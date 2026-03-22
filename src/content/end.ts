import { pttLoadedEvent } from "../events";
import { MessageType } from "../messages";
import { type ExtensionSettings, ThemeMode } from "../settings.ts";

import Pages, { ErrorPage, Logged, LoginPage, Main } from "./pages";

const main = async (settings: ExtensionSettings) => {
    if (!["/", "/index.php"].includes(window.location.pathname)) {
        console.log("unknown page", window.location.pathname);
        return;
    }

    const args = new URLSearchParams(window.location.search);
    document.body.removeAttribute("bgcolor");
    document.body.removeAttribute("text");

    let page: IPage | undefined;
    try {
        if (document.querySelector("select[name=UID_UNIVERSITY]") != null) {
            page = new LoginPage();
        } else if (args.has("X")) {
            const pageName = args.get("X") as string;

            for (const [iPage, pageNames] of Pages) {
                if (pageNames.includes(pageName)) {
                    page = new iPage(settings);
                    break;
                }
            }
        }

        if (!page) {
            page = new Main(settings);
        }

        const body = document.getElementsByTagName("body")[0];
        body.classList.add("ptt-" + page.className);
        if (page instanceof Logged) {
            body.classList.add("ptt-logged");
        }
    } catch (e) {
        if (e instanceof Error) {
            page = new ErrorPage(e);
        } else {
            throw e;
        }
    }

    console.log("Loading page: ", page.className);

    await page.initialise();
    return page;
};

const replaceStyles = (settings: ExtensionSettings) => {
    document.head.querySelectorAll('link[href$="/css.css"]').forEach((e) => {
        e.remove();
    });

    console.log("Applying theme:", settings.theme, "mode:", settings.themeMode);
    const body = document.getElementsByTagName("body")[0];
    if (settings.themeMode === ThemeMode.AUTO && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        body.classList.add("dark");
    } else if (settings.themeMode === ThemeMode.DARK) {
        body.classList.add("dark");
    } else {
        body.classList.remove("dark");
    }

    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");

    link.setAttribute("href", chrome.runtime.getURL(`themes/${settings.theme.toLowerCase()}/styles.css`));
    document.getElementsByTagName("head")[0].appendChild(link);
    return new Promise((resolve) => {
        link.onload = resolve;
    });
};

chrome.runtime.sendMessage({ type: MessageType.GET_SETTINGS }, async (settings: ExtensionSettings) => {
    await replaceStyles(settings);
    await main(settings);

    document.dispatchEvent(pttLoadedEvent);
});
