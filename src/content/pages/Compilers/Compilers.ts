import { mount } from "svelte";

import { Logged } from "../Logged";

import CompilersComponent from "./Compilers.svelte";

export interface CompilerGroup {
    name: string;
    open: boolean;
    actions: { name: string; link: string; icon: string }[];
}

export class Compilers extends Logged {
    className = "compilers";

    async initialise() {
        await super.initialise();

        const sections = [...document.querySelectorAll<HTMLDetailsElement>("body > details.menuList2")];
        if (!sections.length) return;
        const groups: CompilerGroup[] = sections.map((section) => ({
            name: section.querySelector("summary")?.textContent?.trim() ?? "",
            open: section.open,
            actions: [...section.querySelectorAll<HTMLAnchorElement>(".menuItem2 > a")].map((link) => ({
                name: link.querySelector("b")?.textContent?.trim() ?? "",
                link: link.href,
                icon: link.querySelector("img")?.src ?? ""
            }))
        }));

        const container = document.createElement("div");
        sections[0].before(container);
        mount(CompilersComponent, { target: container, props: { groups } });
        sections.forEach((section) => section.remove());
    }
}
