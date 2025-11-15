const express = require('express');
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

app.get('/api/restaurant_table', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM restaurant_table');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching restaurant_table:', error);
        res.status(500).json({ error: 'Failed to fetch restaurant_table data' });
    }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});