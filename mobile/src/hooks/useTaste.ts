import { useEffect, useState } from "react";
import { addTaste, getTaste, removeTaste, type TasteItem } from "@/api/taste";

type Pick = Omit<TasteItem, "id">;

// User's taste, and picking or unpicking from it. Each tap saves straight away.
export function useTaste() {
    const [items, setItems] = useState<TasteItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [busy, setBusy] = useState<string[]>([]);             // picks being saved or removed right now
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getTaste()
            .then(setItems)
            .catch((err) => setError(err.message))
            .finally(() => setLoaded(true));
    }, []);

    const key = (kind: string, mbid: string) => `${kind}:${mbid}`;
    const find = (kind: string, mbid: string) => items.find((i) => i.kind === kind && i.mbid === mbid);

    async function toggle(pick: Pick) {
        const k = key(pick.kind, pick.mbid);
        
        if (busy.includes(k)) return;          // a second tap while the first is still saving
        setBusy((busyKeys) => [...busyKeys, k]);
        setError(null);
        
        try {
            const existing = find(pick.kind, pick.mbid);
            
            if (existing) {
                await removeTaste(existing.id);
                setItems((all) => all.filter((i) => i.id !== existing.id));
            } else {
                const saved = await addTaste(pick);
                setItems((all) => [...all, saved]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setBusy((busyKeys) => busyKeys.filter((busyKey) => busyKey !== k));
        }
    }

    return {
        items,
        loaded,
        error,
        toggle,
        isPicked: (kind: string, mbid: string) => Boolean(find(kind, mbid)),
        isBusy: (kind: string, mbid: string) => busy.includes(key(kind, mbid)),
    };
}
