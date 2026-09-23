"use strict";
GameApp.renderers.TerrainRenderer = class {
  constructor() { this.time = 0; this.soilCache = new Map(); }
  update(dt) { this.time += dt; }
  noise(i) { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

  islandPath(ctx, w, h) {
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(w - 16, 0);
    ctx.quadraticCurveTo(w, 0, w, 16);
    ctx.bezierCurveTo(w * 0.94, h * 1.1, w * 0.7, h * 1.65, w * 0.5, h * 1.5);
    ctx.bezierCurveTo(w * 0.28, h * 1.7, w * 0.05, h * 1.05, 0, 16);
    ctx.quadraticCurveTo(0, 0, 16, 0); ctx.closePath();
  }

  soil(ctx, x, y, width, height, island) {
    const key = `${width}:${height}:${island}`;
    if (!this.soilCache.has(key)) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(width + 4); canvas.height = Math.ceil(height * (island ? 1.8 : 1) + 4);
      const c = canvas.getContext("2d");
      c.translate(2, 2);
      if (island) this.islandPath(c, width, height);
      else { c.beginPath(); c.rect(0, 0, width, height); }
      c.save(); c.clip();
      const fill = c.createLinearGradient(0, 0, 0, canvas.height);
      fill.addColorStop(0, "#9c7059"); fill.addColorStop(0.25, "#745046"); fill.addColorStop(1, "#342f45");
      c.fillStyle = fill; c.fillRect(0, 0, width, canvas.height);
      // Broad, gently undulating strata make the soil read as an illustration.
      for (let layer = 0; layer < 4; layer++) {
        const top = 21 + layer * height * 0.3;
        c.fillStyle = ["#92684f", "#694b49", "#59434b", "#423748"][layer];
        c.beginPath(); c.moveTo(0, top);
        for (let px = 0; px < width; px += 60) c.quadraticCurveTo(px + 30, top + Math.sin(px * 0.018 + layer) * 17, px + 60, top + Math.sin((px + 60) * 0.018 + layer) * 10);
        c.lineTo(width, canvas.height); c.lineTo(0, canvas.height); c.closePath(); c.fill();
      }
      for (let i = 0; i < width * height / 3800; i++) {
        const px = this.noise(i + 8) * width, py = 25 + this.noise(i + 96) * (canvas.height - 25);
        const r = 2 + this.noise(i + 44) * 7;
        c.fillStyle = i % 3 ? "#aa7b63" : "#463747";
        c.beginPath(); c.ellipse(px, py, r * 1.5, r, this.noise(i) * 2, 0, Math.PI * 2); c.fill();
        c.strokeStyle = "#c29470"; c.lineWidth = 1.2;
        c.beginPath(); c.ellipse(px, py - 1, r, r * 0.65, 0, Math.PI * 1.1, Math.PI * 1.8); c.stroke();
      }
      // Fine roots descend from the turf, clipped to the floating island.
      c.strokeStyle = "#c19970"; c.lineWidth = 1.6; c.globalAlpha = 0.45;
      for (let px = 24; px < width; px += 67) {
        const length = 22 + this.noise(px) * 29;
        c.beginPath(); c.moveTo(px, 8); c.bezierCurveTo(px - 9, 26, px + 13, 29, px + 3, length + 13);
        c.moveTo(px + 1, 26); c.quadraticCurveTo(px + 10, 31, px + 17, 30); c.stroke();
      }
      c.restore();
      if (island) { this.islandPath(c, width, height); c.strokeStyle = "#433747"; c.lineWidth = 3; c.stroke(); }
      if (this.soilCache.size > 24) this.soilCache.clear();
      this.soilCache.set(key, canvas);
    }
    ctx.drawImage(this.soilCache.get(key), x - 2, y - 2);
  }

  grass(ctx, x, y, width, size) {
    ctx.save(); ctx.translate(x, y);
    // Scalloped moss edge and its shadow hang over the soil.
    ctx.fillStyle = "rgba(30,42,39,0.38)"; ctx.beginPath(); ctx.roundRect(0, 1, width, size + 8, 9); ctx.fill();
    const fill = ctx.createLinearGradient(0, -5, 0, size + 7);
    fill.addColorStop(0, "#bbdf8c"); fill.addColorStop(0.3, "#80b76e"); fill.addColorStop(1, "#3d7460");
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(width, 0); ctx.lineTo(width, size * 0.5);
    for (let px = width; px > 0; px -= 20) {
      const left = Math.max(0, px - 20);
      ctx.quadraticCurveTo((px + left) / 2, size * (0.8 + this.noise(px) * 0.5), left, size * 0.55);
    }
    ctx.closePath(); ctx.fill();
    // Filled curved leaves, in three shades, share a slow breeze.
    for (let layer = 0; layer < 2; layer++) for (let px = 5; px < width - 4; px += 10) {
      const seed = px + x * 0.17 + layer * 57;
      const h = size * (0.4 + this.noise(seed) * 0.85) * (layer ? 0.7 : 1);
      const sway = Math.sin(this.time * 1.55 + (px + x) * 0.012) * h * 0.19;
      const lean = (this.noise(seed + 5) - 0.5) * 13 + sway;
      const base = layer ? 7 : 2;
      ctx.fillStyle = ["#60996a", "#8fc77d", "#bddf91"][(Math.floor(px / 10) + layer) % 3];
      ctx.beginPath(); ctx.moveTo(px - 3, base);
      ctx.quadraticCurveTo(px - 5, -h * 0.5, px + lean, -h);
      ctx.quadraticCurveTo(px + 1 + lean * 0.3, -h * 0.22, px + 4, base); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = "rgba(222,241,163,0.55)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (let px = 12; px < width - 12; px += 32) { ctx.beginPath(); ctx.moveTo(px, 3); ctx.quadraticCurveTo(px + 5, 0, px + 12, 3); ctx.stroke(); }
    ctx.restore();
  }
  drawPlatform(ctx, platform) {
    this.soil(ctx, platform.x, platform.y, platform.width, platform.height, true);
    this.grass(ctx, platform.x, platform.y, platform.width, Math.min(GameApp.config.game.environment.grassHeight, platform.height * 0.55));
  }
  drawGround(ctx, x, y, width, height) {
    this.soil(ctx, x, y, width, height, false);
    this.grass(ctx, x, y, width, GameApp.config.game.environment.grassHeight * 1.25);
  }
};
