import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable Middlewares
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files if requested
app.use(express.static(path.join(__dirname, '../frontend')));

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'replace_with_your_openrouter_api_key') {
    console.log('✓ OpenRouter API key detected and loaded.');
} else {
    console.warn('⚠️ Warning: OPENROUTER_API_KEY is not set or has placeholder value. Server will run, but API calls will fail gracefully.');
}

/**
 * Helper to call OpenRouter's chat completions endpoint
 * @param {Array} messages - Array of {role, content} objects
 * @returns {string} The assistant's reply text
 */
async function callOpenRouter(messages) {
    const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'FutureMe'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            temperature: 0.8,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        const err = new Error(`OpenRouter API error [${response.status}]: ${errorBody}`);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Helper to clean markdown syntax from JSON strings returned by the model
 * @param {string} rawText 
 * @returns {object} parsed JSON object
 */
function cleanAndParseJson(rawText) {
    let cleanText = rawText.trim();
    // Remove starting ```json or ``` blocks
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
    }
    
    if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    
    cleanText = cleanText.trim();
    return JSON.parse(cleanText);
}

/**
 * Route: POST /api/generate-futureme
 * Triggers the core reflection analysis.
 */
app.post('/api/generate-futureme', async (req, res) => {
    try {
        const { name, age, goal, struggle, oneYearVision, tone } = req.body;

        // Validation
        if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
            return res.status(400).json({
                success: false,
                error: 'All fields (name, age, goal, struggle, oneYearVision, tone) are strictly required.'
            });
        }

        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'replace_with_your_openrouter_api_key') {
            return res.status(503).json({
                success: false,
                error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY in your backend .env file.'
            });
        }

        const systemPrompt = `You are FutureMe, the future successful version of the user. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user's future self speaking directly to their current self.

Tone selected by user: ${tone}

Return only valid JSON in this exact format:
{
  "message": "A powerful 120-180 word message from the future self.",
  "futureIdentity": "A concise description of who the user is becoming.",
  "nextMoves": ["Action 1", "Action 2", "Action 3"],
  "habit": "One small daily habit they should start today.",
  "warning": "One mistake their future self warns them about.",
  "mantra": "A short memorable line they can repeat daily."
}

Make it specific. Avoid generic motivation. Avoid clichés. Make it emotional but practical. Do not include any markdown fences or explanatory text outside the JSON.`;

        const userMessage = `Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}`;

        console.log(`🤖 Generating FutureMe response for: ${name} (Tone: ${tone})`);
        
        const replyText = await callOpenRouter([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        // Safely parse
        const parsedData = cleanAndParseJson(replyText);

        return res.status(200).json({
            success: true,
            data: parsedData
        });

    } catch (error) {
        console.error('❌ Error during FutureMe generation:', error.message);

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'API rate limit hit. Please wait a moment and try again.',
                details: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: 'FutureMe could not respond right now. Try again.',
            details: error.message
        });
    }
});

/**
 * Route: POST /api/chat-futureme
 * Implements ongoing live conversation with FutureMe using context and history.
 */
app.post('/api/chat-futureme', async (req, res) => {
    try {
        const { userProfile, chatHistory, question } = req.body;

        if (!userProfile || !question) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: userProfile and question.'
            });
        }

        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'replace_with_your_openrouter_api_key') {
            return res.status(503).json({
                success: false,
                error: 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY in your backend .env file.'
            });
        }

        const { name, age, goal, struggle, oneYearVision, tone } = userProfile;

        const systemPrompt = `You are FutureMe, the future version of the user who already achieved their one-year vision. Reply directly to the user's question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are an AI model. Speak like the future self.

User profile context:
Name: ${name}
Age: ${age}
Goal: ${goal}
Struggle: ${struggle}
One-year vision: ${oneYearVision}
Tone preference: ${tone}

Reply in 2-5 short paragraphs. Give at least one clear action. Speak directly to their heart. Do not use generic corporate language. Maintain the requested "${tone}" tone strictly.`;

        // Build messages array with chat history
        const messages = [{ role: 'system', content: systemPrompt }];

        if (chatHistory && chatHistory.length > 0) {
            chatHistory.forEach(chat => {
                messages.push({
                    role: chat.role === 'user' ? 'user' : 'assistant',
                    content: chat.message
                });
            });
        }

        messages.push({ role: 'user', content: question });

        console.log(`💬 Ongoing Chat request from ${name}: "${question.substring(0, 40)}..."`);

        const replyText = await callOpenRouter(messages);

        return res.status(200).json({
            success: true,
            reply: replyText.trim()
        });

    } catch (error) {
        console.error('❌ Error during chat response:', error.message);

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'API rate limit hit. Please wait a moment and try again.',
                details: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: 'FutureMe could not respond right now. Try again.',
            details: error.message
        });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`
============================================================
🚀 FutureMe Full-Stack Service Launched Successfully!
💻 Local endpoint: http://localhost:${PORT}
📁 Static assets directory: /frontend
🔗 API Provider: OpenRouter (${MODEL})
============================================================
`);
});
