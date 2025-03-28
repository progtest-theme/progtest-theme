import { ExtensionSettings } from "../../../settings";
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

type ParsedItem = Pick<MenuItem, "title" | "text" | "link"> & { semester: string }

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
        const subjectInfo: CoursesInfo = await fetch(
            "https://courses.fit.cvut.cz/data/courses-all.json",
            {
                method: "GET",
                mode: "cors",
                credentials: "omit",
            },
        ).then((response) => response.json());

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
                    link: item.link,
                });
                return;
            }

            let year = item.semester.match(/\d+\/\d+/)[0];

            const footer = item.semester;
            const semesterKey = `B${year.split("/")[0].substring(2)}${item.semester.includes("Zimní") ? 1 : 2
                }`;
            const subjectHomepage =
                subjectInfo.courses[item.title]?.homepage ??
                `https://courses.fit.cvut.cz/${item.title}`;

            subjects[semesterKey] ??= [];
            subjects[semesterKey].push({
                title: item.title,
                text: item.text.substring(0, item.text.indexOf("(")),
                icon,
                link: item.link,
                subjectHomepage,
                footer,
            });
        });

        const container = document.createElement("div");
        document.querySelector("div.navLink.navbar")?.insertAdjacentElement("afterend", container);
        new MainComponent({
            target: container,
            props: { subjects, settings },
        });
    }
}

function parseItems(): ParsedItem[] {
    let items: ParsedItem[] = [];

    document.querySelectorAll("details.menuList").forEach(
        (semester) => {
            semester.querySelectorAll("div.bigButLink").forEach((subject) => {
                const link = subject.querySelector("a");
                const name = subject.querySelector("span");
                const title = subject.nextElementSibling?.querySelector("span");
                items.push({
                    title: name?.innerText ?? "",
                    text: title?.innerText ?? "",
                    link: link?.href ?? "",
                    semester: semester.querySelector("summary")?.innerText ?? ""
                });
            })
            semester.remove();
        }
    )

    return items;
}

function getMenuIcon(title: string) {
    return (
        {
            "BI-AAG": "icon-aag",
            "BI-AG1": "icon-ag1",
            "BI-OSY": "icon-osy",
            "BI-PA1": "icon-pa1",
            "BI-PA2": "icon-pa2",
            "BI-PJV": "icon-pjv",
            "BI-PS1": "icon-ps1",
            "BI-PYT": "icon-pyt",
            "NI-PDP": "icon-pdp",
            Nastavení: "icon-setting",
            Překladače: "icon-compile",
            FAQ: "icon-faq",
        }[title] || "icon-unknown"
    );
}
