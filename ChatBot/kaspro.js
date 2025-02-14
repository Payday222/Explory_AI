const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
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
  console.log('Bot socket connected:', socket.id);
  socket.emit('testMessage', "Server is good");

  socket.on('SendData', async (fullPrompt) => {
    console.log('Prompt from client:', fullPrompt);
    await getChatCompletion(fullPrompt, socket);
  });
  //! cleaar chat history on disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected, clearing history`);
    chatHistory.length = 0; // Clears history
  });
  //! clear chat history on disconnect
  

  socket.on('evaluateAnswer', async (data) => {
    const { answer } = data;
    let prompt = `Take the role of a teacher. For the test generated by you earlier, a student submitted the following answers: ${JSON.stringify(data)}, evaluate them. Provide the score and some feedback. Begin your answer with "TEACHER:"`;

    q.enqueue(prompt);
    processQueue();
  });
});
class Queue {
  constructor() {
    this.items = {};
    this.front = 0;
    this.back = 0;
  }

  enqueue(element) {
    this.items[this.back] = element;
    this.back++;
  }
  dequeue() {
    if(this.isEmpty()) return null;
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return item;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  peek() {
    return this.isEmpty() ? null : this.items[this.front];
  }
  size() {
    return this.back - this.front;
  }
}

const q = new Queue;

let isGenerating = false;

async function processQueue() {
  // if(isGenerating || q.isEmpty) return

  isGenerating = true; 
  const prompt = q.dequeue();
  await getChatCompletion(prompt);

  isGenerating = false;

  if(!isGenerating) {
    processQueue();
  }
}

if(!isGenerating) {
  processQueue();
}
async function getChatCompletion(prompt, socket) {

  isGenerating = true;

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
      socket.emit('EvaluationResponse', response,);
    }

    if (tokenIndex !== -1) {
      clientResponse = response.substring(0, tokenIndex).trim();
      hostResponse = response.substring(tokenIndex + splitToken.length).trim();
    } else {
      clientResponse = response;
    }

    socket.emit('botResponseClient', clientResponse);
    socket.emit('botResponseHost', hostResponse);
    
    chatHistory.push(['user', prompt]);
    chatHistory.push(['assistant', response]);

    isGenerating = false;

  } catch (error) {
    console.error('Error generating AI response:', error);
    socket.emit('botResponseClient', "Error: Unable to get response from AI.");
  }
}

// Start the server
server.listen(3007, () => {
  console.log("Bot server running on port 3007");
});