# Vijay Vikram Singh Portfolio

A professional Node.js portfolio website with an enterprise-meets-edgy visual direction.

## Run locally

1. Add OpenRouter key in root `.env`:
   OPENROUTER_API_KEY=your_key_here

   Note: `OPENROUTES_API_KEY` is also accepted for backward compatibility.

2. Install dependencies:
   npm install
3. Start server:
   npm start
4. Open:
   http://localhost:3000

Digital Twin chat uses model `openai/gpt-oss-120b` via OpenRouter.

## Development mode

npm run dev

## Test and coverage

- Run tests:
  npm test
- Run tests with coverage:
  npm run coverage

Coverage thresholds are enforced in `vitest.config.js`.
