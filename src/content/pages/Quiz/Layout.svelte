<script lang="ts">
    import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<main>
    {@render children()}
</main>

<style>
    main {
        --quiz-border: #d1d1d1;
        --quiz-text: #424242;
        --quiz-muted: #666;
        --quiz-accent: #455a64;

        box-sizing: border-box;
        width: calc(100% - 32px);
        max-width: 960px;
        margin: 20px auto;
        overflow: hidden;
        border: 1px solid var(--quiz-border);
        border-radius: 5px;
        background: #fff;
        color: var(--quiz-text);
        box-shadow: 0 2px 4px -2px rgb(0 0 0 / 0.25);
        font-size: 16px;
        line-height: 1.5;
        text-align: left;
    }

    :global(body.dark) main {
        --quiz-border: #505050;
        --quiz-text: #eee;
        --quiz-muted: #aaa;
        --quiz-accent: #b0bec5;

        background: #2d2d2d;
    }
</style>
