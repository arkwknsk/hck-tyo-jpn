import { Graphics } from "pixi.js";
import { Context } from "./Context";

export class ScreenHelper {
    public static SMALL_AREA: number = 859
    public static LARGE_AREA: number = 1549
    public static LARGE_SCREEN: number = ScreenHelper.LARGE_AREA * 2
    public static SIDE_SCREEN: number = ScreenHelper.SMALL_AREA + ScreenHelper.LARGE_AREA

    /**
     * NEORT++用のスクリーンエリア
     * @returns Graphics of スクリーンエリア
     */
    static GetScreenArea(): Graphics {
        const graphics = new Graphics()
        let left: number = 0
        graphics.beginFill(0x444444)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.LARGE_AREA

        graphics.beginFill(0x444444)
        graphics.drawRect(left, 0, ScreenHelper.SMALL_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.SMALL_AREA

        graphics.beginFill(0x666666)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.LARGE_AREA

        graphics.beginFill(0x666666)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.LARGE_AREA

        graphics.beginFill(0x7f7f7f)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.LARGE_AREA

        graphics.beginFill(0x7f7f7f)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.LARGE_AREA

        graphics.beginFill(0x444444)
        graphics.drawRect(left, 0, ScreenHelper.SMALL_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()
        left += ScreenHelper.SMALL_AREA

        graphics.beginFill(0x444444)
        graphics.drawRect(left, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
        graphics.endFill()

        return graphics
    }

    /**
     * NEORT++用のグリッド
     * @returns Graphics for grids
     */
    static GetGrids(): Graphics {
        const crossSize = 128

        const g = new Graphics()

        g.lineStyle(1, 0xFFFF00).moveTo(Context.STAGE_WIDTH / 2, 0).lineTo(Context.STAGE_WIDTH / 2, Context.STAGE_HEIGHT)
        g.lineStyle(1, 0xFFFF00).moveTo(Context.STAGE_WIDTH / 2 - crossSize, Context.STAGE_HEIGHT / 2).lineTo(Context.STAGE_WIDTH / 2 + crossSize, Context.STAGE_HEIGHT / 2)

        g.lineStyle(1, 0xFF0000)
        g.drawRect(Context.STAGE_WIDTH / 2 - ScreenHelper.LARGE_SCREEN / 2, 0, ScreenHelper.LARGE_SCREEN, Context.STAGE_HEIGHT)

        g.drawRect(ScreenHelper.LARGE_AREA, 0, ScreenHelper.SIDE_SCREEN, Context.STAGE_HEIGHT)
        g.drawRect(Context.STAGE_WIDTH / 2 + ScreenHelper.LARGE_SCREEN / 2, 0, ScreenHelper.SIDE_SCREEN, Context.STAGE_HEIGHT)

        return g
    }
}