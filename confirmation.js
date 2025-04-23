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

const pool = mysql.createPool(config);

app.get('/set-cookie', (req, res) => {
    const userId = req.query.userId;
    const email = req.query.email;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    if (userId) {
        res.cookie('userId', userId, { httpOnly: true, sameSite: 'Lax', secure: false });
    }
    res.cookie('email', email, { httpOnly: true, sameSite: 'Lax', secure: false });

    console.log('Cookies set for email:', email);
    res.redirect('/register');
});

app.get('/register', (req, res) => {
    console.log('Cookies:', req.cookies);
    const email = req.cookies.email;

    if (!email) {
        return res.status(400).json({ message: 'Email cookie is required.' });
    }

    const query = 'SELECT id FROM users WHERE email = ?';
    pool.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error while retrieving userId from db:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userId = results[0].id;
        console.log('Verifying user:', userId, 'with email:', email);

        const sql = 'UPDATE users SET verified = ? WHERE id = ?';
        pool.query(sql, [true, userId], (err, updateResult) => {
            if (err) {
                console.error('Error updating user:', err);
                return res.status(500).json({ message: 'Error updating user.', error: err });
            }

            console.log('User verified:', updateResult);
            res.status(200).json({ message: 'User verified successfully', result: updateResult });
        });
    });
});

const port = 3002;
app.listen(port, () => {
    console.log(`Registration server is running on port ${port}`);
});
