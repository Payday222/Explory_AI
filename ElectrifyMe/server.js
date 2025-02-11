const express = require('express');
//const http = require('http'); // maybe destroy
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000
const app = express();


app.use(express.static(path.join(__dirname,'public')));


const expressServer = app.listen(PORT, () => console.log(`listen on port ${PORT}`))

const io = new Server(expressServer,{
    cors:{
        origin: process.env.NODE_ENV === "production" ?  false : ["http://localhost:3500", "http://127.0.0.1:3500"]
    }
})



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
    // MARCEL
    socket.on('sendMessageToClient', ({ room, socketId, message }) => {
     

        const clientsInRoom = io.sockets.adapter.rooms[room]?.sockets;
        

        if (clientsInRoom !== null ) {
            io.to(socketId).emit('receiveMessage', {
                from: socket.id,
                message: message
            });
            console.log(`Message sent to ${socketId} in room ${room}: ${message}`);
        }
        else{
            console.log("fuck u");
        } 
    });
});

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });