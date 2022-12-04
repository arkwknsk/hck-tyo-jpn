export class MathUtil {
  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomInclusive(min: number, max: number): number {
    return Math.random() * (max - min + 1) + min //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
  }


  static getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min //The maximum is exclusive and the minimum is inclusive
  }
}
