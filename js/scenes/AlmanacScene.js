"use strict";
GameApp.scenes.AlmanacScene = class {
  constructor(game) { this.game = game; this.running = false; }
  enter() {
    this.game.clearCanvas();
    this.game.audio.playMusic("menu");
    const enemies = Object.entries(GameApp.config.game.enemies);
    const cards = enemies.map(([kind, enemy]) => '<article class="ghost-card"><canvas width="180" height="170" data-ghost="' + kind + '"></canvas><div class="ghost-copy"><h2>' + enemy.name + '</h2><p class="ghost-description">' + enemy.description + '</p><dl><div><dt>Здоровье</dt><dd>' + enemy.health + '</dd></div><div><dt>Урон</dt><dd>' + enemy.damage + '</dd></div><div><dt>Скорость</dt><dd>' + enemy.speed + '</dd></div><div><dt>Скорость атаки</dt><dd>' + (1 / enemy.attackCooldown).toFixed(2) + ' уд/с</dd></div><div><dt>Урон порталу</dt><dd>' + enemy.portalDamage + '</dd></div></dl></div></article>').join("");
    this.game.root.innerHTML = '<section class="panel almanac-panel"><div class="almanac-head"><div><span class="eyebrow">Обитатели сна</span><h1>Альманах</h1></div><button id="back">← Назад</button></div><div class="ghost-grid">' + cards + '</div></section>';
    this.game.root.querySelector("#back").onclick = () => this.game.sceneManager.change(GameApp.scenes.MainMenuScene);
    this.previews = [...this.game.root.querySelectorAll("[data-ghost]")].map((canvas) => {
      const giant = canvas.dataset.ghost === "gigant";
      const enemy = new GameApp.entities.Enemy(canvas.dataset.ghost, { x: 0, y: 0, scale: giant ? 2.2 : 2.5 });
      enemy.position.x = (canvas.width - enemy.width) / 2; enemy.position.y = (canvas.height - enemy.height) / 2 + (giant ? 18 : 8);
      return { canvas, enemy };
    });
    this.running = true; this.lastPreviewTime = performance.now();
    const animate = (time) => { if (!this.running) return; const dt = Math.min((time - this.lastPreviewTime) / 1000, 0.05); this.lastPreviewTime = time; this.previews.forEach(({ canvas, enemy }) => { enemy.animation.setState("idle"); enemy.animation.update(dt); const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height); enemy.draw(ctx, GameApp.renderers.EnemyRenderer); }); requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
  }
  exit() { this.running = false; this.game.clearCanvas(); }
};
