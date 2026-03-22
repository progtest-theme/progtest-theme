interface IPage {
    readonly className: string;

    initialise(): Promise<void>;
}