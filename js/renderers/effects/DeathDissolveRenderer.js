"use strict";
GameApp.renderers.effects ??= {};
GameApp.renderers.effects.DeathDissolveRenderer = {
  // Compatibility for older preview pages; the effect is now soft and rounded.
  drawShattered(ctx, entity, progress, renderer) { this.drawDissolved(ctx, entity, progress, renderer); },
  drawDissolved(ctx, entity, progress, renderer) {
    const p = Math.max(0, Math.min(1, progress));
    this.drawDeathWave(ctx, entity, p);
    if (p >= 1) return;
    if (!entity.deathArtwork) {
      const pad = Math.ceil(Math.max(entity.width, entity.height) * .65);
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(entity.width + pad * 2); canvas.height = Math.ceil(entity.height + pad * 2);
      const frozen = { ...(entity.deathPose || {}), dissolve: 0 };
      const copy = { ...entity, trailStrength: 0, position: { x: pad, y: pad }, animation: { time: entity.animation.time, getPose: () => frozen } };
      renderer.draw(canvas.getContext("2d"), copy, frozen);
      const wisps = Array.from({ length: 12 }, (_, i) => {
        const angle = i * 2.39996, radius = entity.width * (.13 + i % 3 * .09);
        const x = pad + entity.width / 2 + Math.cos(angle) * radius;
        const y = pad + entity.height / 2 + Math.sin(angle) * entity.height * .28;
        const size = Math.ceil(Math.max(entity.width, entity.height) * .52);
        const puff = document.createElement("canvas"); puff.width = puff.height = size;
        const c = puff.getContext("2d");
        const color = entity.color || GameApp.config.game.colors.player;
        const mask = c.createRadialGradient(size * .43, size * .4, 0, size / 2, size / 2, size * .5);
        mask.addColorStop(0, "#fff3e5"); mask.addColorStop(.28, color); mask.addColorStop(1, "rgba(255,240,225,0)");
        c.fillStyle = mask; c.fillRect(0, 0, size, size);
        return { canvas: puff, x, y, vx: Math.cos(angle) * entity.width * .8, vy: -entity.height * (.6 + i % 4 * .17), phase: angle };
      });
      entity.deathArtwork = { canvas, pad, wisps };
    }
    const { canvas, pad, wisps } = entity.deathArtwork;
    const smooth = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
    ctx.save(); ctx.translate(entity.position.x - pad, entity.position.y - pad);
    const alpha = ctx.globalAlpha, cx = pad + entity.width / 2, cy = pad + entity.height / 2;
    ctx.save(); ctx.translate(cx, cy - entity.height * .32 * smooth(p));
    ctx.scale(1 - .24 * smooth(p), 1 + Math.sin(p * Math.PI) * .12);
    ctx.globalAlpha = alpha * (1 - smooth(p / .8)); ctx.drawImage(canvas, -cx, -cy); ctx.restore();
    const drift = smooth(p);
    for (const wisp of wisps) {
      const size = wisp.canvas.width * (1 - .55 * drift);
      ctx.globalAlpha = alpha * Math.sin(p * Math.PI) * (1 - smooth((p - .55) / .45)) * .65;
      ctx.drawImage(wisp.canvas, wisp.x + wisp.vx * drift + Math.sin(p * 4 + wisp.phase) * entity.width * .05 * drift - size / 2,
        wisp.y + wisp.vy * drift - size / 2, size, size);
    }
    ctx.restore();
  },
  drawDeathWave(ctx, entity, progress) {
    if (progress < .52) return;
    const p = Math.min(1, (progress - .52) / .48);
    const pulse = Math.sin(p * Math.PI);
    const x = entity.centerX, y = entity.position.y + entity.height * .55;
    const radius = Math.max(entity.width, entity.height) * (.42 + p * 1.45);
    ctx.save(); ctx.globalAlpha *= pulse * .72; ctx.lineCap = "round";
    ctx.strokeStyle = "#fff0d5"; ctx.shadowColor = entity.color || "#f5c84b"; ctx.shadowBlur = 16;
    ctx.lineWidth = Math.max(2, (entity.scale || 1) * (3.2 - p * 1.5));
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha *= .45; ctx.lineWidth *= .55;
    ctx.beginPath(); ctx.arc(x, y, radius * .68, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = pulse * .8; ctx.fillStyle = "#fff7df";
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4 + p * .45;
      const sx = x + Math.cos(angle) * radius * .88, sy = y + Math.sin(angle) * radius * .52;
      const size = Math.max(1.5, (entity.scale || 1) * 2.4 * (1 - p * .45));
      ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },
  drawEye(ctx, enemy, pose, width, height) {
    const time = enemy.animation.time || 0;
    const phase = time % 4.7;
    const blink = phase < 0.18 ? 1 - Math.sin(phase / 0.18 * Math.PI) * 0.94 : 1;
    const look = enemy.visualFacing ?? enemy.facing ?? 1;
    const y = -height * 0.12 + Math.sin(time * 1.7) * height * 0.008;
    const eyes = enemy.kind === "splitter" ? [-0.14, 0.14] : [look * 0.17];
    eyes.forEach((offset) => {
      const eyeScale = enemy.kind === "splitter" ? 0.82 : 1;
      ctx.save(); ctx.translate(offset * width + (pose.eyeJitter || 0), y);
      ctx.scale((pose.eyeScaleX ?? 1) * eyeScale * (enemy.kind === "sniper" ? 2.5 : 1), (pose.eyeScaleY ?? 1) * blink * eyeScale);
      ctx.fillStyle = "#fffaff";
      ctx.beginPath(); ctx.ellipse(0, 0, width * 0.11, height * 0.135, -look * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#624178";
      ctx.beginPath(); ctx.ellipse(look * width * 0.029, Math.sin(time * 1.1) * height * 0.012, width * 0.057, height * 0.078, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#241c3b";
      ctx.beginPath(); ctx.ellipse(look * width * 0.036, 0, width * 0.033, height * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(look * width * 0.025 - width * 0.018, -height * 0.033, width * 0.024, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }
};
