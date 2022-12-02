import maplibregl from 'maplibre-gl';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import blank from './assets/blank.json';

import './reset.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div><h1>HCK/TYO/JPN</h1></div>`;

export class AppManager {
  private stats: Stats = Stats();

  static readonly INPUTS = {
    fpsMonitor: false,
    isGrid: true,
    h: 140,
    s: 0,
    l: 0.0
  };
  public constructor() {

    this.init();

  }

  private init = (): void => {
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
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
    // const map = new maplibregl.Map({
      new maplibregl.Map({
      "container": "map",
      center: [139.767144, 35.680621],
      zoom: 15,
      maxZoom: 17.99,
      minZoom: 4,
      "pitch": 0,
      "maxPitch": 85,
      // "bearing": 22,
      "bearing": 0,
      "hash": true,
      "style": blank
    });

    // map.addControl( );

    // let hoveredStateId = null;
    // style.layers.filter(a => a.id.indexOf("bldg") === 0).forEach(layer => {
    //   const id = layer.id;
    //   // When a click event occurs on a feature in the places layer, open a popup at the
    //   // location of the feature, with description HTML from its properties.

    // });



    pane.addInput(AppManager.INPUTS, 'h', {
      min: 0,
      max: 360,
      step: 1.0
    });
    // .on('change', (ev) => {
    //     // this.drawBackground()
    // });
  }

}

window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded");
  new AppManager();
});
