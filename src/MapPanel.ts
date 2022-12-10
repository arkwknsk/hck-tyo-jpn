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
  private mapSprite: Sprite | undefined
  private _status: string = 'random'


  private latValue = new Text()
  private lngValue = new Text()
  private dispLatValue: string = ''
  private dispLatCursor: number = 0
  private dispLatCursorStep: number = 0
  private dispLngCursor: number = 0
  private dispLngCursorStep: number = 0
  private dispLngValue: string = ''
  private counter: number = 0

  public constructor(rasterMaps: RasterMap) {
    super();

    this._rasterMap = rasterMaps

    this.init()
  }

  public init() {
    this.dispLatCursorStep = this._rasterMap.lat.toString().length / (1.0 * 30)
    this.dispLngCursorStep = this._rasterMap.lng.toString().length / (1.0 * 30)

    this._mapArea = new Graphics()
    this._mapArea.beginFill(0xcccccc)
    this._mapArea.drawRect(0, ScreenHelper.UNIT * 2, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6)

    // this.addChild(this._mapArea)


    const style: TextStyle = new TextStyle({
      fontFamily: "Inter Medium",
      fontWeight: '500',
      fill: 0xffffff,
      fontSize: 12,
      letterSpacing: 0
      , align: 'left',
    })

    // const latLabel = new Text(
    //   `Lat:`, style
    // );
    // latLabel.x = 0
    // this.addChild(latLabel);

    this.latValue = new Text('', style);
    this.latValue.x = 0
    this.latValue.y = ScreenHelper.UNIT / 2
    this.latValue.text = this._rasterMap.lat.toString()
    this.addChild(this.latValue);

    // const lngLabel = new Text(
    //   `Lng:`, style
    // );
    // lngLabel.x = 0
    // lngLabel.y = 24
    // this.addChild(lngLabel);

    this.lngValue = new Text('', style);
    this.lngValue.x = 0
    this.lngValue.y = ScreenHelper.UNIT / 2 + 18
    this.lngValue.text = this._rasterMap.lng.toString()
    this.addChild(this.lngValue);

    const loadTexture = new Texture(new BaseTexture(this._rasterMap.image))
    const mapSprite = new Sprite(loadTexture)
    mapSprite.x = 0
    mapSprite.y = ScreenHelper.UNIT * 2
    mapSprite.width = ScreenHelper.UNIT * 6
    mapSprite.height = ScreenHelper.UNIT * 6
    mapSprite.alpha = 0.0
    this.mapSprite = mapSprite

    this.addChild(mapSprite)
  }


  public Start(): void {
    if (this.mapSprite) {
      // this.counter = 0
      // const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
      gsap.timeline({ defaults: { delay: 0, duration: 1.0 } })
        .from(this, { counter: 0 })
        .to(this, {
          counter: 1, duration: 2.0, onComplete: () => {
            this._status = 'toFix'
          }
        })
        .from(this, { counter: 0 })
        .to(this, {
          counter: 1, duration: 0.25, onComplete: () => {
            this._status = 'map'
          }
        })
        .call(() => {
          if (this.mapSprite) this.mapSprite.alpha = 0.5
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
      if (this._status === 'random' || this._status === 'toFix') {
        this.dispLatValue = MapPanel.getRandomString(this._rasterMap.lat, this.dispLatCursor)
        this.latValue.text = this.dispLatValue
        this.dispLngValue = MapPanel.getRandomString(this._rasterMap.lng, this.dispLngCursor)
        this.lngValue.text = this.dispLngValue
      }
    }
    if (this._status === 'random') {
    } else if (this._status === 'toFix') {
      if (AppManager.app) {
        // if (AppManager.app.ticker.lastTime > this.prevTime + 50) {
        //   this.prevTime = AppManager.app.ticker.lastTime
        this.dispLatCursor += this.dispLatCursorStep;
        this.dispLngCursor += this.dispLngCursorStep;
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