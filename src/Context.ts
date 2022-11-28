export class Context {

    public static STAGE_WIDTH: number = 11012;
    public static STAGE_HEIGHT: number = 1080;

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
