"use strict";
GameApp.core.Game = class {
  constructor(root) {
    this.root = root;
    this.uiSettingsKey = "portalGuardUiSettings";
    try { Object.assign(GameApp.config.game.ui, JSON.parse(localStorage.getItem(this.uiSettingsKey) || "{}")); } catch {}
    document.documentElement.style.setProperty("--heading-scale-x", GameApp.config.game.typography.headingScaleX);
    document.documentElement.style.setProperty("--game-background", GameApp.config.game.background.solidColor);
    this.input = new GameApp.core.InputManager();
    this.events = new GameApp.utils.EventBus();
    this.audio = new GameApp.audio.AudioManager(GameApp.config.game.audio);
    this.audio.bind(this.events);
    this.levels = new GameApp.core.LevelManager();
    this.progress = new GameApp.core.ProgressManager();
    this.sceneManager = new GameApp.core.SceneManager(this);
    this.lastTime = 0;
  }
  setPlayerHealthBarVisible(visible) {
    GameApp.config.game.ui.showPlayerHealthBar = !!visible;
    try { localStorage.setItem(this.uiSettingsKey, JSON.stringify(GameApp.config.game.ui)); } catch {}
  }
  start() { requestAnimationFrame((time) => this.loop(time)); }
  loop(time) { const dt = Math.min((time - this.lastTime) / 1000 || 0, 0.05); this.lastTime = time; this.sceneManager.update(dt); this.sceneManager.draw(this.ctx); requestAnimationFrame((next) => this.loop(next)); }
  setCanvas() { const c = GameApp.config.game.canvas; this.root.innerHTML = '<canvas width="' + c.logicalWidth + '" height="' + c.logicalHeight + '"></canvas>'; this.canvas = this.root.querySelector("canvas"); this.ctx = this.canvas.getContext("2d"); this.sceneManager.current?.resize?.(c.logicalWidth, c.logicalHeight); }
  clearCanvas() { this.ctx = null; this.canvas = null; }
};
