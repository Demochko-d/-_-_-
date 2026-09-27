"use strict";
GameApp.renderers.PortalRenderer = {
  energy(ctx, x, y, w, h, time, hostile, strength = 1) {
    if (strength <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + Math.sin(time * 2.1) * .025, 1 + Math.cos(time * 2.1) * .018);
    ctx.globalAlpha *= strength;
    ctx.strokeStyle = hostile ? "#794669" : "#654765"; ctx.lineWidth = Math.max(2, w * .045);
    ctx.fillStyle = hostile ? "#bb548a" : "#9876d7";
    ctx.beginPath(); ctx.ellipse(0, 0, w * .5, h * .5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.save(); ctx.clip();
    ctx.fillStyle = hostile ? "#e986ba" : "#c5a3ef";
    ctx.beginPath(); ctx.ellipse(Math.sin(time) * w * .12, -h * .05, w * .37, h * .39, -.16, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hostile ? "#ffd5e6" : "#fff0d5"; ctx.lineWidth = Math.max(2, w * .035); ctx.lineCap = "round";
    for (let i = 0; i < 2; i++) {
      ctx.beginPath(); ctx.ellipse(0, 0, w * (.22 + i * .14), h * (.29 + i * .12), Math.sin(time * .7) * .18,
        time * .85 + i * Math.PI, time * .85 + i * Math.PI + Math.PI * 1.15); ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      const p = (time * .2 + i / 5) % 1;
      ctx.globalAlpha = strength * Math.sin(p * Math.PI) * .8; ctx.fillStyle = "#fff5dc";
      ctx.beginPath(); ctx.arc(Math.sin(i * 2.4 + time * .5) * w * .29, h * (.5 - p), w * .035, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore(); ctx.restore();
  },
  stone(ctx, x, y, w, h, angle, flash, cracked) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.lineJoin = "round";
    ctx.fillStyle = flash ? "#fff1df" : "#b5adc9"; ctx.strokeStyle = "#654765"; ctx.lineWidth = Math.max(2, w * .13);
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, w * .2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#f7e9ed"; ctx.lineWidth = Math.max(1.5, w * .09); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-w * .27, -h * .25); ctx.lineTo(w * .2, -h * .25); ctx.stroke();
    if (cracked) {
      ctx.strokeStyle = "#795b7e"; ctx.beginPath(); ctx.moveTo(w * .06, -h * .47); ctx.lineTo(-w * .12, 0); ctx.lineTo(w * .13, h * .23); ctx.stroke();
    }
    ctx.restore();
  },
  draw(ctx, entity) {
    const w = entity.width, h = entity.height, stage = entity.damageStage || 0;
    ctx.save(); ctx.translate(entity.position.x, entity.position.y);
    ctx.fillStyle = "rgba(101,71,101,.18)"; ctx.beginPath(); ctx.ellipse(w / 2, h * .98, w * .7, h * .07, 0, 0, Math.PI * 2); ctx.fill();
    const strength = entity.health > 0 ? 1 - stage * .12 : Math.max(0, entity.hitFlash / .28);
    this.energy(ctx, w * .5, h * .53, w * .7, h * .86, entity.time, false, strength);
    const shake = entity.hitFlash > 0 ? Math.sin(entity.time * 48) * w * .015 * entity.hitFlash / .28 : 0;
    for (const stone of entity.getStoneLayout()) {
      if (stone.stage <= stage) continue;
      this.stone(ctx, stone.x * w + shake, stone.y * h, w * .25, h * .17, stone.angle, entity.hitFlash > .2, stage > 0 && stone.stage === stage + 1);
    }
    for (const stone of entity.debris) {
      this.stone(ctx, stone.x * w, stone.y * h, w * .21, h * .14, stone.angle, false, true);
      if (stone.age < .65) {
        ctx.save(); ctx.globalAlpha = (1 - stone.age / .65) * .5; ctx.fillStyle = "#fff0df";
        ctx.beginPath(); ctx.arc(stone.x * w, stone.y * h, w * (.08 + stone.age * .15), 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
  },
  drawSpawn(ctx, x, groundY, w, h, time, side, pulseTime = 0) {
    ctx.save();
    const duration = GameApp.config.game.spawn.appearanceDuration;
    const pulse = pulseTime > 0 ? Math.sin((1 - pulseTime / duration) * Math.PI) : 0;
    ctx.translate(x + w / 2, groundY - h * .49); ctx.scale(1 + pulse * .12, 1 + pulse * .07); ctx.translate(-(x + w / 2), -(groundY - h * .49));
    this.energy(ctx, x + w / 2, groundY - h * .49, w * .86, h * .96, time + (side < 0 ? 1.4 : 0), true);
    if (pulse > 0) {
      ctx.globalAlpha = pulse * .7; ctx.strokeStyle = "#fff0df"; ctx.lineWidth = 4; ctx.shadowColor = "#e986ba"; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.ellipse(x + w / 2, groundY - h * .49, w * (.48 + pulse * .2), h * (.5 + pulse * .12), 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    ctx.strokeStyle = "#fff0df"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      const a = time * .7 + i * Math.PI * 2 / 3;
      const px = x + w / 2 + Math.cos(a) * w * .48, py = groundY - h * .49 + Math.sin(a) * h * .48;
      ctx.beginPath(); ctx.moveTo(px - 3, py); ctx.lineTo(px + 3, py); ctx.moveTo(px, py - 3); ctx.lineTo(px, py + 3); ctx.stroke();
    }
    ctx.restore();
  }
};
