import { gsap } from 'gsap';
import { Map, StyleSpecification } from 'maplibre-gl';
import { Application, Assets, BaseTexture, Graphics, Sprite, Texture } from 'pixi.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
// import Tweakpane from "tweakpane";
import Blank from './assets/o186ulfx6.json';
import { Context } from './Context';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';
import { MathUtil } from './MathUtil'
import { MapPanel } from './MapPanel'
import { Title } from './Title'
import { TimeIndicator } from './TimeIndicator'
import { Clock } from './Clock'
import seedrandom from 'seedrandom'

import './main.css';
import './reset.css';

const StatusType = {
  OP: "op",
  HORIZONTAL: "Horizontal",
  Hearts: "hearts",
  Spades: "spades",
} as const;

type StatusType = typeof StatusType[keyof typeof StatusType];


/**
 * Main Class
 */
export class AppManager {
  public static app: Application | undefined
  private static graphics: Graphics | undefined
  private static mapGraphics: Graphics | undefined
  private static gridGraphics: Graphics | undefined
  private static titleText: Title | undefined
  private static mapPanels: MapPanel[] | undefined
  private static timeIndicator: TimeIndicator
  private static mapMasks: HTMLDivElement[] | undefined

  private static stats: Stats;

  private static map: Map | undefined
  private static largeMap: Map | undefined

  private static rasterMaps: RasterMap[]

  private static withoutRoadStyle: StyleSpecification | undefined

  private static startTime: Date



  /**
   * Direction Status 演出ステータス
   *
   * @private
   * @static
   * @type {string}
   * @memberof AppManager
   */
  private static status: StatusType

  static readonly INPUTS = {
    fpsMonitor: false,
    isGrid: true,
    h: 140,
    s: 0,
    l: 0.0
  };

  private constructor() {
    AppManager.stats = Stats()
    AppManager.startTime = new Date(); //Begin
    AppManager.timeIndicator = new TimeIndicator(AppManager.startTime)
  }


  static init = async () => {
    new AppManager()
    AppManager.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(AppManager.stats.dom);

    AppManager.status = StatusType.OP

    const seed = MathUtil.getSeed()
    console.log(`[Main]: seed:${seed}`)
    const generator = seedrandom(seed);
    const randomNumber = generator();
    console.log(`[Main]: randomNumber:${randomNumber}`)

    /*
    const style = {
      "version": 8,
      "glyphs": "https://maps.gsi.go.jp/xyz/noto-jp/{fontstack}/{range}.pbf",
      "sources": {
        "pale": {
          "type": "vector",
          "tiles": [
            // "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
            "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf"
          ],
          "minzoom": 4,
          "maxzoom": 16,
          // "tileSize": 256,
          "attribution": "<a href='http://maps.gsi.go.jp/development/ichiran.html'>地理院タイル</a>"
        },
        "plateau": {
          "type": "vector",
          "tiles": [
            "https://indigo-lab.github.io/plateau-tokyo23ku-building-mvt-2020/{z}/{x}/{y}.pbf"
          ],
          "minzoom": 10,
          "maxzoom": 16,
          "attribution": "<a href='https://github.com/indigo-lab/plateau-tokyo23ku-building-mvt-2020'>plateau-tokyo23ku-building-mvt-2020 by indigo-lab</a> (<a href='https://www.mlit.go.jp/plateau/'>国土交通省 Project PLATEAU</a> のデータを加工して作成)"
        }
      },
      "layers": [{
        "id": "pale",
        "type": "fill",
        "source": "pale",
        "minzoom": 4,
        "maxzoom": 16
      }, {
        "id": "bldg",
        "type": "fill-extrusion",
        "source": "plateau",
        "source-layer": "bldg",
        "minzoom": 10,
        "maxzoom": 20,
        "paint": {
          "fill-extrusion-color": [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            "#888888", "#000000"
          ],
          "fill-extrusion-height": ["get", "measuredHeight"]
        }
      }]
    };
*/

    /*
    const pane = new Tweakpane({
      title: "HCK/TYO/JPN",
    });


    pane.addInput(AppManager.INPUTS, 'h', {
      min: 0,
      max: 360,
      step: 1.0
    });
    */
    this.initMaskMap()

    const layers = AppManager.filterLayer()
    // console.debug(layers);
    // Blank.layers = layers
    AppManager.withoutRoadStyle = JSON.parse(JSON.stringify(Blank)) as StyleSpecification
    AppManager.withoutRoadStyle.layers = layers

    await this.initPIXI()
    await this.initCacheCanvas()

    if (AppManager.titleText) {
      AppManager.titleText.visible = true
      AppManager.titleText.Start()
    }

    await this.createLargeMap()
    await this.initTimeline()
    // this.mapPanels = this.addMapPanel()

  }


  static initMaskMap() {
    this.mapMasks = []
    for (let i = 0; i < 2; i++) {
      var maskElement = document.createElement('div')
      document.body.appendChild(maskElement);
      this.mapMasks.push(maskElement)

      maskElement.setAttribute("id", `mapMask${i}`)
      if (i === 0) maskElement.setAttribute("style", `opacity:1.0;z-index:100;background-color:#000000;position:absolute;top:0;left:${ScreenHelper.LEFT_SCREEN_LEFT}px;width:${ScreenHelper.SIDE_SCREEN}px;height:${Context.STAGE_HEIGHT}px;`);
      if (i === 1) maskElement.setAttribute("style", `opacity:1.0;z-index:100;background-color:#000000;position:absolute;top:0;left:${ScreenHelper.RIGHT_SCREEN_LEFT}px;width:${ScreenHelper.SIDE_SCREEN}px;height:${Context.STAGE_HEIGHT}px;`);
    }

  }

  static async initPIXI(): Promise<void> {
    AppManager.app = new Application({
      width: Context.STAGE_WIDTH,
      height: Context.STAGE_HEIGHT,
      backgroundColor: '#000000',

      antialias: true,
      autoDensity: true, // !!!
      resolution: 1,
    });

    //FPS
    AppManager.app.ticker.maxFPS = 30;

    const app = document.getElementById('app')
    if (app) {
      app.appendChild(AppManager.app.view as HTMLCanvasElement)
      console.log("[Main]: Added PIXI")
      AppManager.app.stage.sortableChildren = true
    }

    await Assets.load("Inter-Medium.ttf").catch((error) => { console.log(error.message); });;
    await Assets.load("Inter-Regular.ttf").catch((error) => { console.log(error.message); });;
    await Assets.load("Lekton-Regular.ttf").catch((error) => { console.log(error.message); });;
    console.log("[Main]: Loaded fonts")


    AppManager.mapGraphics = new Graphics()
    AppManager.app.stage.addChild(AppManager.mapGraphics)

    AppManager.graphics = new Graphics()
    AppManager.app.stage.addChild(AppManager.graphics)

    AppManager.gridGraphics = new Graphics()
    AppManager.app.stage.addChild(AppManager.gridGraphics)

    const grids = ScreenHelper.GetGrids()
    const layoutGrid = ScreenHelper.GetLayoutGrid()
    // if (AppManager.gridGraphics) {
    //   AppManager.gridGraphics.addChild(grids)
    //   AppManager.gridGraphics.addChild(layoutGrid)
    // }

    this.timeIndicator.x = ScreenHelper.FRONT_SCREEN_LEFT
    AppManager.gridGraphics.addChild(this.timeIndicator)

    AppManager.app.ticker.add(() => {
      try {
        if (AppManager.stats) AppManager.stats.begin();

        AppManager.update();

        if (AppManager.stats) AppManager.stats.end();

      } catch (error: any) {
        console.error(error.message)
      }
    });


    this.titleText = new Title()
    this.titleText.x = ScreenHelper.FRONT_SCREEN_LEFT + (ScreenHelper.LARGE_SCREEN - this.titleText.width) / 2
    this.titleText.y = (Context.STAGE_HEIGHT - this.titleText.height) / 2
    this.titleText.visible = false
    AppManager.graphics.addChild(this.titleText);




  }

  /**
   * preload 
   * 
   */
  static async preloadRasterMaps(): Promise<void> {
    console.log("[Main]: Before preloadRasterMaps")
    AppManager.rasterMaps = []
    for (let i = 0; i < Context.PRELOAD_MAPS; i++) {
      var rasterMap = await AppManager.createRasterMap(i)
      AppManager.rasterMaps.push(rasterMap)
    }
    console.log(`[Main]: After preloadRasterMaps  ${AppManager.timeIndicator.toString()}`)
  }

  /**
   * 地図のラスター形式のキャッシュを生成
   *
   * @param name - description
  */
  static async createRasterMap(index: number): Promise<RasterMap> {
    const seed = `MathUtil.getSeed()${index}`
    var rasterMap: RasterMap = {
      id: index, lat: MathUtil.getRandomInclusiveSeed(seed, Context.MIN_LAT, Context.MAX_LAT), lng: MathUtil.getRandomInclusiveSeed(seed, Context.MIN_LNG, Context.MAX_LNG),
    }
    rasterMap.image = await AppManager.createMapCopyCanvas(rasterMap.id, rasterMap.lat, rasterMap.lng)
    // AppManager.rasterMaps.push(rasterMap)
    // console.log(`[Main]: After createMapCopyCanvas ${rasterMap.lat},${rasterMap.lng} ${AppManager.timeIndicator.toString()}`)

    return rasterMap
  }

  static async createLargeMap(): Promise<void> {
    console.log(`[Main]: createLargeMap`)

    return new Promise<void>((resolve, reject) => {
      var mapElement = document.createElement('div')
      document.body.appendChild(mapElement);
      const mapID = `largeMap}`
      mapElement.setAttribute("id", mapID)
      // mapElement.setAttribute("style", `opacity:0.5;z-index:10;position:absolute;top:0;left:${ScreenHelper.FRONT_SCREEN_LEFT}px;width:${ScreenHelper.LARGE_SCREEN}px;height:${Context.STAGE_HEIGHT}px;`);
      mapElement.setAttribute("style", `opacity:0.5;z-index:10;position:absolute;top:0;left:${ScreenHelper.LEFT_SCREEN_LEFT}px;width:${ScreenHelper.LARGE_SCREEN + ScreenHelper.SIDE_SCREEN * 2}px;height:${Context.STAGE_HEIGHT}px;`);

      AppManager.largeMap = new Map({
        "container": mapID,
        center: [139.7873784, 35.6853717],
        zoom: 13.0,
        maxZoom: 17.99,
        minZoom: 4,
        "pitch": 0,
        "maxPitch": 85,
        "bearing": 0,
        "hash": false,
        "style": Blank as StyleSpecification
      });

      AppManager.largeMap.on('load', function () {
        resolve();
      })
    })
  }

  static shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static sleep(waitSeconds: number, someFunction: Function) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(someFunction())
      }, waitSeconds * 1000)
    })
  }

  static zoomLargeMap(to: number): void {
    if (!AppManager.largeMap) return
    const currentZoom = AppManager.largeMap.getZoom();
    if (currentZoom < to) {
      AppManager.largeMap.setZoom(currentZoom + 0.0005)
    }
    setTimeout(() => {
      this.zoomLargeMap(to)
    }, 1000 / 30);
  }

  /**
   * レイヤーの中から建物だけを抽出
   * @returns フィルタリング後のレイヤー
   */
  static filterLayer(): any {
    const wantLayer = ['building', 'structurea', 'structurel']
    // const wantLayer = ['road']
    const evenValues = Blank.layers.filter((value) => {
      if (value["source-layer"] !== undefined) {
        if (wantLayer.includes(value["source-layer"])) {
          return true;
        } else {
          return false;
        }
      } else if (value["id"] === 'background') {
        return true;
      } else {
        return false
      }
    })

    return evenValues
  }

  static initCacheCanvas(): Promise<void> {
    return new Promise<void>((resolve) => {
      const cacheCanvasElement = document.getElementById('cacheCanvas') as HTMLCanvasElement;
      const w = (Context.MAP_WIDTH * 2 * 10).toString()
      const h = (Context.MAP_HEIGHT * 2).toString()
      cacheCanvasElement.setAttribute('width', w)
      cacheCanvasElement.setAttribute('height', h);
      cacheCanvasElement.setAttribute("style", `position: absolute; top: 1080px;left: 0px;`);

      resolve()
    })
  }

  static createMapCopyCanvas(index: number, lat: number, lng: number): Promise<HTMLImageElement> {
    // console.log(`[Main] createMapCopyCanvas ${lat},${lng}`)
    return new Promise<HTMLImageElement>((resolve, reject) => {
      var mapElement = document.createElement('div')
      document.body.appendChild(mapElement);
      // const mapID = `map${ index } `
      const mapID = `map-small-${index}`
      mapElement.setAttribute("id", mapID)
      const left = 0
      mapElement.setAttribute("style", `z - index: -1000; position: absolute; top: 0; left:${left} px; width:${Context.MAP_WIDTH * 2} px; height:${Context.MAP_HEIGHT * 2} px; `);

      const map = new Map({
        "container": mapID,
        center: [lng, lat],
        zoom: 15,
        maxZoom: 17.99,
        minZoom: 4,
        "pitch": 0,
        "maxPitch": 85,
        "bearing": 0,
        "hash": false,
        maxTileCacheSize: 0,
        "style": AppManager.withoutRoadStyle as StyleSpecification
      });

      map.once('load', () => {
        // console.log(`index:${index} ${mapID}`)
        let data: string;
        var mapElement = document.getElementById(mapID)
        if (mapElement) {
          let mapCanvasElement = mapElement.firstElementChild?.firstElementChild as HTMLCanvasElement
          const cacheCanvasElement = document.getElementById('cacheCanvas') as HTMLCanvasElement;

          if (cacheCanvasElement) {
            const cacheCanvasContext = cacheCanvasElement.getContext('2d')
            if (cacheCanvasContext) {
              data = mapCanvasElement.toDataURL()
              var img = new Image(Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
              img.src = data

              cacheCanvasContext.drawImage(img, 0, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2, Context.MAP_WIDTH * 2 * index, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
              // cacheCanvasContext.drawImage(img, 0, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2, 0, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT)
              document.body.removeChild(mapElement)
              map.remove()
              resolve(img)
            }
            else {
              reject()
            }
          }
          else {
            reject()
          }
        }
      });
    });
  }

  static async initTimeline(): Promise<void> {
    console.log("[Main] initTimeline")

    gsap.ticker.fps(30);

    if (!AppManager.largeMap) return
    const tl = gsap.timeline({}).call(() => {
      console.log(`[TL] START ${this.timeIndicator.toString()} `)
    })
      .call(() => {
        // AppManager.largeMap?.flyTo({ curve: 1.0, speed: 0.2, zoom: 5.0, maxDuration: 10000 })
        AppManager.preloadRasterMaps()
        AppManager.zoomLargeMap(13.9)
      }, []
        , "0")
      // .call(() => {
      //   AppManager.largeMap?.jumpTo({ zoom: 13.0 })
      // }, []
      //   , "+=3"
      // )
      .call(() => {
        if (AppManager.titleText) AppManager.titleText.toFix()
      }, []
        , `+= ${3.0 - AppManager.timeIndicator.sDiff} ` //Fixed discrepancy between app start time and timeline start time. アプリ起動時刻とtimelineがスタートした時刻のズレを補正
      )
      .call(() => {
        if (AppManager.mapMasks) {
          for (let i = 0; i < AppManager.mapMasks.length; i++) {
            const mask = AppManager.mapMasks[i]
            mask.setAttribute("style", `display: none`);
          }
        }

        if (AppManager.titleText) AppManager.titleText.toFix()
        AppManager.largeMap?.jumpTo({ zoom: 14.0 })
        AppManager.zoomLargeMap(14.9)
      }, []
        , "+=1.5"
      )
      .call(() => {
        // if (AppManager.largeMap) AppManager.largeMap.remove()
        AppManager.largeMap?.getContainer().setAttribute("style", `display: none`);
        console.log(`[TL] CALL ${this.timeIndicator.toString()} `)

        console.log(`[TL] addMapPanel ${this.timeIndicator.toString()} `)
        AppManager.status = StatusType.HORIZONTAL
        AppManager.mapPanels = AppManager.addPreloadMapPanel()
        AppManager.showMapPanel()

      }, []
        , "+=5")
      .call(() => {
        // AppManager.largeMap?.jumpTo({ zoom: 14.0 })
      }, []
        , "+=5"
      )
  }

  static addPreloadMapPanel(): MapPanel[] {
    // console.log(`[Main] addPreloadMapPanel:`)

    if (!AppManager.mapGraphics) return []
    if (!AppManager.rasterMaps) return []

    let mapPanels: MapPanel[] = []

    for (let i = 0; i < AppManager.rasterMaps.length; i++) {
      const mapPanel = new MapPanel(AppManager.rasterMaps[i])
      mapPanel.alpha = 0

      const indexX = (i % Context.MAPS_COLS)
      const generator = seedrandom(MathUtil.getSeed());
      const randomNumber = generator();

      const indexY = Math.floor((randomNumber * randomNumber) * Context.MAPS_ROWS)

      const panelSize = (ScreenHelper.UNIT * 6)
      const topMargin = ScreenHelper.UNIT * 2
      const betweenMargin = (ScreenHelper.UNIT * 2)
      const betweenMarginY = (ScreenHelper.UNIT * 2)

      mapPanel.x = ScreenHelper.BACK_SCREEN_LEFT_MARGIN + ScreenHelper.UNIT * 3 + panelSize * indexX + betweenMargin * indexX + panelSize * (randomNumber * randomNumber)
      mapPanel.y = topMargin + indexY * panelSize + betweenMarginY * indexY

      AppManager.mapGraphics.addChild(mapPanel)
      mapPanels.push(mapPanel)
      // mapPanel.Start()
      // console.log(`[Main] addPreloadMapPanel: ${mapPanels.length}`)

    }

    return mapPanels

  }

  static async showMapPanel() {
    if (!AppManager) return
    if (!AppManager.mapPanels) return

    if (this.titleText) this.titleText.alpha = 0

    let playlist: number[] = []
    for (let i = 0; i < AppManager.mapPanels.length; i++) {
      playlist.push(i)
    }
    console.log(`[Main] showMapPanel:`)


    // const target = JSON.parse(JSON.stringify(playlist))
    const target = playlist
    target.forEach((index: number) => {
      const mapIndex = target[index]
      if (this.mapPanels) {
        const map = this.mapPanels[mapIndex]
        map.Start();
        map.alpha = 1
        // console.log(`[Main] showMapPanel:${mapIndex} ${map.rasterMap.id}`)
      }
    });
    // await this.sleep(5, () => {
    //   console.log('next maps')
    // })

    // for (let i = 0; i < AppManager.length; i++) {
    //   playlist.push(i)
    // }
    // playlist = this.shuffle(playlist)

    // const num = 7
    // for (let time = 0; time < num; time++) {
    //   const target = playlist.splice(0, Context.NUMBER_MAPS / num)
    //   target.forEach(mapIndex => {
    //     if (this.mapPanels) {
    //       const map = this.mapPanels[mapIndex]
    //       // map.Start();
    //       // map.alpha = 0
    //     }
    //   });
    //   await this.sleep(0.05, () => {
    //     console.log('next maps')
    //   })
    // }

  }


  static update(): void {
    if (this.timeIndicator) this.timeIndicator.update()

    if (AppManager.status === StatusType.HORIZONTAL) {
      if (Clock.CheckSeconds()) {
        console.log("[Main]: CheckSeconds")
      }
    }
  }

}

window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded")
  AppManager.init()
});
