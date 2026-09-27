"use strict";
GameApp.renderers.DreamBackgroundRenderer = class {
  constructor() { this.lightning = []; this.time = 0; this.waveFlash = 0; }
  resize(width, height) { this.width = width; this.height = height; }
  update(dt) { this.time += dt; this.waveFlash = Math.max(0, this.waveFlash - dt); }
  triggerWave() {
    const config = GameApp.config.game.background;
    this.waveFlash = config.waveFlashDuration;
    this.lightning = Array.from({ length: config.lightningCount }, (_, i) => {
      const x = this.width * (.12 + Math.random() * .76), y = this.height * (.42 + Math.random() * .28);
      return { points: Array.from({ length: 9 }, (_, j) => ({ x: x + (Math.random() - .5) * this.width * .07, y: y * j / 8 })), delay: i * .16, life: .2 };
    });
  }
  cloud(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = "#fff0df"; ctx.strokeStyle = "#dba9c1"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-90, 18);
    ctx.bezierCurveTo(-115, -12, -71, -42, -46, -25);
    ctx.bezierCurveTo(-38, -80, 39, -79, 49, -29);
    ctx.bezierCurveTo(92, -47, 119, 0, 91, 20);
    ctx.bezierCurveTo(51, 38, -55, 38, -90, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  draw(ctx, width, height) {
    const t = this.time;
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#e9b6ce"); sky.addColorStop(.5, "#f5d0d2"); sky.addColorStop(1, "#fff0d5");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
    // Menu colours and star motifs, with slow movement behind the arena.
    ctx.save(); ctx.translate(width * .76, height * .23 + Math.sin(t * .4) * 5);
    ctx.rotate(-.22); ctx.fillStyle = "#fff2c5"; ctx.strokeStyle = "#ba83a5"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, height * .082, .6, Math.PI * 1.76);
    ctx.bezierCurveTo(-height * .012, -height * .036, -height * .027, height * .034, height * .068, height * .046);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    for (let i = 0; i < 24; i++) {
      const x = width * ((i * .6180339 + .12) % 1), y = height * (.1 + ((i * .381966) % 1) * .49);
      const r = (4 + i % 3 * 3) * (.85 + Math.sin(t * .9 + i) * .15);
      ctx.save(); ctx.translate(x, y + Math.sin(t * .45 + i) * 4); ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = .38 + Math.sin(t * .7 + i) * .17;
      ctx.fillStyle = i % 3 ? "#fff8e5" : "#b776a0";
      ctx.beginPath(); ctx.roundRect(-r / 2, -r / 2, r, r, 2); ctx.fill(); ctx.restore();
    }
    const cloudTracks = [
      { start: -.08, y: .24, scale: .65, speed: .018 },
      { start: .18, y: .34, scale: .92, speed: .012 },
      { start: .47, y: .21, scale: 1.18, speed: .009 },
      { start: .71, y: .38, scale: .78, speed: .015 },
      { start: .91, y: .28, scale: .7, speed: .021 }
    ];
    cloudTracks.forEach((cloud, i) => {
      const margin = 150 * cloud.scale;
      const travel = width + margin * 2;
      const x = -margin + ((width * cloud.start + t * width * cloud.speed + margin) % travel + travel) % travel;
      const y = height * cloud.y + Math.sin(t * .28 + i * 1.7) * 5;
      this.cloud(ctx, x, y, cloud.scale);
    });
    for (let layer = 0; layer < 2; layer++) {
      const base = height * (.72 + layer * .08);
      ctx.fillStyle = layer ? "#ba9ac6" : "#d6afd0"; ctx.strokeStyle = layer ? "#aa8ab8" : "#c79cc1"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-10, height); ctx.lineTo(-10, base);
      for (let i = 0; i < 6; i++) {
        const x = i * width / 5, drift = Math.sin(t * .13 + i + layer) * 6;
        ctx.bezierCurveTo(x + width * .04, base - height * .23 + drift, x + width * .13, base - height * .23, x + width * .2, base);
      }
      ctx.lineTo(width + 10, height); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const x = width * (.17 + i * .32), y = height * (.44 + i % 2 * .07) + Math.sin(t * .55 + i * 2) * 8;
      ctx.fillStyle = "#be91bc"; ctx.strokeStyle = "#a980ae"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x - 39, y); ctx.bezierCurveTo(x - 28, y + 42, x + 20, y + 42, x + 39, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#ecd2df"; ctx.beginPath(); ctx.ellipse(x, y, 40, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    this.drawWaveStorm(ctx, width, height); ctx.restore();
  }
  drawWaveStorm(ctx, width, height) {
    if (this.waveFlash <= 0) return;
    const elapsed = GameApp.config.game.background.waveFlashDuration - this.waveFlash;
    ctx.save(); ctx.fillStyle = `rgba(167,37,102,${Math.min(1, this.waveFlash / .75) * .17})`; ctx.fillRect(0, 0, width, height);
    for (const bolt of this.lightning) {
      const age = elapsed - bolt.delay;
      if (age < 0 || age > bolt.life) continue;
      ctx.globalAlpha = Math.sin(age / bolt.life * Math.PI); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.strokeStyle = "#de629e"; ctx.lineWidth = 9;
      ctx.beginPath(); bolt.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
      ctx.strokeStyle = "#fff0df"; ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
  }
};
