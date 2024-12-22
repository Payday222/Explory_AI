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
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// MySQL configuration
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// Helper function to fetch userId from database
function getUserIdByEmail(email) {
    const conn = mysql.createConnection(config);

    return new Promise((resolve, reject) => {
        const sql = 'SELECT id FROM users WHERE email = ? LIMIT 1';
        conn.query(sql, [email], (err, results) => {
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

// Send-email endpoint
app.post('/send-email', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).send('Invalid input data.');
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
            html: `<p>Welcome! Click <a href="http://localhost:3002/get-cookies">here</a> to register your account.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.send.json('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send.json(error.message);
    }
});

// Get-cookies endpoint
app.get('/get-cookies', (req, res) => {
    const email = req.cookies.email;
    const userId = req.cookies.userId;

    if (email && userId) {
        res.send.json(`Cookie values - Email: ${email}, User ID: ${userId}`);
    } else {
        res.status(400).send.json('No cookies found');
    }
});

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
