<script lang="ts">
    import { onMount } from "svelte";
    import { SvelteSet } from "svelte/reactivity";

    import PageLayout from "../PageLayout.svelte";
    import { appendNodes } from "../Quiz/native";
    import { normaliseSearch } from "../search";

    import type { FAQSection } from "./FAQ";

    let { sections, intro }: { sections: FAQSection[]; intro?: string } = $props();
    let query = $state("");
    const opened = new SvelteSet<string>();
    const terms = $derived(normaliseSearch(query).split(" ").filter(Boolean));
    const searching = $derived(terms.length > 0);
    const matches = $derived(
        sections.map((section) => ({
            ...section,
            questions: section.questions.filter((question) => terms.every((term) => question.search.includes(term)))
        }))
    );
    const visible = $derived(matches.filter((section) => section.questions.length));
    const count = $derived(visible.reduce((sum, section) => sum + section.questions.length, 0));
    const total = $derived(sections.reduce((sum, section) => sum + section.questions.length, 0));
    const allOpen = $derived(
        visible.every((section) => section.questions.every((question) => opened.has(question.id)))
    );

    function reset() {
        query = "";
    }
    function toggleAll() {
        const expanding = !allOpen;
        for (const section of visible)
            for (const question of section.questions) {
                if (expanding) opened.add(question.id);
                else opened.delete(question.id);
            }
    }
    function trackToggle(id: string, open: boolean) {
        if (searching || opened.has(id) === open) return;
        if (open) opened.add(id);
        else opened.delete(id);
    }

    onMount(() => {
        function openHash() {
            const id = window.location.hash.slice(1);
            const question = sections.some((section) => section.questions.some((question) => question.id === id));
            if (!question && !sections.some((section) => section.id === id)) return;
            reset();
            if (question) opened.add(id);
            requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
        }
        openHash();
        window.addEventListener("hashchange", openHash);
        return () => window.removeEventListener("hashchange", openHash);
    });
</script>

<PageLayout title="FAQ">
    <div class="searchbar">
        <label>Hledat ve FAQ <input type="search" bind:value={query} placeholder="Kompilace, heslo, paměť…" /></label>
        {#if searching}<span role="status">{count} z {total} otázek</span>{/if}
        {#if !searching}<button type="button" onclick={toggleAll}>{allOpen ? "Sbalit vše" : "Rozbalit vše"}</button
            >{/if}
    </div>
    <nav aria-label="Kategorie otázek">
        {#each sections as section (section.id)}<a href={`#${section.id}`} onclick={reset}>{section.title}</a>{/each}
    </nav>
    <div class="content">
        {#if intro}<p class="intro">{intro}</p>{/if}
        {#each visible as section (section.id)}
            <section aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                <div class="questions">
                    {#each section.questions as question (question.id)}
                        <details
                            id={question.id}
                            open={searching || opened.has(question.id)}
                            ontoggle={(event) => trackToggle(question.id, event.currentTarget.open)}
                        >
                            <summary
                                >{question.title}<a
                                    class="permalink"
                                    href={`#${question.id}`}
                                    aria-label={`Odkaz na otázku: ${question.title}`}>#</a
                                ></summary
                            >
                            <div class="answer" use:appendNodes={question.nodes}></div>
                        </details>
                    {/each}
                </div>
            </section>
        {/each}
        {#if !count}<div class="empty">
                <p>Žádná odpovídající otázka.</p>
                <button type="button" onclick={reset}>Zrušit hledání</button>
            </div>{/if}
    </div>
</PageLayout>

<style>
    .searchbar {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--page-border);
        font-size: 13px;
    }
    label {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    input {
        box-sizing: border-box;
        width: 320px;
        padding: 7px 10px;
        border: 1px solid var(--page-border);
        border-radius: 3px;
        background: var(--page-subtle);
        color: var(--page-text);
        font: inherit;
        font-size: 14px;
    }
    .searchbar > span,
    .searchbar > button {
        margin-left: auto;
    }
    .searchbar > span {
        color: var(--page-muted);
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
    input:focus-visible,
    button:focus-visible,
    summary:focus-visible {
        outline: 2px solid var(--page-accent);
        outline-offset: 2px;
    }
    nav {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 24px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--page-border);
        font-size: 13px;
    }
    nav a,
    .permalink,
    .answer :global(a),
    :global(body.dark) nav a,
    :global(body.dark) .permalink,
    :global(body.dark) .answer :global(a) {
        color: var(--page-accent);
        text-decoration: underline;
        text-underline-offset: 3px;
    }
    .content {
        padding: 0 16px 20px;
    }
    .intro {
        margin: 16px 0;
        color: var(--page-muted);
        font-size: 14px;
    }
    section + section {
        margin-top: 24px;
    }
    h2 {
        scroll-margin-top: 80px;
        margin: 18px 0 10px;
        color: var(--page-text);
        font-size: 20px;
        font-weight: 400;
    }
    .questions {
        overflow: hidden;
        border: 1px solid var(--page-border);
        border-radius: 3px;
    }
    details {
        scroll-margin-top: 80px;
    }
    details + details {
        border-top: 1px solid var(--page-border);
    }
    summary {
        padding: 11px 14px;
        color: var(--page-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.6;
        cursor: pointer;
    }
    summary::marker {
        color: var(--page-muted);
    }
    summary:hover,
    details[open] summary {
        background: var(--page-subtle);
    }
    .permalink {
        float: right;
        margin-left: 12px;
        font-size: 13px;
    }
    .answer {
        padding: 0 18px 8px;
        overflow-wrap: anywhere;
        color: var(--page-text);
        font-size: 14px;
        line-height: 1.75;
    }
    .answer :global(p) {
        margin: 12px 0;
    }
    .answer :global(ul),
    .answer :global(ol) {
        padding-left: 24px;
    }
    .answer :global(li + li) {
        margin-top: 7px;
    }
    .answer :global(pre) {
        max-width: 100%;
        box-sizing: border-box;
        padding: 12px;
        overflow: auto;
        border: 1px solid var(--page-border);
        border-radius: 3px;
        background: var(--page-subtle);
        font-size: 13px;
        line-height: 1.6;
    }
    .empty {
        padding: 30px 0;
        color: var(--page-muted);
    }
</style>
