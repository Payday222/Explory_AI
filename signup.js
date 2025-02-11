const express = require('express');
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
const PORT = 3003;

app.use(express.json());

function sqlInsert(email, password, res) {
    const conn = mysql.createConnection(config);

    const sql = 'INSERT INTO users (email, pass) VALUES (?, ?)';
    const values = [email, password];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: 'Error executing query', details: err.message });
            return;
        }

        console.log("Query successful", result);
        const userId = result.insertId;


        res.status(200).json({ message: 'User registered successfully', userId });
        res.cookie('email', email, { httpOnly: true, sameSite: 'Lax', secure: false });

        res.status(200).json({ message: 'User registered successfully', userId });
    });

    conn.end(err => {
        if (err) console.error("Error closing connection:", err);
    });
}

// Signup endpoint
app.post('/signup', (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.error("Password or email invalid");
        return res.status(400).json({ error: 'Email and password are required' });
    }

    sqlInsert(email, password, res); 
});

app.listen(PORT, () => {
    console.log(`Server is running on http://188.127.1.110:${PORT}`);
});
