export class Context {

    public static STAGE_WIDTH: number = 1080;
    public static STAGE_HEIGHT: number = 1080;

    public static ROWS: number = 14;
    public static COLS: number = 14;
    public static SIZE: number = 72;

    private static _instance: Context;

    /**
     * getInstance
     */
    public static get instance(): Context {
        if (!this._instance) this._instance = new Context();

        return this._instance;
    }

    private constructor() { }
}
