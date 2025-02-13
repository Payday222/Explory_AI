// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Import the Server class from socket.io
const { io: Client } = require('socket.io-client'); // Import the client from socket.io-client

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://188.127.1.110:3005", // Allow requests from this origin
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
}); // Create a new instance of the Server class with CORS options
const botSocket = Client('http://188.127.1.110:3007'); // Connect to the bot server

app.use(express.static('public')); // Serve static files from the 'public' directory

// Handle socket connections
io.on('connection', (socket) => {
    console.log("[Server] A client connected");

    // Handle joining a room
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`[Server] Client joined room: ${roomCode}`);
        socket.to(roomCode).emit('joinedRoom', roomCode);
    });

    // Handle sending answers
    socket.on('sendAnswers', (data) => {
        const { roomCode, answers, clientID } = data;
        console.log(`[Server] Received answers for room ${roomCode}: ${answers}`);
        console.log('sendans client id:', clientID);
        // Broadcast the answers to all clients in the room
        socket.to(roomCode).emit('sendAnswers', JSON.stringify(data));
        botSocket.emit('evaluateAnswer', data); // Forward to the bot for evaluation
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log("[Server] A client disconnected");
    });

    botSocket.on('EvaluationResponse', (data) => {
        const { response, clientID } = data;
        console.log('Received EvaluationResponse from bot:', response);
        console.log('Evaluation client id:', clientID);
        // Send the evaluation result only to the original sender
        io.to(clientID).emit('EvaluationResponse', { response });
    });
});

// Start the server
const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});