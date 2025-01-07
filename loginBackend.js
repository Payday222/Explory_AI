const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
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
app.use(express.json());
const port = 3004;

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    function validateCredentials(email, password) {
        if (email && password) {
            const conn = mysql.createConnection(config);

            conn.connect((err) => {
                if (err) {
                    console.error('Error connecting to the database:', err);
                    res.status(500).send({ success: false, message: 'Database connection error' });
                    return;
                } else {
                    console.log('Connected to the MySQL database!');
                }
            });

            const query = 'SELECT * FROM users WHERE email = ? AND pass = ?';
            const values = [email, password];
            conn.query(query, values, (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    res.status(500).send({ success: false, message: 'Query error' });
                } else if (results.length > 0) {
                    console.log('Login successful:', results);
                    res.send({ success: true, message: 'Login successful' });
                } else {
                    console.log('Invalid credentials');
                    res.status(401).send({ success: false, message: 'Invalid credentials' });
                }
            });
        } else {
            res.status(400).send({ success: false, message: 'Email and password are required' });
        }
    }

    validateCredentials(email, password);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
