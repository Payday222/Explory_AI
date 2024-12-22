const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const shared = require('./shared');

dotenv.config({ path: './db.env' });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

function validateConn() {
    const conn = mysql.createConnection(config);

    conn.connect(err => {
        if (err) {
            console.error(err);
        } else {
            console.log('Connected successfully');
        }
    });
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser()); // Use cookie-parser middleware

app.post('/send-email', async (req, res) => {
    const { email, userId } = req.body; // Get userId from the request body
    shared.setSharedVariable(email);

    console.log('Received request to send email to:', email, 'with userId:', userId);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'learnlaboffice.ai@gmail.com',
            pass: 'goiu pnja lzvi ltjp' // Use environment variables for sensitive data
        }
    });

    const mailOptions = {
        from: 'learnlaboffice.ai@gmail.com',
        to: email,
        subject: 'Register your LearnLabsAI account',
        html: `<p>Welcome! Click <a href="http://localhost:3002/get-cookies">here</a> to register your account.</p>`
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
});

// Route to get the cookies
// app.get('/get-cookies', (req, res) => { //! this doesnt work
//     const email = req.cookies.email; // Retrieve the email from the cookie
//     const userId = req.cookies.userId; // Retrieve the userId from the cookie

//     if (email && userId) {
//         res.send(`Cookie values - Email: ${email}, User ID: ${userId}`);
//     } else {
//         res.send('No cookies found');
//     }
// });

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});