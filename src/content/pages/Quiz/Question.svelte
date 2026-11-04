<script lang="ts">
    import Deadline from "./Deadline.svelte";
    import Layout from "./Layout.svelte";
    import type { AnswerContent } from "./Question";
    import { appendNodes, type DeadlineData } from "./native";

    let {
        previous,
        next,
        position,
        deadline,
        prompt,
        answers,
        references,
        overview,
        save,
        saveAndPrevious,
        saveAndNext
    }: {
        previous?: HTMLAnchorElement | null;
        next?: HTMLAnchorElement | null;
        position: string;
        deadline?: DeadlineData;
        prompt: ChildNode[];
        answers: AnswerContent[];
        references: HTMLAnchorElement[];
        overview: HTMLAnchorElement;
        save?: HTMLInputElement | null;
        saveAndPrevious?: () => Promise<void>;
        saveAndNext?: () => Promise<void>;
    } = $props();

    let saving = $state(false);
    let saveError = $state("");

    function appendNavigation(
        element: HTMLElement,
        navigation: { link?: HTMLAnchorElement | null; save?: () => Promise<void> }
    ) {
        const link = navigation.link;
        const save = navigation.save;
        if (!link) return;
        element.append(link);
        if (!save) return;
        async function handleClick(event: MouseEvent) {
            event.preventDefault();
            if (saving) return;
            saving = true;
            saveError = "";
            const label = link.textContent;
            link.textContent = "Ukládám…";
            link.setAttribute("aria-disabled", "true");
            try {
                await save();
            } catch (error) {
                saveError = error instanceof Error ? error.message : "Odpověď se nepodařilo uložit. Zkuste to znovu.";
            } finally {
                saving = false;
                link.textContent = label;
                link.removeAttribute("aria-disabled");
            }
        }
        link.addEventListener("click", handleClick);
        return { destroy: () => link.removeEventListener("click", handleClick) };
    }
</script>

<Layout>
    <div class="navigation">
        <div class="previous" aria-busy={saving} use:appendNavigation={{ link: previous, save: saveAndPrevious }}></div>
        <span class="position">{position}</span>
        <div class="next" aria-busy={saving} use:appendNavigation={{ link: next, save: saveAndNext }}></div>
    </div>
    {#if saveError}
        <p class="save-error" role="alert">{saveError}</p>
    {/if}
    {#if deadline}
        <Deadline data={deadline} />
    {/if}
    <section class="prompt" use:appendNodes={prompt}></section>
    <div class="answers">
        {#each answers as answer (answer)}
            {#if answer.choice}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label
                    class="answer"
                    class:correct={answer.result === "correct"}
                    class:incorrect={answer.result === "incorrect"}
                    use:appendNodes={answer.nodes}
                ></label>
            {:else}
                <div
                    class="answer"
                    class:correct={answer.result === "correct"}
                    class:incorrect={answer.result === "incorrect"}
                    use:appendNodes={answer.nodes}
                ></div>
            {/if}
        {/each}
    </div>
    <footer>
        <div class="references">
            <span use:appendNodes={[overview]}></span>
            {#each references as reference (reference)}
                <span use:appendNodes={[reference]}></span>
            {/each}
        </div>
        {#if save}
            <div class="bUpd" use:appendNodes={[save]}></div>
        {/if}
    </footer>
</Layout>

<style>
    .navigation {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: #45535a;
        color: #fff;
    }

    .navigation :global(a),
    :global(body.dark) .navigation :global(a) {
        color: #fff;
        font-size: 14px;
    }

    .next {
        text-align: right;
    }

    .save-error {
        margin: 16px 20px;
        padding: 12px 16px;
        border: 1px solid #d32f2f;
        border-radius: 4px;
        background: rgb(244 67 54 / 0.16);
    }

    .prompt {
        padding: 16px 20px;
        overflow-wrap: anywhere;
        font-size: 17px;
    }

    .prompt :global(p:first-child) {
        margin-top: 0;
    }

    .prompt :global(p:last-child) {
        margin-bottom: 0;
    }

    .prompt :global(pre),
    .answer :global(pre) {
        max-width: 100%;
        overflow: auto;
        font-size: 14px;
        text-align: left;
    }

    .answers {
        display: grid;
        gap: 10px;
        padding: 0 20px 20px;
    }

    .answer {
        position: relative;
        min-width: 0;
        padding: 14px 16px;
        border: 1px solid var(--quiz-border);
        border-radius: 4px;
        overflow-wrap: anywhere;
        line-height: 1.6;
    }

    label.answer {
        padding-left: 54px;
        cursor: pointer;
    }

    label.answer:has(:global(input:enabled)):hover {
        background: rgb(128 128 128 / 0.1);
    }

    label.answer:not(.correct, .incorrect):has(:global(input:checked)) {
        border-color: #607d8b;
        background: rgb(96 125 139 / 0.12);
    }

    label.answer :global(input) {
        appearance: none;
        box-sizing: border-box;
        position: absolute;
        top: 16px;
        left: 16px;
        width: 24px;
        height: 24px;
        margin: 0;
        border: 2px solid #757575;
        border-radius: 4px;
        background: #fff;
        opacity: 1;
        cursor: inherit;
    }

    label.answer :global(input[type="radio"]) {
        border-radius: 50%;
    }

    label.answer :global(input:checked) {
        border-color: #2563eb;
        background: #2563eb;
    }

    label.answer :global(input:checked)::after {
        content: "";
        display: block;
        position: absolute;
    }

    label.answer :global(input[type="radio"]:checked)::after {
        inset: 5px;
        border-radius: 50%;
        background: #fff;
    }

    label.answer :global(input[type="checkbox"]:checked)::after {
        top: 2px;
        left: 6px;
        width: 6px;
        height: 11px;
        border: solid #fff;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
    }

    label.answer :global(input:focus-visible) {
        outline: 3px solid #2563eb;
        outline-offset: 4px;
    }

    :global(body.dark) label.answer :global(input) {
        border-color: #aaa;
        background: #252525;
    }

    :global(body.dark) label.answer :global(input:checked) {
        border-color: #93c5fd;
        background: #2563eb;
    }

    .answer :global(input:not([type="radio"], [type="checkbox"])),
    .answer :global(select),
    .answer :global(textarea) {
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        font: inherit;
    }

    .answer.correct {
        border-color: #388e3c;
        background: rgb(76 175 80 / 0.16);
    }

    .answer.incorrect {
        border-color: #d32f2f;
        background: rgb(244 67 54 / 0.16);
    }

    :global(body.dark) .answer.correct {
        border-color: #66bb6a;
        background: rgb(76 175 80 / 0.22);
    }

    :global(body.dark) .answer.incorrect {
        border-color: #ef5350;
        background: rgb(244 67 54 / 0.22);
    }

    footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 20px;
        border-top: 1px solid var(--quiz-border);
    }

    .references {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 20px;
        font-size: 14px;
    }

    .references :global(a),
    :global(body.dark) .references :global(a) {
        color: var(--quiz-accent);
        text-decoration: underline;
    }

    .bUpd {
        width: 120px;
    }

    @media (width <= 600px) {
        .navigation {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .position {
            grid-column: 1 / -1;
            grid-row: 1;
            text-align: center;
        }

        .previous,
        .next {
            grid-row: 2;
        }

        .bUpd {
            width: 100%;
        }
    }
</style>
