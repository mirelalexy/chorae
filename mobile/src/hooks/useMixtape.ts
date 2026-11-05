import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getMixtape, type Mixtape } from "@/api/mixtapes";

export function useMixtape(id: string) {
    const [tape, setTape] = useState<Mixtape | null>(null);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            let current = true;

            getMixtape(id)
                .then((found) => {
                    if (!current) return;
                    setTape(found);
                    setError(null);
                })
                .catch((err) => 
                    current && setError(
                        err instanceof Error ? err.message : "Couldn't load this tape."
                    )
                );

            return () => {
                current = false;
            };
        }, [id]),
    );

    return { tape, error, loading: tape === null && error === null };
}
