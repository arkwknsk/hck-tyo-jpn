import { Context } from './Context';
import { RasterMap } from './MapType';
import { Graphics, Matrix, RenderTexture } from 'pixi.js';
import { ScreenHelper } from './ScreenHelper'
import { MathUtil } from './MathUtil'

export class MosaicMap extends Graphics {

  private static _rasterMaps: RasterMap[] = [];
  public get rasterMaps(): RasterMap[] { return MosaicMap._rasterMaps }
  public set rasterMaps(rasterMaps: RasterMap[]) {
    MosaicMap._rasterMaps = rasterMaps
  }

  private static _mainStage: Graphics;

  private static _textures: RenderTexture[] = []
  public get textures(): RenderTexture[] { return MosaicMap._textures }
  public set textures(textures: RenderTexture[]) {
    MosaicMap._textures = textures
  }

  constructor() {
    super();

    this.init()
  }

  private init() {
    MosaicMap._mainStage = new Graphics()
    this.addChild(MosaicMap._mainStage)
  }

  public draw(): void {
    // MosaicMap.makeTexture()
    const g = MosaicMap._mainStage
    g.clear()

    const mosaicWidth = ScreenHelper.UNIT * 6
    const mosaicHeight = ScreenHelper.UNIT * 6 + 1

    let texturePool: RenderTexture[] = []
    let textureIndex = 0
    for (let i = 0; i < Context.NUMBER_MOSAIC; i++) {
      if (textureIndex === 0) {
        texturePool = MosaicMap.shuffle(MosaicMap._textures)
      }
      const texture = texturePool[textureIndex]
      if (textureIndex < texturePool.length - 1) {
        textureIndex++
      } else {
        textureIndex = 0
      }

      try {
        const seed = `${MathUtil.getSeed()}${i}${i}`
        const row = MathUtil.getRandomIntSeed(seed, 0, Context.MOSAIC_ROWS)
        // const row = 0
        const x = Math.floor(i % Context.MOSAIC_COLS) * mosaicWidth
        const y = mosaicHeight * row + ScreenHelper.UNIT * 7

        const matrix = new Matrix()
        matrix.translate(0, -(ScreenHelper.UNIT * 1) - (ScreenHelper.UNIT * 2 * (row + 1)) + 1)

        g.beginTextureFill({ texture: texture, color: 0xFFFFFF, alpha: 1.0, matrix })
        g.drawRect(x, y, mosaicWidth, mosaicHeight)
        g.endFill()

        // g.lineStyle(1, 0xFF0000, 0.5)
        //   .drawRect(x, y, mosaicWidth, mosaicHeight)

      } catch (error) {

      }
    }

  }

  static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}