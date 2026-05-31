# FutureMe 🔮 — Meet the version of you who already made it

FutureMe is a premium, AI-powered self-reflection and dialogue application designed for founders and builders to connect with the person they are becoming. By inputting details about current struggles, ambitions, and future milestones, the app synthesizes a structured, highly personalized quantum letter from their future self, along with immediate next moves, warning parameters, and daily mantras.

This application is built live under the brand **Nitish’s Founder Labs**.

---

## Folder Structure

```text
futureme/
  frontend/
    index.html     # Premium responsive structure
    style.css      # Custom Apple-style and visual effects
    script.js      # E2E AJAX fetch operations & chat loops
  backend/
    server.js      # Express server safely calling Gemini
    package.json   # Backend dependencies configuration
    .env.example   # Configuration template
  README.md        # Documentation
```

---

## Getting Started (Live Build Setup)

Follow these steps to run the application fully locally for your live demonstration session.

### 1. Setup Backend Dependencies
Navigate to the `backend/` directory and install the required modules:
```bash
cd backend
npm install
```

### 2. Configure Your Gemini API Key
Create a `.env` file by copying the template file:
```bash
cp .env.example .env
```
Open `.env` in your editor and input your actual Google Gemini API Key:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
PORT=5000
```

### 3. Run the Secure Backend
Start the server in development mode (which utilizes `nodemon` to reload automatically upon code tweaks):
```bash
npm run dev
```
If you don't have `nodemon` installed globally, you can start the standard Node process:
```bash
npm start
```
You should see:
```text
============================================================
🚀 FutureMe Full-Stack Service Launched Successfully!
💻 Local endpoint: http://localhost:5000
📁 Static assets directory: /frontend
============================================================
```

### 4. Run the Premium Frontend
Since the Express server serves the static folder, you can run the whole app by simply opening:
👉 **[http://localhost:5000](http://localhost:5000)**

Alternatively, you can open the static file `frontend/index.html` directly in your browser or run it via VS Code's Live Server. The frontend client includes smart fallback handlers that allow it to correctly communicate with `http://localhost:5000` regardless of how the index page is opened!

---

## Secure API Routes Explanation

The backend server ensures your `GEMINI_API_KEY` remains securely hidden on the server side:

### 1. Core Profile Synthesizer
* **Endpoint:** `POST /api/generate-futureme`
* **Content-Type:** `application/json`
* **Request Payload Example:**
  ```json
  {
    "name": "Nitish",
    "age": "23",
    "goal": "Build a successful AI startup",
    "struggle": "Lack of consistency",
    "oneYearVision": "Running a profitable AI company",
    "tone": "Brutally Honest"
  }
  ```
* **Response Payload Example:**
  ```json
  {
    "success": true,
    "data": {
      "message": "Hey Nitish, I am the version of you who stopped waiting around for permission. Hitting running a profitable AI company wasn't a checklist, it required consistent daily work...",
      "futureIdentity": "The high-accountability operator who conquered excuses and replaced them with daily execution.",
      "nextMoves": [
        "Delete or restrict all applications that induce distraction or artificial planning loops.",
        "Accept that lack of consistency is entirely within your control.",
        "Tell three high-performing peers about your target."
      ],
      "habit": "A strict 'No-Social-Media' rule until you have completed at least 90 minutes of high-leverage focus.",
      "warning": "Do not let planning cycles replace the act of publishing daily progress.",
      "mantra": "Action cures fear. Speed is our leverage."
    }
  }
  ```

### 2. Conversational Chat Engine
* **Endpoint:** `POST /api/chat-futureme`
* **Content-Type:** `application/json`
* **Request Payload Example:**
  ```json
  {
    "userProfile": {
      "name": "Nitish",
      "age": "23",
      "goal": "Build a successful AI startup",
      "struggle": "Lack of consistency",
      "oneYearVision": "Running a profitable AI company",
      "tone": "Brutally Honest"
    },
    "chatHistory": [
      {
        "role": "user",
        "message": "Will I actually make it?"
      },
      {
        "role": "futureme",
        "message": "Only if your daily actions stop negotiating with your dreams."
      }
    ],
    "question": "What should I focus on this week?"
  }
  ```
* **Response Payload Example:**
  ```json
  {
    "success": true,
    "reply": "This week, focus 100% of your energy on shipping one public proof of progress for your AI startup. Do not write another plan. Write code, launch it to one user, get feedback, and build consistency. That is your sole metric."
  }
  ```

---

## Premium UI Details (Apple-Style Aesthetics)
- **Glassmorphism:** Elegant glass backdrops (`backdrop-filter: blur(20px)`) with subtle highlight borders.
- **Ambient Lighting:** Multi-layered CSS glowing orbs that animate slowly in the background.
- **Scroll Fades:** Interactive `IntersectionObserver` elements fade in smoothly as you read the landing page.
- **Micro-Interactions:** Subtle button scaling, smooth state transitions, and responsive glowing outlines upon input focus.
- **Double-Click Lock & Delay:** Submit buttons are immediately disabled upon click, displaying an emotional loading timeline simulation for at least 1.5s.
