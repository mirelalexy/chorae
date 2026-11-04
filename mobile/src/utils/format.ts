// Format helpers used for Chorae.

export function greeting(date = new Date()): string {
	const hour = date.getHours();
	if (hour < 12) return "Morning";
	if (hour < 18) return "Afternoon";
	return "Evening";
}

export function duration(ms: number): string {
	const minutes = Math.round(ms / 60000);
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// Show how many mixtapes are left, or when another can be created.
export function leftToday({
    used,
    limit,
    resetsAt,
}: {
    used: number;
    limit: number;
    resetsAt: string | null;
}): string {
    const left = Math.max(0, limit - used);

    if (left > 0) return `${left} of ${limit} left today`;
    if (!resetsAt) return "None left today";

    const time = new Date(resetsAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `Next one at ${time}`;
}