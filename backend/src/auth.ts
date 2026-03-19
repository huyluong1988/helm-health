import crypto from "crypto";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { query } from "./db";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
const dummyTokenPrefix = process.env.DUMMY_TOKEN_PREFIX || "dummy";

export type AuthedUser = { id: number; name: string };

function signSub(sub: string): string {
  const hmac = crypto.createHmac("sha256", jwtSecret);
  hmac.update(sub);
  return hmac.digest("base64url");
}

export function issueToken(user: AuthedUser): string {
  // Token format: `prefix.<userId>.<signature>`
  const sub = String(user.id);
  const sig = signSub(sub);
  return `${dummyTokenPrefix}.${sub}.${sig}`;
}

export function verifyToken(token: string): AuthedUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [prefix, sub, sig] = parts;
  if (prefix !== dummyTokenPrefix) return null;
  if (signSub(sub) !== sig) return null;

  const id = Number(sub);
  if (!Number.isFinite(id)) return null;
  return { id, name: "" }; // Name is fetched in the request handler
}

declare global {
  namespace Express {
    // Used to pass the authenticated user from middleware to route handlers.
    interface Locals {
      user?: AuthedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Bearer token" });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  const verified = verifyToken(token);
  if (!verified) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const rows = await query<{ id: number; name: string }>(
    "SELECT id, name FROM app_users WHERE id = $1",
    [verified.id]
  );

  if (rows.length !== 1) {
    res.status(401).json({ error: "Invalid token (user not found)" });
    return;
  }

  res.locals.user = { id: rows[0].id, name: rows[0].name };
  next();
}

export async function getOrCreateUserByName(name: string): Promise<AuthedUser> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }

  const rows = await query<{ id: number; name: string }>(
    `
    INSERT INTO app_users (name)
    VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name
    `,
    [trimmed]
  );

  return { id: rows[0].id, name: rows[0].name };
}

export {};

