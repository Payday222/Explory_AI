const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

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

// Load context data from a file
const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Store chat history
const chatHistory = [];

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Bot socket connected:', socket.id);
  socket.emit('testMessage', "Server is good");

  // Listen for 'SendData' events from clients
  io.on('SendData', async (fullPrompt) => {
    console.log('Prompt from client:', fullPrompt);
    await getChatCompletion(fullPrompt, socket);
  });
  //! cleaar chat history on disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected, clearing history`);
    chatHistory.length = 0; // Clears history
  });
  //! clear chat history on disconnect
  

  socket.on('sendAnswers', async (data) => {
    const {roomCode, answers, clientID} = data;
    console.log(`[Server] Received answers for room ${roomCode}: ${answers}`);
    console.log("clientID recieved: ", clientID);
    let prompt = `Take the role of a teacher. For the test generated by you earlier, a student submitted the following answers: ${JSON.stringify(answers)}, evaluate them. Provide the score and some feedback. Begin your answer with "TEACHER:"`;
    console.log('ClientID: ', clientID); //works
  
    await getChatCompletion(prompt, socket, clientID);
  });
});



async function getChatCompletion(prompt, socket, clientID) {
  const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
  }));

  messages.push({ role: 'system', content: context });
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

    if (response.includes("TEACHER:")) {
      // Emit the response along with the clientID so that the relay knows where to send it.
      socket.emit('EvaluationResponse', { response, clientID });
      console.log('Emitted EvaluationResponse for clientID:', clientID);
    }

    if (tokenIndex !== -1) {
      clientResponse = response.substring(0, tokenIndex).trim();
      hostResponse = response.substring(tokenIndex + splitToken.length).trim();
    } else {
      clientResponse = response;
    }

    io.emit('botResponseClient', clientResponse);
    socket.emit('botResponseHost', hostResponse);
    
    
    chatHistory.push(['user', prompt]);
    chatHistory.push(['assistant', response]);

  } catch (error) {
    console.error('Error generating AI response:', error);
    socket.emit('botResponseClient', "Error: Unable to get response from AI.");
  }
}


// Start the server
server.listen(3005, () => {
  console.log("Bot server running on port 3007");
});