<script lang="ts">
    import PageLayout from "./PageLayout.svelte";
    import type { ResultGroup } from "./Results";

    let { table, ownRow, groups }: { table: HTMLTableElement; ownRow?: HTMLTableRowElement; groups: ResultGroup[] } =
        $props();
    let summariesOnly = $state(false);

    $effect(() => {
        for (const group of groups) {
            group.heading.colSpan = summariesOnly ? 1 : group.span;
            for (const cell of group.details) cell.hidden = summariesOnly;
        }
    });

    function appendTable(element: HTMLElement) {
        element.append(table);
    }
    function findOwnRow() {
        ownRow?.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }
</script>

<PageLayout title="Výsledky" wide>
    <div class="controls">
        {#if groups.length}<label><input type="checkbox" bind:checked={summariesOnly} /> Pouze součty</label>{/if}
        {#if ownRow}<button type="button" onclick={findOwnRow}>Můj řádek</button>{/if}
    </div>
    <div class="table-scroll" role="region" aria-label="Výsledky studentů" tabindex="0" use:appendTable></div>
</PageLayout>

<style>
    .controls {
        display: flex;
        align-items: center;
        justify-content: end;
        gap: 20px;
        min-height: 34px;
        padding: 6px 12px;
        border-bottom: 1px solid var(--page-border);
        font-size: 13px;
    }
    label {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
    }
    input {
        width: 16px;
        height: 16px;
        margin: 0;
        accent-color: #607d8b;
    }
    button {
        padding: 5px 12px;
        border: 1px solid #37474f;
        border-radius: 3px;
        background: #45535a;
        color: #fff;
        font: inherit;
        cursor: pointer;
    }
    button:hover {
        background: #546e7a;
    }
    button:focus-visible,
    .table-scroll:focus-visible {
        outline: 2px solid var(--page-accent);
        outline-offset: 2px;
    }
    .table-scroll {
        max-height: calc(100vh - 210px);
        overflow: auto;
        border-radius: 0 0 4px 4px;
    }
    :global(body.dark) .table-scroll {
        color-scheme: dark;
    }
    .table-scroll :global(table.resultLayout) {
        border: 0;
        border-radius: 0;
        border-collapse: separate;
        border-spacing: 0;
        color: var(--page-text);
        box-shadow: none;
        font-size: 13px;
        font-variant-numeric: tabular-nums;
    }
    .table-scroll :global(thead) {
        position: sticky;
        top: 0;
        z-index: 4;
    }
    .table-scroll :global(th) {
        box-sizing: border-box;
        padding: 0;
        border-right: 1px solid var(--page-border);
        border-bottom: 1px solid var(--page-border);
        background: var(--page-heading);
        color: var(--page-text);
        text-align: center;
        white-space: nowrap;
        font-weight: 600;
    }
    .table-scroll :global(th a),
    :global(body.dark) .table-scroll :global(th a) {
        display: block;
        padding: 9px 10px;
        color: inherit;
        text-decoration: none;
    }
    .table-scroll :global(th a:hover) {
        background: var(--page-hover);
    }
    .table-scroll :global(th a[aria-current="true"]) {
        text-decoration: underline;
        text-underline-offset: 4px;
    }
    .table-scroll :global(table.resultLayout > tbody > tr > td) {
        box-sizing: border-box;
        min-width: 64px;
        padding: 7px 10px;
        border-bottom: 1px solid var(--page-border);
        background: var(--page-bg);
        text-align: right;
        white-space: nowrap;
    }
    .table-scroll :global(table.resultLayout > tbody > tr:nth-child(even) > td) {
        background: var(--page-subtle);
    }
    .table-scroll :global(table.resultLayout > tbody > tr:hover > td) {
        background: var(--page-hover);
    }
    .table-scroll :global(table.resultLayout > tbody > tr.current-student > td) {
        background: var(--page-selected);
        font-weight: 600;
    }
    .table-scroll :global(.rank-column) {
        position: sticky;
        left: 0;
        z-index: 2;
        min-width: 52px !important;
        width: 52px;
        max-width: 52px;
        text-align: center !important;
    }
    .table-scroll :global(.name-column) {
        position: sticky;
        left: 52px;
        z-index: 2;
        min-width: 240px !important;
        width: 240px;
        max-width: 240px;
        overflow: hidden;
        border-right: 1px solid var(--page-border);
        text-overflow: ellipsis;
        text-align: left !important;
    }
    .table-scroll :global(.total-column) {
        position: sticky;
        z-index: 2;
        min-width: 88px !important;
        width: 88px;
        max-width: 88px;
        border-left: 1px solid var(--page-border);
        font-weight: 700;
    }
    .table-scroll :global(.total-group) {
        position: sticky;
        right: 0;
        z-index: 2;
        border-left: 1px solid var(--page-border);
    }
    .table-scroll :global(.group-start) {
        border-left: 1px solid var(--page-border);
        font-weight: 600;
    }
    .table-scroll :global(.current-student .rank-column) {
        border-left: 3px solid #607d8b;
    }
    .table-scroll :global([hidden]) {
        display: none;
    }
</style>
