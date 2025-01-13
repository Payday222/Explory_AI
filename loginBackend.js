const express = require('express');
const mysql = require('mysql2/promise'); //!promise mysql
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
app.use(express.json());
const port = 3004;

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ success: false, message: 'Email and password are required' });
    }

    try {
        const conn = await mysql.createConnection(config);
        console.log('Connected to the MySQL database!');

        
        const query = 'SELECT * FROM users WHERE email = ? AND pass = ?';
        const [results] = await conn.execute(query, [email, password]);

        if (results.length > 0) {
           
            const isVerified = await checkVerified(email, conn);
            if (isVerified) {
                return res.send({ success: true, message: 'Login successful' });
            } else {
                return res.status(401).send({ success: false, message: 'User  not verified' });
            }
        } else {
            console.log('Invalid credentials');
            return res.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).send({ success: false, message: 'Database error' });
    }
});

async function checkVerified(email, conn) {
    const query = 'SELECT * FROM users WHERE email = ? AND verified = 1';
    const [results] = await conn.execute(query, [email]);

    if (results.length > 0) {
        console.log('Verification successful:', results);
        return true;
    } else {
        console.log('User  not verified');
        return false;
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});