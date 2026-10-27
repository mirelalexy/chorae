import { createHash, randomBytes } from "node:crypto";

// Generate a secret token for the user.
export function newToken(): string {
    return randomBytes(32).toString("base64url");
}

// Hash tokens before storing/comparing them.
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}