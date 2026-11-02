import type { Recording } from "./types";

// Select release to take cover from: first check official album,
// then any official release, then whatever comes next.
export function selectRelease(recording: Recording) {
    const rank = (r: Recording["releases"][number]) => {
        const group = r["release-group"];
        const official = !r.status || r.status === "Official";
        const plain = (group?.["secondary-types"] ?? []).length === 0;

        if (official && plain && group?.["primary-type"] === "Album") return 0;
        if (official && plain) return 1;
        if (official) return 2;
        return 3;
    };

    // Earliest date wins ties.
    return [...recording.releases].sort(
        (a, b) => rank(a) - rank(b) || (a.date || "9999").localeCompare(b.date || "9999"),
    )[0];
}