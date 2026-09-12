# Beginner Tutorial: Building This Portfolio + AI Career Chat

## 1. What You Built
You now have a full-stack portfolio website that:
- Runs locally with Node.js
- Shows structured professional information (about, journey, skills, work, contact)
- Includes an AI chat assistant ("Ask me") powered by OpenRouter
- Uses automated tests (unit + integration)
- Enforces code coverage thresholds above 80%

This is a complete beginner-friendly architecture because frontend and backend are clearly separated, and all data is exposed through simple API routes.

---

## 2. Technology Summary (Beginner-Friendly)

### Node.js
Node.js lets you run JavaScript outside the browser. Here, it runs your web server.

### Express
Express is a web framework for Node.js. It helps define routes like:
- GET /api/profile
- POST /api/chat

### HTML + CSS + Vanilla JavaScript
- HTML defines page structure
- CSS defines visual design and layout
- JavaScript fetches data from backend APIs and updates the page dynamically

### dotenv
dotenv loads environment variables from .env files. That is how your API key is read without hardcoding secrets in source files.

### OpenRouter
OpenRouter acts as the AI gateway. Your backend sends chat requests to:
- https://openrouter.ai/api/v1/chat/completions

Model used:
- openai/gpt-oss-120b

### Vitest + Supertest
- Vitest runs tests
- Supertest makes HTTP requests to your Express app in tests
- Coverage thresholds ensure test quality stays high

---

## 3. Project Structure

Important folders and files:

- portfolio/src/server.js
- portfolio/src/app.js
- portfolio/src/content.js
- portfolio/src/utils/portfolio.js
- portfolio/src/services/digitalTwin.js
- portfolio/public/index.html
- portfolio/public/styles.css
- portfolio/public/main.js
- portfolio/tests/integration/app.test.js
- portfolio/tests/unit/portfolio-utils.test.js
- portfolio/tests/unit/digital-twin.test.js
- portfolio/vitest.config.js

Think of this as 3 layers:
1. Data and logic layer (src)
2. UI layer (public)
3. Testing layer (tests)

---

## 4. High-Level Walkthrough of What Was Done

### Step A: Build the base portfolio app
- Created a Node.js project in the portfolio folder
- Installed Express
- Added static file hosting
- Added API routes for profile, skills, projects, and journey

### Step B: Create frontend sections
- Added hero, about, journey, work, and contact sections in HTML
- Added a strong visual style (enterprise + edgy)
- Added dynamic rendering from API data via JavaScript

### Step C: Add the AI chat feature (Ask me)
- Added backend route POST /api/chat
- Created OpenRouter service with safe input handling
- Loaded API key from root .env
- Added chat UI with bubbles, timestamps, typing indicator, and suggested prompts

### Step D: Add tests and coverage enforcement
- Added unit tests for utility logic and chat service logic
- Added integration tests for API endpoints and page delivery
- Enforced coverage thresholds in vitest config

---

## 5. Detailed Code Review With Samples

## 5.1 Server Startup and Environment Loading
File: portfolio/src/server.js

What it does:
- Loads .env from root
- Creates Express app
- Starts server at port 3000 (default)

Code sample:

```js
const path = require("path");
const dotenv = require("dotenv");
const { createApp } = require("./app");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = createApp();

app.listen(port, () => {
  console.log(`Portfolio website running at http://localhost:${port}`);
});
```

Why this matters:
- Keeps secrets out of source code
- Makes local development easy

---

## 5.2 API Routing Layer
File: portfolio/src/app.js

What it does:
- Defines all API endpoints
- Returns JSON for frontend sections
- Accepts chat message and calls digitalTwinService
- Handles route errors safely

Code sample (chat route):

```js
app.post("/api/chat", async (req, res) => {
  const message = req.body?.message;
  const history = req.body?.history;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const result = await digitalTwinService.askCareerQuestion({ message, history });
    return res.json(result);
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 502;
    return res.status(statusCode).json({
      error: error.message || "Digital Twin request failed.",
    });
  }
});
```

Why this matters:
- Backend validates user input
- Prevents frontend from directly exposing API keys

---

## 5.3 AI Integration Service (OpenRouter)
File: portfolio/src/services/digitalTwin.js

What it does:
- Builds system prompt from portfolio content
- Sanitizes message history
- Enforces message length and history size
- Calls OpenRouter with model openai/gpt-oss-120b

Code sample (request payload and API call):

```js
const payload = {
  model,
  temperature: 0.35,
  max_tokens: 400,
  messages: [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ],
};

const response = await fetchImpl(openRouterUrl, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
    "X-Title": "Vijay Vikram Singh Portfolio",
  },
  body: JSON.stringify(payload),
});
```

Why this matters:
- Central place for AI behavior
- Easy to test, easy to replace model/provider later

---

## 5.4 Frontend Layout (HTML)
File: portfolio/public/index.html

What it does:
- Defines all sections
- Includes Ask me section with chat shell
- Includes textarea and send button
- Includes typing indicator area

Code sample (chat structure):

```html
<section id="digital-twin" class="section reveal">
  <h2 class="section-title">Ask me</h2>
  <div class="twin-chat-shell">
    <div id="twin-log" class="twin-log" aria-live="polite"></div>
    <div id="twin-typing" class="twin-typing" hidden>
      <span></span><span></span><span></span>
      <p>Digital Twin is typing</p>
    </div>
    <form id="twin-form" class="twin-form">
      <textarea id="twin-input" rows="3" maxlength="1200" required></textarea>
      <button id="twin-send" class="btn btn-primary" type="submit">Send</button>
    </form>
  </div>
</section>
```

Why this matters:
- Accessibility-friendly structure with aria-live
- Easy to target from JavaScript

---

## 5.5 Frontend Behavior (JavaScript)
File: portfolio/public/main.js

What it does:
- Fetches all content endpoints
- Renders page content dynamically
- Handles chat send/receive lifecycle
- Shows typing indicator only while waiting

Code sample (chat submission):

```js
async function submitTwinQuestion(message) {
  const trimmed = message.trim();
  if (!trimmed || twinState.busy) {
    return;
  }

  appendTwinMessage("user", trimmed);
  twinState.history.push({ role: "user", content: trimmed });
  setTwinBusy(true);

  try {
    const data = await postJson("/api/chat", {
      message: trimmed,
      history: twinState.history,
    });

    appendTwinMessage("assistant", data.reply);
    twinState.history.push({ role: "assistant", content: data.reply });
    setTwinStatus("Digital Twin is ready.", false);
  } catch (error) {
    setTwinStatus(error.message || "Unable to reach Digital Twin right now.", true);
  } finally {
    setTwinBusy(false);
  }
}
```

Why this matters:
- Clear async request flow
- Better user feedback through state transitions

---

## 5.6 Styling and Chat Feel (CSS)
File: portfolio/public/styles.css

What it does:
- Creates enterprise + edgy visual identity
- Uses glassy cards, gradients, and bold color accents
- Styles chat bubbles, avatars, typing animation, and responsive behavior

Code sample (typing indicator):

```css
.twin-typing {
  display: none;
}

.twin-typing.active {
  display: inline-flex;
}

.twin-typing span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  animation: twin-pulse 1.2s infinite ease-in-out;
}
```

Why this matters:
- Polished interaction details make the AI feel alive

---

## 5.7 Testing Strategy
Files:
- portfolio/tests/integration/app.test.js
- portfolio/tests/unit/portfolio-utils.test.js
- portfolio/tests/unit/digital-twin.test.js
- portfolio/vitest.config.js

What is tested:
- API routes return expected JSON
- Chat API validates errors and success cases
- Utility functions behave correctly
- OpenRouter service handles edge cases

Code sample (integration test):

```js
it("returns chat answer from digital twin service", async () => {
  const askCareerQuestion = vi.fn(async () => ({
    reply: "Vijay has 6+ years of iOS experience.",
    model: "openai/gpt-oss-120b",
  }));

  const chatApp = createApp({
    digitalTwinService: { askCareerQuestion },
  });

  const response = await request(chatApp)
    .post("/api/chat")
    .send({ message: "How much iOS experience do you have?", history: [] });

  expect(response.statusCode).toBe(200);
});
```

Coverage thresholds:
- statements >= 85
- branches >= 82
- functions >= 85
- lines >= 85

---

## 6. How to Run and Test

From the portfolio folder:

```bash
npm install
npm start
```

Then open:
- http://localhost:3000

Run tests:

```bash
npm test
npm run coverage
```

---

## 7. Beginner Mental Model (Important)

When a visitor chats:
1. User types in browser textarea
2. Frontend sends POST /api/chat to your backend
3. Backend validates input
4. Backend calls OpenRouter using secret API key from .env
5. AI answer comes back to backend
6. Backend returns clean JSON to frontend
7. Frontend renders the answer as chat bubble

This pattern is standard for production apps because secrets stay server-side.

---

## 8. Self-Review: 5 Improvement Suggestions

1. Add frontend unit tests for main.js interactions
Current tests focus mostly on backend and service logic. Chat UI behavior (DOM updates, keyboard behavior, typing indicator transitions) should be tested with jsdom-based tests.

2. Add request timeout and retry strategy for OpenRouter
Network/API delays can happen. Add AbortController timeout and safe retry rules for transient errors like 429/503.

3. Introduce rate limiting on POST /api/chat
Protect the endpoint from spam and accidental overload using per-IP limits (for example express-rate-limit).

4. Persist conversation history server-side (optional)
Right now history is client-managed. For a stronger assistant experience, store conversations temporarily on the server/session for continuity and analytics.

5. Improve observability and structured logging
Add structured logs and request IDs so backend failures are easier to diagnose in local and deployed environments.

---

You now have a clean, modern full-stack starter that demonstrates API design, frontend rendering, AI integration, and test quality controls in one project.
