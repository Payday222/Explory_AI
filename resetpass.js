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
const PORT = 3008;

app.use(express.json());

function sqlInsert(email, password, res) {
     const conn = mysql.createConnection(config);
    
        const sql = 'INSERT INTO users (pass) VALUES ( ?)';
        const values = [password];

        conn.query(sql, values, (err, result) => {
            if(err) {
                console.error("Error executing query:", err);
            res.status(500).json({ error: 'Error executing query', details: err.message });
            return;
            }
            console.log("Query successful", result);
        })
}