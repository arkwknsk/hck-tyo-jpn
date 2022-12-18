import { Graphics } from "pixi.js";
import { Context } from "./Context";

export class ScreenHelper {
  // RED -> BLUE -> GREEN -> ORANGE
  public static SMALL_AREA: number = 859
  public static LARGE_AREA: number = 3098 / 2
  public static LARGE_SCREEN: number = 3098
  public static SIDE_SCREEN: number = 2408

  public static LEFT_SCREEN_LEFT: number = ScreenHelper.LARGE_SCREEN / 2
  public static FRONT_SCREEN_LEFT: number = ScreenHelper.LEFT_SCREEN_LEFT + ScreenHelper.SIDE_SCREEN
  public static RIGHT_SCREEN_LEFT: number = ScreenHelper.FRONT_SCREEN_LEFT + ScreenHelper.LARGE_SCREEN
  public static BACK_SCREEN_LEFT: number = ScreenHelper.RIGHT_SCREEN_LEFT + ScreenHelper.SIDE_SCREEN

  public static BACK_SCREEN_LEFT_MARGIN: number = 0
  public static BACK_SCREEN_RIGHT_MARGIN: number = 0
  public static LEFT_SCREEN_LEFT_MARGIN: number = 0
  public static FRONT_SCREEN_LEFT_MARGIN: number = 0
  public static RIGHT_SCREEN_LEFT_MARGIN: number = 0

  public static DIVISIONS: number = 32
  public static UNIT: number = Math.floor(Context.STAGE_HEIGHT / this.DIVISIONS)

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

    //Center Cross
    g.lineStyle(2, 0xFFFF00).moveTo(Context.STAGE_WIDTH / 2, 0).lineTo(Context.STAGE_WIDTH / 2, Context.STAGE_HEIGHT)
    g.lineStyle(2, 0xFFFF00).moveTo(Context.STAGE_WIDTH / 2 - crossSize, Context.STAGE_HEIGHT / 2).lineTo(Context.STAGE_WIDTH / 2 + crossSize, Context.STAGE_HEIGHT / 2)

    g.lineStyle(2, 0xFF0000)
    // BACK(LEFT)
    // g.drawRect(0, 0, ScreenHelper.LARGE_AREA, Context.STAGE_HEIGHT)
    g.drawRect(0, 0, 1549, Context.STAGE_HEIGHT)
    // LEFT
    // g.drawRect(ScreenHelper.LEFT_SCREEN_LEFT, 0, ScreenHelper.SIDE_SCREEN, Context.STAGE_HEIGHT)
    g.drawRect(ScreenHelper.LEFT_SCREEN_LEFT, 0, 859 + 1549, Context.STAGE_HEIGHT)
    //FRONT
    // g.drawRect(ScreenHelper.FRONT_SCREEN_LEFT, 0, ScreenHelper.LARGE_SCREEN, Context.STAGE_HEIGHT)
    g.drawRect(ScreenHelper.FRONT_SCREEN_LEFT, 0, 3098, Context.STAGE_HEIGHT)
    //RIGHT
    // g.drawRect(ScreenHelper.RIGHT_SCREEN_LEFT, 0, ScreenHelper.SIDE_SCREEN, Context.STAGE_HEIGHT)
    g.drawRect(ScreenHelper.RIGHT_SCREEN_LEFT, 0, 859 + 1549, Context.STAGE_HEIGHT)

    return g
  }

  /**
   * レイアウト用のグリッドを返す
   *
   * @static
   * @return {*}  {Graphics}
   * @memberof ScreenHelper
   */
  static GetLayoutGrid(): Graphics {
    let g = new Graphics()

    //最小グリッドの算出
    const unit = Context.STAGE_HEIGHT / this.DIVISIONS
    // console.log(`GetLayoutGrid height:${unit}`)

    //水平方向に分割
    for (let i = 0; i < this.DIVISIONS; i++) {
      g.lineStyle(1, 0x66aaFF).moveTo(0, this.UNIT * i).lineTo(Context.STAGE_WIDTH, this.UNIT * i)
    }

    //垂直方向に分割

    //BACK(LEFT)
    [g, this.BACK_SCREEN_LEFT_MARGIN] = this.GetLayoutGridByScreen(g, ScreenHelper.LARGE_AREA, 0, unit);

    //LEFT
    [g, this.LEFT_SCREEN_LEFT_MARGIN] = this.GetLayoutGridByScreen(g, ScreenHelper.SIDE_SCREEN, ScreenHelper.LEFT_SCREEN_LEFT, unit);

    //FRONT
    [g, this.FRONT_SCREEN_LEFT_MARGIN] = this.GetLayoutGridByScreen(g, ScreenHelper.LARGE_SCREEN, ScreenHelper.FRONT_SCREEN_LEFT, unit);

    //RIGHT
    [g, this.RIGHT_SCREEN_LEFT_MARGIN] = this.GetLayoutGridByScreen(g, ScreenHelper.SIDE_SCREEN, ScreenHelper.RIGHT_SCREEN_LEFT, unit);

    //BACK(RIGHT)
    [g, this.BACK_SCREEN_RIGHT_MARGIN] = this.GetLayoutGridByScreen(g, ScreenHelper.LARGE_AREA, ScreenHelper.BACK_SCREEN_LEFT, unit);

    g.alpha = 0.5
    return g
  }


  static GetLayoutGridByScreen(g: Graphics, screenWidth: number, left: number, unit: number): [Graphics, number] {
    const divisionsX = Math.floor(screenWidth / unit)
    const marginLeft = left + (screenWidth - (Math.floor(screenWidth / unit) * unit)) / 2
    for (let i = 0; i <= divisionsX; i++) {
      g.lineStyle(1, 0x66aaFF).moveTo(marginLeft + unit * i, 0).lineTo(marginLeft + unit * i, Context.STAGE_HEIGHT)
    }

    return [g, marginLeft]
  }
}