const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Create Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        image TEXT
    )`);

    // Create Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total_price REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Create OrderItems table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Insert dummy products if empty
    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
        if (row && row.count === 0) {
            const insert = db.prepare(`INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`);
            insert.run('Wireless Headphones', 'High-quality noise-canceling headphones with 40-hour battery life.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80');
            insert.run('Smart Watch', 'Fitness tracker and smartwatch with heart rate monitor and GPS.', 149.50, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80');
            insert.run('Gaming Mouse', 'Ergonomic gaming mouse with customizable RGB lighting.', 59.99, 'https://images.unsplash.com/photo-1527814050087-379381547969?w=500&q=80');
            insert.run('Mechanical Keyboard', 'RGB mechanical keyboard with tactile blue switches.', 89.99, 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80');
            insert.run('4K Monitor', 'Ultra HD 27-inch monitor with 144Hz refresh rate.', 299.99, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80');
            insert.run('Bluetooth Speaker', 'Portable waterproof bluetooth speaker with deep bass.', 79.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80');
            insert.finalize();
        }
    });
});

module.exports = db;
