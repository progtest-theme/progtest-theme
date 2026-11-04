<script lang="ts">
    import type { CompilerGroup } from "./Compilers";

    let { groups }: { groups: CompilerGroup[] } = $props();
</script>

<main>
    {#each groups as group}
        <details open={group.open}>
            <summary>{group.name}</summary>
            <div class="actions">
                {#each group.actions as action}
                    <a href={action.link}>
                        <img src={action.icon} alt="" />
                        {action.name}
                    </a>
                {/each}
            </div>
        </details>
    {/each}
</main>

<style>
    main {
        width: calc(100% - 32px);
        max-width: 695px;
        margin: 20px auto;
    }

    details {
        margin-bottom: 20px;
        overflow: hidden;
        border: 1px solid #d1d1d1;
        border-radius: 5px;
        background: #fff;
        color: #424242;
        box-shadow: 0 2px 4px -2px rgb(0 0 0 / 0.25);
    }

    :global(body.dark) details {
        border-color: #313131;
        background: #2d2d2d;
        color: #fff;
    }

    summary {
        padding: 7px 11px;
        background: #45535a;
        color: #fff;
        font-size: 18pt;
        font-weight: 100;
        cursor: pointer;
    }

    .actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        color: inherit;
        font-size: 13pt;
        font-weight: 500;
    }

    a:hover {
        background: rgb(128 128 128 / 0.15);
    }

    :global(body.dark) a {
        color: inherit;
    }

    a + a {
        border-left: 1px solid rgb(128 128 128 / 0.25);
    }

    img {
        width: 32px;
        height: 32px;
        object-fit: contain;
    }

    @media (width <= 600px) {
        .actions {
            grid-template-columns: 1fr;
        }

        a + a {
            border-left: none;
            border-top: 1px solid rgb(128 128 128 / 0.25);
        }
    }
</style>
