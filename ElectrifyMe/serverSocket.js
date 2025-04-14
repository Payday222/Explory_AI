const express = require('express');
//const http = require('http'); // maybe destroy
const path = require('path');
const { Server } = require('socket.io');
const redisAdapter = require('socket.io-redis');
const PORT = 3005
const app = express();
const { io: Client} = require('socket.io-client');

app.use(express.static(path.join(__dirname,'Public')));


const expressServer = app.listen(PORT, () => console.log(`listen on port ${PORT}`))

const io = new Server(expressServer,{
    cors:{
        origin: process.env.NODE_ENV === "production" ?  false : ["http://localhost:3500", "http://127.0.0.1:3500"]
    }
})
const botSocket = Client('http://188.127.1.110:3007');

// io.adapter(redisAdapter({host: 'localhost', port: 3010}));

let rooms = {};


botSocket.on('connect', () => {
console.log("botSocket connected to serverSocket");
botSocket.on('botResponseClientv2', (data) => { 
    const {roomCode, clientResponse} = data;

    if(!roomCode) {
        console.log('roomCode null');
    }
    if(!clientResponse) {
        console.log('clientResponse null');
    }

    io.to(roomCode).emit('testServerSocket', clientResponse);
    console.log("ServerSocket recieved and emmited test: ", data, "to:", roomCode);


})
});


io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    socket.on('createRoom', (roomCode,oldRoomCode ) => {
        // setTimeout(() => {
        //     const rooming = io.sockets.adapter.rooms;
        //     const sids = io.sockets.adapter.sids;
        
        //     console.log('--- Room Overview ---');
        
        //     for (let [roomName, socketSet] of rooming) {
        //         // Skip rooms that are just individual socket IDs
        //         if (!sids.has(roomName)) {
        //             console.log(`Room: ${roomName}`);
        //             console.log('Sockets:', [...socketSet]);
        //             console.log('--------------------');
        //         }
        //     }
        // }, 500);

        // if (oldRoomCode && rooms[oldRoomCode] && socket.id === rooms[oldRoomCode].host) {
            
        //     socket.emit('cleanUpRoomData', oldRoomCode);

        //     for (let socketId of rooms[oldRoomCode].clients) {
        //         if (socketId !== socket.id) {
        //             const clientSocket = io.sockets.sockets.get(socketId);
        //             if (clientSocket) {
                       
        //                clientSocket.leave(oldRoomCode)
        //             }
        //         }
        //     }

        //     delete rooms[oldRoomCode];
            
        // }
        
        //! This might not be needed but for future add
        // for (const room of socket.rooms) {
        //     if (room !== socket.id) {
        //         socket.leave(room);
        //     }
        // }
         rooms[roomCode] = { host: socket.id, clients: [] };
         socket.join(roomCode);
         socket.emit('roomCreated', roomCode);


        
    });

    //socket.on

    socket.on('joinRoom', (roomCode) => {
        const room = rooms[roomCode]
        if (room) {
            
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }
            if (!room.clients.includes(socket.id)) {
                room.clients.push(socket.id);
            }
            socket.join(roomCode);
            socket.emit('joinedRoom', roomCode);
            io.to(room.host).emit('newClient', socket.id);
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('sendMessage', (data) => {
        const { roomCode, message, name } = data;
        io.to(rooms[roomCode].host).emit('messageReceived', { clientId: socket.id, message, name });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        // for (const roomCode in rooms) {
        //     const room = rooms[roomCode];
        //     if (room.host === socket.id) {
        //         //delete rooms[roomCode];
        //     } else {
        //         room.clients = room.clients.filter(clientId => clientId !== socket.id);
        //     }
        // }
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