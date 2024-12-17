const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/send-email', (req, res) => {
    const { email, password } = req.body;

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

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.send('Email sent: ' + info.response);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
