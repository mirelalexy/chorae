import argon2 from "argon2";

const OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 19456,     // 19MiB/hash
    timeCost: 2,           // passes over that memory
    parallelism: 1         // threads
} as const;

export function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, OPTIONS);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    try {
        return await argon2.verify(stored, password);
    } catch {
        return false;
    }
}