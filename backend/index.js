const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = 5000;

// Config Database Connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'Buffet',
};

let pool;

async function initDB() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database pool created successfully.');
    } catch (error) {
        console.error('Failed to create database pool:', error);
    }
}
initDB();

// Log Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());

// --- 1. Common & Master Data ---
app.get('/api/status', (req, res) => res.json({ status: 'OK', time: new Date() }));

app.get('/api/menu', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT menu_id as id, menu_name as name, category, price, is_buffet FROM menu');
        const formatted = rows.map(item => ({
            ...item,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300" 
        }));
        res.json(formatted);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 2. Table App (Cashier) ---

app.get('/api/tables', async (req, res) => {
    try {
        const sql = `
            SELECT t.*, o.order_id as active_order_id
            FROM restaurant_table t
            LEFT JOIN orders o ON t.table_id = o.table_id AND o.status = 'Open'
            ORDER BY t.table_number ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/orders/open', async (req, res) => {
    const { table_number, adults, children } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [tables] = await connection.query('SELECT table_id, status FROM restaurant_table WHERE table_number = ?', [table_number]);
        if (tables.length === 0) throw new Error('Table not found');
        
        const tableId = tables[0].table_id;

        const [resOrder] = await connection.query(
            `INSERT INTO orders (table_id, start_time, status, num_adults, num_children, adult_price, child_price, num_of_customers) 
             VALUES (?, NOW(), 'Open', ?, ?, 299.00, 199.00, ?)`,
            [tableId, adults, children, adults + children]
        );

        console.log(`Order opened: ID ${resOrder.insertId} for Table ${table_number}`);

        await connection.query('UPDATE restaurant_table SET status = "Occupied", capacity = ? WHERE table_id = ?', [adults + children, tableId]);

        await connection.commit();
        res.json({ success: true, orderId: resOrder.insertId });
    } catch (error) {
        await connection.rollback();
        console.error("Open order failed:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log(`Fetching Order Detail for ID: ${orderId}`);
        
        const [orders] = await pool.query(`
            SELECT o.*, t.table_number 
            FROM orders o 
            LEFT JOIN restaurant_table t ON o.table_id = t.table_id 
            WHERE o.order_id = ?`, [orderId]);
            
        if (orders.length === 0) {
            console.log(`Order ${orderId} not found in DB`);
            return res.status(404).json({ error: "Order not found" });
        }
        
        const [items] = await pool.query(`
            SELECT od.*, m.menu_name, m.price 
            FROM order_detail od
            JOIN menu m ON od.menu_id = m.menu_id
            WHERE od.order_id = ? AND od.status != 'Cancelled'`, [orderId]);

        res.json({ order: orders[0], items });
    } catch (error) {
        console.error("Get order failed:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- จุดที่แก้ไข (FIXED HERE) ---
app.post('/api/orders/:orderId/checkout', async (req, res) => {
    const { orderId } = req.params;
    const { total_amount } = req.body; 
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orders] = await connection.query('SELECT table_id FROM orders WHERE order_id = ?', [orderId]);
        if(orders.length === 0) throw new Error("Order not found");
        const tableId = orders[0].table_id;

        await connection.query('UPDATE orders SET status = "Closed", end_time = NOW() WHERE order_id = ?', [orderId]);
        await connection.query('UPDATE restaurant_table SET status = "Available", capacity = 0 WHERE table_id = ?', [tableId]);
        
        // แก้ไข: เอา net_amount ออก เพราะเป็น Generated Column
        await connection.query(
            'INSERT INTO bill (order_id, total_amount) VALUES (?, ?)',
            [orderId, total_amount || 0]
        );

        console.log(`Checkout Order ${orderId} Success`);
        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error("Checkout failed:", error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- 3. Customer App ---

app.post('/api/orders/:orderId/items', async (req, res) => {
    const { orderId } = req.params;
    const { items } = req.body;
    
    if (!items || items.length === 0) return res.status(400).json({ error: "Empty items" });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const sql = 'INSERT INTO order_detail (order_id, menu_id, qty, status, note) VALUES ?';
        const values = items.map(i => [orderId, i.id, i.quantity, 'Pending', i.note || '']);
        
        await connection.query(sql, [values]);
        await connection.commit();
        console.log(`Added items to Order ${orderId}`);
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- 4. Kitchen App ---

app.get('/api/kitchen/pending', async (req, res) => {
    try {
        const sql = `
            SELECT 
                od.order_detail_id as id,
                od.qty as quantity,
                od.status,
                od.note,
                m.menu_name as menuItem,
                o.order_id,
                o.start_time as timestamp,
                t.table_number as tableNumber
            FROM order_detail od
            JOIN menu m ON od.menu_id = m.menu_id
            JOIN orders o ON od.order_id = o.order_id
            JOIN restaurant_table t ON o.table_id = t.table_id
            WHERE od.status IN ('Pending', 'Preparing')
            ORDER BY o.start_time ASC
        `;
        const [rows] = await pool.query(sql);

        const ordersMap = new Map();
        rows.forEach(row => {
            if (!ordersMap.has(row.order_id)) {
                ordersMap.set(row.order_id, {
                    id: row.order_id.toString(),
                    tableNumber: row.tableNumber,
                    status: 'waiting',
                    timestamp: row.timestamp,
                    items: [],
                    isNew: false
                });
            }
            const order = ordersMap.get(row.order_id);
            order.items.push({
                id: row.id,
                menuItem: row.menuItem,
                quantity: row.quantity,
                status: row.status
            });
        });

        res.json(Array.from(ordersMap.values()));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/kitchen/serve/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
        await pool.query("UPDATE order_detail SET status = 'Served' WHERE order_id = ? AND status != 'Served'", [orderId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});