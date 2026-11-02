import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Where the login token is kept between app launches.
// Web falls back to local storage, while mobile goes on the system's secure storage.
const KEY = "chorae.session";

export async function getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
        return globalThis.localStorage?.getItem(KEY) ?? null;
    }
    return SecureStore.getItemAsync(KEY);
}

export async function saveToken(token: string): Promise<void> {
    if (Platform.OS === "web") {
        return globalThis.localStorage?.setItem(KEY, token);
    }
    return SecureStore.setItemAsync(KEY, token);
}

export async function clearToken(): Promise<void> {
    if (Platform.OS === "web") {
        return globalThis.localStorage?.removeItem(KEY);
    }
    return SecureStore.deleteItemAsync(KEY);
}