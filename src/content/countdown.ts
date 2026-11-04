export function formatCountdown(seconds: number): { prefix: string; time: string } {
    const total = Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0;
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const fewDays = days >= 2 && days <= 4;
    const dayLabel = days === 1 ? "den" : fewDays ? "dny" : "dní";
    return {
        prefix: fewDays ? "Zbývají" : "Zbývá",
        time: `${days ? `${days} ${dayLabel}, ` : ""}${hours}h, ${minutes}m a ${total % 60}s`
    };
}
