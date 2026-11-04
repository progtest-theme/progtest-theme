import { flushSync, mount } from "svelte";

import { Logged } from "./Logged";
import ResultsComponent from "./Results.svelte";

export interface ResultGroup {
    heading: HTMLTableCellElement;
    span: number;
    details: HTMLTableCellElement[];
}

export class Results extends Logged {
    className = "results";

    async initialise() {
        await super.initialise();

        const table = document.querySelector<HTMLTableElement>("table.resultLayout");
        if (!table?.tHead || !table.tBodies.length) return;
        const username = document.title.split(/[@|]/)[0].trim();
        const rows = [...table.tBodies].flatMap((body) => [...body.rows]);
        let ownRow: HTMLTableRowElement | undefined;
        rows.forEach((row) => {
            const name = row.cells[1]?.textContent?.trim() ?? "";
            const own = !!username && name.includes(`(${username})`);
            if (own) ownRow = row;
            row.classList.toggle("current-student", own);
            row.cells[0]?.classList.add("rank-column");
            row.cells[1]?.classList.add("name-column");
            if (row.cells[1]) row.cells[1].title = name;
            row.querySelectorAll("span.dupC").forEach((marker) => marker.parentElement?.classList.add("dupCpar"));
        });

        const firstRow = table.tHead.rows[0];
        if (!firstRow) return;
        const groupStarts: number[] = [];
        const drafts: { heading: HTMLTableCellElement; columns: number[]; headers: HTMLTableCellElement[] }[] = [];
        const lowerHeaders = [...(table.tHead.rows[1]?.cells ?? [])];
        let lowerColumn = 0;
        let column = 0;
        for (const cell of firstRow.cells) {
            if (column >= 2) groupStarts.push(column);
            if (cell.rowSpan === 1 && table.tHead.rows.length === 2) {
                const headers = lowerHeaders.slice(lowerColumn, lowerColumn + cell.colSpan);
                if (cell.colSpan > 1 && headers[0]?.textContent?.trim() === "Σ") {
                    drafts.push({
                        heading: cell,
                        columns: headers.slice(1).map((_, index) => column + index + 1),
                        headers: headers.slice(1)
                    });
                }
                lowerColumn += cell.colSpan;
            }
            column += cell.colSpan;
        }
        for (const row of rows) {
            for (const index of groupStarts) row.cells[index]?.classList.add("group-start");
        }
        firstRow.cells[0]?.classList.add("rank-column");
        firstRow.cells[1]?.classList.add("name-column");
        const totalHeading = firstRow.cells[firstRow.cells.length - 1];
        const totalSpan = totalHeading.colSpan;
        function markTotal(cell: HTMLTableCellElement, offset: number) {
            cell.classList.add("total-column");
            cell.style.right = `${offset * 88}px`;
        }
        if (totalSpan > 1) {
            totalHeading.classList.add("total-group");
            lowerHeaders.slice(-totalSpan).forEach((cell, index) => markTotal(cell, totalSpan - index - 1));
        } else markTotal(totalHeading, 0);
        for (const row of rows) {
            [...row.cells].slice(-totalSpan).forEach((cell, index) => markTotal(cell, totalSpan - index - 1));
        }
        const sort = new URLSearchParams(window.location.search).get("Srt");
        const headings = new Map<HTMLTableCellElement, HTMLTableCellElement>();
        table.tHead.querySelectorAll("td").forEach((cell) => {
            const heading = document.createElement("th");
            for (const attribute of cell.attributes) heading.setAttribute(attribute.name, attribute.value);
            heading.scope = cell.colSpan > 1 ? "colgroup" : "col";
            heading.append(...cell.childNodes);
            const link = heading.querySelector("a");
            if (sort && link && new URL(link.href).searchParams.get("Srt") === sort)
                link.setAttribute("aria-current", "true");
            headings.set(cell, heading);
            cell.replaceWith(heading);
        });
        const groups: ResultGroup[] = drafts.map((group) => ({
            heading: headings.get(group.heading) ?? group.heading,
            span: group.heading.colSpan,
            details: [
                ...group.headers.map((cell) => headings.get(cell) ?? cell),
                ...rows.flatMap((row) => group.columns.map((index) => row.cells[index]).filter(Boolean))
            ]
        }));
        table.tHead.removeAttribute("style");
        table.tHead.classList.remove("stickyTable");
        table.style.width = "100%";
        table.setAttribute("aria-label", "Výsledky studentů");

        const container = document.createElement("div");
        table.before(container);
        flushSync(() => mount(ResultsComponent, { target: container, props: { table, ownRow, groups } }));
    }
}
