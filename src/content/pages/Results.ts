import type { ExtensionSettings } from "../../settings";

import { Logged } from "./Logged";

export class Results extends Logged {
    className = "results";

    constructor(settings: ExtensionSettings) {
        super(settings);
    }

    async initialise() {
        await super.initialise();

        let styles = "";

        // add selector to duplicate parent elements
        document.querySelectorAll("span.dupC").forEach((e) => {
            const parent = e.parentNode;
            if (parent instanceof HTMLElement) {
                parent.className += " dupCpar";
            }
        });

        // mark number of columns
        const c: number[] = [];
        let i = 0;
        const qsel = document.querySelector("thead > tr:nth-child(1)");
        if (qsel != null) {
            qsel.childNodes.forEach((e) => {
                if (!(e instanceof HTMLElement)) return;
                const colspan = e.getAttribute("colspan");
                i += colspan ? parseInt(colspan) : 1;
                c.push(i);
            });
            c.pop();
            c.shift();
            c.forEach((e) => {
                styles +=
                    "tbody > tr > td:nth-child(" + (e + 1) + ") {border-left: thin solid #aaa;font-weight: bold;}";
            });

            styles += "tr > td:last-child {font-weight: bold;}";
        }

        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
}
