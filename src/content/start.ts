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
    document.documentElement.appendChild(script);
};

addLoader();
setTitle();
setTimeout(setFavicon, 0);
