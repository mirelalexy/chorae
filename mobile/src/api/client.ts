import { getToken } from "@/auth/token";

// Every request from the app to the API goes through here.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
    constructor(
        public status: number, 
        message: string, 
        public issues: { path: (string | number)[]; message: string}[] = []) {
        super(message);
    }
}

type Options = {
    method?: "GET" | "POST";
    body?: unknown;
}

// Called when the API says the login is no longer valid (401), so the app goes back to login screen.
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(handler: (() => void) | null) {
    onUnauthorized = handler;
}

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
    if (!API_URL) {
        throw new Error("EXPO_PUBLIC_API_URL isn't set in mobile/.env.");
    }

    // Every request carries the login token.
    const token = await getToken();

    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers: { 
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}`} : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    } catch {
        throw new ApiError(0, "Couldn't reach Chorae. Check your connection.");
    }

    // 204 (success, but no content, like when logging out) has no body to read.
    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
        // A token sent was refused: that means it expired or someone logged out everywhere.
        if (res.status === 401 && token) {
            onUnauthorized?.();
        }
        throw new ApiError(res.status, data?.error ?? "Something went wrong.", data?.issues ?? []);
    }

    return data as T;
}