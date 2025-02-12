const OpenAI = require("openai"); 
const dotenv = require("dotenv"); 
const readlineSync = require("readline-sync");
const colours = require("colors");
const fs = require("fs"); 
const express = require('express');
const http = require('http');
const { Socket } = require("socket.io");
const server = express();
dotenv.config();

const socketIo = require('socket.io')
const app = express();
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('bot socket connected');

  socket.on('SendData', (fullPrompt) => {
    console.log('prompt from client: ', fullPrompt);
  
    getChatCompletion(fullPrompt);
  });
});

const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");
const chatHistory = [];


const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

async function getChatCompletion(prompt) {
  let propmcik = prompt;
  // * You can add onclick with a boolean or some shit if you want to have the while true for a reason
  //! I added the loop so that I can test the save history shit if you don't want it, the unsaved version is commented below [ctrl k u]
// while(true){
  
  
  
      // propmcik += await readlineSync.question("Give a quesion\n");

      
      

  const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
  }));
  messages.push({role: 'system', content: context})
  messages.push({ role: 'user', content: propmcik });
  console.log(messages);    
      const chatCompletion = await openai.chat.completions.create({ //response of the AI
        messages: messages,
        model: "gpt-4o", 
      });
  let response = chatCompletion.choices[0].message.content //actual text
  const splitToken = "HUBERCIKLUBCHLOPCOW"
  const tokenIndex = response.indexOf(splitToken);
  let clienResponse = "";
  let hostResponse = "";
  if(tokenIndex !== -1) {
    clienResponse = response.substring(0, tokenIndex).trim();
    hostResponse = response.substring(tokenIndex + splitToken.length).trim();
  } else {
    clienResponse = response;
    console.log('no split token found in response');
  }
  io.emit('botResponseClient', clienResponse);  
  io.emit('botResponseHost', hostResponse);
  

  if (propmcik.toLowerCase().trim().length < 2) { 
    console.log(colours.bold(colours.yellow(chatCompletion.choices[0].message.content)));
    return;
  } 
  console.log(colours.bold(colours.yellow(chatCompletion.choices[0].message.content)));

  chatHistory.push(['user', propmcik]);
  chatHistory.push(['assistant',chatCompletion.choices[0].message.content]);
  propmcik = '';
}
// }
getChatCompletion();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: {origin: "*"} } )

// app.use(express.static("public"));

/*
let propmcik = " ";
const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");
  propmcik += context;
  propmcik += "Make a test about" + readlineSync.question("What subject should the test be about?\n ");
  propmcik += " on " + readlineSync.question("What grade is the test level on?\n") + " level  ";
  propmcik += " make a " +  readlineSync.question("How should the test look like?\n") + " style test without writing the answers";
  console.log(propmcik);
async function getChatCompletion(prompt) {
      const chatCompletion = await openai.chat.completions.create({
        messages: [{role:'user',content: prompt}],
        model: "gpt-4o", 
      });
      console.log(chatCompletion.choices[0].message.content);
    }
getChatCompletion(propmcik);*/

server.listen(3007, () => {
  console.log('chatbot running on port 3007');
})