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
            return res.status(500).send('Error executing query: ' + err.message);
        } else {
            console.log("Query successful", result);
            const userId = result.insertId; // Get the userId from the result

            // Set cookies after successful registration
            res.cookie('userId', userId, { httpOnly: true, sameSite: 'None', secure: false });
            res.cookie('email', email, { httpOnly: true, sameSite: 'None', secure: false });

            return res.status(200).send('User  registered successfully');
        }
    });

}

// Signup endpoint
app.post('/signup', (req, res) => {
    console.log(req.body);
    const { email, password } = req.body; // Get email and password from request body

    if (!email || !password) {
        console.error("Password or email invalid");
        return res.status(400).send('Email and password are required');
    }

    sqlInsert(email, password, res); // Call sqlInsert with email, password, and response object
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});