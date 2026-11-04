/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard"],
    rules: {
        "selector-class-pattern": ".*",
        "selector-id-pattern": "#*",
        "color-hex-length": "short",
        "alpha-value-notation": "number",
        "color-function-notation": "legacy",
        "no-descending-specificity": null
    }
};
