const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const crypto = require('crypto');
const { Console } = require('console');

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
const conn = mysql.createConnection(config);

function getUserIdByEmail(email) {

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

app.post('/reset-pass', async (req, res) => {
    const { email } = req.body;
    
    if(!email) {
        alert('email not passed to reset-pass endpoint');
        return;
    }
    try {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'learnlaboffice.ai@gmail.com',
            pass: process.env.EMAIL_PASSWORD
        }

    });

    const authCode = crypto.randomBytes(6).toString('hex').slice(0, 6);
    const mailOptions = {
        from: 'learnlaboffice.ai@gmail.com',
        to: email,
        subject: 'LearnLabs password reset',
        html: `<p>Hello! Here is the code for resetting your password</p><br><h3>${authCode}</h3><br><p>Please paste this code into the designated app input field. Happy Learning :)</p>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ message: 'Email sent successfully', response: info.response });

    } catch (error) {
        console.error('Error sending pass reset email:', error);
        res.status(500).json({ error: error.message });
    }
    conn.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return;
        }
        console.log('Connected to the MySQL database!');
    });

    const query = "UPDATE users SET reset_token = ? WHERE email = ?";
    const values = [authCode, email];
    
    conn.query(query, values, (err, results) => {
        if(results.length > 0 ) {
        if(err) {
            console.log("Error updating database");
            return res.status(500).json({ message: 'Error updating user.', error: err });
        } 
        console.log('User verified:', updateResult);
        return res.status(200).json({ message: 'User verified successfully', result: updateResult })
    } else {
        console.log('ERROR: No users found with that email');
        alert('Your email was not found in our database, please create an account');
        return res.status(404).json({ message: 'User not found.' });
    }
    });
})
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
