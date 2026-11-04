<script lang="ts">
    import Deadline from "./Deadline.svelte";
    import Layout from "./Layout.svelte";
    import type { QuizQuestion } from "./Quiz";
    import { appendNodes, type DeadlineData } from "./native";

    let {
        title,
        questions,
        actions,
        deadline
    }: {
        title: string;
        questions: QuizQuestion[];
        actions: HTMLAnchorElement[];
        deadline?: DeadlineData;
    } = $props();
</script>

<Layout>
    <h1>{title}</h1>
    {#if deadline}
        <Deadline data={deadline} />
    {/if}
    <ol>
        {#each questions as question}
            <li>
                <a href={question.link}>
                    <span class="name">{question.name}</span>
                    <span class="status">{question.status}</span>
                    <span class="score">{question.score}</span>
                    <span class="open">{question.openLabel} ›</span>
                </a>
            </li>
        {/each}
    </ol>
    {#if actions.length}
        <footer>
            {#each actions as action}
                <div
                    class:regenerate={action.getAttribute("href")?.includes("X=KNTR")}
                    use:appendNodes={[action]}
                ></div>
            {/each}
        </footer>
    {/if}
</Layout>

<style>
    h1 {
        margin: 0;
        padding: 10px 20px;
        background: #45535a;
        color: #fff;
        font-size: 18pt;
        font-weight: 100;
    }

    ol {
        margin: 0;
        padding: 0;
        list-style: none;
    }

    li + li {
        border-top: 1px solid var(--quiz-border);
    }

    li a {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 70px 100px;
        align-items: center;
        gap: 8px 16px;
        padding: 12px 20px;
        color: var(--quiz-text);
    }

    :global(body.dark) li a {
        color: var(--quiz-text);
    }

    li a:hover {
        background: rgb(128 128 128 / 0.1);
    }

    .status {
        color: var(--quiz-muted);
        font-size: 13px;
    }

    .score,
    .open {
        text-align: right;
    }

    .open {
        color: var(--quiz-accent);
        font-size: 14px;
    }

    footer {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--quiz-border);
    }

    footer :global(a) {
        display: inline-block;
        padding: 7px 14px;
        border: 1px solid #455a64;
        border-radius: 4px;
        background: #607d8b;
        color: #fff;
        font-size: 14px;
    }

    :global(body.dark) footer :global(a) {
        color: #fff;
    }

    footer .regenerate :global(a) {
        border-color: var(--quiz-border);
        background: transparent;
        color: var(--quiz-text);
    }

    footer :global(a:hover) {
        filter: brightness(1.15);
    }

    @media (width <= 600px) {
        li a {
            grid-template-columns: minmax(0, 1fr) auto;
        }

        .status {
            grid-column: 1;
            grid-row: 2;
        }

        .score {
            grid-column: 2;
            grid-row: 2;
        }

        .open {
            grid-column: 2;
            grid-row: 1;
        }
    }
</style>
