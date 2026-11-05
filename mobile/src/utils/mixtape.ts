import type { Mixtape, Track } from "@/api/mixtapes";
import { duration } from "./format";

export const sideLetter = (index: number) => String.fromCharCode(65 + index);

export type SeedPlacement = {
    track: Track;
    place: string;
}

// Find the user's must-have songs and their positions in the tape.
export function seedsOf(tape: Mixtape): SeedPlacement[] {
    return tape.sides.flatMap((side, sideIndex) =>
        side.tracks.flatMap((track, trackIndex) => {
            if (!track.isSeed) return [];

            const letter = sideLetter(sideIndex);
            const place = trackIndex === 0
                ? `Opens side ${letter}`
                : `Side ${letter} · #${trackIndex + 1}`;

            return [{ track, place }];
        }),
    );
}

// Count the songs chosen by the user and by Rae to display in mix.
export function mixOf(tape: Mixtape): { yours: number; rae: number } {
    const tracks = tape.sides.flatMap((side) => side.tracks);
    const yours = tracks.filter((track) => track.isSeed).length;

    return { yours, rae: tracks.length - yours };
}

// Get the first four unique album covers, in track order.
export function coversOf(tape: Mixtape): string[] {
    const urls = tape.sides
        .flatMap((side) => side.tracks.map((track) => track.coverUrl))
        .filter((url) => url !== null);

    return [...new Set(urls)].slice(0, 4);
}

// Format a side's track count and duration.
export function sideStats(side: Mixtape["sides"][number]): string {
    const count = side.tracks.length;
    const totalMs = side.tracks.reduce(
        (sum, track) => sum + (track.lengthMs ?? 0),
        0,
    );

    return `${count} ${count === 1 ? "song" : "songs"} · ${duration(totalMs)}`;
}