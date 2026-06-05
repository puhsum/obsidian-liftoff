export function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseDuration(mmss: string): number {
	const parts = mmss.trim().split(":");
	if (parts.length !== 2) return 0;
	const m = parseInt(parts[0]!, 10);
	const s = parseInt(parts[1]!, 10);
	if (isNaN(m) || isNaN(s) || s < 0 || s > 59) return 0;
	return m * 60 + s;
}
