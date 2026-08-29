# AI Crypto Advisor

A personalized crypto investor dashboard that provides users with crypto prices, relevant market news, AI-generated insights, and crypto memes based on their investment preferences.

Users can sign up and complete a short onboarding process to personalize their dashboard experience.


## Tech Stack

* React + Vite + TypeScript
* Node.js + Express
* SQLite
* JWT authentication

## Features

* User signup and login
* Personalized onboarding based on:

  * Selected crypto assets
  * Investor type
  * Preferred content
* Live crypto prices from CoinGecko
* Market news from Marketaux
* AI-generated insights using OpenRouter
* Crypto meme section
* Thumbs up/down feedback for each dashboard section
* Persistent user preferences and feedback

When an external service is unavailable, the application uses fallback content to keep the dashboard functional.

## Local Setup

Requires Node.js 22+.

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Environment Variables

Create a `.env` file based on `.env.example` and configure:

```env
PORT=4100
HOST=127.0.0.1
JWT_SECRET=your-secret

MARKETAUX_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=minimax/minimax-m3:free
```

API keys are optional for local testing. Fallback content is used when external services are unavailable.

Never commit `.env` or API keys to GitHub.

## Build

```bash
npm run typecheck
npm run build
npm start
```

## Database

The application uses SQLite for storing users, preferences, and dashboard feedback.

## Links

* **Live App:** [Add deployed URL]
* **GitHub Repository:** [Add repository URL]

