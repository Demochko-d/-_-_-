"use strict";
GameApp.renderers.TerrainRenderer = class {
  constructor() { this.time = 0; this.soilCache = new Map(); }
  update(dt) { this.time += dt; }
  islandPath(ctx, w, h) {
    ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(w - 15, 0);
    ctx.quadraticCurveTo(w, 0, w, 14);
    ctx.bezierCurveTo(w * .95, h, w * .67, h * 1.5, w * .5, h * 1.45);
    ctx.bezierCurveTo(w * .3, h * 1.52, w * .04, h, 0, 14);
    ctx.quadraticCurveTo(0, 0, 15, 0); ctx.closePath();
  }
  soil(ctx, x, y, width, height, island) {
    const key = `${width}:${height}:${island}`;
    const env = GameApp.config.game.environment;
    if (!this.soilCache.has(key)) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(width + 8); canvas.height = Math.ceil(height * (island ? 1.6 : 1) + 8);
      const c = canvas.getContext("2d"); c.translate(4, 4);
      if (island) this.islandPath(c, width, height);
      else { c.beginPath(); c.rect(0, 0, width, height); }
      c.fillStyle = env.soilTop; c.fill(); c.save(); c.clip();
      c.fillStyle = env.soilBottom; c.beginPath(); c.moveTo(0, height * .6);
      c.bezierCurveTo(width * .25, height * .22, width * .64, height * 1.1, width, height * .42);
      c.lineTo(width, canvas.height); c.lineTo(0, canvas.height); c.closePath(); c.fill();
      c.strokeStyle = "#efb7c6"; c.lineWidth = 4; c.lineCap = "round";
      for (let px = 38; px < width - 20; px += 116) {
        const py = height * (.38 + .12 * Math.sin(px));
        c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 7, py + 4, px + 15, py); c.stroke();
      }
      c.restore();
      if (island) { this.islandPath(c, width, height); c.strokeStyle = env.outline; c.lineWidth = 4; c.stroke(); }
      if (this.soilCache.size > 24) this.soilCache.clear();
      this.soilCache.set(key, canvas);
    }
    ctx.drawImage(this.soilCache.get(key), x - 4, y - 4);
  }
  grass(ctx, x, y, width, size) {
    const env = GameApp.config.game.environment;
    ctx.save(); ctx.translate(x, y); ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.fillStyle = env.grassDark; ctx.strokeStyle = env.outline; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(width, 1); ctx.lineTo(width, size * .55);
    const steps = Math.ceil(width / 32);
    for (let i = steps; i > 0; i--) {
      const right = width * i / steps, left = width * (i - 1) / steps;
      ctx.bezierCurveTo(right - 4, size * 1.25, left + 5, size * 1.25, left, size * .55);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = env.grassLight; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(width - 4, 2); ctx.stroke();
    for (let px = 18; px < width - 12; px += 42) {
      const sway = Math.sin(this.time * 1.7 + (x + px) * .014) * 4;
      const h = size * (.65 + .18 * Math.sin(px * 2));
      ctx.fillStyle = env.grassLight; ctx.strokeStyle = env.outline; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(px - 9, 2);
      ctx.quadraticCurveTo(px - 12 + sway, -h * .5, px - 7 + sway, -h);
      ctx.quadraticCurveTo(px + sway, -h * .6, px + 1, -2);
      ctx.quadraticCurveTo(px + 4 + sway, -h * .85, px + 10 + sway, -h * .7);
      ctx.quadraticCurveTo(px + 10, -2, px + 9, 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  drawPlatform(ctx, p) {
    this.soil(ctx, p.x, p.y, p.width, p.height, true);
    this.grass(ctx, p.x, p.y, p.width, Math.min(GameApp.config.game.environment.grassHeight, p.height * .55));
  }
  drawGround(ctx, x, y, width, height) {
    this.soil(ctx, x, y, width, height, false);
    this.grass(ctx, x, y, width, GameApp.config.game.environment.grassHeight * 1.25);
  }
};
