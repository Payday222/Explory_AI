const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/send-email', async (req, res) => {
    const { email, password } = req.body;

    console.log('Received request to send email to:', email);

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
        text: `Welcome! Your password is ${password}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.send('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send(error.toString());
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
