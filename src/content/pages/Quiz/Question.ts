import { flushSync, mount } from "svelte";

import { Logged } from "../Logged";

import QuestionComponent from "./Question.svelte";
import { readDeadline, saveQuestion } from "./native";

export interface AnswerContent {
    nodes: ChildNode[];
    choice: boolean;
    result?: "correct" | "incorrect";
}

export class Question extends Logged {
    className = "question";

    async initialise() {
        await super.initialise();

        const form = document.querySelector<HTMLFormElement>('form[name="form1"]');
        const source =
            form?.querySelector<HTMLElement>(".topLayout") ??
            document.querySelector<HTMLElement>("body > center > .topLayout");
        const table = source?.querySelector("table");
        if (!source || !table) return;

        const rows = [...table.tBodies[0].rows];
        const promptIndex = rows[2]?.cells.length === 1 ? 2 : 3;
        const prompt = rows[promptIndex]?.cells[0];
        if (!prompt) return;

        const previous = rows[0]?.cells[0]?.querySelector("a");
        const next = rows[0]?.cells[2]?.querySelector("a");
        const position = rows[0]?.cells[1]?.textContent?.trim() ?? "";
        const deadline = readDeadline(table);
        const save = form?.querySelector<HTMLInputElement>('input[type="submit"]');
        const saveAndNavigate = (link?: HTMLAnchorElement | null): (() => Promise<void>) | undefined => {
            if (!form || !save || !link) return;
            const href = link.getAttribute("href") ?? "";
            const destination = href.match(/^javascript:warnModify\((['"])(.*?)\1\);?$/)?.[2] ?? href;
            const url = new URL(destination, window.location.href);
            if (url.origin === window.location.origin && ["KNTQ", "KNT"].includes(url.searchParams.get("X") ?? "")) {
                link.href = url.href;
                return async () => {
                    if (await saveQuestion(form, save)) window.location.assign(url.href);
                };
            }
        };
        const references = [...prompt.querySelectorAll<HTMLAnchorElement>(".bLink a")];
        references.forEach((link) => link.closest(".bLink")?.remove());
        prompt.querySelector(":scope > hr:first-child")?.remove();

        const answers: AnswerContent[] = rows
            .slice(promptIndex + 1)
            .filter((row) => !(save && row.contains(save)))
            .map((row) => {
                const cells = [...row.cells].filter(
                    (cell) =>
                        cell.textContent?.trim() ||
                        cell.querySelector("input, select, textarea, img, svg, .redBox, .greenBox")
                );
                const controls = row.querySelectorAll<HTMLInputElement>(
                    'input:not([type="hidden"]):not([type="submit"]), select, textarea'
                );
                let result: AnswerContent["result"];
                const choice = row.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
                if (!save && choice?.disabled) {
                    // ProgTest marks mismatches, including correct options the student missed.
                    const mismatch = !!row.querySelector(".redBox");
                    if (choice.checked) result = mismatch ? "incorrect" : "correct";
                    else if (mismatch) result = "correct";
                } else if (!save && controls.length && [...controls].every((control) => control.disabled)) {
                    if (row.querySelector(".err, .redBox")) result = "incorrect";
                    else if (row.querySelector(".std, .greenBox")) result = "correct";
                }
                row.querySelectorAll(".redBox, .greenBox").forEach((marker) => marker.remove());
                return {
                    nodes: cells.flatMap((cell) => [...cell.childNodes]),
                    choice: controls.length === 1 && ["radio", "checkbox"].includes(controls[0].type),
                    result
                };
            })
            .filter((answer) => answer.nodes.length);

        const overview = document.createElement("a");
        const overviewUrl = new URL(window.location.href);
        overviewUrl.searchParams.set("X", "KNT");
        overviewUrl.searchParams.delete("Idx");
        overview.textContent = "Přehled otázek";
        overview.href = previous?.getAttribute("href")?.includes("warnModify")
            ? `javascript:warnModify(${JSON.stringify(overviewUrl.pathname + overviewUrl.search)})`
            : overviewUrl.href;

        if (form) {
            source.querySelectorAll<HTMLInputElement>('input[type="hidden"]').forEach((input) => form.append(input));
        }
        const container = document.createElement("div");
        source.before(container);
        flushSync(() =>
            mount(QuestionComponent, {
                target: container,
                props: {
                    previous,
                    next,
                    position,
                    deadline,
                    prompt: [...prompt.childNodes],
                    answers,
                    references,
                    overview,
                    save,
                    saveAndPrevious: saveAndNavigate(previous),
                    saveAndNext: saveAndNavigate(next)
                }
            })
        );
        source.remove();
    }
}
