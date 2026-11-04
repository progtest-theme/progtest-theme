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
        save
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
    } = $props();
</script>

<Layout>
    <div class="navigation">
        <div class="previous" use:appendNodes={previous ? [previous] : []}></div>
        <span class="position">{position}</span>
        <div class="next" use:appendNodes={next ? [next] : []}></div>
    </div>
    {#if deadline}
        <Deadline data={deadline} />
    {/if}
    <section class="prompt" use:appendNodes={prompt}></section>
    <div class="answers">
        {#each answers as answer}
            {#if answer.choice}
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <label class="answer" use:appendNodes={answer.nodes}></label>
            {:else}
                <div class="answer" use:appendNodes={answer.nodes}></div>
            {/if}
        {/each}
    </div>
    <footer>
        <div class="references">
            <span use:appendNodes={[overview]}></span>
            {#each references as reference}
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
        padding-left: 48px;
        cursor: pointer;
    }

    label.answer:hover {
        background: rgb(128 128 128 / 0.1);
    }

    label.answer:has(:global(input:checked)) {
        border-color: #607d8b;
        background: rgb(96 125 139 / 0.12);
    }

    label.answer :global(input) {
        position: absolute;
        top: 18px;
        left: 16px;
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: #607d8b;
    }

    .answer :global(input:not([type="radio"], [type="checkbox"])),
    .answer :global(select),
    .answer :global(textarea) {
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        font: inherit;
    }

    .answer :global(.redBox),
    .answer :global(.greenBox) {
        position: absolute;
        top: 18px;
        right: 8px;
        left: auto;
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
