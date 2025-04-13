const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Console } = require("console");

dotenv.config();

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins during development
    methods: ["GET", "POST"],
  },
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

const roomsocket = ClientIo("http://188.127.1.110:3005");


// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Store chat history
const chatHistory = new Map();
let context = new Map();
//let roomcode = "codecode";

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Bot socket connected:', socket.id);
  socket.emit('testMessage', "Server is good");

  // Listen for 'SendData' events from clients
  socket.on('SendData', async (fullPrompt,contexting, roomCode) => {
    console.log('Prompt from client:', fullPrompt);
    context.set(roomCode,contexting);
    //! Lets see...
    

    await getChatCompletion(fullPrompt, socket, roomCode);
  });
  //! clear chat history on disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected, clearing history`);
    
  });
  // clear chat history on disconnect
  
  
//!  I am a bit scared about context not being sent correctly
  socket.on('sendAnswers', async (data) => {
    const {roomCode, answers} = data;
    console.log(`[Server] Received answers for room ${roomCode}: ${answers}`);
    console.log("clientID recieved: ", socket.id);
    
    let prompt = `Take the role of a teacher. For the test generated by you earlier, a student submitted the following answers: ${JSON.stringify(answers)}, 
    evaluate them. Provide the score and some feedback. Provide the person with materials to use and maybe some sources with this information: ${context.get(roomCode)}. 
    Begin your answer with "TEACHER@:" use the context as a base to provide him with materials. Do not ask me if I need something more or anything of sorts `;
    console.log('ClientID: ', socket.id); 
    console.log('Context pls work', context.get(roomCode))
  
    await getChatCompletion(prompt, socket, roomCode);
  });
});



async function getChatCompletion(prompt, socket, roomCode) {
  const SingularHistory = chatHistory.get(roomCode) || [];


  const messages = SingularHistory.map(([role, content]) => ({
    role,
    content,
  }));
  //roomCode = roomCode;
   
  messages.push({ role: 'user', content: prompt });
 
  console.log('Messages sent to OpenAI:', messages);

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4", 
    });

    const response = chatCompletion.choices[0].message.content;
    console.log('Response from OpenAI:', response);

    const splitToken = "HUBERCIKLUBCHLOPCOW";
    const tokenIndex = response.indexOf(splitToken);
    let clientResponse = "";
    let hostResponse = "";

    if (response.includes("TEACHER@:")) {
      // Emit the response along with the clientID so that the relay knows where to send it.
      const clientIDs = socket.id;
      //!  socket.emit('EvaluationResponse', { response, clientIDs }); - maybe change back
      io.to(clientIDs).emit('EvaluationResponse', { response }); //? this should be better
      console.log('Emitted EvaluationResponse for clientID:', clientIDs);
    }
    else
    {
      if (tokenIndex !== -1) {
        clientResponse = response.substring(0, tokenIndex).trim();
        hostResponse = response.substring(tokenIndex + splitToken.length).trim();
      } else {
        clientResponse = response;
      } 
  
      if(io.sockets.adapter.rooms.has(roomCode)) {
        socket.broadcast.to(roomCode).emit('botResponseClient', clientResponse);
      } else {
        console.log("Room doesnt exist");
      }
      socket.emit('botResponseHost', hostResponse);
      console.log('emmiting host and client botresponse', clientResponse, hostResponse);
    }

    if (tokenIndex !== -1) {
      clientResponse = response.substring(0, tokenIndex).trim();
      hostResponse = response.substring(tokenIndex + splitToken.length).trim();
    } else {
      clientResponse = response;
    } 
    io.emit('botResponseClient', clientResponse);
    socket.emit('botResponseHost', hostResponse);
    console.log('emmiting host and client botresponse', clientResponse, hostResponse);
    
    //use socket.to(roomcode) instead of io.emit
    //send the roomcode with the test data and pass it along to getchatcompletion 
    
    
    SingularHistory.push(['user', prompt]);
    SingularHistory.push(['assistant', response]);
    chatHistory.set(roomCode,SingularHistory);
    

  } catch (error) {
    console.error('Error generating AI response:', error);
    socket.to(roomCode).emit('botResponseClient', "Error: Unable to get response from AI.");
    
  }

  socket.on('cleanUpRoomData', (oldRoomCode) => {
    console.log(`Cleaning up data for room: ${oldRoomCode}`);
    
    context.delete(oldRoomCode);
    chatHistory.delete(oldRoomCode);
});

}


// Start the server
server.listen(3007, () => {
  console.log("Bot server running on port 3007");
});