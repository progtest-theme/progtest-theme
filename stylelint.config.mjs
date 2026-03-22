/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard"],
    rules: {
        "selector-class-pattern": ".*",
        "selector-id-pattern": "#*",
        "color-hex-length": "short",
        "alpha-value-notation": "number",
        "color-function-notation": "rgba",
        "no-descending-specificity": null
    }
};
