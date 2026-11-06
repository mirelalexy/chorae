// Format helpers used for Chorae.

export function greeting(date = new Date()): string {
	const hour = date.getHours();
	if (hour < 12) return "Morning";
	if (hour < 18) return "Afternoon";
	return "Evening";
}

export function duration(ms: number): string {
	const minutes = Math.round(ms / 60000);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

// Show how many mixtapes are left, or when another can be created.
export function tapesAvailability({
    used,
    limit,
    resetsAt,
    now = Date.now(),
}: {
    used: number;
    limit: number;
    // When the oldest counted tape leaves the 24h window.
    resetsAt: string | null;
    now?: number;
}): {
    label: string;
    detail: string | null;
} {
    const left = Math.max(0, limit - used);
    const nextAt = resetsAt ? new Date(resetsAt).getTime() : NaN;

    const label = left > 0
        ? `${left} ${left === 1 ? "tape" : "tapes" } available`
        : "No tapes available";

    if (nextAt && nextAt <= now) {
        return { label, detail: null };
    }

    const minutes = Math.ceil((nextAt - now) / 60000);
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60;

    const duration = [
        hours > 0 ? `${hours}h` : "",
        rest > 0 ? `${rest}m` : "",
    ].join(" ");

    return {
        label,
        detail:
            left > 0
                ? `Next spot opens in ${duration}`
                : `Create again in ${duration}`
    }
}

export function trackLength(ms: number | null): string {
    if (ms === null) return "";
    const seconds = Math.round(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes}:${String(rest).padStart(2, "0")}`;
}