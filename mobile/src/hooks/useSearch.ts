
import { useEffect, useState } from "react";
import { useDebounced } from "@/hooks/useDebounced";

type Options = {
    minLength?: number;
    delay?: number;
};

export function useSearch<T>(
    find: (query: string) => Promise<T[]>,
    { minLength = 2, delay = 400 }: Options = {}
) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useDebounced(query.trim(), delay);
    const active = search.length >= minLength;

    useEffect(() => {
        if (!active) {
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        let current = true;

        setLoading(true);
        setError(null);

        find(search)
            .then((found) => {
                if (!current) return;
                setResults(found);
            })
            .catch((err) => {
                if (!current) return;
                setError(err instanceof Error ? err.message : "Something went wrong.");
            })
            .finally(() => {
                if (current) setLoading(false);
            });

        // Ignore results from an older search if the query changes.
        return () => {
            current = false;
        };
    }, [search, active, find]);

    return {
        query,
        setQuery,
        search,
        active,
        results,
        loading,
        error,
        empty: active && !loading && !error && results.length === 0,
    };
}
