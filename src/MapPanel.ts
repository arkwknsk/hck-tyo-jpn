import { AppManager } from './main'
import { gsap } from 'gsap';
import { BaseTexture, Graphics, Sprite, Text, Texture, TextStyle, IPointData } from 'pixi.js';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';
// import { Context } from './Context';
// import { MathUtil } from './MathUtil'

export class MapPanel extends Graphics {
  public readonly MAP_RATIO: number = 1.333
  private _rasterMap: RasterMap
  public get rasterMap(): RasterMap {
    return this._rasterMap
  }
  private _mapArea: Graphics | undefined
  private mapSprite: Sprite | undefined
  private _status: string = 'random'
  private _frameGraphics: Graphics | undefined
  private _corner: Graphics[] | undefined
  private _cornerGraphics: Graphics | undefined
  private _cornerGoals: IPointData[] | undefined

  private latValue = new Text()
  private lngValue = new Text()
  private dispLatValue: string = ''
  private dispLatCursor: number = 0
  private dispLatCursorStep: number = 0
  private dispLngCursor: number = 0
  private dispLngCursorStep: number = 0
  private dispLngValue: string = ''
  // private counter: number = 0
  // private frame: number = 0

  public constructor(rasterMaps: RasterMap) {
    super();

    this._rasterMap = rasterMaps

    this.init()
  }

  public init() {
    // console.log(`[MapPanel]: init id:${this._rasterMap.id} this._rasterMap.lat:${this._rasterMap.lat}`)
    if (!this._rasterMap) return
    try {
      this.dispLatCursorStep = this._rasterMap.lat.toString().length / (1.0 * 30)
      this.dispLngCursorStep = this._rasterMap.lng.toString().length / (1.0 * 30)

    } catch (error) {
      return;
    }
    this._mapArea = new Graphics()
    this._mapArea.beginFill(0xcccccc)
    this._mapArea.drawRect(0, ScreenHelper.UNIT * 2, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6)

    // this.addChild(this._mapArea)


    const style: TextStyle = new TextStyle({
      fontFamily: "Lekton Regular",
      fontWeight: '400',
      fill: 0xffffff,
      fontSize: 12,
      letterSpacing: 0
      , align: 'left',
    })

    this.latValue = new Text('', style);
    this.latValue.x = 0
    this.latValue.y = ScreenHelper.UNIT / 2 + ScreenHelper.UNIT / 2
    this.latValue.text = this._rasterMap.lat.toString()
    this.addChild(this.latValue);

    this.lngValue = new Text('', style);
    this.lngValue.x = 0
    this.lngValue.y = ScreenHelper.UNIT / 2 + ScreenHelper.UNIT / 2 + 18
    this.lngValue.text = this._rasterMap.lng.toString()
    this.addChild(this.lngValue);

    const loadTexture = new Texture(new BaseTexture(this._rasterMap.image))
    const mapSprite = new Sprite(loadTexture)
    mapSprite.y = ScreenHelper.UNIT * 2
    mapSprite.width = ScreenHelper.UNIT * 6 * this.MAP_RATIO
    mapSprite.height = ScreenHelper.UNIT * 6
    mapSprite.x = -((ScreenHelper.UNIT * 6 * this.MAP_RATIO) - ScreenHelper.UNIT * 6) * 0.5
    mapSprite.alpha = 0.0

    const mask = new Graphics()
    mask.beginFill(0xffffff);
    mask.drawRect(0, 0, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6);
    mask.endFill();
    mask.y = mapSprite.y

    mapSprite.mask = mask
    this.mapSprite = mapSprite

    this.addChild(mask)
    this.addChild(mapSprite)

    const g = new Graphics()
    g.lineStyle(1, 0xFFFFFF, 0.5)
      .drawRect(0, ScreenHelper.UNIT * 2, ScreenHelper.UNIT * 6, ScreenHelper.UNIT * 6)
    this.addChild(g)

    this._frameGraphics = g

    const c = new Graphics()
    c.lineStyle(1, 0xFFFFFF, 0.8)
      .moveTo(0, 0).lineTo(0, 10)
      .moveTo(0, 0).lineTo(10, 0)


    this._cornerGraphics = new Graphics()
    this._corner = []
    for (let i = 0; i < 4; i++) {
      const target = c.clone()
      target.angle = i * 90
      target.x = 0
      target.y = ScreenHelper.UNIT * 2

      this._corner.push(target)

      this._cornerGraphics.addChild(target)
    }
    this.addChild(this._cornerGraphics)
    this.calcMapCorner()
  }

  public Start(): void {
    if (!this._rasterMap) return
    if (this.mapSprite && this._corner) {
      // this.counter = 0
      // const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
      if (this._frameGraphics) this._frameGraphics.alpha = 0.0
      this._status = 'random'
      const tl = gsap.timeline({ defaults: { delay: 0, duration: 1.0 } })
        .call(() => {
          this._status = 'toFix'
        }, [], "1.0")

      if (this._cornerGoals) {
        for (let i = 0; i < 4; i++) {
          tl.to(this._corner[i], { duration: 2.0, x: this._cornerGoals[i].x, y: this._cornerGoals[i].y }, "1.0")
        }
      }
      tl
        .call(() => {
          if (this._frameGraphics) {
            this._frameGraphics.alpha = 1.0
            this._status = 'fixed'
          }
        }, [], ">")
        .call(() => {
          this._status = 'toMap'
        }, [], "+=0.5")
        .call(() => {
          this._status = 'map'
        }, [], ">0.25")
        .call(() => {
          // if (this.mapSprite) this.mapSprite.alpha = 0.5
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
      if (this._status === 'random' || this._status === 'toFix' || this._status === 'fixed' || this._status === 'toMap') {
        this.dispLatValue = MapPanel.getRandomString(this._rasterMap.lat, this.dispLatCursor)
        this.latValue.text = this.dispLatValue
        this.dispLngValue = MapPanel.getRandomString(this._rasterMap.lng, this.dispLngCursor)
        this.lngValue.text = this.dispLngValue
        if (this._frameGraphics && this._cornerGraphics) {
          this._cornerGraphics.alpha = (this._cornerGraphics.alpha === 0.9) ? 0.1 : 0.9
        }
      }
    }
    if (this._status === 'random') {
      if (AppManager.app) {
        this.dispLatCursor += this.dispLatCursorStep;
        this.dispLngCursor += this.dispLngCursorStep;
        // }
      }
    } else if (this._status === 'toFix') {
      if (AppManager.app) {
        this.dispLatCursor += this.dispLatCursorStep;
        this.dispLngCursor += this.dispLngCursorStep;
        // }
      }
    } else if (this._status === 'fixed') {
      if (this._frameGraphics && this._cornerGraphics) {
        this._frameGraphics.alpha = (this._frameGraphics.alpha === 1) ? 0.1 : 1
        // this._cornerGraphics.alpha = (this._cornerGraphics.alpha === 0.9) ? 0.1 : 0.9
      }
    } else if (this._status === 'toMap') {
      if (this.mapSprite) {
        this.mapSprite.alpha = (this.mapSprite.alpha === 0.5) ? 0.1 : 0.5
        // this.mapSprite.angle += 1
        // this.mapSprite.anchor.x = this.mapSprite.anchor.y = 0.5
      }
      if (this._cornerGraphics) {
        this._cornerGraphics.alpha = (this._cornerGraphics.alpha === 0.9) ? 0.1 : 0.9
      }
    } else if (this._status === 'map') {
      if (this.mapSprite) this.mapSprite.alpha = 0.5
      if (this._frameGraphics) this._frameGraphics.alpha = 0.5
      if (this._cornerGraphics) {
        this._cornerGraphics.alpha = 0.9
      }
    } else {
      if (this._frameGraphics && this._cornerGraphics) {
        this._frameGraphics.alpha = 0.5
        this._cornerGraphics.alpha = 0.9
      }
    }
    // this.x += 0.25;
    if (this._status === 'random') {
      this.x += 2;
    } else {
      this.x += 1;
    }
    // console.log(this)
  }

  calcMapCorner(): void {
    this._cornerGoals = []
    if (!this._corner) return;
    for (let i = 0; i < 4; i++) {
      let x: number

      if (i < 2) {
        x = (i % 2) * ScreenHelper.UNIT * 6
      } else if (i == 2) {
        x = ScreenHelper.UNIT * 6
      } else {
        x = 0
      }
      const y = Math.floor(i / 2) * ScreenHelper.UNIT * 6 + ScreenHelper.UNIT * 2
      this._cornerGoals.push({ x, y })
    }
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