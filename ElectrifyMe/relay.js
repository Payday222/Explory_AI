// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://188.127.1.110:3005", // Allow requests from this origin
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
const botSocket = Client('http://188.127.1.110:3007'); // Connect to the bot server

app.use(express.static('public')); // Serve static files from the 'public' directory


io.on('connection', (socket) => {
    console.log("[Server] A client connected");

    
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`[Server] Client joined room: ${roomCode}`);
        socket.to(roomCode).emit('joinedRoom', roomCode);
    });

    socket.on('sendAnswers', (data) => {
        const { roomCode, answers, clientID  } = data;
        console.log(`[Server] Received answers for room ${roomCode}: ${answers}`);
        console.log("clientID recieved: ", clientID);
        // Broadcast the answers to all clients in the room
        // socket.to(roomCode).emit('sendAnswers', JSON.stringify(data));
        botSocket.emit('evaluateAnswer', {...data}); // Forward to the bot for evaluation
    });

    
    socket.on('disconnect', () => {
        console.log("[Server] A client disconnected");
    });

    botSocket.on('EvaluationResponse', (data) => {
        const { response, clientID } = data;
        console.log('Received EvaluationResponse from bot:', response, 'for clientID:', clientID);
        io.to(clientID).emit('EvaluationResponse', { response });
    });
    
});

const PORT = process.env.PORT || 3008;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});