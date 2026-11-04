import { flushSync, mount } from "svelte";

import { Logged } from "../Logged";
import { normaliseSearch } from "../search";

import FAQComponent from "./FAQ.svelte";

export interface FAQQuestion {
    id: string;
    title: string;
    nodes: ChildNode[];
    search: string;
}

export interface FAQSection {
    id: string;
    title: string;
    questions: FAQQuestion[];
}

export class FAQ extends Logged {
    className = "faq";

    async initialise() {
        await super.initialise();

        const source = document.querySelector<HTMLElement>("body > center > .newBox");
        const content = source?.querySelector<HTMLElement>("td.al");
        if (!source || !content) return;

        const sections: FAQSection[] = [];
        for (const heading of content.querySelectorAll(":scope > h2")) {
            const list = heading.nextElementSibling;
            if (!list?.matches("ol")) continue;
            const id = heading.id || `faq-section-${sections.length + 1}`;
            const title = heading.textContent?.trim() ?? "";
            const questions: FAQQuestion[] = [];
            for (const item of list.querySelectorAll(":scope > li")) {
                const question = item.querySelector(":scope > b");
                if (!question) continue;
                const questionTitle = question.textContent?.replace(/\s+/g, " ").trim() ?? "";
                const search = normaliseSearch(`${title} ${item.textContent}`);
                if (question.nextElementSibling?.matches("br")) question.nextElementSibling.remove();
                question.remove();
                questions.push({
                    id: item.id || `${id}-question-${questions.length + 1}`,
                    title: questionTitle,
                    nodes: [...item.childNodes],
                    search
                });
            }
            sections.push({ id, title, questions });
        }
        if (!sections.length) return;

        const intro = content.querySelector(":scope > p")?.textContent?.trim();
        const container = document.createElement("div");
        source.before(container);
        flushSync(() => mount(FAQComponent, { target: container, props: { sections, intro } }));
        source.remove();
    }
}
