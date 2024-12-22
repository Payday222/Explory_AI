const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config({ path: './db.env' });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const conn = mysql.createConnection(config);

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

// Set cookie endpoint
app.get('/set-cookie', (req, res) => {
    const userId = req.query.userId;
    const email = req.query.email;

    if (!userId || !email) {
        res.status(400).json({ message: 'Invalid userId or email' });
        return;
    }

    // Redirect to /register endpoint
    res.redirect('/register');
});

// Register endpoint
app.get('/register', (req, res) => {
    console.log('Cookies:', req.cookies); // Log the cookies

    const userId = req.cookies.userId;
    const email = req.cookies.email;

    if (!userId) {
        res.status(400).json({ message: 'Invalid userId' });
        return;
    }

    console.log('Received request to register user:', userId, 'with email:', email);

    const sql = 'UPDATE users SET verified = ? WHERE id = ?';
    const values = [true, userId];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Error executing query', error: err });
        } else {
            console.log('User  verified:', result);
            res.status(200).json({ message: 'User  verified', result });
        }
    });
});

const port = 3002; // Adjust this port as needed
app.listen(port, () => {
    console.log(`Registration server is running on port ${port}`);
});