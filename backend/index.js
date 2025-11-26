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

app.get('/api/status', (req, res) => res.json({ status: 'OK', time: new Date() }));

// --- 1. Menu Management ---

app.get('/api/menu', async (req, res) => {
    try {
        // ดึงข้อมูลจริงจาก DB (รวม image_url)
        const [rows] = await pool.query('SELECT * FROM menu');
        res.json(rows);
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: error.message }); 
    }
});

app.post('/api/menu', async (req, res) => {
    const { name, category, price, is_buffet, img_url } = req.body;
    try {
        await pool.query(
            'INSERT INTO menu (menu_name, category, price, is_buffet, img_url) VALUES (?, ?, ?, ?, ?)',
            [name, category, price, is_buffet, img_url]
        );
        res.json({ success: true });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: error.message }); 
    }
});

app.delete('/api/menu/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM menu WHERE menu_id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- 2. Order Management ---

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

        if (tables[0].status === 'Occupied') {
            const [activeOrders] = await connection.query('SELECT order_id FROM orders WHERE table_id = ? AND status = "Open"', [tableId]);
            if (activeOrders.length > 0) {
                throw new Error('Table is currently occupied with an active order');
            }
        }

        const [resOrder] = await connection.query(
            `INSERT INTO orders (table_id, start_time, status, num_adults, num_children, adult_price, child_price, num_of_customers) 
             VALUES (?, NOW(), 'Open', ?, ?, 299.00, 199.00, ?)`,
            [tableId, adults, children, adults + children]
        );

        await connection.query('UPDATE restaurant_table SET status = "Occupied", capacity = ? WHERE table_id = ?', [adults + children, tableId]);

        await connection.commit();
        res.json({ success: true, orderId: resOrder.insertId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally { connection.release(); }
});

app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const [orders] = await pool.query(`
            SELECT o.*, t.table_number 
            FROM orders o 
            LEFT JOIN restaurant_table t ON o.table_id = t.table_id 
            WHERE o.order_id = ?`, [orderId]);
            
        if (orders.length === 0) return res.status(404).json({ error: "Order not found" });
        
        const [items] = await pool.query(`
            SELECT od.*, m.menu_name, m.price, m.img_url 
            FROM order_detail od
            JOIN menu m ON od.menu_id = m.menu_id
            WHERE od.order_id = ? AND od.status != 'Cancelled'
            ORDER BY od.created_at DESC`, [orderId]);

        res.json({ order: orders[0], items });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/orders/:orderId/items', async (req, res) => {
    const { orderId } = req.params;
    const { items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "Empty" });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const sql = 'INSERT INTO order_detail (order_id, menu_id, qty, status, note, created_at) VALUES ?';
        const values = items.map(i => [orderId, i.id, i.quantity, 'Pending', i.note || '', new Date()]);
        
        await connection.query(sql, [values]);
        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally { connection.release(); }
});

app.post('/api/orders/:orderId/checkout', async (req, res) => {
    const { orderId } = req.params;
    const { total_amount } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [orders] = await connection.query('SELECT table_id FROM orders WHERE order_id = ?', [orderId]);
        if(orders.length === 0) throw new Error("Order not found");

        await connection.query('UPDATE orders SET status = "Closed", end_time = NOW() WHERE order_id = ?', [orderId]);
        await connection.query('UPDATE restaurant_table SET status = "Available", capacity = 0 WHERE table_id = ?', [orders[0].table_id]);
        
        // Insert bill (ไม่ต้องใส่ net_amount เพราะเป็น generated column)
        await connection.query('INSERT INTO bill (order_id, total_amount) VALUES (?, ?)', [orderId, total_amount || 0]);

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally { connection.release(); }
});

// --- 3. Kitchen & Helpers ---

app.post('/api/tables/:tableId/reset', async (req, res) => {
    const { tableId } = req.params;
    try {
        await pool.query('UPDATE restaurant_table SET status = "Available", capacity = 0 WHERE table_id = ?', [tableId]);
        await pool.query('UPDATE orders SET status = "Closed", end_time = NOW() WHERE table_id = ? AND status = "Open"', [tableId]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/kitchen/pending', async (req, res) => {
    try {
        const sql = `
            SELECT 
                od.order_detail_id as id,
                od.qty as quantity,
                od.status,
                od.note,
                od.created_at,
                m.menu_name as menuItem,
                o.order_id,
                t.table_number as tableNumber
            FROM order_detail od
            JOIN menu m ON od.menu_id = m.menu_id
            JOIN orders o ON od.order_id = o.order_id
            JOIN restaurant_table t ON o.table_id = t.table_id
            WHERE od.status IN ('Pending', 'Preparing')
            ORDER BY od.created_at ASC
        `;
        const [rows] = await pool.query(sql);

        const batches = new Map();
        rows.forEach(row => {
            const timeKey = new Date(row.created_at).toISOString().substring(0, 16);
            const batchKey = `${row.order_id}_${timeKey}`;

            if (!batches.has(batchKey)) {
                batches.set(batchKey, {
                    id: batchKey,
                    orderId: row.order_id,
                    tableNumber: row.tableNumber,
                    status: 'waiting',
                    timestamp: row.created_at,
                    items: []
                });
            }
            batches.get(batchKey).items.push({
                id: row.id,
                menuItem: row.menuItem,
                quantity: row.quantity,
                status: row.status
            });
        });

        res.json(Array.from(batches.values()));
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/kitchen/serve/batch/:batchKey', async (req, res) => {
    const { ids } = req.body;
    try {
        await pool.query("UPDATE order_detail SET status = 'Served' WHERE order_detail_id IN (?)", [ids]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});