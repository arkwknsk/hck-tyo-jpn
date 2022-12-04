import { gsap } from 'gsap';
import { Map, StyleSpecification } from 'maplibre-gl';
import { Application, Assets, BaseTexture, Graphics, Sprite, Text, Texture } from 'pixi.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import Blank from './assets/o186ulfx6.json';
import { Context } from './Context';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';
import { MathUtil } from './MathUtil'
import { MapPanel } from './MapPanel'

import './main.css';
import './reset.css';

/**
 * Main Class
 */
export class AppManager {
  public static app: Application | undefined
  private static graphics: Graphics | undefined
  private static mapGraphics: Graphics | undefined
  private static gridGraphics: Graphics | undefined

  private static stats: Stats;

  private static map: Map | undefined

  private static rasterMaps: RasterMap[]


  static readonly INPUTS = {
    fpsMonitor: false,
    isGrid: true,
    h: 140,
    s: 0,
    l: 0.0
  };

  private constructor() {
    AppManager.stats = Stats()
  }


  static init = async () => {
    new AppManager()
    AppManager.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(AppManager.stats.dom);
    const pane = new Tweakpane({
      title: "HCK/TYO/JPN",
    });


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


    pane.addInput(AppManager.INPUTS, 'h', {
      min: 0,
      max: 360,
      step: 1.0
    });

    this.initPIXI()
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

    const app = document.getElementById('app');
    if (app) {
      app.appendChild(AppManager.app.view as HTMLCanvasElement)
      console.log("[Main]: Added PIXI")
      AppManager.app.stage.sortableChildren = true
    }

    await Assets.load({
      data: {
        weights: ['Medium', 'Normal', 'Light'], // only loads the weight
      },
      src: "Inter-VariableFont_slnt,wght.ttf",
    }
    );
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
    // AppManager.gridGraphics.addChild(ScreenHelper.GetLayoutGrid())
    // }
    const message = new Text(
      'HCK/TYO/JPN',
      {
        fontFamily: "Inter",
        // fontFamily: "DIN Al",
        fontWeight: "500",
        fill: 0xffffff,
        fontSize: 120,
        letterSpacing: -0.25
        , align: 'left',
      }
    );
    message.x = ScreenHelper.FRONT_SCREEN_LEFT
    AppManager.graphics.addChild(message);

    const message2 = new Text(
      'LAT: 35.7 ',
      {
        fontFamily: "Inter",
        // fontFamily: "DIN Alternate Bold",
        fontWeight: "300",
        fill: 0xffffff,
        fontSize: 120,
        letterSpacing: -0.25
        , align: 'left',
      }
    );
    message2.x = ScreenHelper.LEFT_SCREEN_LEFT;
    message2.y = 110
    AppManager.graphics.addChild(message2);

    AppManager.app.ticker.add(() => {
      AppManager.stats.begin();

      AppManager.update();

      AppManager.stats.end();
    });


    const layers = this.filterLayer()
    // console.debug(layers);
    Blank.layers = layers

    console.log("[Main]: Before createMapCopyCanvas")
    await this.initMap()
    this.rasterMaps = []
    for (let i = 0; i < Context.NUMBER_MAPS; i++) {
      var rasterMap: RasterMap = {
        id: i, lat: MathUtil.getRandomInclusive(Context.MIN_LAT, Context.MAX_LAT), lng: MathUtil.getRandomInclusive(Context.MIN_LNG, Context.MAX_LNG),

      }
      rasterMap.image = await this.createMapCopyCanvas(rasterMap.id, rasterMap.lat, rasterMap.lng)
      this.rasterMaps.push(rasterMap)
      // console.log(`${rasterMap.id} ${rasterMap.lat} ${rasterMap.lng}`)
    }

    console.log("[Main]: After createMapCopyCanvas")
    // this.addRasterMap()

    this.addMapPanel()

    // AppManager.mapGraphics.alpha = 0.5

  }

  /**
   * レイヤーの中から建物だけを抽出
   * @returns フィルタリング後のレイヤー
   */
  static filterLayer(): any {
    const wantLayer = ['building', 'structurea', 'structurel', 'wstructurea']
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

  static initMap(): Promise<void> {
    return new Promise<void>((resolve) => {
      // const cacheCanvasElement = document.getElementById('cacheCanvas') as HTMLCanvasElement;
      // cacheCanvasElement.setAttribute('width', (Context.MAP_WIDTH * 2 * 10).toString())
      // cacheCanvasElement.setAttribute('height', (Context.MAP_HEIGHT * 2).toString());
      // cacheCanvasElement.setAttribute("style", `display:none;position:absolute;top:1080px;width:1000px;left:0px;`);

      resolve()
    })
  }

  static createMapCopyCanvas(index: number, lat: number, lng: number): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      var mapElement = document.createElement('div')
      document.body.appendChild(mapElement);
      const mapID = `map${index}`
      mapElement.setAttribute("id", mapID)
      const left = 0
      mapElement.setAttribute("style", `z-index:-1000;position:absolute;top:0;left:${left}px;width:${Context.MAP_WIDTH * 2}px;height:${Context.MAP_HEIGHT * 2}px;`);

      AppManager.map = new Map({
        "container": mapID,
        center: [lng, lat],
        zoom: 15,
        maxZoom: 17.99,
        minZoom: 4,
        "pitch": 0,
        "maxPitch": 85,
        "bearing": 0,
        "hash": false,
        "style": Blank as StyleSpecification
      });

      if (AppManager.map) {
        AppManager.map.once('load', function () {
          let data: string;
          var mapElement = document.getElementById(mapID)
          if (mapElement) {
            const mapCanvasElement = mapElement.firstElementChild?.firstElementChild as HTMLCanvasElement
            const cacheCanvasElement = document.getElementById('cacheCanvas') as HTMLCanvasElement;

            if (cacheCanvasElement) {
              const cacheCanvasContext = cacheCanvasElement.getContext('2d')
              if (cacheCanvasContext) {
                data = mapCanvasElement.toDataURL()
                // console.log(data)
                var img = new Image(Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                img.src = data
                // document.body.appendChild(img)

                // cacheCanvasContext.drawImage(img, Context.MAP_WIDTH * 2 * index, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                // cacheCanvasContext.drawImage(img, 0, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2, Context.MAP_WIDTH * 2 * index, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                // document.body.removeChild(mapElement)
                resolve(img)
                // document.body.appendChild(cacheCanvasElement)
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
      }
    });
  }

  static addRasterMap() {
    let i = 0
    const cols = Context.MAPS_COLS
    const rows = Context.MAPS_ROWS
    const scale = 0.5
    const marginY = (Context.STAGE_HEIGHT - Context.MAP_HEIGHT * scale * rows) / (rows + 1)
    const marginX = (Context.STAGE_WIDTH - Context.MAP_WIDTH * scale * cols) / (cols + 1)
    AppManager.rasterMaps.forEach(item => {
      console.log("[Main] addRasterMap")
      if (AppManager.mapGraphics) {
        const loadTexture = new Texture(new BaseTexture(item.image))
        const loadSprite = new Sprite(loadTexture)
        // loadSprite.anchor.set(0.5)
        loadSprite.x = marginX + (i % cols) * Context.MAP_WIDTH * scale + marginX * (i % cols)

        loadSprite.y = marginY + Math.floor(i / cols) * Context.MAP_HEIGHT * scale + marginY * Math.floor(i / cols)
        // loadSprite.y = 100
        // console.log(`[Main] addRasterMap  ${item.id} ${loadSprite.x} , ${loadSprite.y}  ${Math.floor(i / cols)}`)

        loadSprite.width = Context.MAP_WIDTH * 0.75
        loadSprite.height = Context.MAP_HEIGHT * 0.75
        AppManager.mapGraphics.addChild(loadSprite)
      }

      i++
    });
  }

  static initTimeline(): void {
    // throttle the frames-per-second to 30
    gsap.ticker.fps(30);
    // const tl = gsap.timeline({})
  }

  static addMapPanel() {
    if (!AppManager.mapGraphics) return
    if (!AppManager.rasterMaps) return

    for (let i = 0; i < Context.NUMBER_MAPS; i++) {
      const mapPanel = new MapPanel(this.rasterMaps[i])

      const indexX = (i % Context.MAPS_COLS)
      const indexY = Math.floor(i / Context.MAPS_COLS)

      const cols = [4, 6, 8, 6, 4]
      const panelSize = (ScreenHelper.UNIT * 6)
      const topMargin = ScreenHelper.UNIT * 2
      const betweenMargin = (ScreenHelper.UNIT * 5)
      const betweenMarginY = (ScreenHelper.UNIT * 4)

      if (indexX < cols[0]) {
        mapPanel.x = ScreenHelper.BACK_SCREEN_LEFT_MARGIN + ScreenHelper.UNIT * 3 + panelSize * indexX + betweenMargin * indexX
      }
      else if (indexX < cols[0] + cols[1]) {
        mapPanel.x = ScreenHelper.LEFT_SCREEN_LEFT_MARGIN + ScreenHelper.UNIT * 5 + panelSize * (indexX - cols[0]) + betweenMargin * (indexX - cols[0])
      }
      else if (indexX < cols[0] + cols[1] + cols[2]) {
        mapPanel.x = ScreenHelper.FRONT_SCREEN_LEFT_MARGIN + ScreenHelper.UNIT * 4 + panelSize * (indexX - (cols[0] + cols[1])) + betweenMargin * (indexX - (cols[0] + cols[1]))
      }
      else if (indexX < cols[0] + cols[1] + cols[2] + cols[3]) {
        mapPanel.x = ScreenHelper.RIGHT_SCREEN_LEFT_MARGIN + ScreenHelper.UNIT * 5 + panelSize * (indexX - (cols[0] + cols[1] + cols[2])) + betweenMargin * (indexX - (cols[0] + cols[1] + cols[2]))
      }
      else {
        mapPanel.x = ScreenHelper.BACK_SCREEN_RIGHT_MARGIN + ScreenHelper.UNIT * 3 + panelSize * (indexX - (cols[0] + cols[1] + cols[2] + cols[3])) + betweenMargin * (indexX - (cols[0] + cols[1] + cols[2] + cols[3]))
      }

      mapPanel.y = topMargin + indexY * panelSize + betweenMarginY * indexY
      // console.log(`[Main:addMapPanel]: ${indexX} ${ScreenHelper.BACK_SCREEN_LEFT_MARGIN}`)

      AppManager.mapGraphics.addChild(mapPanel)
      mapPanel.Start()
    }

  }


  static update(): void {

  }

}

window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded")
  AppManager.init()
});
