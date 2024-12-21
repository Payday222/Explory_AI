const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({ path: './db.env'});

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

const app = express();
app.use(bodyParser.json());

const conn = mysql.createConnection(config);

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'INSERT INTO users (email, pass) VALUES (?, ?)';
    const values = [email, password];

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Error executing query', error: err });
        } else {
            res.status(200).json({ message: 'Query success' });
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

module.exports = { config };
