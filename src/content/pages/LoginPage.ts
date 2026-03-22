export class LoginPage implements IPage {
    className = "login";

    async initialise() {
        const loginForm = document.getElementsByTagName("form")[0];

        if (!loginForm) {
            return;
        }

        loginForm.classList.add("loginForm");
        this.createElements(loginForm);

        // add title mover
        document
            .querySelectorAll(".loginForm :is(#ldap1, #ldap2, #ldap3) > td:nth-child(1) > b")
            .forEach((e: Element) => {
                if (!(e instanceof HTMLElement)) return;

                e.addEventListener("click", moveInputLabel);
            });

        document.querySelectorAll(".loginForm :is(#ldap1, #ldap2, #ldap3) input").forEach((e: Element) => {
            if (!(e instanceof HTMLInputElement)) return;

            e.addEventListener("focus", loginFocus);
            e.addEventListener("focusout", loginFocusOut);
        });

        // in firefox, when opening the page, load the selected login type
        // @ts-expect-error browser is only defined in Chrome and thus is not in types as a global variable
        if (typeof browser !== "undefined") {
            document.querySelector<HTMLElement>("#uniSelect > .uniOption")?.click();
        }
    }

    createElements(loginForm: HTMLElement): void {
        loginForm.parentElement?.insertBefore(this.createTitleElement(), loginForm);
        loginForm.appendChild(this.createUniSelectElement());

        const langElement = document.getElementsByName("lang")[0];
        langElement.parentNode?.append(this.createGlobeElement());
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

            const uni = document.createElement("div");
            uni.innerText = e.innerText;
            uni.setAttribute("uni", e.value);
            uni.classList.add("uniOption");
            uni.addEventListener("click", uniChange);
            uniSelect.appendChild(uni);
        });

        uniSelect.children[0].setAttribute("active", "true");

        return uniSelect;
    }

    createGlobeElement(): HTMLElement {
        const globeElement = document.createElement("img");
        globeElement.id = "langGlobe";
        globeElement.src = chrome.runtime.getURL("themes/assets/lang-globe.svg");

        return globeElement;
    }
}

export const moveInputLabel = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    target.setAttribute("moved", "true");
    const label = target.parentNode?.parentNode?.children[1].children[0];
    if (!(label instanceof HTMLElement)) {
        return;
    }
    label.focus();
};

export const loginFocusOut = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    if (target?.value == "") {
        target.parentNode?.parentNode?.children[0].children[0].removeAttribute("moved");
    }
};

export const loginFocus = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    const login = target?.parentNode?.parentNode?.children[0].children[0];
    if (login instanceof HTMLElement) {
        login.click();
    }
};

export const uniChange = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    let c = 0,
        i = 0;
    document.getElementById("uniSelect")?.childNodes.forEach((e) => {
        if (!(e instanceof HTMLElement)) return;
        if (!e.classList.contains("uniOption")) return;
        e.removeAttribute("active");
        if (e == target) {
            i = c;
        }
        c++;
    });

    target?.setAttribute("active", "true");

    const select = document.querySelector<HTMLSelectElement>('select[name="UID_UNIVERSITY"]');
    if (select) {
        select.selectedIndex = i;
        const trigger = new Event("change");
        select.dispatchEvent(trigger);
    }
};
