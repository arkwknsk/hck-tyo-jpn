export class Context {

    public static STAGE_WIDTH: number = 11012;
    public static STAGE_HEIGHT: number = 1080;

    public static NUMBER_MAPS: number = 12
    public static MAP_WIDTH = 300
    public static MAP_HEIGHT = 300

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
