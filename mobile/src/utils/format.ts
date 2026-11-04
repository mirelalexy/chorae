// Format helpers used for Chorae.

export function greeting(date = new Date()): string {
	const hour = date.getHours();
	if (hour < 12) return "Morning";
	if (hour < 18) return "Afternoon";
	return "Evening";
}