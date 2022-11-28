import { Application, Graphics } from "pixi.js";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import Tweakpane from "tweakpane";
import { Context } from "./Context";

import './main.css';
import './reset.css';

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `<div><h1>HCK/TYO/JPN</h1></div>`;

export class AppManager {
  private app: Application
  private graphics: Graphics
  
  private stats: Stats = Stats();

  static readonly INPUTS = {
    fpsMonitor: false,
    isGrid: true,
    h: 140,
    s: 0,
    l: 0.0
  };
  public constructor() {

    this.app = new Application({
      width: Context.STAGE_WIDTH,
      height: Context.STAGE_HEIGHT,
      backgroundColor: '#222222',

      antialias: true,
      autoDensity: true, // !!!
      resolution: 2,
    });
    
    document.body.appendChild(this.app.view)
    this.app.stage.sortableChildren = true

    this.graphics = new Graphics()
    let left: number = 0
    this.app.stage.addChild(this.graphics);
    this.graphics.beginFill(0x444444);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    left += 1549

    this.graphics.beginFill(0x555555);
    this.graphics.drawRect(left,0,859,1080)
    this.graphics.endFill()
    left += 859

    this.graphics.beginFill(0x666666);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    left += 1549

    this.graphics.beginFill(0x7f7f7f);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    left += 1549

    this.graphics.beginFill(0x707070);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    left += 1549

    this.graphics.beginFill(0x666666);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    left += 1549

    this.graphics.beginFill(0x555555);
    this.graphics.drawRect(left,0,859,1080)
    this.graphics.endFill()
    left += 859

    this.graphics.beginFill(0x444444);
    this.graphics.drawRect(left,0,1549,1080)
    this.graphics.endFill()
    
    this.init();

  }

  private init = (): void => {
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
    const pane = new Tweakpane({
      title: "HCK/TYO/JPN",
    });


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
