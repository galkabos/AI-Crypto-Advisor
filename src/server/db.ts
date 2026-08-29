import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { Preferences, SectionKey } from "./domain.js";

type SqliteResult = {
  changes: number;
  lastInsertRowid: number | bigint;
};

type Statement = {
  run: (...params: unknown[]) => SqliteResult;
  get: (...params: unknown[]) => Record<string, unknown> | undefined;
  all: (...params: unknown[]) => Record<string, unknown>[];
};

type Database = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
};

type SqliteModule = {
  DatabaseSync: new (filename: string) => Database;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  onboardingCompleted: boolean;
  createdAt: string;
};

export type VoteRecord = {
  id: string;
  userId: string;
  section: SectionKey;
  contentId: string;
  contentSnapshot: Record<string, unknown> | null;
  vote: 1 | -1;
  createdAt: string;
};

const require = createRequire(import.meta.url);
const { DatabaseSync } = require("node:sqlite") as SqliteModule;

const dataDir = path.resolve(process.cwd(), process.env.DATA_DIR ?? "data");
mkdirSync(dataDir, { recursive: true });

export const databasePath = path.join(dataDir, "app.sqlite");
const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    onboarding_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS preferences (
    user_id TEXT PRIMARY KEY,
    assets TEXT NOT NULL,
    investor_type TEXT NOT NULL,
    content_types TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    section TEXT NOT NULL,
    content_id TEXT NOT NULL,
    content_snapshot TEXT,
    vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, section, content_id)
  );

  CREATE INDEX IF NOT EXISTS idx_votes_user_content
    ON votes(user_id, content_id);
`);

ensureVoteSnapshotColumn();

export function createUser(input: { name: string; email: string; passwordHash: string }): UserRecord {
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    onboardingCompleted: false,
    createdAt: now
  };

  db.prepare(
    `
      INSERT INTO users (id, name, email, password_hash, onboarding_completed, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(user.id, user.name, user.email, user.passwordHash, 0, user.createdAt);

  return user;
}

export function findUserByEmail(email: string): UserRecord | null {
  const row = db
    .prepare(
      `
        SELECT id, name, email, password_hash, onboarding_completed, created_at
        FROM users
        WHERE email = ?
      `
    )
    .get(email);

  return row ? mapUser(row) : null;
}

export function findUserById(id: string): UserRecord | null {
  const row = db
    .prepare(
      `
        SELECT id, name, email, password_hash, onboarding_completed, created_at
        FROM users
        WHERE id = ?
      `
    )
    .get(id);

  return row ? mapUser(row) : null;
}

export function savePreferences(userId: string, preferences: Preferences): Preferences {
  const now = new Date().toISOString();

  db.prepare(
    `
      INSERT INTO preferences (user_id, assets, investor_type, content_types, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        assets = excluded.assets,
        investor_type = excluded.investor_type,
        content_types = excluded.content_types,
        updated_at = excluded.updated_at
    `
  ).run(
    userId,
    JSON.stringify(preferences.assets),
    preferences.investorType,
    JSON.stringify(preferences.contentTypes),
    now
  );

  db.prepare("UPDATE users SET onboarding_completed = 1 WHERE id = ?").run(userId);
  return preferences;
}

export function getPreferences(userId: string): Preferences | null {
  const row = db
    .prepare(
      `
        SELECT assets, investor_type, content_types
        FROM preferences
        WHERE user_id = ?
      `
    )
    .get(userId);

  if (!row) {
    return null;
  }

  return {
    assets: JSON.parse(String(row.assets)),
    investorType: String(row.investor_type) as Preferences["investorType"],
    contentTypes: JSON.parse(String(row.content_types))
  };
}

export function saveVote(input: {
  userId: string;
  section: SectionKey;
  contentId: string;
  contentSnapshot?: unknown;
  vote: 1 | -1;
}): VoteRecord {
  const now = new Date().toISOString();
  const id = randomUUID();
  const contentSnapshot = serializeContentSnapshot(input.contentSnapshot);

  db.prepare(
    `
      INSERT INTO votes (id, user_id, section, content_id, content_snapshot, vote, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, section, content_id) DO UPDATE SET
        id = excluded.id,
        content_snapshot = excluded.content_snapshot,
        vote = excluded.vote,
        created_at = excluded.created_at
    `
  ).run(id, input.userId, input.section, input.contentId, contentSnapshot, input.vote, now);

  return {
    id,
    userId: input.userId,
    section: input.section,
    contentId: input.contentId,
    contentSnapshot: contentSnapshot ? (JSON.parse(contentSnapshot) as Record<string, unknown>) : null,
    vote: input.vote,
    createdAt: now
  };
}

export function getVotesForContent(userId: string, contentIds: string[]): Record<string, 1 | -1> {
  if (contentIds.length === 0) {
    return {};
  }

  const placeholders = contentIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `
        SELECT content_id, vote
        FROM votes
        WHERE user_id = ? AND content_id IN (${placeholders})
      `
    )
    .all(userId, ...contentIds);

  return Object.fromEntries(
    rows.map((row) => [String(row.content_id), Number(row.vote) === 1 ? 1 : -1])
  );
}

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    onboardingCompleted: user.onboardingCompleted
  };
}

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    onboardingCompleted: Number(row.onboarding_completed) === 1,
    createdAt: String(row.created_at)
  };
}

function ensureVoteSnapshotColumn() {
  const columns = db.prepare("PRAGMA table_info(votes)").all();
  const hasContentSnapshot = columns.some((column) => String(column.name) === "content_snapshot");

  if (!hasContentSnapshot) {
    db.exec("ALTER TABLE votes ADD COLUMN content_snapshot TEXT");
  }
}

function serializeContentSnapshot(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  try {
    const serialized = JSON.stringify(value);

    if (serialized.length <= 20000) {
      return serialized;
    }

    return JSON.stringify({
      truncated: true,
      preview: serialized.slice(0, 5000)
    });
  } catch {
    return null;
  }
}
