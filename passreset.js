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

app.post('/reset-pass', (req, res) => {
    const { code, pass } = req.body;

    if (!code || code.length === 0) {
        return res.status(400).json({ error: 'Code is empty or null' });
    }

    const query = "SELECT * FROM users WHERE reset_token = ?";
    conn.query(query, [code], (err, results) => {
        if (err) {
            console.error('Error reading from DB:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Invalid reset token' });
        }

        const email = results[0].email;

        // Update password
        const updateQuery = "UPDATE users SET pass = ? WHERE email = ?";
        conn.query(updateQuery, [pass, email], (err, updateRes) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Failed to update password' });
            }

            if (updateRes.affectedRows === 0) {
                return res.status(404).json({ error: 'No user found to update' });
            }

            res.json({ message: 'Password changed successfully' });
        });
    });
});

// Start the server on port 3009
app.listen(3009, () => {
    console.log('passreset running on http://localhost:3009');
});
