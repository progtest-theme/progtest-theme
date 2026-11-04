<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        title,
        wide = false,
        children
    }: {
        title: string;
        wide?: boolean;
        children: Snippet;
    } = $props();
</script>

<main class:wide>
    <header>
        <h1>{title}</h1>
    </header>
    {@render children()}
</main>

<style>
    main {
        --page-bg: #fff;
        --page-subtle: #f5f5f5;
        --page-border: #d1d1d1;
        --page-text: #424242;
        --page-muted: #666;
        --page-accent: #455a64;
        --page-hover: #eee;
        --page-heading: #e8e8e8;
        --page-selected: #e9eef0;

        box-sizing: border-box;
        width: calc(100% - 32px);
        max-width: 1100px;
        margin: 20px auto;
        border: 1px solid var(--page-border);
        border-radius: 5px;
        background: var(--page-bg);
        color: var(--page-text);
        font-size: 15px;
        line-height: 1.6;
        text-align: left;
    }

    main.wide {
        max-width: none;
    }

    :global(body.dark) main {
        --page-bg: #0e0e0e;
        --page-subtle: #161616;
        --page-border: #313131;
        --page-text: #eee;
        --page-muted: #aaa;
        --page-accent: #b0bec5;
        --page-hover: #242424;
        --page-heading: #1c1e1f;
        --page-selected: #20282c;
    }

    header {
        padding: 9px 16px;
        background: #45535a;
        color: #fff;
        border-radius: 4px 4px 0 0;
        border-bottom: 1px solid var(--page-border);
    }
    h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 300;
        line-height: 1.3;
    }
</style>
