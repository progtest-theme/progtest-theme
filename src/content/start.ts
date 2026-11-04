import { finishLoading, pttLoadedEvent } from "../events";

const setTitle = () => {
    document.title = document.title.replace("@progtest.fit.cvut.cz -", " |").replace("progtest.fit.cvut.cz - ", "");
};

const setFavicon = () => {
    const favicon: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement("link");
    favicon.type = "image/x-icon";
    favicon.rel = "shortcut icon";
    favicon.href = chrome.runtime.getURL("./themes/assets/favicon.ico");
    document.head.appendChild(favicon);
};

const addLoader = () => {
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", chrome.runtime.getURL("content/loader.js"));
    script.onerror = finishLoading;
    document.documentElement.appendChild(script);
};

const loadingTimeout = setTimeout(finishLoading, 12_000);
document.addEventListener(pttLoadedEvent.type, () => clearTimeout(loadingTimeout), { once: true });
window.addEventListener("pageshow", (event) => {
    if (event.persisted) finishLoading();
});

addLoader();
setTitle();
setTimeout(setFavicon, 0);
