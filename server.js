const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'supersecretkey_for_ecommerce'; // In production, use env variable

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.status(401).json({ error: 'Token required. Please log in.' });
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
        req.user = user;
        next();
    });
};

// API Routes

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            res.json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        res.json(row);
    });
});

// Process Order
app.post('/api/orders', authenticateToken, (req, res) => {
    const { items, totalPrice } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });
    
    db.run(`INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)`, [req.user.id, totalPrice, 'Pending'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;
        
        let stmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
        items.forEach(item => {
            stmt.run(orderId, item.productId, item.quantity, item.price);
        });
        stmt.finalize();
        
        res.json({ message: 'Order placed successfully', orderId });
    });
});

// Get User Orders
app.get('/api/orders', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
