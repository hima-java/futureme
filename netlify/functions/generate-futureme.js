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

function cleanAndParseJson(rawText) {
    let cleanText = rawText.trim();
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

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { name, age, goal, struggle, oneYearVision, tone } = await req.json();

        if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'All fields (name, age, goal, struggle, oneYearVision, tone) are required.'
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

        const replyText = await callOpenRouter([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        const parsedData = cleanAndParseJson(replyText);

        return new Response(
            JSON.stringify({
                success: true,
                data: parsedData
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
