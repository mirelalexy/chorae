import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getProfile, type ProfilePage } from "@/api/profile";

// The user's profile, loaded whenever the page comes into view (after editing it, or a new tape).
export function useProfile() {
    const [page, setPage] = useState<ProfilePage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let current = true;

            getProfile()
                .then((found) => {
                    if (!current) return;
                    setPage(found);
                    setError(null);
                })
                .catch((err) => 
                    current && setError(
                        err instanceof Error ? err.message : "Couldn't load your profile."
                    )
                );

            return () => {
                current = false;
            };
        }, []),
    );

    return { page, setPage, error };
}
