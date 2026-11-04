export class LoginPage implements IPage {
    className = "login";

    async initialise() {
        const loginForm = document.getElementsByTagName("form")[0];

        if (!loginForm) {
            return;
        }

        this.prepareForm(loginForm);
        this.createElements(loginForm);

        const select = loginForm.querySelector<HTMLSelectElement>('select[name="UID_UNIVERSITY"]');
        const syncSelection = () => {
            loginForm.querySelectorAll<HTMLButtonElement>("#uniSelect .uniOption").forEach((option) => {
                const active = option.getAttribute("uni") === select?.value;
                option.toggleAttribute("active", active);
                option.setAttribute("aria-pressed", String(active));
            });
        };
        select?.addEventListener("change", syncSelection);
        // ProgTest's Alt+number shortcuts change selectedIndex without firing change.
        document.addEventListener("keydown", (event) => {
            if (event.altKey && /^[1-9]$/.test(event.key)) {
                queueMicrotask(syncSelection);
            }
        });
        syncSelection();
    }

    prepareForm(loginForm: HTMLFormElement): void {
        loginForm.querySelectorAll<HTMLInputElement>("#ldap input:not([type='submit'])").forEach((input) => {
            const row = input.parentElement;
            input.id ||= `ptt-${input.name.toLowerCase()}`;
            const label = row?.querySelector("label");
            if (label) label.htmlFor = input.id;
            if (input.name === "SECOND_FACTOR") {
                input.autocomplete = "one-time-code";
                input.inputMode = "numeric";
            }
        });
    }

    createElements(loginForm: HTMLElement): void {
        loginForm.parentElement?.insertBefore(this.createTitleElement(), loginForm);
        loginForm.appendChild(this.createUniSelectElement());

        const langElement = document.getElementsByName("lang")[0];
        langElement?.parentNode?.append(this.createGlobeElement());
    }

    createTitleElement(): HTMLElement {
        const title = document.createElement("div");
        title.className = "appName";
        title.innerHTML = "FIT: <b>ProgTest</b>";

        return title;
    }

    createUniSelectElement(): HTMLElement {
        const uniSelect = document.createElement("div");
        uniSelect.id = "uniSelect";

        document.querySelector("select[name=UID_UNIVERSITY]")?.childNodes.forEach((e) => {
            if (!(e instanceof HTMLOptionElement)) return;

            const uni = document.createElement("button");
            uni.type = "button";
            uni.innerText = e.innerText;
            uni.setAttribute("uni", e.value);
            uni.classList.add("uniOption");
            uni.addEventListener("click", uniChange);
            uniSelect.appendChild(uni);
        });

        return uniSelect;
    }

    createGlobeElement(): HTMLElement {
        const globeElement = document.createElement("img");
        globeElement.id = "langGlobe";
        globeElement.src = chrome.runtime.getURL("themes/assets/lang-globe.svg");

        return globeElement;
    }
}

export const uniChange = (event: MouseEvent) => {
    const target = event.currentTarget ?? event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const select = document.querySelector<HTMLSelectElement>('select[name="UID_UNIVERSITY"]');
    if (select) {
        select.value = target.getAttribute("uni") ?? select.value;
        const trigger = new Event("change", { bubbles: true });
        select.dispatchEvent(trigger);
    }
};
