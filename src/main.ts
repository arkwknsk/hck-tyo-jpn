import { Map, StyleSpecification } from 'maplibre-gl';
import { Application, Assets, Graphics, Text } from 'pixi.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import Blank from './assets/o186ulfx6.json';
import { Context } from './Context';
import { RasterMap } from './MapType';
import { ScreenHelper } from './ScreenHelper';

import './main.css';
import './reset.css';

/**
 * Main Class
 */
export class AppManager {
  private app: Application | undefined
  private graphics: Graphics | undefined

  private stats: Stats;

  private static map: Map | undefined

  private static mapDataUrl: String[]

  static readonly INPUTS = {
    fpsMonitor: false,
    isGrid: true,
    h: 140,
    s: 0,
    l: 0.0
  };

  private constructor() {
    this.stats = Stats()
  }


  static init = async () => {
    const appManager = new AppManager()
    appManager.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(appManager.stats.dom);
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

    appManager.app = new Application({
      width: Context.STAGE_WIDTH,
      height: Context.STAGE_HEIGHT,
      backgroundColor: '#222222',

      antialias: true,
      autoDensity: true, // !!!
      resolution: 1,
    });

    const app = document.getElementById('app');
    if (app) {
      app.appendChild(appManager.app.view as HTMLCanvasElement)
      console.log("[Main]: Added PIXI")
      appManager.app.stage.sortableChildren = true
    }

    await Assets.load({
      src: "Inter-VariableFont_slnt,wght.ttf",
    }
    );
    console.log("[Main]: Loaded fonts")

    appManager.graphics = new Graphics()
    const areaGraphics = ScreenHelper.GetScreenArea()
    appManager.graphics.addChild(areaGraphics)
    const grids = ScreenHelper.GetGrids()
    appManager.graphics.addChild(grids)

    appManager.app.stage.addChild(appManager.graphics)

    const message = new Text(
      'HCK/TYO/JPN',
      {
        fontFamily: "Inter",
        // fontFamily: "DIN Al",
        fontWeight: "600",
        fill: 0xffffff,
        fontSize: 120,
        letterSpacing: -0.25
        , align: 'left',
      }
    );
    message.x = ScreenHelper.FRONT_SCREEN_LEFT
    appManager.graphics.addChild(message);

    const message2 = new Text(
      'LAT: 35.7 ',
      {
        fontFamily: "Inter",
        // fontFamily: "DIN Alternate Bold",
        fontWeight: "700",
        fill: 0xffffff,
        fontSize: 120,
        letterSpacing: -0.25
        , align: 'left',
      }
    );
    message2.x = ScreenHelper.LEFT_SCREEN_LEFT;
    message2.y = 110
    appManager.graphics.addChild(message2);
    const layers = this.filterLayer()
    // console.debug(layers);
    Blank.layers = layers

    console.log("[Main]: Before createMapCopyCanvas")
    await this.initMap()
    for (let i = 0; i < Context.NUMBER_MAPS; i++) {
      var rasterMap: RasterMap = {
        id: i, lat: 35.6895014 + Math.random() * i * 0.025, lng: 139.6917337 + Math.random() * i * 0.025,

      }
      rasterMap.image = await this.createMapCopyCanvas(rasterMap.id, rasterMap.lat, rasterMap.lng)
      console.log(`${rasterMap.id} ${rasterMap.lat} ${rasterMap.lng}`)
    }

    console.log("[Main]: After createMapCopyCanvas")

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
      const cacheCanvasElement = document.getElementById('cacheCanvas') as HTMLCanvasElement;
      cacheCanvasElement.setAttribute('width', (Context.MAP_WIDTH * 2 * 10).toString())
      cacheCanvasElement.setAttribute('height', (Context.MAP_HEIGHT * 2).toString());
      cacheCanvasElement.setAttribute("style", `position:absolute;top:1080px;width:1000px;left:0px;`);

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
      mapElement.setAttribute("style", `position:absolute;top:0;left:${left}px;width:${Context.MAP_WIDTH * 2}px;height:${Context.MAP_HEIGHT * 2}px;`);

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
                console.log(`[Main:createMapCopyCanvas]: setTimeout index:${index}`)

                data = mapCanvasElement.toDataURL()
                console.log(data)
                var img = new Image(Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                img.src = data
                // document.body.appendChild(img)

                // cacheCanvasContext.drawImage(img, Context.MAP_WIDTH * 2 * index, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                cacheCanvasContext.drawImage(img, 0, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2, Context.MAP_WIDTH * 2 * index, 0, Context.MAP_WIDTH * 2, Context.MAP_HEIGHT * 2)
                document.body.removeChild(mapElement)
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


}


window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded")
  AppManager.init()
});
