import { Context } from "./Context";

export class Clock {
  private static _prevTime: number = 0
  public static get prevTime(): number {
    return this._prevTime
  }
  // private static readonly SECOND = 1000;

  static CheckSeconds(): Boolean {
    const now = new Date().getTime()
    if (now - Clock.prevTime > 1000) {
      Clock._prevTime = now
      return true
    }
    else {
      return false
    }

  }

}