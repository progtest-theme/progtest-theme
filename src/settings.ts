export enum Theme {
    DEFAULT = "DEFAULT"
}

export enum ThemeMode {
    AUTO = "AUTO",
    LIGHT = "LIGHT",
    DARK = "DARK"
}

export interface ExtensionSettings {
    theme: Theme;
    themeMode: ThemeMode;
    autohideResults: boolean;
    showNotifications: boolean;
    syntaxHighlighting: boolean;
    playSounds: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
    theme: Theme.DEFAULT,
    themeMode: ThemeMode.AUTO,
    autohideResults: true,
    showNotifications: true,
    syntaxHighlighting: true,
    playSounds: true
} as const;
