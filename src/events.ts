export const pttLoadedEvent = new Event("pttLoaded");

export function finishLoading() {
    document.documentElement.setAttribute("data-ptt-loaded", "");
    document.body?.classList.add("ptt-loaded");
    document.dispatchEvent(pttLoadedEvent);
}
