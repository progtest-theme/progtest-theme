import { mount } from "svelte";

import Loader from "../components/loader.svelte";

const loaderElement = document.createElement("pttloader");
document.documentElement.appendChild(loaderElement);
mount(Loader, {
    target: loaderElement
});
