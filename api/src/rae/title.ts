
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

// Remove redundant side labels from Rae's titles in case she handles them wrong.
export function cleanSideTitle(title: string): string {
    const cleaned = title.replace(
        /^\s*side\s+[a-z0-9]{1,2}\s*[:.\-\u2013\u2014]\s*/i,
        "",
    ).trim();

    return cleaned || title.trim();
}