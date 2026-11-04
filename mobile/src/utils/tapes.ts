
import type { MixtapeSummary } from "@/api/mixtapes";

export const SORTS = [
    { key: "recent", label: "Recently updated" },
    { key: "newest", label: "Recently added" },
    { key: "alphabetical", label: "Alphabetical" },
] as const;

export const KINDS = [
    { key: "all", label: "All" },
    { key: "generated", label: "Rae generated" },
    { key: "curated", label: "Rae curated" },
] as const;

export type Sort = (typeof SORTS)[number]["key"];
export type Kind = (typeof KINDS)[number]["key"];

export function sortTapes(tapes: MixtapeSummary[], sort: Sort) {
    const time = (date: string) => new Date(date).getTime();
    const copy = [...tapes];

    switch (sort) {
        case "recent":
            return copy.sort((a, b) => time(b.updatedAt) - time(a.updatedAt));

        case "newest":
            return copy.sort((a, b) => time(b.createdAt) - time(a.createdAt));

        case "alphabetical":
            return copy.sort((a, b) =>
                a.title.localeCompare(b.title, undefined, {
                    sensitivity: "base",
                })
            );
    }
}
