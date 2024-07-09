const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API;

app.use(cors({
    origin: 'http://localhost:3000',
}));
app.use(bodyParser.json());

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);

// Store conversation history as a global variable
const conversations = {};

app.post('/api/query', async (req, res) => {
    try {
        if (!API_KEY) {
            throw new Error('GEMINI_API key is not set in environment variables.');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const { message, sessionId } = req.body;

        // Initialize conversation history if it doesn't exist
        if (!conversations[sessionId]) {
            conversations[sessionId] = [];
        }

        // Add user message to history
        conversations[sessionId].push({ user: 'User', text: message });

        // Construct prompt with conversation history
        const prompt = `You are QueryAI, an advanced data query assistant. 
        ... (your data description)

        Previous Conversation:
        ${conversations[sessionId].map(msg => `${msg.user}: ${msg.text}`).join('\n')}

        User Query: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);

        // Add AI response to history
        conversations[sessionId].push({ user: 'AI', text: text });

        res.json({ response: text });
    } catch (error) {
        console.error('Error generating content:', error);

        if (error.message.includes('GEMINI_API key is not set')) {
            res.status(500).json({ error: 'API key error' });
        } else {
            res.status(500).json({ error: 'Error generating content' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});