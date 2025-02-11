const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://188.127.1.110:27017/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const messageSchema = new mongoose.Schema({
    messages: [String],  
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);


app.post('/saveMessages', async (req, res) => {
    try {
        const newMessage = new Message({ messages: req.body.messages });
        await newMessage.save();
        res.json({ success: true, message: "Messages saved!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


app.listen(3006, () => {
    console.log('Server running on port 3000');
});
