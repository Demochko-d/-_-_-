"use strict";
GameApp.scenes.MainMenuScene = class {
  constructor(game) { this.game = game; this.frame = 0; }
  enter() {
    this.game.clearCanvas();
    this.game.audio.playMusic("menu");
    this.game.root.innerHTML = '<section class="panel hero-panel"><div class="hero-copy"><span class="eyebrow">Сновидение зовёт</span><h1>Хранитель<br><em>сна</em></h1><p>Защити портал от созданий, пришедших из-за границы сна.</p><div class="menu-actions"><button id="play">Играть</button><button id="almanac">Альманах</button><button id="how-to-play">Как играть</button><button id="settings">Настройки</button></div></div><div class="menu-splitter" aria-hidden="true"><canvas class="menu-splitter-canvas" width="430" height="460"></canvas></div></section>';
    this.game.root.querySelector("#play").onclick = () => this.game.sceneManager.change(GameApp.scenes.LevelSelectScene);
    this.game.root.querySelector("#almanac").onclick = () => this.game.sceneManager.change(GameApp.scenes.AlmanacScene);
    this.game.root.querySelector("#how-to-play").onclick = () => this.game.sceneManager.change(GameApp.scenes.HowToPlayScene);
    this.game.root.querySelector("#settings").onclick = () => this.game.sceneManager.change(GameApp.scenes.SettingsScene);
    this.canvas = this.game.root.querySelector(".menu-splitter-canvas");
    this.enemy = new GameApp.entities.Enemy("splitter", { x: 88, y: 74, scale: 7 });
    this.enemy.visualFacing = -1; this.enemy.facing = -1;
    let previous = performance.now();
    const animate = (now) => {
      if (!this.canvas?.isConnected) return;
      const dt = Math.min(.05, (now - previous) / 1000); previous = now;
      this.enemy.animation.setState("idle"); this.enemy.animation.update(dt);
      const ctx = this.canvas.getContext("2d"); ctx.reset?.(); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "rgba(101,71,101,.16)"; ctx.beginPath(); ctx.ellipse(215, 401, 132, 24, 0, 0, Math.PI * 2); ctx.fill();
      GameApp.renderers.EnemyRenderer.draw(ctx, this.enemy);
      this.frame = requestAnimationFrame(animate);
    };
    this.frame = requestAnimationFrame(animate);
  }
  exit() { cancelAnimationFrame(this.frame); this.canvas = null; }
};
