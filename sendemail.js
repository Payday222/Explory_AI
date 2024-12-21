const express = require('express');
const nodemailer = require('nodemailer');
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const conn = mysql.createConnection(config);

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

app.post('/send-email', async (req, res) => {
    const { email, password } = req.body;

    console.log('Received request to send email to:', email);

    // Query to get userId
    const userQuery = 'SELECT id FROM users WHERE email = ?';

    conn.query(userQuery, [email], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Error executing query', error: err });
            return;
        }

        if (results.length > 0) {
            const userId = results[0].id;
            console.log('Retrieved userId:', userId); // Log the userId

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'learnlaboffice.ai@gmail.com',
                    pass: 'goiu pnja lzvi ltjp'
                }
            });

            const mailOptions = {
                from: 'learnlaboffice.ai@gmail.com',
                to: email,
                subject: 'Register your LearnLabsAI account',
                html: `<p>Welcome! Click <a href="http://localhost:3002/set-cookie?userId=${userId}&email=${email}">here</a> to register your account. Your password is ${password}</p>`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    res.status(500).send(error.toString());
                    return;
                }
                console.log('Email sent: ' + info.response);
                res.send('Email sent: ' + info.response);
            });

        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
