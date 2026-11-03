import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { clearToken, getToken, saveToken } from "./token";
import { api, ApiError, setOnUnauthorized } from "@/api/client";

export type User = {
    id: string;
    email: string;
    displayName: string;
};

type Status = "loading" | "signedOut" | "signedIn" | "offline";

type Auth = {
    status: Status;
    user: User | null;
    // True right after signing up, until onboarding is finished or skipped.
    onboarding: boolean;
    finishOnboarding: () => void;
    signUp: (input: { email: string; password: string; displayName: string; ageConfirmed: boolean }) => Promise<void>;
    logIn: (input: { email: string, password: string }) => Promise<void>;
    logOut: () => Promise<void>;
};

type Props = {
    children: ReactNode;
};

const AuthContext = createContext<Auth | null>(null);

// Knows whether someone is logged in, and offers sign up, log in and log out to every screen inside it.
// Screens read it with useAuth().
export function AuthProvider({ children }: Props) {
    const [status, setStatus] = useState<Status>("loading");
    const [user, setUser] = useState<User | null>(null);
    const [onboarding, setOnboarding] = useState(false);

    async function forget() {
        await clearToken();
        setUser(null);
        setStatus("signedOut");
    }

    // On launch: is there a saved token, and does the API still accept it?
    useEffect(() => {
        setOnUnauthorized(() => void forget());

        (async () => {
            const token = await getToken();
            if (!token) return setStatus("signedOut");

            try {
                const res = await api<{ user: User }>("/auth/me");
                setUser(res.user);
                setStatus("signedIn");
            } catch (err) {
                if (err instanceof ApiError && err.status === 0) setStatus("offline");
                else await forget(); 
            }
        })();

        return () => setOnUnauthorized(null);
    }, []);

    async function start(res: { token: string; user: User }) {
        await saveToken(res.token);
        setUser(res.user);
        setStatus("signedIn");
    }

    const auth: Auth = {
        status,
        user,
        onboarding,
        finishOnboarding: () => setOnboarding(false),
        signUp: async (input) => {
            const res = await api<{ token: string; user: User }>("/auth/signup", { method: "POST", body: input });
            setOnboarding(true);
            await start(res);
        },
        logIn: async (input) => {
            await start(await api("/auth/login", { method: "POST", body: input }));
        },
        logOut: async () => {
            // Tell the API first, so the token stops working everywhere, then log out on this phone.
            await api("/auth/logout", { method: "POST" }).catch(() => {});
            await forget();
        },
    };

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error("useAuth must be used inside <AuthProvider>.");
    return auth;
}