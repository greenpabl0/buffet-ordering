const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // ใช้ promise-based pool
const app = express();
const port = 5000; // ใช้พอร์ตเดียวกับที่กำหนดใน Docker Compose

// ข้อมูลการเชื่อมต่อ DB ดึงมาจาก Environment Variables ใน Docker Compose
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

let pool;

try {
    // สร้าง Connection Pool สำหรับ DB
    pool = mysql.createPool(dbConfig);
    console.log('Database pool created successfully.');
} catch (error) {
    console.error('Failed to create database pool:', error);
}

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],   // อนุญาตให้ frontend เข้าถึง
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true
}));
app.options("*", cors());

app.use(express.json()); // Middleware สำหรับอ่าน JSON body

// --- API Endpoint ทดสอบ ---
app.get('/api/status', (req, res) => {
    res.json({ status: 'Backend API is running', environment: process.env.NODE_ENV || 'development' });
});

// --- API Endpoint สำหรับดึงเมนู (ตัวอย่าง) ---
app.get('/api/menu', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT menu_id as id, menu_name as name, category, price, is_buffet FROM menu');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Failed to fetch menu data' });
    }
});

app.get('/api/employee', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM employee');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Failed to fetch employee data' });
    }
});

// End-point สำหรับเปิดโต๊ะและสร้าง Order (ใช้ Transaction)
app.post('/api/orders/open', async (req, res) => {
    // 1. ดึงข้อมูลที่จำเป็น
    const { 
        table_number, // ดึงจาก Frontend
        emp_id, 
        num_adults, 
        num_children, 
        adult_price, 
        child_price 
    } = req.body;
    
    // คำนวณจำนวนลูกค้าทั้งหมด
    const num_of_customers = num_adults + num_children;
    
    let connection;

    try {
        // 2. ขอ Connection จาก Pool เพื่อเริ่ม Transaction
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 3. (A) ค้นหา table_id จาก table_number ก่อน
        const [tableRows] = await connection.query(
            "SELECT table_id, status FROM restaurant_table WHERE table_number = ?",
            [table_number]
        );

        if (tableRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Table number not found." });
        }
        
        const { table_id, status } = tableRows[0];
        
        // ตรวจสอบสถานะโต๊ะก่อน
        if (status !== 'Available') {
            await connection.rollback();
            return res.status(409).json({ error: `Table ${table_number} is already ${status}.` });
        }

        // 4. (B) อัปเดตสถานะโต๊ะให้เป็น 'Occupied'
        await connection.query(
            `UPDATE restaurant_table 
             SET status = 'Occupied' 
             WHERE table_id = ?`,
            [table_id]
        );

        // 5. (C) สร้าง Order ใหม่ โดยใช้ table_id ที่ค้นหาได้
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
             (table_id, emp_id, start_time, num_adults, num_children, adult_price, child_price, num_of_customers) 
             VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`,
            [table_id, emp_id, num_adults, num_children, adult_price, child_price, num_of_customers]
        );
        
        const newOrderId = orderResult.insertId;

        // 6. Commit Transaction เมื่อทุกอย่างสำเร็จ
        await connection.commit();

        // 7. ส่งผลลัพธ์กลับ
        res.status(201).json({ 
            success: true, 
            message: "Table successfully occupied and Order created.", 
            order_id: newOrderId,
            table_number: table_number
        });

    } catch (error) {
        // 8. Rollback หากมีข้อผิดพลาด
        if (connection) {
            await connection.rollback();
        }
        console.error("Error opening table and creating order:", error);
        res.status(500).json({ error: "Failed to open table due to server error." });
    } finally {
        // 9. คืน Connection กลับ Pool
        if (connection) {
            connection.release();
        }
    }
});

// End-point สำหรับดึงข้อมูล Order เดียว
app.get('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const [rows] = await pool.query(
            // อาจจะ Join ตาราง restaurant_table ด้วย เพื่อดึง table_number
            `SELECT 
                o.*, 
                rt.table_number 
             FROM orders o
             JOIN restaurant_table rt ON o.table_id = rt.table_id
             WHERE o.order_id = ?`,
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Order not found." });
        }

        res.json({ success: true, order: rows[0] });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Failed to fetch order data." });
    }
});

// End-point สำหรับปิดออร์เดอร์และคืนสถานะโต๊ะ
app.put('/api/orders/:orderId/close', async (req, res) => {
    const { orderId } = req.params;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. อัปเดตสถานะ Order เป็น 'Closed' และบันทึก end_time
        const [orderUpdateResult] = await connection.query(
            `UPDATE orders 
             SET status = 'Closed', end_time = NOW() 
             WHERE order_id = ? AND status = 'Open'`,
            [orderId]
        );

        if (orderUpdateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(409).json({ error: "Order not found or already closed/cancelled." });
        }

        // 2. ค้นหา table_id เพื่อคืนสถานะโต๊ะ
        const [orderRows] = await connection.query(
            "SELECT table_id FROM orders WHERE order_id = ?",
            [orderId]
        );
        const tableId = orderRows[0].table_id;

        // 3. อัปเดตสถานะโต๊ะใน restaurant_table ให้เป็น 'Available'
        await connection.query(
            `UPDATE restaurant_table 
             SET status = 'Available' 
             WHERE table_id = ?`,
            [tableId]
        );

        await connection.commit();

        res.json({ success: true, message: "Order closed and table made available." });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Error closing order:", error);
        res.status(500).json({ error: "Failed to close order due to server error." });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});