// Every request from the app to the API goes through here.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

type Options = {
    method?: "GET" | "POST";
    body?: unknown;
}

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
    if (!API_URL) {
        throw new Error("EXPO_PUBLIC_API_URL isn't set in mobile/.env.");
    }

    let res: Response;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    } catch {
        throw new ApiError(0, "Couldn't reach Chorae. Check your connection.");
    }

    // 204 (success, but no content, like when logging out) has no body to read.
    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(res.status, data?.error ?? "Something went wrong.");
    }

    return data as T;
}