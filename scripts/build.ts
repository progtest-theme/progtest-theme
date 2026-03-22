import { cp, mkdir, rm } from "fs/promises";

import { BUILD_DIR, ENTRYPOINTS, SRC_DIR } from "./constants";
import { sveltePlugin } from "./sveltePlugin";
import { copyDirectory } from "./utils";

export async function build(options: { verbose: boolean; clean: boolean }) {
    if (options.clean) {
        await rm(BUILD_DIR, { recursive: true, force: true });
    }

    try {
        await mkdir(BUILD_DIR, { recursive: true });
    } catch (e) {
        if ((e as ErrnoException)?.code !== "EEXIST") {
            console.error(e);
        }
    }

    console.log("Building .js files");
    const buildOutput = await Bun.build({
        entrypoints: Array(...ENTRYPOINTS),
        outdir: BUILD_DIR,
        plugins: [sveltePlugin]
    });
    if (!buildOutput.success) {
        console.error("Build failed:", buildOutput);
        return;
    }
    console.log("Build finished", buildOutput);

    console.log("Copying other files");
    await copyDirectory(SRC_DIR, BUILD_DIR, {
        filter: (path) => {
            return !(path.endsWith(".js") || path.endsWith(".ts") || path.endsWith(".svelte"));
        },
        verbose: options.verbose
    });

    for (const path of [
        "./node_modules/normalize.css/normalize.css",
        "./node_modules/iconify-icon/dist/iconify-icon.min.js"
    ]) {
        await cp(path, `${BUILD_DIR}/external/${path.split("/").pop()}`);
    }
}
