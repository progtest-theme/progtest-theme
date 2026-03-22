/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
    plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-svelte"],
    printWidth: 120,
    tabWidth: 4,
    semi: true,
    trailingComma: "none",

    importOrder: [
        "^@?\\w",
        "^#.*$",
        "^\\.\\.(?!/?$)|^\\.\\./?$",
        "^\\./(?=.*/)(?!/?$)|^\\.(?!/?$)|^\\./?$",
        "^"
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true
};
