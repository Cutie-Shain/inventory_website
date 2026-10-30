const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',         // Agar aapka MySQL username alag hai toh badlein
    password: 'root12345', // Apna MySQL password yahan likhein
    database: 'inventory_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Database successfully!');
});

// 1. POST API: Admin Login Check
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    
    db.query(query, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server Error' });
        
        if (results.length > 0) {
            res.json({ success: true, message: 'Login Successful!' });
        } else {
            res.json({ success: false, message: 'Invalid Username or Password!' });
        }
    });
});

// 2. GET API: Fetch All Products
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json({ success: true, products: results });
    });
});

// 3. POST API: Add New Product
app.post('/api/products', (req, res) => {
    const { name, price, stock } = req.body;
    const query = 'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)';
    
    db.query(query, [name, price, stock], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json({ success: true, message: 'Product Added Successfully!' });
    });
});

// 4. GET API: Fetch All Khata Ledger Entries
app.get('/api/khata', (req, res) => {
    const query = 'SELECT * FROM khata_ledger ORDER BY date_created DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json({ success: true, ledger: results });
    });
});

// 5. POST API: Record New Khata Entry
app.post('/api/khata', (req, res) => {
    const { customer_name, item_bought, total_amount, paid_amount } = req.body;
    const query = 'INSERT INTO khata_ledger (customer_name, item_bought, total_amount, paid_amount) VALUES (?, ?, ?, ?)';
    
    db.query(query, [customer_name, item_bought, total_amount, paid_amount], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json({ success: true, message: 'Khata Entry Recorded Successfully!' });
    });
});

// 6. DELETE API: Clear/Remove a Person's Khata (Full Payment Done Option)
app.delete('/api/khata/:id', (req, res) => {
    const khataId = req.params.id;
    const query = 'DELETE FROM khata_ledger WHERE id = ?';
    
    db.query(query, [khataId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json({ success: true, message: 'Khata Record Cleared and Removed!' });
    });
});
// ================= SALES API =================

// Save Bill
app.post('/api/sales', (req, res) => {

    const { item_name, quantity, price, total } = req.body;

    const sql = `
        INSERT INTO sales
        (item_name, quantity, price, total)
        VALUES (?,?,?,?)
    `;

    db.query(sql,
        [item_name, quantity, price, total],
        (err) => {

            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    message: "Bill not saved"
                });
            }

            res.json({
                success: true,
                message: "Bill Saved"
            });

        });

});



// Dashboard Data
app.get('/api/dashboard', (req, res) => {

    const sql = `
        SELECT
        COUNT(*) AS bills,
        IFNULL(SUM(total),0) AS revenue
        FROM sales
        WHERE DATE(created_at)=CURDATE()
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.json({
                success:false
            });
        }

        res.json({
            success:true,
            bills:result[0].bills,
            revenue:result[0].revenue
        });

    });

});
// Server Start
app.listen(3000, () => {
    console.log('Server running smoothly on http://localhost:3000');
});