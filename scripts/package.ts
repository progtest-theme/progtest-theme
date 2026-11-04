import { cp, mkdir, readdir, rename, rm } from "fs/promises";
import minimist from "minimist";
import webExt from "web-ext";

import { BUILD_DIR, CHROME_MANIFEST, FIREFOX_MANIFEST, OUT_DIR } from "./constants";
import { zipDirectory } from "./utils";

const MANIFEST_TARGET = `${BUILD_DIR}/manifest.json` as const;
const FIREFOX_DIST_DIR = `${OUT_DIR}/firefox` as const;
const CHROME_DIST_DIR = `${OUT_DIR}/chrome` as const;

async function pack(distDir: string, useSystemUtilities: boolean) {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });
    await zipDirectory(BUILD_DIR, `${distDir}/progtest_themes.zip`, {
        useSystemUtilities
    });
}

async function signFirefox() {
    if (!process.env.WEB_EXT_API_KEY || !process.env.WEB_EXT_API_SECRET) {
        throw new Error("WEB_EXT_API_KEY and WEB_EXT_API_SECRET must be set in the environment");
    }
    const { version } = await Bun.file(FIREFOX_MANIFEST).json();

    await cp(FIREFOX_MANIFEST, MANIFEST_TARGET);
    await rm(FIREFOX_DIST_DIR, { recursive: true, force: true });
    await mkdir(FIREFOX_DIST_DIR, { recursive: true });
    await webExt.cmd.sign(
        {
            sourceDir: BUILD_DIR,
            artifactsDir: FIREFOX_DIST_DIR,
            apiKey: process.env.WEB_EXT_API_KEY,
            apiSecret: process.env.WEB_EXT_API_SECRET,
            channel: "unlisted",
            amoBaseUrl: "https://addons.mozilla.org/api/v5",
            useSubmissionApi: true
        },
        { shouldExitProgram: false }
    );

    const signedFiles = (await readdir(FIREFOX_DIST_DIR)).filter((file) => file.endsWith(".xpi"));
    if (signedFiles.length !== 1) {
        throw new Error(`Expected one signed Firefox XPI, found ${signedFiles.length}`);
    }
    const filename = `progtest_themes-${version}-firefox.xpi`;
    const destination = `${FIREFOX_DIST_DIR}/${filename}`;
    if (signedFiles[0] !== filename) await rename(`${FIREFOX_DIST_DIR}/${signedFiles[0]}`, destination);
    console.log(`Firefox extension saved to ${destination}`);
}

async function packChrome(useSystemUtilities: boolean) {
    await cp(CHROME_MANIFEST, MANIFEST_TARGET);
    await pack(CHROME_DIST_DIR, useSystemUtilities);
}

async function main() {
    const args = minimist(process.argv.slice(2), {
        boolean: ["chrome", "firefox", "system"],
        default: {
            chrome: false,
            firefox: false,
            system: false
        }
    });

    if (args.chrome) {
        await packChrome(args.system);
        return;
    }

    if (args.firefox) {
        if (args.system) {
            throw new Error("System utilities cannot be used with firefox signing");
        }
        await signFirefox();

        return;
    }

    console.log("Use '--chrome' or '--firefox' to build a specific browser extension");
    console.log("Use '--system' to use system utilities for zipping");
}

main();
