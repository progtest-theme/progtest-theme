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

export async function saveQuestion(form: HTMLFormElement, save: HTMLInputElement): Promise<boolean> {
    if (!form.reportValidity()) return false;

    const data = new FormData(form, save);
    const body = new URLSearchParams();
    for (const [name, value] of data) {
        if (typeof value !== "string") throw new Error("Tuto odpověď uložte tlačítkem Uložit.");
        body.append(name, value);
    }

    const controls = [...form.elements].filter(
        (control): control is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
            (control instanceof HTMLInputElement ||
                control instanceof HTMLSelectElement ||
                control instanceof HTMLTextAreaElement) &&
            !control.disabled
    );
    controls.forEach((control) => (control.disabled = true));
    try {
        const response = await fetch(form.action, {
            method: "POST",
            body,
            credentials: "same-origin"
        });
        if (!response.ok) throw new Error("Odpověď se nepodařilo uložit. Zkuste to znovu.");

        let page = new DOMParser().parseFromString(await response.text(), "text/html");
        if (page.querySelector('select[name="UID_UNIVERSITY"]')) {
            throw new Error("Uložení nebylo potvrzeno. Zkontrolujte přihlášení a termín odevzdání.");
        }
        let savedForm = page.querySelector<HTMLFormElement>('form[name="form1"]');
        const questionUrl = new URL(form.action);
        questionUrl.searchParams.set("X", "KNTQ");
        const savedAction = savedForm && new URL(savedForm.getAttribute("action") ?? "", questionUrl);
        if (
            !savedAction ||
            ["Cou", "Knt", "Idx"].some(
                (name) => savedAction.searchParams.get(name) !== questionUrl.searchParams.get(name)
            )
        ) {
            // Saving can return the overview; read back this question before leaving it.
            const savedResponse = await fetch(questionUrl.href, { credentials: "same-origin", cache: "no-store" });
            if (!savedResponse.ok) throw new Error("Uložení odpovědi nebylo potvrzeno. Zkuste to znovu.");
            page = new DOMParser().parseFromString(await savedResponse.text(), "text/html");
            savedForm = page.querySelector<HTMLFormElement>('form[name="form1"]');
        }
        if (!savedForm || page.querySelector('select[name="UID_UNIVERSITY"]')) {
            throw new Error("Uložení nebylo potvrzeno. Zkontrolujte přihlášení a termín odevzdání.");
        }
        if (savedForm.querySelector("input.err, select.err, textarea.err")) {
            throw new Error("Odpověď obsahuje chybu. Zkontrolujte ji a uložte znovu.");
        }

        const savedData = new FormData(savedForm);
        const names = new Set([...body.keys(), ...savedData.keys()]);
        for (const name of names) {
            if (!/^(ANS|FLD)_/.test(name)) continue;
            if (JSON.stringify(body.getAll(name)) !== JSON.stringify(savedData.getAll(name))) {
                throw new Error("Uložení odpovědi nebylo potvrzeno. Zkuste to znovu.");
            }
        }
        return true;
    } finally {
        controls.forEach((control) => (control.disabled = false));
    }
}
