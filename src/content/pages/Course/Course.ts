import type { ExtensionSettings } from "../../../settings";
import { buildLink, getCourseId } from "../../utils";
import { Logged } from "../Logged";

import CourseComponent from "./Course.svelte";

export interface CourseItem {
    name: string;
    type: string;
    link: string | undefined;
    opens: Date | undefined;
    bonusEnd: Date | undefined;
    closes: Date | undefined;
    score: number | undefined | null;
    disabled: boolean;
}

export interface CourseGroup {
    name: string;
    tasks: CourseItem[];
}

export class Course extends Logged {
    className = "course";

    constructor(settings: ExtensionSettings) {
        super(settings);
    }

    async initialise() {
        await super.initialise();

        document.querySelectorAll<HTMLElement>("body > details").forEach((e) => {
            e.style.display = "none";
        });

        const tasks = await GetTasks();

        const container = document.createElement("div");
        document.body.appendChild(container);
        new CourseComponent({
            target: container,
            props: { courseGroups: tasks }
        });
    }
}

export async function GetTasks() {
    const page = await fetch(buildLink("X=Course&Cou=" + getCourseId()))
        .then((res) => res.text())
        .catch((e) => {
            console.error("Failed to fetch course overview", e);
        });
    if (!page) return;
    const tree = new DOMParser().parseFromString(page, "text/html");
    const ret: CourseGroup[] = [];

    tree.querySelectorAll("details.menuList").forEach((e) => {
        const groupName = e.querySelector<HTMLElement>("summary > b")?.textContent;
        const tasks: CourseItem[] = [];

        if (!groupName) {
            throw new Error("Missing required group name: " + JSON.stringify(groupName));
        }

        if (groupName === "Výsledky") {
            return;
        }

        e.querySelectorAll(":scope > div > div").forEach((f) => {
            const name = f.querySelector<HTMLElement>("[class*='bigBut'] span")?.textContent;

            let type = {
                program: "task",
                quiz: "test",
                extra: "extra"
            }[
                f.querySelector<HTMLImageElement>("[class*='bigBut'] img")?.src.split("/").pop()?.split(".").shift() ??
                    ""
            ];

            if (type == "test" && name?.toLowerCase().includes("demo")) {
                type = "test-demo";
            }

            const link: string | undefined = f.querySelector<HTMLAnchorElement>(":scope > div a")?.href;
            const disabled: boolean = link === undefined;
            let score: number | undefined | null;
            let opens: Date | undefined;
            let closes: Date | undefined;
            let bonusEnd: Date | undefined;

            f.querySelectorAll(":scope > div > span").forEach((span) => {
                const text = span.textContent?.trim() ?? "";

                if (text.startsWith("Hodnocení:")) {
                    score = parseFloat(text.substring(text.indexOf(":") + 1).trim());

                    if (isNaN(score)) {
                        score = null;
                    }
                } else if (text.startsWith("Přístupné od:")) {
                    opens = textToDate(text.substring(text.indexOf(":") + 1).trim());
                } else if (text.startsWith("Řádný termín:")) {
                    closes = textToDate(text.substring(text.indexOf(":") + 1).trim());
                } else if (text.startsWith("Včasné odevzdání do:")) {
                    bonusEnd = textToDate(text.substring(text.indexOf(":") + 1).trim());
                }
            });

            if (!name || !type) {
                console.log(f);
                throw new Error("Missing required properties: " + JSON.stringify([name, type]));
            }

            tasks.push({
                name,
                type,
                link: link,
                disabled: disabled,
                score: score,
                opens: opens,
                closes: closes,
                bonusEnd: bonusEnd
            });
        });

        ret.push({
            name: groupName,
            tasks: tasks
        });
    });

    return ret;
}

export function isToday(d: Date) {
    const today = new Date();
    return d.getDate() == today.getDate() && d.getMonth() == today.getMonth() && d.getFullYear() == today.getFullYear();
}

/**
 * [title]
 *
 * Termín odevzdání: [deadline]
 *
 * Termín odevzdání s penalizací: <b>[lateDeadline]</b> [lateDeadlineInfo]
 *
 * Hodnocení: <b>[score] / [scoreMax]</b> [scoreInfo]
 */
export interface TaskItemInfo {
    title: string;
    deadline: Date;
    lateDeadline: Date | undefined;
    lateDeadlineInfo: string | undefined;
    score: number;
    scoreMax: number;
    scoreInfo: string | undefined;
}

/**
 * Vybraná / zadaná úloha: [title]
 *
 * Odevzdaná řešení: [submissions] / [submissionsMax] + [submissionsWithPenalty]
 *
 * Hodnocení: [score] / [scoreMax]
 */
export interface TaskItemTask {
    title: string;
    link: string;
    text: string;
    submissions: number | null;
    submissionsMax: number | null;
    submissionsWithPenalty: number | null;
    score: number;
    scoreMax: number;
}

export interface TaskItem {
    info: TaskItemInfo;
    tasks: TaskItemTask[];
}

function isDateValid(date: Date) {
    return !isNaN(date.getTime());
}

function textToDate(text: string | null): Date {
    if (!text) {
        throw new Error("Failed to parse date");
    }
    // parse "DD.MM.YYYY HH:MM:SS"
    const [date, time] = text.split(" ") ?? [];
    const [day, month, year] = (date.split(".") ?? []).map((s) => parseInt(s));
    const [hour, minute, second] = (time?.split(":") ?? []).map((s) => parseInt(s));
    const parsedDate = new Date(year, month - 1, day, hour, minute, second);
    if (!isDateValid(parsedDate)) {
        throw new Error(`Failed to parse date: ${text}\n
        ${JSON.stringify([day, month, year, hour, minute, second])}`);
    }
    return parsedDate;
}

function parseItemInfo(document: Document): TaskItemInfo {
    const header = document.querySelectorAll("center > div:nth-child(1) table tbody tr");

    let title: string | undefined;
    let deadline: Date | undefined;
    let lateDeadline: Date | undefined;
    let lateDeadlineInfo: string | undefined;
    let score: number | undefined;
    let scoreMax: number | undefined;
    let scoreInfo: string | undefined;

    header.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length === 1) {
            title = cells[0].textContent?.trim();
        }

        if (cells.length < 2) {
            return;
        }

        const key = cells[0].textContent?.trim();
        const value = cells[1];

        if (!key || !value) {
            return;
        }

        switch (key) {
            case "Termín odevzdání:":
                deadline = textToDate(value?.textContent ?? "");
                break;
            case "Pozdní odevzdání s penalizací:":
                lateDeadline = textToDate(value.querySelector("b")?.textContent ?? "");
                lateDeadlineInfo = value.textContent?.replace(value.querySelector("b")?.textContent ?? "", "").trim();
                break;
            case "Hodnocení:":
                const floats = value?.textContent?.match(/\d+\.\d+/g);

                scoreInfo = value.textContent?.replace(value.querySelector("b")?.textContent ?? "", "").trim();
                if (floats && floats.length >= 2) {
                    score = parseFloat(floats[0]);
                    scoreMax = parseFloat(floats[1]);
                }
                break;
        }
    });

    if (!title || !deadline || score === undefined || scoreMax === undefined) {
        throw new Error(
            "Failed to parse item info: " +
                JSON.stringify({
                    title,
                    deadline,
                    lateDeadline,
                    lateDeadlineInfo,
                    score,
                    scoreMax,
                    scoreInfo
                })
        );
    }

    return {
        title,
        deadline,
        lateDeadline,
        lateDeadlineInfo,
        score,
        scoreMax,
        scoreInfo
    };
}

function parseItemTasks(document: Document): TaskItemTask[] {
    const tasks: TaskItemTask[] = [];

    document.querySelectorAll("table#maintable").forEach((val, i) => {
        // skip first as that one contains ItemInfo
        if (i === 0) return;

        const title = val.querySelector("tbody > tr:nth-child(1) > td:nth-child(2)")?.textContent;
        const link = val.querySelector<HTMLAnchorElement>("tbody > tr:last-child a:last-child")?.href;
        const text = val.querySelector("tbody > tr:nth-child(4) > td")?.textContent?.trim();

        const submissionsText = val.querySelector("tbody > tr:nth-child(2) > td:nth-child(2)")?.textContent;

        const [submissions = null, submissionsMax = null, submissionsWithPenalty = null] = (
            submissionsText?.split("/") ?? []
        )
            .flatMap((s) => s.split("+"))
            .map((s) => {
                s = s.trim();
                if (s === "-") {
                    return null;
                }
                return parseInt(s);
            });

        const scoreText = val.querySelector("tbody > tr:nth-child(3) > td:nth-child(2)")?.textContent;
        const [score, scoreMax] = (scoreText?.split("/") ?? []).map(parseFloat);

        if (!title || !link || !text) {
            throw new Error("Failed to parse item task: " + JSON.stringify({ title, link, text }));
        }

        tasks.push({
            title,
            link,
            text,
            submissions,
            submissionsMax,
            submissionsWithPenalty,
            score,
            scoreMax
        });
    });

    return tasks;
}

export async function parseTaskGrp(text: string): Promise<TaskItem> {
    const doc = new DOMParser().parseFromString(text, "text/html");
    return { info: parseItemInfo(doc), tasks: parseItemTasks(doc) };
}
