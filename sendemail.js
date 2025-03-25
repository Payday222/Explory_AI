const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config({ path: './db.env' });

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://188.127.1.110:3000', credentials: true }));

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

function getUserIdByEmail(email) {
    const conn = mysql.createConnection(config);

    return new Promise((resolve, reject) => {
        const sql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
        conn.query(sql, [email], (err, results) => {
            conn.end(); // Close the connection
            if (err) {
                return reject(err);
            }
            if (results.length === 0) {
                return reject(new Error('User not found'));
            }
            resolve(results[0].id);
        });
    });
}

app.post('/send-email', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid input data.' });
    }

    try {
        // Fetch userId from the database
        const userId = await getUserIdByEmail(email);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'learnlaboffice.ai@gmail.com',
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'learnlaboffice.ai@gmail.com',
            to: email,
            subject: 'Register your LearnLabsAI account',
            html: `<p>Welcome! Click <a href="http://188.127.1.110:3002/set-cookie?email=${encodeURIComponent(email)}">here</a> to register your account.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.json({ message: 'Email sent successfully', response: info.response });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get-cookies endpoint
app.get('/get-cookies', (req, res) => {
    const email = req.cookies.email;
    const userId = req.cookies.userId;

    if (email && userId) {
        res.json({ email, userId });
    } else {
        res.status(400).json({ error: 'No cookies found' });
    }
});

const crypto = require('crypto'); // To generate a secure token

app.post('/send-pass-reset', (req, res) => {
    const { email } = req.body;

    // Generate a unique token (you can store it in a DB for validation)
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
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
