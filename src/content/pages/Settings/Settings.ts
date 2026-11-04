import { mount } from "svelte";

import { Logged } from "../Logged";

import SettingsComponent from "./Settings.svelte";

export interface SettingsField {
    name: string;
    type: string;
    value: string;
    checked: boolean;
    label: string;
}

export class Settings extends Logged {
    className = "settings";

    async initialise() {
        await super.initialise();

        const form = document.querySelector<HTMLFormElement>('form[name="form1"]');
        const box = form?.querySelector(".insBox");
        if (!form || !box) return;

        const readField = (name: string): SettingsField => {
            const input = form.elements.namedItem(name);
            if (!(input instanceof HTMLInputElement)) {
                throw new Error(`Missing settings field: ${name}`);
            }
            return {
                name: input.name,
                type: input.type,
                value: input.value,
                checked: input.checked,
                label: input.closest("tr")?.querySelector("b")?.textContent?.trim() ?? input.value
            };
        };

        const fields = {
            email: readField("EMAIL"),
            assessment: readField("EMAIL_ASSESS"),
            anonymize: readField("ANONYMIZE"),
            submit: readField("U1")
        };
        const help =
            form.querySelector('input[name="ANONYMIZE"]')?.closest("tr")?.nextElementSibling?.textContent?.trim() ?? "";

        const container = document.createElement("div");
        box.before(container);
        mount(SettingsComponent, { target: container, props: { fields, help } });
        box.remove();
    }
}
