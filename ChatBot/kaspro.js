const OpenAI = require("openai"); 
const dotenv = require("dotenv"); 
const readlineSync = require("readline-sync");
const colours = require("colors");
const fs = require("fs"); 
dotenv.config();

const textData = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(line => line.trim() !== '');
const context = textData.join("\n");
const chatHistory = [];


const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

async function getChatCompletion() {
  let propmcik = " ";
  // * You can add onclick with a boolean or some shit if you want to have the while true for a reason
  //! I added the loop so that I can test the save history shit if you don't want it, the unsaved version is commented below [ctrl k u]
while(true){
  
  
  
      propmcik += await readlineSync.question("Give a quesion\n");
  const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
  }));
  messages.push({role: 'system', content: context})
  messages.push({ role: 'user', content: propmcik });
  console.log(messages);    
      const chatCompletion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-4o", 
      });
  
  

  if (propmcik.toLowerCase().trim().length < 2) { 
    console.log(colours.bold(colours.yellow(chatCompletion.choices[0].message.content)));
    return;
  } 
  console.log(colours.bold(colours.yellow(chatCompletion.choices[0].message.content)));

  chatHistory.push(['user', propmcik]);
  chatHistory.push(['assistant',chatCompletion.choices[0].message.content]);
  propmcik = '';
}}
getChatCompletion();


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