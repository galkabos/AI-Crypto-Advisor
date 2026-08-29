import "dotenv/config";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { existsSync } from "node:fs";
import path from "node:path";
import { ASSET_OPTIONS, CONTENT_TYPES, INVESTOR_TYPES, isSectionKey, parsePreferences } from "./domain.js";
import {
  createUser,
  databasePath,
  findUserByEmail,
  findUserById,
  getPreferences,
  getVotesForContent,
  savePreferences,
  saveVote,
  toPublicUser,
  type UserRecord
} from "./db.js";
import {
  dashboardContentIds,
  getAiInsight,
  getCoinPrices,
  getMarketNews,
  getRandomMeme
} from "./content.js";

type AuthedRequest = Request & {
  user: UserRecord;
};

const app = express();
const port = Number(process.env.PORT ?? 4100);
const jwtSecret = process.env.JWT_SECRET ?? "dev-only-secret-change-me";
const isProduction = process.env.NODE_ENV === "production";
const host = process.env.HOST ?? (isProduction ? "0.0.0.0" : "127.0.0.1");

if (isProduction && !process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not configured. Set it before deploying.");
}

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true
  })
);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, databasePath });
});

app.get("/api/options", (_request, response) => {
  response.json({
    assets: ASSET_OPTIONS,
    investorTypes: INVESTOR_TYPES,
    contentTypes: CONTENT_TYPES
  });
});

app.post("/api/auth/signup", async (request, response) => {
  const name = cleanString(request.body?.name);
  const email = cleanString(request.body?.email).toLowerCase();
  const password = String(request.body?.password ?? "");

  if (name.length < 2) {
    return response.status(400).json({ message: "Name must be at least 2 characters." });
  }

  if (!isEmail(email)) {
    return response.status(400).json({ message: "Enter a valid email address." });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: "Password must be at least 6 characters." });
  }

  if (findUserByEmail(email)) {
    return response.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ name, email, passwordHash });
  setAuthCookie(response, user);

  return response.status(201).json({ user: toPublicUser(user), preferences: null });
});

app.post("/api/auth/login", async (request, response) => {
  const email = cleanString(request.body?.email).toLowerCase();
  const password = String(request.body?.password ?? "");
  const user = findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  setAuthCookie(response, user);

  return response.json({
    user: toPublicUser(user),
    preferences: getPreferences(user.id)
  });
});

app.post("/api/auth/logout", (_request, response) => {
  response.clearCookie("token", authCookieOptions());
  response.status(204).send();
});

app.get("/api/me", requireAuth, (request, response) => {
  const authedRequest = request as AuthedRequest;

  response.json({
    user: toPublicUser(authedRequest.user),
    preferences: getPreferences(authedRequest.user.id)
  });
});

app.post("/api/onboarding", requireAuth, (request, response) => {
  const authedRequest = request as AuthedRequest;

  try {
    const preferences = parsePreferences(request.body);
    savePreferences(authedRequest.user.id, preferences);
    const updatedUser = findUserById(authedRequest.user.id) ?? authedRequest.user;

    return response.json({
      user: toPublicUser(updatedUser),
      preferences
    });
  } catch (error) {
    return response.status(400).json({
      message: error instanceof Error ? error.message : "Invalid onboarding answers."
    });
  }
});

app.get("/api/dashboard", requireAuth, async (request, response) => {
  const authedRequest = request as AuthedRequest;
  const preferences = getPreferences(authedRequest.user.id);

  if (!preferences) {
    return response.status(428).json({ message: "Complete onboarding before opening the dashboard." });
  }

  const meme = getRandomMeme();
  const contentIds = dashboardContentIds(preferences, meme);
  const [prices, news, insight] = await Promise.all([
    getCoinPrices(preferences),
    getMarketNews(preferences),
    getAiInsight(preferences)
  ]);
  const votes = getVotesForContent(authedRequest.user.id, Object.values(contentIds));

  return response.json({
    generatedAt: new Date().toISOString(),
    preferences,
    sections: {
      coinPrices: {
        section: "coin-prices",
        title: "Coin Prices",
        contentId: contentIds.coinPrices,
        source: prices.source,
        items: prices.items,
        userVote: votes[contentIds.coinPrices]
      },
      marketNews: {
        section: "market-news",
        title: "Market News",
        contentId: contentIds.marketNews,
        source: news.source,
        items: news.items,
        userVote: votes[contentIds.marketNews]
      },
      aiInsight: {
        section: "ai-insight",
        title: "AI Insight of the Day",
        contentId: contentIds.aiInsight,
        insight,
        userVote: votes[contentIds.aiInsight]
      },
      cryptoMeme: {
        section: "crypto-meme",
        title: "Fun Crypto Meme",
        contentId: contentIds.cryptoMeme,
        item: meme,
        userVote: votes[contentIds.cryptoMeme]
      }
    }
  });
});

app.post("/api/votes", requireAuth, (request, response) => {
  const authedRequest = request as AuthedRequest;
  const section = request.body?.section;
  const contentId = cleanString(request.body?.contentId);
  const contentSnapshot = request.body?.contentSnapshot;
  const vote = Number(request.body?.vote);

  if (!isSectionKey(section)) {
    return response.status(400).json({ message: "Unknown dashboard section." });
  }

  if (!contentId) {
    return response.status(400).json({ message: "Content identifier is required." });
  }

  if (vote !== 1 && vote !== -1) {
    return response.status(400).json({ message: "Vote must be 1 or -1." });
  }

  const savedVote = saveVote({
    userId: authedRequest.user.id,
    section,
    contentId,
    contentSnapshot,
    vote
  });

  return response.status(201).json({ vote: savedVote });
});

const clientDist = path.resolve(process.cwd(), "dist", "client");

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong." });
});

const server = app.listen(port, host, () => {
  console.log(`AI Crypto Advisor API running on http://${host}:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the process using that port or set another PORT in .env.`
    );
    process.exit(1);
  }

  console.error("Failed to start the server.", error);
  process.exit(1);
});

function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = request.cookies?.token;

  if (!token) {
    return response.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub?: string };

    if (!payload.sub) {
      return response.status(401).json({ message: "Authentication required." });
    }

    const user = findUserById(payload.sub);

    if (!user) {
      return response.status(401).json({ message: "Authentication required." });
    }

    (request as AuthedRequest).user = user;
    next();
  } catch {
    return response.status(401).json({ message: "Authentication required." });
  }
}

function setAuthCookie(response: Response, user: UserRecord) {
  const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

  response.cookie("token", token, {
    ...authCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const
  };
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
