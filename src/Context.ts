export class Context {

    public static STAGE_WIDTH: number = 11012;
    public static STAGE_HEIGHT: number = 1080;

    public static MAPS_COLS: number = 28
    public static MAPS_ROWS: number = 3
    public static NUMBER_MAPS: number = this.MAPS_COLS * this.MAPS_ROWS
    public static PRELOAD_MAPS: number = 20

    public static MAP_WIDTH = 300
    public static MAP_HEIGHT = 300

    public static MAX_LAT: number = 35.5215
    public static MIN_LAT: number = 35.6978
    public static MAX_LNG: number = 139.6276
    public static MIN_LNG: number = 139.7808

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
