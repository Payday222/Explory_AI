const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({ path: './db.env' });
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

// Function to generate a password reset token
function generateToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Send password reset email with token
app.post('/send-pass-reset', (req, res) => {
    const { email } = req.body;

    // Generate a reset token
    const resetToken = generateToken();

    // Save token to the database (to validate later)
    const conn = mysql.createConnection(config);
    const sql = 'UPDATE users SET reset_token = ? WHERE email = ?';
    const values = [resetToken, email];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating reset token:", err);
            res.status(500).json({ error: 'Error updating reset token' });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Send reset email with token link
        const mailOptions = {
            from: 'learnlaboffice.ai@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            html: `<p>To reset your password, click the link below:</p><p><a href="http://188.127.1.110/resetpass.html?token=${resetToken}">Reset Password</a></p>`
        };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'learnlaboffice.ai@gmail.com',
                pass: process.env.EMAIL_PASSWORD // Use environment variables for sensitive info
            }
        });

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
                res.status(500).json({ error: 'Error sending email' });
                return;
            }

            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Password reset email sent successfully' });
        });
    });

    conn.end();
});

// Endpoint to handle password reset
app.post('/resetpass', (req, res) => {
    const { email, password, token } = req.body;

    // Validate the token
    const conn = mysql.createConnection(config);
    const sql = 'SELECT * FROM users WHERE email = ? AND reset_token = ?';
    const values = [email, token];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(500).json({ error: 'Error executing query', details: err.message });
            return;
        }

        if (result.length === 0) {
            res.status(400).json({ error: 'Invalid or expired token' });
            return;
        }

        // Update the password for the user
        const updateSql = 'UPDATE users SET pass = ?, reset_token = NULL WHERE email = ?';
        const updateValues = [password, email];

        conn.query(updateSql, updateValues, (err, result) => {
            if (err) {
                console.error("Error updating password:", err);
                res.status(500).json({ error: 'Error updating password' });
                return;
            }

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            console.log("Password updated successfully", result);
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });

    conn.end();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
