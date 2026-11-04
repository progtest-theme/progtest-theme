<script lang="ts">
    import type { SettingsField } from "./Settings";

    let {
        fields,
        help
    }: {
        fields: { email: SettingsField; assessment: SettingsField; anonymize: SettingsField; submit: SettingsField };
        help: string;
    } = $props();
</script>

<main>
    <label for="settings-email">{fields.email.label}</label>
    <input
        id="settings-email"
        class="std"
        type={fields.email.type}
        name={fields.email.name}
        value={fields.email.value}
    />

    <label class="option">
        <input
            type="checkbox"
            name={fields.assessment.name}
            value={fields.assessment.value}
            checked={fields.assessment.checked}
        />
        <span>{fields.assessment.label}</span>
    </label>

    <hr />

    <label class="option">
        <input
            type="checkbox"
            name={fields.anonymize.name}
            value={fields.anonymize.value}
            checked={fields.anonymize.checked}
            aria-describedby={help ? "settings-anonymize-help" : undefined}
        />
        <span>{fields.anonymize.label}</span>
    </label>
    {#if help}
        <p id="settings-anonymize-help">{help}</p>
    {/if}

    <div class="bUpd">
        <input type="submit" name={fields.submit.name} value={fields.submit.value} />
    </div>
</main>

<style>
    main {
        box-sizing: border-box;
        width: calc(100% - 32px);
        max-width: 695px;
        margin: 20px auto;
        padding: 24px;
        border: 1px solid #d1d1d1;
        border-radius: 5px;
        background: #fff;
        color: #424242;
        box-shadow: 0 2px 4px -2px rgb(0 0 0 / 0.25);
        font-size: 13pt;
        text-align: left;
    }

    :global(body.dark) main {
        border-color: #313131;
        background: #2d2d2d;
        color: #fff;
    }

    input.std {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        margin: 8px 0 20px;
        padding: 8px;
        font: inherit;
    }

    .option {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        cursor: pointer;
    }

    input[type="checkbox"] {
        flex: none;
        width: 16px;
        height: 16px;
        margin: 4px 0 0;
        accent-color: #607d8b;
    }

    hr {
        margin: 20px 0;
    }

    p {
        margin: 10px 0 0 26px;
        font-size: 12px;
        line-height: 1.6;
    }

    .bUpd {
        width: 120px;
        margin-top: 20px;
    }
</style>
