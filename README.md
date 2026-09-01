# AI Crypto Advisor

AI Crypto Advisor is a personalized crypto investor dashboard. Users can sign up or log in, complete a short onboarding flow, and receive a dashboard tailored to their crypto interests.

During onboarding, users choose their preferred crypto assets, investor type, and content preferences. These preferences are stored in SQLite and used to personalize the dashboard. Authentication is handled with JWT stored in an HTTP-only cookie, and passwords are hashed before being saved.

The dashboard includes four sections: Coin Prices, Market News, AI Insight of the Day, and Fun Crypto Meme. Coin prices are fetched from CoinGecko based on the selected assets. Market news is fetched from Marketaux using the selected crypto symbols when possible. AI Insight is generated through OpenRouter using a prompt that includes the user's selected assets, investor type, and preferred content types. The meme section uses a static list and changes when dashboard content is generated.

If CoinGecko, Marketaux, or OpenRouter is unavailable, invalid, rate-limited, or not configured, the app shows fallback content so the dashboard remains usable. These fallback states are displayed with user-friendly messages without exposing technical API errors.

Each dashboard section supports thumbs up/down feedback. Votes are stored in SQLite with the user, section, content ID, vote value, timestamp, and a snapshot of the exact content shown. AI Insight content IDs include a hash of the generated text, so feedback is linked to the specific insight the user voted on.

The app is built with React, Vite, TypeScript, Node.js, Express, SQLite, and JWT authentication. It is deployed on Railway as a single service, with the Express server serving both the API and the built frontend. SQLite uses persistent storage for users, preferences, and feedback.

## Links

- **Live App:** https://ai-crypto-advisor-production-bafb.up.railway.app/

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

