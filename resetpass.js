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

// Function to update the user's password
function sqlUpdatePassword(email, password, res) {
    const conn = mysql.createConnection(config);
    
    // Use the UPDATE statement to change the password for the user with the specified email
    const sql = 'UPDATE users SET pass = ? WHERE email = ?';
    const values = [password, email];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: 'Error executing query', details: err.message });
            return;
        }
        
        if (result.affectedRows === 0) {
            // No rows were updated, meaning the email was not found
            res.status(404).json({ error: 'User  not found' });
            return;
        }

        console.log("Password updated successfully", result);
        res.status(200).json({ message: 'Password updated successfully' });
    });

    // Close the connection
    conn.end();
}

// Endpoint to handle password reset
app.post('/resetpass', (req, res) => {
    const { email, password } = req.body;

    // Call the function to update the password
    sqlUpdatePassword(email, password, res);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});