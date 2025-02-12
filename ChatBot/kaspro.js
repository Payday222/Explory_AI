const OpenAI = require("openai");
const dotenv = require("dotenv");
const readlineSync = require("readline-sync");
const colours = require("colors");
const fs = require("fs");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
dotenv.config();

const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Read context data from file
const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Store chat history
const chatHistory = [];

// Handle socket connection
io.on('connection', (socket) => {
  console.log('bot socket connected');

  // Receive prompt from client and generate response
  socket.on('SendData', async (fullPrompt) => {
    console.log('Prompt from client: ', fullPrompt);
    await getChatCompletion(fullPrompt);
  });
});

// Function to get AI response using OpenAI API
async function getChatCompletion(prompt) {
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
      console.log('No split token found in response');
    }

    // Emit the response to the client and host
    io.emit('botResponseClient', clientResponse);
    io.emit('botResponseHost', hostResponse);

    // Display response in the server logs
    console.log(colours.bold(colours.yellow(response)));

    // Add to chat history for context in future requests
    chatHistory.push(['user', propmcik]);
    chatHistory.push(['assistant', response]);

  } catch (error) {
    console.error("Error with OpenAI API:", error);
  }
}

// Start the server
server.listen(3007, () => {
  console.log('Chatbot running on port 3007');
});
