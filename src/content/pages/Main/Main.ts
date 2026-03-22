import type { ExtensionSettings } from "../../../settings";
import { Logged } from "../Logged";

import MainComponent from "./Main.svelte";

export type MenuItem = {
    title: string;
    text: string;
    icon: string;
    link: string;
    subjectHomepage?: string;
    footer?: string;
};

export type Subjects = Record<string, MenuItem[]>;

type ParsedItem = Pick<MenuItem, "title" | "text" | "link"> & {
    semester: string;
};

type CoursesInfo = {
    semester: string;
    generatedAt: string;
    courses: Record<
        string,
        {
            department: number;
            nameCs: string;
            nameEn: string;
            programmeType: string;
            classesLang: string;
            season: string;
            homepage: string;
            grades: string;
            pagesRepo: string;
            active: boolean;
        }
    >;
};

export class Main extends Logged {
    className = "main";

    orderC = 1000;
    constructor(settings: ExtensionSettings) {
        super(settings);
    }

    async initialise() {
        await super.initialise();

        // collect all elements
        const items = parseItems();
        if (items.length === 0) {
            return;
        }

        // get subject URLs from courses
        const subjectInfo: CoursesInfo = await fetch("https://courses.fit.cvut.cz/data/courses-all.json", {
            method: "GET",
            mode: "cors",
            credentials: "omit"
        }).then((response) => response.json());

        const subjects: Subjects = {};
        const settings: MenuItem[] = [];
        items.forEach((item) => {
            const icon = getMenuIcon(item.title);

            // settings have no semester
            if (item.semester === "Nástroje") {
                // overrides
                if (item.title === "FAQ") {
                    item.text = "Často kladené dotazy";
                }
                if (item.title === item.text) {
                    item.text = "";
                }
                settings.push({
                    title: item.title,
                    text: item.text,
                    icon,
                    link: item.link
                });
                return;
            }

            const year = item.semester.match(/\d+\/\d+/);

            const footer = item.semester;
            const semesterKey = `B${(year ? year[0].split("/")[0] : "").substring(
                2
            )}${item.semester.includes("Zimní") ? 1 : 2}`;
            const subjectHomepage =
                subjectInfo.courses[item.title]?.homepage ?? `https://courses.fit.cvut.cz/${item.title}`;

            subjects[semesterKey] ??= [];
            subjects[semesterKey].push({
                title: item.title,
                text: item.text.substring(0, item.text.indexOf("(")) || item.text,
                icon,
                link: item.link,
                subjectHomepage,
                footer
            });
        });

        const container = document.createElement("div");
        document.querySelector("div.navLink.navbar")?.insertAdjacentElement("afterend", container);
        new MainComponent({
            target: container,
            props: { subjects, settings }
        });
    }
}

function parseItems(): ParsedItem[] {
    const items: ParsedItem[] = [];

    document.querySelectorAll("details.menuList").forEach((semester) => {
        semester.querySelectorAll("div.bigButLink").forEach((subject) => {
            const link = subject.querySelector("a");
            const name = subject.querySelector("span");
            const title = subject.nextElementSibling?.querySelector("span");

            items.push({
                title: name?.textContent ?? "",
                text: title?.textContent ?? "",
                link: link?.href ?? "",
                semester: semester.querySelector("summary")?.innerText ?? ""
            });
        });
        semester.remove();
    });

    return items;
}

function getMenuIcon(title: string) {
    const iconName = (
        {
            Nastavení: "settings",
            Překladače: "compile",
            FAQ: "faq"
        }[title] || title.toLowerCase()
            .replace("bi-", "")
            .replace("ni-", "")
    );

    return chrome.runtime.getURL("themes/assets/icons/" + iconName + ".svg");
}
