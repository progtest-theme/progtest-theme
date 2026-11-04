export interface DeadlineData {
    label: string;
    value: string;
    countdown: string | undefined;
}

export function readDeadline(table: HTMLTableElement): DeadlineData | undefined {
    const countdown = table.querySelector<HTMLElement>("#countdown");
    const row = countdown?.closest("tr");
    if (!row) return;
    return {
        label: row.cells[0]?.textContent?.trim() ?? "",
        value: row.cells[1]?.textContent?.trim() ?? "",
        countdown: countdown?.textContent ?? undefined
    };
}

// Keep ProgTest's original controls and inline handlers when moving them into components.
export function appendNodes(element: HTMLElement, nodes: Node[]) {
    element.append(...nodes);
}
