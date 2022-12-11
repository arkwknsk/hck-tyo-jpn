import { AppManager } from './main'
import { gsap } from 'gsap';
import { Graphics, Text } from 'pixi.js';
// import { Context } from './Context';
// import { MathUtil } from './MathUtil'

export class Title extends Graphics {
  private _status: string = 'random'
  private readonly TITLE_STRING: string = 'HCK/TYO/JPN'


  private titleTexts: Text[]
  private dispValue: string = ''
  private dispCursor: number = 0
  private dispCursorStep: number = 0.25

  public constructor() {
    super();
    this.titleTexts = []

    this.init()
  }

  public init() {
    for (let i = 0; i < this.TITLE_STRING.length; i++) {
      const char = this.TITLE_STRING[i];
      const text = new Text(
        char,
        {
          fontFamily: "Inter Regular",
          fontWeight: '400',
          fill: 0xffffff,
          fontSize: 120,
          letterSpacing: -0.25
          , align: 'center',
        }
      );
      text.x = i * 120
      this.titleTexts.push(text);
      this.addChild(text);
    }
    this.alpha = 1.0
  }

  public Start(): void {
    // const tl = gsap.timeline({ defaults: { duration: 1.0, ease: "power4.out" } })
    // gsap.timeline({ defaults: { delay: 0, duration: 1.0 } })
    //   .call(() => {
    //     this._status = 'toFix'
    //   }, [], "+=3.0")
    if (AppManager) {
      if (AppManager.app) {
        AppManager.app.ticker.add(this.update);
      }
    }
  }

  public toFix(): void {
    this._status = 'toFix'
  }

  private update = (): void => {
    if (this._status === 'random' || this._status === 'toFix') {
      this.dispValue = Title.getRandomString(this.TITLE_STRING, this.dispCursor)
      // console.log(this.dispCursor)
      for (let i = 0; i < this.titleTexts.length; i++) {
        const text = this.titleTexts[i];
        text.text = this.dispValue.slice(i, i + 1)
      }
    }
    if (this._status === 'random') {
    } else if (this._status === 'toFix') {
      if (AppManager.app) {
        if (this.dispCursor <= this.TITLE_STRING.length) {
          this.dispCursor += this.dispCursorStep;
        } else {
          AppManager.app.ticker.remove(this.update);
        }
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