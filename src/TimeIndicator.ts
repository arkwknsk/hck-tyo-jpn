import { Graphics, Text, TextStyle } from 'pixi.js';
import { Context } from './Context';
// import { MathUtil } from './MathUtil'

export class TimeIndicator extends Graphics {
  private _start: Date
  private _string: string = ""
  private minText = new Text()
  private secText = new Text()
  private msecText = new Text()
  private static textStyle: TextStyle = new TextStyle({
    fontFamily: "Inter Regular",
    fontWeight: '400',
    fill: 0xffffff,
    fontSize: 96,
    letterSpacing: -0.25
    , align: 'center',
  })

  public constructor(start: Date) {
    super();

    this._start = start

    this.init()
  }

  public init() {
    this.minText = new Text('88', TimeIndicator.textStyle);
    this.addChild(this.minText);
    const dividerM2SText: Text = new Text(':', TimeIndicator.textStyle);
    dividerM2SText.x = 120
    this.addChild(dividerM2SText)
    this.secText = new Text('88', TimeIndicator.textStyle);
    this.secText.x = 150
    this.addChild(this.secText);
    const dividerS2mText: Text = new Text('.', TimeIndicator.textStyle);
    dividerS2mText.x = 270
    this.addChild(dividerS2mText)
    this.msecText = new Text('888', TimeIndicator.textStyle);
    this.msecText.x = 300
    this.addChild(this.msecText);
    this.y = Context.STAGE_HEIGHT - 100
  }

  public Start(): void {
  }

  public update = (): void => {
    const now = new Date()
    // debugger
    const diff = now.getTime() - this._start.getTime();
    const mDiff = Math.floor(diff / (1000 * 60 * 60))
    const sDiff = Math.floor((diff - (mDiff * 1000 * 60)) / 1000)
    const msDiff = Math.floor((diff - (sDiff * 100) * 100))

    this.minText.text = TimeIndicator.zeroPadding(mDiff, 2)
    this.secText.text = TimeIndicator.zeroPadding(sDiff, 2)
    this.msecText.text = TimeIndicator.zeroPadding(msDiff, 2)

    this._string = `${TimeIndicator.zeroPadding(mDiff, 2)}:${TimeIndicator.zeroPadding(sDiff, 2)}.${TimeIndicator.zeroPadding(msDiff, 2)}`

  }

  static zeroPadding(num: number, length: number): string {
    return (Array(length).join('0') + num).slice(-length);
  }

  toString(): string {
    return this._string
  }

}