import { AppManager } from './main'
import { gsap } from 'gsap';
import { BaseTexture, Graphics, Sprite, Text, Texture, TextStyle } from 'pixi.js';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';
// import { Context } from './Context';
// import { MathUtil } from './MathUtil'

export class MapPanel extends Graphics {
  private _rasterMap: RasterMap
  private _mapArea: Graphics | undefined
  private _status: string = 'random'


  private latValue = new Text()
  private lngValue = new Text()
  private dispLatValue: string = ''
  private dispLatCursor: number = 0
  private dispLngCursor: number = 0
  private dispLngValue: string = ''
  // private prevTime: number = 0

  public constructor(rasterMaps: RasterMap) {
    super();

    this._rasterMap = rasterMaps

    this.init()
  }

  public init() {
    this._mapArea = new Graphics()
    this._mapArea.beginFill(0xcccccc)
    this._mapArea.drawRect(0, ScreenHelper.UNIT * 2, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6)

    // this.addChild(this._mapArea)


    const style: TextStyle = new TextStyle({
      fontFamily: "Inter",
      fontWeight: "400",
      fill: 0xffffff,
      fontSize: 14,
      letterSpacing: 0
      , align: 'left',
    })

    const latLabel = new Text(
      `Lat:`, style
    );
    latLabel.x = 0
    this.addChild(latLabel);

    this.latValue = new Text('', style);
    this.latValue.x = ScreenHelper.UNIT
    this.latValue.text = this._rasterMap.lat.toString()
    this.addChild(this.latValue);

    const lngLabel = new Text(
      `Lng:`, style
    );
    lngLabel.x = 0
    lngLabel.y = 24
    this.addChild(lngLabel);

    this.lngValue = new Text('', style);
    this.lngValue.x = ScreenHelper.UNIT
    this.lngValue.y = 24
    this.lngValue.text = this._rasterMap.lng.toString()
    this.addChild(this.lngValue);

    const loadTexture = new Texture(new BaseTexture(this._rasterMap.image))
    const mapSprite = new Sprite(loadTexture)
    mapSprite.x = 0
    mapSprite.y = ScreenHelper.UNIT * 2
    mapSprite.width = ScreenHelper.UNIT * 6
    mapSprite.height = ScreenHelper.UNIT * 6
    mapSprite.alpha = 0.5

    this.addChild(mapSprite)
  }


  public Start(): void {
    if (this._mapArea) {
      // const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
      gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
        .call(() => {
          console.debug('hoge')
        })
        .from(this._mapArea, { alpha: 0 })
        .to(this._mapArea, { alpha: 1.0 })

        .call(() => {
          this._status = 'toFix'
        })
    }
    if (AppManager) {
      if (AppManager.app) {
        AppManager.app.ticker.add(this.update);
      }
    }
  }

  private update = (): void => {
    if (this.latValue) {
      this.dispLatValue = MapPanel.getRandomString(this._rasterMap.lat, this.dispLatCursor)
      this.latValue.text = this.dispLatValue
      this.dispLngValue = MapPanel.getRandomString(this._rasterMap.lng, this.dispLngCursor)
      this.lngValue.text = this.dispLngValue
    }
    if (this._status === 'random') {
    } else if (this._status === 'toFix') {
      if (AppManager.app) {
        // if (AppManager.app.ticker.lastTime > this.prevTime + 50) {
        //   this.prevTime = AppManager.app.ticker.lastTime
        this.dispLatCursor += 1;
        this.dispLngCursor += 1;
        // }
      }

    }
    // console.log(this)
  }

  static getRandomString(value: number, cursor: number): string {
    let result: string = ''
    const floorLength = Math.floor(value).toString.length;
    for (let i = 0; i <= floorLength; i++) {
      if (i < cursor) {
        result += value.toString().slice(i, i + 1)
      } else {
        result += this.randomChar()

      }
    }
    // result += '.'
    for (let i = (floorLength + 1); i <= value.toString().length; i++) {
      if (i + floorLength - 1 < cursor) {
        result += value.toString().slice(i, i + 1)
      } else {
        result += this.randomChar()
      }
    }

    return result
  }

  static randomChar() {
    // const pool = '?/\\(^)![]abcdefghijklmnopqrstuvwxyz0123456789{}*&^%$';
    const pool = '0123456789';
    return pool.charAt(Math.floor(Math.random() * pool.length));
  };

}