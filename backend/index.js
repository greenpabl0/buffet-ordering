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
    origin: "http://localhost:8080",   // อนุญาตให้ frontend เข้าถึง
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

app.put('/api/restaurant_table/:table_number', async (req, res) => {
    const { table_number } = req.params;
    const { capacity, status } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE restaurant_table SET capacity = ?, status = ? WHERE table_number = ?',
            [capacity, status, table_number]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Table not found" });
        }

        res.json({ success: true, table_number, message: "Table updated successfully" });
    } catch (error) {
        console.error("Error updating table:", error);
        res.status(500).json({ error: "Failed to update table" });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});