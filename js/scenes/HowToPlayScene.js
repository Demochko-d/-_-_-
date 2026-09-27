"use strict";
GameApp.scenes.HowToPlayScene = class {
  constructor(game) { this.game = game; this.frame = 0; }
  enter() {
    this.game.clearCanvas();
    this.game.audio.playMusic("menu");
    this.game.root.innerHTML = '<section class="panel how-to-panel"><div class="almanac-head how-to-head"><h1>Как играть</h1><button id="back">← Назад</button></div><div class="how-to-body"><div class="how-to-content" id="how-to-content"></div><div class="menu-brute" aria-hidden="true"><canvas class="menu-brute-canvas" width="430" height="460"></canvas></div></div></section>';
    this.game.root.querySelector("#how-to-content").textContent = GameApp.config.game.help.text;
    this.game.root.querySelector("#back").onclick = () => this.game.sceneManager.change(GameApp.scenes.MainMenuScene);
    this.canvas = this.game.root.querySelector(".menu-brute-canvas");
    const scale = 7 * GameApp.config.game.enemies.splitter.width / GameApp.config.game.enemies.brute.width;
    this.enemy = new GameApp.entities.Enemy("brute", { x: 89, y: 74, scale });
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
    animate(performance.now());
  }
  exit() { cancelAnimationFrame(this.frame); this.canvas = null; }
};
