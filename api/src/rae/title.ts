
import { type DraftRequest } from "./schemas";

type TitleInput = Pick<DraftRequest, "prompt" | "title">;

// Check whether the user's prompt contains letters but no capitals.
export function writesInLowercase({ prompt }: TitleInput): boolean {
    return /\p{L}/u.test(prompt) && !/\p{Lu}/u.test(prompt);
}

// Keep the user's title, or match their capitalization when using Rae's.
export function finalTitle(raeTitle: string, request: TitleInput): string {
    const ownTitle = request.title?.trim();
    if (ownTitle) return ownTitle;

    return writesInLowercase(request) ? raeTitle.toLowerCase() : raeTitle;
}
