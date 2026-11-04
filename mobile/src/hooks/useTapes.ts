
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getToday, listMixtapes, type MixtapeSummary, type Today } from "@/api/mixtapes";

export function useTapes() {
    const [tapes, setTapes] = useState<MixtapeSummary[] | null>(null);
    const [today, setToday] = useState<Today | null>(null);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let current = true;

            // Fetch the library and daily allowance together.
            Promise.all([listMixtapes(), getToday()])
                .then(([loadedTapes, loadedToday]) => {
                    if (!current) return;

                    setTapes(loadedTapes);
                    setToday(loadedToday);
                    setError(null);
                })
                .catch((err) => {
                    if (!current) return;
                    setError(err instanceof Error ? err.message : "Could not load your tapes.");
                });

            // Ignore the response if the user leaves this screen.
            return () => {
                current = false;
            };
        }, [])
    );

    return { tapes, today, error };
}
