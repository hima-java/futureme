/**
 * FutureMe — Frontend Application Engine
 * Nitish's Founder Labs Live Build
 * Connects the premium UI matrix with the secure backend Gemini controller
 */

// Global App State
let userProfileContext = null;
let chatHistory = [];

// Determine API Base URL dynamically (handles file:// local open fallback to port 5000)
const API_BASE_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:5000' 
    : window.location.origin;

// 1. Navigation & Reveal Animations
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll Reveal Observer (Smooth Apple-style fades)
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
});

// 2. Toast Notification System
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    const toastText = toast.querySelector('.toast-text');
    if (message) toastText.textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function shareFutureMe() {
    if (!userProfileContext) {
        showToast("Create your FutureMe reflection first to generate a shareable link!");
        return;
    }

    const shareText = `🔮 FutureMe | Built in Nitish's Founder Labs\n"Meet the version of you who already made it."\nSynthesize your identity vector: ${window.location.origin}`;
    navigator.clipboard.writeText(shareText).then(() => {
        showToast('Your FutureMe moment is ready to share.');
    }).catch(() => {
        showToast('Moment link generated!');
    });
}

// 3. Core Reflection Generator
async function generateFutureMe(event) {
    event.preventDefault();

    // Elements
    const form = document.getElementById('futureForm');
    const submitBtn = document.querySelector('.btn-submit');
    const errorBox = document.getElementById('errorBox');
    const loadingEngine = document.getElementById('loadingEngine');
    const loaderText = document.getElementById('loaderText');
    const resultEngine = document.getElementById('resultEngine');

    // Values
    const name = document.getElementById('userName').value.trim();
    const age = document.getElementById('userAge').value.trim();
    const goal = document.getElementById('userGoal').value.trim();
    const struggle = document.getElementById('userStruggle').value.trim();
    const timeline = document.getElementById('userTimeline').value.trim();
    const tone = document.getElementById('futureTone').value;

    // Local Validation
    if (!name || !age || !goal || !struggle || !timeline || !tone) {
        errorBox.textContent = '⚠️ Please populate all required configuration matrix blocks.';
        errorBox.style.display = 'flex';
        return;
    }
    errorBox.style.display = 'none';
    resultEngine.style.display = 'none';

    // Disable submission to prevent duplicate clicks
    submitBtn.disabled = true;
    loadingEngine.style.display = 'flex';

    // Cycle processing messages
    const loadingPhrases = [
        "Assembling your architectural future state...",
        "Establishing quantum telemetry on 1-year axis...",
        "Analyzing operational blocker parameters...",
        "Formulating exact non-negotiable vectors..."
    ];
    
    let phraseIndex = 0;
    const phraseInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
        loaderText.textContent = loadingPhrases[phraseIndex];
    }, 400);

    const startTime = Date.now();

    try {
        // Construct standard REST request payload matching Express endpoint
        const requestPayload = {
            name: name,
            age: age,
            goal: goal,
            struggle: struggle,
            oneYearVision: timeline,
            tone: tone
        };

        // Query secure Backend endpoint
        const response = await fetch(`${API_BASE_URL}/api/generate-futureme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestPayload)
        });

        const result = await response.json();

        // Enforce 1.5s visual pause for atmospheric experience
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = Math.max(1500 - elapsedTime, 0);
        await new Promise(resolve => setTimeout(resolve, remainingDelay));

        clearInterval(phraseInterval);
        loadingEngine.style.display = 'none';

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Cognitive sync pipeline failed. Please reset and try again.');
        }

        // Cache profile context for subsequent chat dialogues
        userProfileContext = requestPayload;

        // Render dynamic payload into UI DOM elements
        document.getElementById('resultHeaderTone').innerText = `Message from your FutureMe [Style: ${tone}]`;
        document.getElementById('resultDynamicMsg').innerText = result.data.message;
        document.getElementById('resultIdentity').innerText = result.data.futureIdentity;
        document.getElementById('resultHabit').innerText = result.data.habit;
        
        // Custom warning & mantra nodes
        document.getElementById('resultWarning').innerText = result.data.warning || "Do not drift from the baseline habits. Every compromise sets the timeline back.";
        document.getElementById('resultMantra').innerText = result.data.mantra ? `“${result.data.mantra}”` : "“Focus is leverage. Action is authority.”";

        // Render tactile moves
        const movesList = document.getElementById('resultMoves');
        movesList.innerHTML = '';
        if (result.data.nextMoves && Array.isArray(result.data.nextMoves)) {
            result.data.nextMoves.forEach(move => {
                const li = document.createElement('li');
                li.textContent = move;
                movesList.appendChild(li);
            });
        }

        // Initialize Temporal Sandbox Live Chat Inputs
        document.getElementById('chatInput').disabled = false;
        document.getElementById('chatSendBtn').disabled = false;

        const chatHistoryContainer = document.getElementById('chatHistory');
        chatHistoryContainer.innerHTML = ''; // Strip welcome placeholder

        // Append initial custom temporal welcome
        const initialBubble = document.createElement('div');
        initialBubble.className = 'chat-bubble bubble-future';
        initialBubble.textContent = `Temporal line open, ${name}. I am looking back from the point where we successfully hit: "${timeline}". Let's cut through the noise. What is currently holding you back from executing your tactical moves today? Ask me anything.`;
        chatHistoryContainer.appendChild(initialBubble);

        // Display results
        resultEngine.style.display = 'block';
        
        // Auto scroll viewport directly to results block
        setTimeout(() => {
            resultEngine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

        showToast("Quantum identity matrix successfully calibrated.");

    } catch (error) {
        clearInterval(phraseInterval);
        loadingEngine.style.display = 'none';
        submitBtn.disabled = false;

        errorBox.textContent = `⚠️ Error: ${error.message || 'FutureMe could not respond right now. Try again.'}`;
        errorBox.style.display = 'flex';
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 4. Live Sync Conversational Sandboxing
function handleChatSubmit(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const historyContainer = document.getElementById('chatHistory');
    const typingIndicator = document.getElementById('chatTypingIndicator');

    const question = input.value.trim();
    if (!question || !userProfileContext) return;

    // Append user dialogue bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-user';
    userBubble.textContent = `“${question}”`;
    historyContainer.appendChild(userBubble);

    // Disable controls
    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Auto Scroll
    historyContainer.scrollTop = historyContainer.scrollHeight;

    // Show elegant typing indicator
    typingIndicator.style.display = 'flex';
    historyContainer.scrollTop = historyContainer.scrollHeight;

    try {
        // Query backend temporal chat pipeline
        const response = await fetch(`${API_BASE_URL}/api/chat-futureme`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userProfile: userProfileContext,
                chatHistory: chatHistory,
                question: question
            })
        });

        const result = await response.json();
        
        // Clear loader
        typingIndicator.style.display = 'none';

        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Signal dropped. Please try resending.');
        }

        // Append Future Self bubble
        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-bubble bubble-future';
        replyBubble.textContent = result.reply;
        historyContainer.appendChild(replyBubble);

        // Store dialogue history
        chatHistory.push({ role: 'user', message: question });
        chatHistory.push({ role: 'futureme', message: result.reply });

        // Auto Scroll
        historyContainer.scrollTop = historyContainer.scrollHeight;

    } catch (error) {
        typingIndicator.style.display = 'none';
        
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble bubble-future';
        errorBubble.style.border = '1px solid rgba(255, 69, 58, 0.3)';
        errorBubble.style.color = '#ff453a';
        errorBubble.textContent = `System Offline: ${error.message || 'Signal lost. Try again.'}`;
        historyContainer.appendChild(errorBubble);
        
        historyContainer.scrollTop = historyContainer.scrollHeight;
    } finally {
        // Re-enable inputs
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

// 5. Utility Matrix Functions
function copyResult() {
    if (!userProfileContext) return;
    
    const message = document.getElementById('resultDynamicMsg').textContent;
    const identity = document.getElementById('resultIdentity').textContent;
    const moves = Array.from(document.querySelectorAll('#resultMoves li')).map((li, i) => `${i+1}. ${li.textContent}`).join('\n');
    const habit = document.getElementById('resultHabit').textContent;
    const warning = document.getElementById('resultWarning').textContent;
    const mantra = document.getElementById('resultMantra').textContent;

    const copyBlock = `🔮 FUTUREME REPORT | IDENTITY MATRIX 🔮\n\n` + 
                      `👤 Operator: ${userProfileContext.name} (${userProfileContext.age} yrs)\n` +
                      `🎯 Goal Alignment: ${userProfileContext.goal}\n` +
                      `🛡️ Active Tone: ${userProfileContext.tone}\n\n` +
                      `💬 TRANSMISSION:\n"${message}"\n\n` +
                      `🔑 FUTURE IDENTITY VECTOR:\n${identity}\n\n` +
                      `⚡ NEXT 3 TACTICAL RELAYS:\n${moves}\n\n` +
                      `🔄 COMPOUND HABIT:\n${habit}\n\n` +
                      `⚠️ CRITICAL WARNING:\n${warning}\n\n` +
                      `✨ memMantra:\n${mantra}\n\n` +
                      `Generated at Nitish's Founder Labs.`;

    navigator.clipboard.writeText(copyBlock).then(() => {
        showToast('Reflection card copied to clipboard!');
    }).catch(() => {
        showToast('Copy failed. Please select text manually.');
    });
}

function resetForm() {
    document.getElementById('futureForm').reset();
    document.getElementById('resultEngine').style.display = 'none';
    document.querySelector('.btn-submit').disabled = false;
    
    // Reset Chat Inputs
    const chatInput = document.getElementById('chatInput');
    chatInput.disabled = true;
    chatInput.value = '';
    document.getElementById('chatSendBtn').disabled = true;
    
    // Reset Chat History Sandbox Window
    const chatHistoryContainer = document.getElementById('chatHistory');
    chatHistoryContainer.innerHTML = `
        <div class="chat-bubble bubble-future" id="chatPlaceholder">
            Fill in your profile details above and generate your FutureMe card to activate this secure Temporal Sandbox. Once generated, you can ask me anything about your roadmap, habits, or mental hurdles.
        </div>
    `;
    
    userProfileContext = null;
    chatHistory = [];
    
    showToast("Identity Matrix parameters successfully reset.");
}
