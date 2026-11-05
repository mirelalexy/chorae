
import { useRef, useState } from "react";
import { askQuestions, type Question, type Seed } from "@/api/mixtapes";

export function useQuestions() {
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askedFor = useRef<string | null>(null);
    const requestId = useRef(0);

    async function ask(prompt: string, seeds: Seed[]) {
        const trimmedPrompt = prompt.trim();
        const key = JSON.stringify([trimmedPrompt, seeds]);

        if (key === askedFor.current && questions) return;
        const currentRequest = ++requestId.current;

        setLoading(true);
        setError(null);
        setQuestions(null);

        try {
            const result = await askQuestions(trimmedPrompt, seeds);
            if (currentRequest !== requestId.current) return;

            setQuestions(result);
            askedFor.current = key;
        } catch (err) {
            if (currentRequest !== requestId.current) return;

            setError(
                err instanceof Error
                    ? err.message
                    : "Rae couldn't think of questions. Try again."
            );
        } finally {
            if (currentRequest === requestId.current) {
                setLoading(false);
            }
        }
    }

    return { questions, loading, error, ask };
}
