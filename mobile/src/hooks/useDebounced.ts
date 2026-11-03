import { useEffect, useState } from "react";

// For search boxes: typing "bad omens" sends one search, not more.
export function useDebounced<T>(value: T, delay = 400): T {
    const [settled, setSettled] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setSettled(value), delay);
        return () => clearTimeout(timer); // start over if typing again before delay
    }, [value, delay]);

    return settled;
}