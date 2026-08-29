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

## Build

```bash
npm run build
npm start
```

## Database

The application uses SQLite for storing users, preferences, and dashboard feedback.

## Links

- **Live App:** https://ai-crypto-advisor-production-bafb.up.railway.app/
