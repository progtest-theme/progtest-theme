<script lang="ts">
    import { onMount } from "svelte";

    import { formatCountdown } from "../../countdown";
    import type { DeadlineData } from "./native";

    let { data }: { data: DeadlineData } = $props();
    let countdownElement: HTMLSpanElement | undefined = $state();
    let remaining = $state(formatCountdown(0));

    onMount(() => {
        if (!countdownElement) return;
        const update = () => {
            remaining = formatCountdown(Number.parseFloat(countdownElement?.textContent ?? ""));
        };
        const observer = new MutationObserver(update);
        observer.observe(countdownElement, { childList: true, subtree: true, characterData: true });
        update();
        return () => observer.disconnect();
    });
</script>

<div class="deadline">
    <div>
        <span>{data.label}</span>
        <b>{data.value}</b>
    </div>
    {#if data.countdown !== undefined}
        <span id="countdown" bind:this={countdownElement} hidden>{data.countdown}</span>
        <span class="countdown" role="timer">{remaining.prefix} <b>{remaining.time}</b></span>
    {/if}
</div>

<style>
    .deadline {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 20px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--quiz-border);
        font-size: 14px;
    }

    .deadline div > span {
        display: block;
        color: var(--quiz-muted);
        font-size: 12px;
    }

    b {
        font-weight: 500;
    }

    .countdown {
        margin-left: auto;
        font-family: var(--font-monospace);
        text-align: right;
    }
</style>
