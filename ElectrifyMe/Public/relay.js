// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const botSocket = io('http://188.127.1.110:3007');
app.use(express.static('public')); 

io.on('connection', (socket) => {
    console.log("[Server] A client connected");

    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`[Server] Client joined room: ${roomCode}`);
        socket.to(roomCode).emit('joinedRoom', roomCode);
    });

    socket.on('sendAnswers', (data) => {
        const { roomCode, answers } = data;
        console.log(`[Server] Received answers for room ${roomCode}: ${answers}`);
        // Broadcast the answers to all clients in the room
        socket.to(roomCode).emit('sendAnswers', data);
        botSocket.emit('evaluateAnswer', data)
    });

    socket.on('disconnect', () => {
        console.log("[Server] A client disconnected");
    });
});

// Start the server
const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});