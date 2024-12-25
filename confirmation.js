const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
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
app.use(bodyParser.json());
app.use(cookieParser());

const conn = mysql.createConnection(config);

conn.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});


app.get('/set-cookie', (req, res) => {
    const userId = req.query.userId;
    const email = req.query.email;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    // Set cookies for userId and email
    // if (userId) {
    //     res.cookie('userId', userId, { httpOnly: true, sameSite: 'Lax', secure: false });
    // }
    // res.cookie('email', email, { httpOnly: true, sameSite: 'Lax', secure: false });

    // console.log('Cookies set for email:', email);

    // // Redirect to /register endpoint
     res.redirect('/register');
});


// Register endpoint
app.get('/register', (req, res) => {
    console.log('Cookies:', req.cookies); 
    const email = req.cookies.email; 

    if (!email) {
        console.error('Email cookie is missing.');
        return res.status(400).json({ message: 'Email cookie is required.' });
    }

    const query = 'SELECT id FROM users WHERE email = ?';
    const q_values = [email];
    let userId = 0; 

    conn.query(query, q_values, (err, results) => {
        if (err) {
            console.error('Error while retrieving userId from db:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        if (results.length > 0) {
            userId = results[0].id; 
            console.log('userId:', userId);

            
            const sql = 'UPDATE users SET verified = ? WHERE id = ?';
            const values = [true, userId];

            conn.query(sql, values, (err, updateResult) => {
                if (err) {
                    console.error('Error executing update query:', err);
                    return res.status(500).json({ message: 'Error updating user.', error: err });
                }

                console.log('User verified:', updateResult);
                return res.status(200).json({ message: 'User verified successfully', result: updateResult });
            });
        } else {
            console.error('No user found with the provided email.');
            return res.status(404).json({ message: 'User not found.' });
        }
    });


    
    // if (!userId) {
    //     console.log(userId);
    //     res.status(400).json({ message: 'Invalid userId' });
    //     return;
    // }

    console.log('Received request to register user:', userId, 'with email:', email);

    const sql = 'UPDATE users SET verified = ? WHERE id = ?';
    const values = [true, userId];

    conn.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Error executing query', error: err });
        } else {
            console.log('User  verified:', result);
            res.status(200).json({ message: 'User  verified', result, userId, email });
        }
    });
});

const port = 3002;
app.listen(port, () => {
    console.log(`Registration server is running on port ${port}`);
});