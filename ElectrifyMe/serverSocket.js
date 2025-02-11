const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');

const PORT = 3005;
const app = express();

app.use(express.static(path.join(__dirname, 'Public')));

const expressServer = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3500", "http://127.0.0.1:3500"]
    }
});

let rooms = {};

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    socket.on('createRoom', (roomCode) => {
        rooms[roomCode] = { host: socket.id, clients: [] };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode]) {
            rooms[roomCode].clients.push(socket.id);
            socket.join(roomCode);
            socket.emit('joinedRoom', roomCode);
            io.to(rooms[roomCode].host).emit('newClient', socket.id);
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('sendMessage', (data) => {
        const { roomCode, message } = data;
        io.to(rooms[roomCode].host).emit('messageReceived', { clientId: socket.id, message });
        StoreData(message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            if (room.host === socket.id) {
                delete rooms[roomCode];
            } else {
                room.clients = room.clients.filter(clientId => clientId !== socket.id);
            }
        }
    });

    socket.on('sendMessageToClient', ({ room, socketId, message }) => {
        const clientsInRoom = io.sockets.adapter.rooms[room]?.sockets;

        if (clientsInRoom) {
            io.to(socketId).emit('receiveMessage', {
                from: socket.id,
                message: message
            });
            console.log(`Message sent to ${socketId} in room ${room}: ${message}`);
        } else {
            console.log("Room does not exist.");
        }
    });
});

// History
const filePath = path.join(__dirname, 'history.json');
const tempFilePath = path.join(__dirname, 'temp.txt');
let stringArray = [];

if (fs.existsSync(filePath)) {
    try {
        stringArray = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error("Error reading JSON file:", error);
    }
}

function StoreData(message) {
    fs.appendFileSync(tempFilePath, message + '\n');
    console.log(`Appended: ${message}`);
}

function saveFinalArray() {
    if (fs.existsSync(tempFilePath)) {
        const lines = fs.readFileSync(tempFilePath, 'utf8').split('\n').filter(Boolean);
        stringArray.push(...lines);

        fs.writeFileSync(filePath, JSON.stringify(stringArray, null, 2));
        fs.unlinkSync(tempFilePath);
        console.log("Final array saved:", stringArray);
    }
}

// ✅ Use `process.on()` instead of `app.on()`
process.on('exit', saveFinalArray);
