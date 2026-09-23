"use strict";
GameApp.renderers.DreamBackgroundRenderer = class {
  constructor() { this.lightning = []; this.time = 0; this.waveFlash = 0; }

  triggerWave() {
    const config = GameApp.config.game.background;
    this.waveFlash = config.waveFlashDuration;
    this.lightning = Array.from({ length: config.lightningCount }, (_, index) => {
      const startX = this.width * (0.12 + Math.random() * 0.76);
      const endY = this.height * (0.42 + Math.random() * 0.28);
      const points = [{ x: startX, y: -20 }];
      for (let step = 1; step <= 8; step++) points.push({ x: startX + (Math.random() - 0.5) * this.width * 0.1, y: endY * step / 8 });
      return { points, delay: index * 0.16 + Math.random() * 0.15, life: 0.12 + Math.random() * 0.1 };
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update(dt) {
    this.time += dt;
    this.waveFlash = Math.max(0, this.waveFlash - dt);
  }

  draw(ctx, width, height) {
    const config = GameApp.config.game.background;
    ctx.save();
    ctx.fillStyle = config.solidColor; ctx.fillRect(0, 0, width, height);
    this.drawWaveStorm(ctx, width, height);
    ctx.restore();
  }

  drawWaveStorm(ctx, width, height) {
    if (this.waveFlash <= 0) return;
    const duration = GameApp.config.game.background.waveFlashDuration;
    const elapsed = duration - this.waveFlash;
    const fade = Math.min(1, this.waveFlash / 0.75);
    const pulse = 0.7 + Math.sin(elapsed * 9) * 0.18;
    const red = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, width * 0.8);
    red.addColorStop(0, `rgba(255,45,91,${0.2 * fade * pulse})`);
    red.addColorStop(0.55, `rgba(125,13,54,${0.28 * fade})`);
    red.addColorStop(1, `rgba(48,0,23,${0.38 * fade})`);
    ctx.globalAlpha = 1; ctx.fillStyle = red; ctx.fillRect(0, 0, width, height);
    this.lightning.forEach((bolt) => {
      const age = elapsed - bolt.delay;
      if (age < 0 || age > bolt.life) return;
      const alpha = Math.sin((age / bolt.life) * Math.PI);
      ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#ffbfd7"; ctx.shadowColor = "#ff3d83"; ctx.shadowBlur = 30; ctx.lineWidth = 10;
      ctx.beginPath(); bolt.points.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
      ctx.strokeStyle = "#fff8f1"; ctx.shadowBlur = 8; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    });
  }

  drawAtmosphere(ctx, width, height) {
    ctx.save(); ctx.shadowBlur = 0;
    const haze = ctx.createRadialGradient(width * 0.8, height * 0.22, 0, width * 0.8, height * 0.22, width * 0.65);
    haze.addColorStop(0, "rgba(219,191,238,0.18)"); haze.addColorStop(1, "rgba(106,133,181,0)");
    ctx.globalAlpha = 1; ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 6; i++) {
      const x = width * (i * 0.21 - 0.06) + Math.sin(this.time * 0.055 + i * 2) * 22;
      const y = height * (0.16 + (i % 3) * 0.125);
      const w = width * (0.12 + (i % 2) * 0.045);
      const cloud = ctx.createLinearGradient(0, y - 35, 0, y + 28);
      cloud.addColorStop(0, "rgba(225,204,239,0.19)"); cloud.addColorStop(1, "rgba(140,145,187,0.025)");
      ctx.fillStyle = cloud; ctx.beginPath(); ctx.moveTo(x - w, y + 12);
      ctx.bezierCurveTo(x - w, y - 10, x - w * 0.63, y - 19, x - w * 0.42, y - 12);
      ctx.bezierCurveTo(x - w * 0.35, y - 58, x + w * 0.16, y - 62, x + w * 0.3, y - 20);
      ctx.bezierCurveTo(x + w * 0.65, y - 35, x + w, y - 8, x + w, y + 13);
      ctx.bezierCurveTo(x + w * 0.5, y + 33, x - w * 0.7, y + 32, x - w, y + 12); ctx.fill();
    }
    // Quiet distant hills behind the playable islands.
    for (let layer = 0; layer < 2; layer++) {
      ctx.fillStyle = layer ? "rgba(70,89,119,0.18)" : "rgba(96,109,142,0.17)";
      const base = height * (0.73 + layer * 0.055);
      ctx.beginPath(); ctx.moveTo(0, height);
      ctx.lineTo(0, base);
      for (let x = 0; x < width; x += width / 4) ctx.bezierCurveTo(x + width / 12, base - height * 0.16, x + width / 7, base - height * 0.13, x + width / 4, base);
      ctx.lineTo(width, height); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  drawMoon(ctx, x, y, r) {
    ctx.save(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    const halo = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 3.2);
    halo.addColorStop(0, "rgba(252,225,179,0.23)"); halo.addColorStop(0.45, "rgba(235,199,228,0.075)"); halo.addColorStop(1, "rgba(235,199,228,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, Math.PI * 2); ctx.fill();
    const disc = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.1);
    disc.addColorStop(0, "#fffbe3"); disc.addColorStop(0.63, "#f6e6bb"); disc.addColorStop(1, "#c9a3a0");
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.clip();
    for (const [cx, cy, size] of [[-0.36,-0.2,0.2],[0.28,0.35,0.23],[0.43,-0.28,0.12],[-0.14,0.58,0.1],[-0.57,0.27,0.11],[0.07,-0.62,0.075]]) {
      const px = x + cx * r, py = y + cy * r, cr = size * r;
      ctx.fillStyle = "rgba(177,142,145,0.2)";
      ctx.beginPath(); ctx.ellipse(px, py, cr, cr * 0.8, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,251,221,0.6)"; ctx.lineWidth = r * 0.025;
      ctx.beginPath(); ctx.ellipse(px, py + cr * 0.1, cr * 0.95, cr * 0.8, -0.4, 0.1, Math.PI * 0.95); ctx.stroke();
      ctx.fillStyle = "rgba(187,151,145,0.12)";
      ctx.beginPath(); ctx.ellipse(px - cr * 0.1, py - cr * 0.13, cr * 0.65, cr * 0.47, -0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,247,211,0.72)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,238,0.65)"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(x, y, r * 0.9, Math.PI * 1.07, Math.PI * 1.59); ctx.stroke();
    ctx.restore();
  }
};
