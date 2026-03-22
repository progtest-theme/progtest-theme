# Development

This is a database of all the information about developing the extension I can think of.

## Test Pages

When developing, you can place the HTML files gathered from issues into `test_pages/`.

The folder structure follows the search params of the URL, e.g. `?X=Course&Cou=123` maps to `test_pages/course/123.html`.

-   `?X=[folder_name]`
    -   `?Cou=[file_name]`

The file can optionally include a comment in the first line describing what the page is.

```html
<!-- BI-PA2 Homework 4 -->
...the rest of the file
```

Then, when running `bun dev`, if you add the `ptmock.localhost 127.0.0.1` entry into your `/etc/hosts`, you can visit `http://ptmock.localhost:3000/`, which will contain a list of all the test pages with their comments. If you open one of them, the URL and the page should be the same as if you went to Progtest.

## Extension reloading

When running `bun dev`, you can take advantage of automatic extension reloading.

First, download the following extension: [Advanced Extension Reload](https://chromewebstore.google.com/detail/advanced-extension-reload/hagknokdofkmojolcpbddjfdjhnjdkae)

Then just fill out `EXTENSION_ID` in `.env` with the ID of ProgTest Themes extension (you can find it in `chrome://extensions`).

## Releasing (for maintainers)

Run `bun version` to bump the version in `package.json` and `manifest.json`.

Run `bun build:chrome` to build the extension for Chrome.

Run `bun build:firefox` to build the extension for Firefox. Don't forget to set `WEB_EXT_API_KEY` and `WEB_EXT_API_SECRET` in `.env`!