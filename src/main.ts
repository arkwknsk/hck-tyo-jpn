import { Map, StyleSpecification } from 'maplibre-gl';
import { Application, Assets, Graphics, Text } from 'pixi.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import Blank from './assets/o186ulfx6.json';
import { Context } from './Context';
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

  private static map: Map | undefined;

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

    const layers = this.filterLayer();
    // console.debug(layers);
    Blank.layers = layers;

    AppManager.map = new Map({
      "container": "map",
      center: [139.767144, 35.680621],
      zoom: 14,
      maxZoom: 17.99,
      minZoom: 4,
      "pitch": 0,
      "maxPitch": 85,
      // "bearing": 22,
      "bearing": 0,
      "hash": false,
      "style": Blank as StyleSpecification
    });

    AppManager.map.on('load', function () {
      console.log('Complete Rendering');
    });

    // map.addControl( );
    var map2Element = document.createElement('div');
    document.body.appendChild(map2Element);
    map2Element.setAttribute("id", "map2")
    map2Element.setAttribute("style", "position:absolute;top:0;left:330px;bottom:0;right:0;width:320px;height:320px;");
    const map2 = new Map({
      "container": "map2",
      center: [139.967144, 35.680621],
      zoom: 14,
      maxZoom: 17.99,
      minZoom: 4,
      "pitch": 0,
      "maxPitch": 85,
      // "bearing": 22,
      "bearing": 0,
      "hash": false,
      "style": Blank as StyleSpecification
    });
    map2.on('load', function () {
      console.log('Complete Rendering');
    });
    map2.on('zoom', function () {
      console.log(map2.getZoom());
    });
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
      resolution: 2,
    });

    const app = document.getElementById('app');
    if (app) {
      app.appendChild(appManager.app.view as HTMLCanvasElement)
      console.log("[Main]: Added PIXI")
      appManager.app.stage.sortableChildren = true
    }
    // .on('change', (ev) => {
    //     // this.drawBackground()
    // });

    // await Assets.load({
    //   data: {
    //     weights: ['bold'],
    //   },
    //   src: "DIN_Alternate_Bold.ttf",
    // }
    // ).catch((error) => {
    //   console.log(error.message);
    // })

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

  }

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

}


window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded")
  AppManager.init()
});
