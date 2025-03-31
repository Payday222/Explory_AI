const OpenAI = require("openai");
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { Console } = require("console");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],

    }
});

app.use(express.static(public));

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

io.on('connection', () => {
    Console.log('exercise generation socket connected (serverside)');

    io.on('makeExercise', (data) => {
        let prompt = "";
        let type = data;
        console.log("data: ", data);
        switch(type) {
            case 'flashcards':
            prompt = `Generate a set of flashcards on the topic of ${topic}, split each flashcard with "CARDSPLIT", and divide flashcard and answer with "ANSSPLIT"`;
            break;

            case 'article':
            prompt = `generate an educational article on the topic of ${topic}, meant to educate a student through a whole lesson. Ensure merithorical correctness, and do not include anything besides the article.
            You may add links to actual articles from the internet if you deem it approprieate, no hyperlinks, plaintext links`;
            break;

            case 'bulletPoints':
            prompt = `Generate a note consisting of bullet points about the topic ${topic} Make sure theres enough to support a whole lesson's worth of knowledge.`;
            break;

            case 'mindMap':
            prompt = `Create a mind map on the topic of ${topic} ensure each section of the mind map has at least six nodes, and that they are well described. `;
            break;

            case 'video':
            prompt = `Find me links to valuable educational videos on the topic of ${topic}`;
            break;
        }
    })


})

async function getChatCompletion(prompt) {
    const messages = chatHistory.map(([role, content]) => ({
      role,
      content,
    }));
  
     
    messages.push({ role: 'user', content: prompt });
  
    console.log('Messages sent to OpenAI:', messages);
  
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4", 
      });
  
      const response = chatCompletion.choices[0].message.content;
      console.log('Response from OpenAI:', response);
  
     
  
      
      chatHistory.push(['user', prompt]);
      chatHistory.push(['assistant', response]);
  
    } catch (error) {
      console.error('Error generating AI response:', error);
     
    }
  }


server.listen(3007, () => {
    console.log("Bot server running on port 3007");
  });