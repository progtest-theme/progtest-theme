import type { BunPlugin } from "bun";
import { readFile } from "fs/promises";
import { compile } from "svelte/compiler";

export const sveltePlugin: BunPlugin = {
    name: "svelte loader",
    async setup(builder) {
        builder.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
            return {
                contents: compile(await readFile(path, "utf8"), {
                    filename: path,
                    generate: "client",
                    css: "injected",
                    runes: true,
                    dev: Bun.main.endsWith("dev.ts")
                }).js.code,
                loader: "js"
            };
        });
    }
};
