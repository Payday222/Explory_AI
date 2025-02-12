const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
dotenv.config();

const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins during development
    methods: ["GET", "POST"],
  },
});

app.use(express.static('public'));

const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

const chatHistory = [];

io.on('connection', (socket) => {
  console.log('bot socket connected', socket.id);
  socket.emit('testMessage', "servers good");
  
  socket.on('SendData', async (fullPrompt) => {
    console.log('Prompt from client: ', fullPrompt);
    await getChatCompletion(fullPrompt, socket);
  });
});

// Function to get AI response using OpenAI API
async function getChatCompletion(prompt, socket) {
  let propmcik = prompt;

  // Build messages for OpenAI API
  const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
  }));
  messages.push({ role: 'system', content: context });
  messages.push({ role: 'user', content: propmcik });

  console.log('Messages sent to OpenAI:', messages);

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4", // Corrected model name
    });

    const response = chatCompletion.choices[0].message.content;
    const splitToken = "HUBERCIKLUBCHLOPCOW";
    const tokenIndex = response.indexOf(splitToken);
    let clientResponse = "";
    let hostResponse = "";

    if (tokenIndex !== -1) {
      clientResponse = response.substring(0, tokenIndex).trim();
      hostResponse = response.substring(tokenIndex + splitToken.length).trim();
    } else {
      clientResponse = response;
    }

    // Send both responses to the client
    socket.emit('botResponseClient', clientResponse);
    socket.emit('botResponseHost', hostResponse);
    
    // Save history if needed
    chatHistory.push(['user', propmcik]);
    chatHistory.push(['assistant', response]);

  } catch (error) {
    console.error('Error generating AI response:', error);
    socket.emit('botResponseClient', "Error: Unable to get response from AI.");
  }
}

// Start the server
server.listen(3007, () => {
  console.log("Bot server running on port 3007");
});
