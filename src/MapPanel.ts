import { AppManager } from './main'
import { gsap } from 'gsap';
import { BaseTexture, Graphics, Sprite, Text, Texture, TextStyle } from 'pixi.js';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';
import { Context } from './Context';
import { MathUtil } from './MathUtil'

export class MapPanel extends Graphics {
  private _rasterMap: RasterMap
  private _mapArea: Graphics | undefined
  private _status: string = 'random'

  private types: string[] = []
  private typeClone: string[] = []

  private latValue = new Text()
  private lngValue = new Text()
  private dispLatValue: string = ''
  private dispLatCursor: number = 0
  private dispLngCursor: number = 0
  private dispLngValue: string = ''

  public constructor(rasterMaps: RasterMap) {
    super();

    this._rasterMap = rasterMaps

    this.init()
  }

  public init() {
    this._mapArea = new Graphics()
    this._mapArea.beginFill(0xcccccc)
    this._mapArea.drawRect(0, ScreenHelper.UNIT * 2, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6)

    this.addChild(this._mapArea)


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

    this.lngValue = new Text('', style);
    this.lngValue.x = ScreenHelper.UNIT
    this.lngValue.y = 32
    this.lngValue.text = this._rasterMap.lng.toString()
    this.addChild(this.lngValue);


    const lngLabel = new Text(
      `Lng:`, style
    );
    lngLabel.x = 0
    lngLabel.y = 32
    this.addChild(lngLabel);
  }

  public Start(): void {
    if (this._mapArea) {
      const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
        .call(() => {
          console.debug('hoge')
        })
        .from(this._mapArea, { alpha: 0 })
        .to(this._mapArea, { alpha: 1.0 })

        .call(() => {
          this._status = 'fix'
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
      if (this._status === 'random') {

      } else {
        this.dispLatCursor += 1;
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