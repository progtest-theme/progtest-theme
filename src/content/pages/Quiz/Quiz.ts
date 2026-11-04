import { flushSync, mount } from "svelte";

import { Logged } from "../Logged";

import QuizComponent from "./Quiz.svelte";
import { readDeadline } from "./native";

export interface QuizQuestion {
    name: string;
    status: string;
    score: string;
    link: string | undefined;
    openLabel: string;
}

export class Quiz extends Logged {
    className = "quiz";

    async initialise() {
        await super.initialise();

        const source = document.querySelector<HTMLElement>("body > center > .topLayout");
        const table = source?.querySelector("table");
        if (!source || !table) return;

        const questions: QuizQuestion[] = [];
        for (const row of table.tBodies[0].rows) {
            if (row.cells.length !== 4 || row.querySelector("#countdown")) continue;
            const link = row.querySelector<HTMLAnchorElement>('a[href*="X=KNTQ"]');
            questions.push({
                name: row.cells[0]?.textContent?.trim() ?? "",
                status: row.cells[1]?.textContent?.trim() ?? "",
                score: row.cells[2]?.textContent?.trim() ?? "",
                link: link?.href,
                openLabel: link?.textContent?.trim() ?? ""
            });
        }
        if (!questions.length) return;

        const actions = [...table.querySelectorAll<HTMLAnchorElement>('a[href*="X=KNTE"], a[href*="X=KNTR"]')];
        const deadline = readDeadline(table);
        const title = document.querySelector(".navLink b")?.textContent?.trim() ?? "";
        const container = document.createElement("div");
        source.before(container);
        flushSync(() => mount(QuizComponent, { target: container, props: { title, questions, actions, deadline } }));
        source.remove();
    }
}
