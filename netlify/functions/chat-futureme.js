const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

async function callOpenRouter(messages) {
    const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://futureme.netlify.app',
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

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { userProfile, chatHistory, question } = await req.json();

        if (!userProfile || !question) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required parameters: userProfile and question.'
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!OPENROUTER_API_KEY) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'OpenRouter API key is not configured.'
                }),
                { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
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

        const replyText = await callOpenRouter(messages);

        return new Response(
            JSON.stringify({
                success: true,
                reply: replyText.trim()
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error:', error.message);

        if (error.status === 429) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'API rate limit hit. Please wait a moment and try again.'
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: 'FutureMe could not respond right now. Try again.'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
