import { Application, Assets, Graphics, Text } from "pixi.js";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import { Context } from "./Context";
import { ScreenHelper } from "./ScreenHelper";

import './main.css';
import './reset.css';

/**
 * Main Class
 */
export class AppManager {
  private app: Application | undefined
  private graphics: Graphics | undefined

  private stats: Stats = Stats()

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

    document.body.appendChild(appManager.app.view as HTMLCanvasElement)
    appManager.app.stage.sortableChildren = true
    // .on('change', (ev) => {
    //     // this.drawBackground()
    // });

    await Assets.load({
      data: {
        weights: ['bold'],
      },
      src: "DIN_Alternate_Bold.ttf",
    }
    );

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
        // fontFamily: "Inter",
        fontFamily: "DIN Alternate Bold",
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

}

window.addEventListener("DOMContentLoaded", () => {
  console.log("[Main.ts]: DOMContentLoaded")
  AppManager.init()
});
