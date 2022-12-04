import { AppManager } from './main'
import { gsap } from 'gsap';
import { Graphics, Text } from 'pixi.js';
// import { Context } from './Context';
// import { MathUtil } from './MathUtil'

export class Title extends Graphics {
  private _status: string = 'random'
  private titleString: string = 'HCK/TYO/JPN'


  private titleText = new Text()
  private dispValue: string = ''
  private dispCursor: number = 0
  private dispCursorStep: number = 1

  public constructor() {
    super();

    this.init()
  }

  public init() {
    this.titleText = new Text(
      'HCK/TYO/JPN',
      {
        fontFamily: "Inter",
        fontWeight: "400",
        fill: 0xffffff,
        fontSize: 120,
        letterSpacing: -0.25
        , align: 'left',
      }
    );
    this.addChild(this.titleText);
    this.alpha = 0
  }

  public Start(): void {
    // const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
    gsap.timeline({ defaults: { delay: 0, duration: 1.0 } })
      .from(this, { alpha: 0 })
      .to(this, {
        alpha: 1, duration: 2.0, onComplete: () => {
        }
      })
      .to(this, {
        duration: 0.5, delay: 5.0, onComplete: () => {
          this._status = 'toFix'
        }
      })
    if (AppManager) {
      if (AppManager.app) {
        AppManager.app.ticker.add(this.update);
      }
    }
  }

  private update = (): void => {
    if (this._status === 'random' || this._status === 'toFix') {
      this.dispValue = Title.getRandomString(this.titleString, this.dispCursor)
      // console.log(this.dispCursor)
      this.titleText.text = this.dispValue
    }
    if (this._status === 'random') {
    } else if (this._status === 'toFix') {
      if (AppManager.app) {
        // if (this.dispCursor <= this.titleString.length) {
        this.dispCursor += this.dispCursorStep;
        // }
      }

    }
  }

  static getRandomString(value: string, cursor: number): string {
    let result: string = ''
    for (let i = 0; i <= value.length; i++) {
      if (i < cursor) {
        result += value.slice(i, i + 1)
      } else {
        result += this.randomChar()
      }
    }

    return result
  }

  static randomChar() {
    // const pool = '?/\\(^)![]abcdefghijklmnopqrstuvwxyz0123456789{}*&^%$';
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // const pool = '0123456789';
    return pool.charAt(Math.floor(Math.random() * pool.length));
  };

}