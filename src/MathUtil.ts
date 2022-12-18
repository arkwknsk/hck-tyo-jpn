import seedrandom from 'seedrandom'

export class MathUtil {
  static getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomIntInclusiveSeed(seed: string, min: number, max: number): number {
    const generator = seedrandom(seed);
    const randomNumber = generator();

    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(randomNumber * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomIntSeed(seed: string, min: number, max: number): number {
    const generator = seedrandom(seed);
    const randomNumber = generator();

    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(randomNumber * (max - min) + min)
  }

  static getRandomInclusive(min: number, max: number): number {
    return Math.random() * (max - min + 1) + min //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomInclusiveSeed(seed: string, min: number, max: number): number {
    const generator = seedrandom(seed);
    const randomNumber = generator();
    return randomNumber * (max - min + 1) + min //The maximum is inclusive and the minimum is inclusive
  }

  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min) //The maximum is exclusive and the minimum is inclusive
  }


  static getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min //The maximum is exclusive and the minimum is inclusive
  }

  static getSeed(): string {
    const now = new Date()
    const year = (now.getFullYear()).toString();
    const month = MathUtil.zeroPadding((now.getMonth() + 1));
    const day = MathUtil.zeroPadding(now.getDate());
    const hour = MathUtil.zeroPadding(now.getHours());
    const min = MathUtil.zeroPadding(now.getMinutes());
    const sec = MathUtil.zeroPadding(now.getSeconds());
    const msec = MathUtil.zeroPadding(now.getMilliseconds(), 4)

    return `${year}${month}${day}${hour}${min}${sec}${msec}`;
  }

  static zeroPadding(num: number, length: number = 2): string {
    return (Array(length).join('0') + num).slice(-length);
  }

}
