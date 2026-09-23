"use strict";
GameApp.renderers.PortalRenderer = {
  draw(ctx, entity) {
    const x = entity.position.x, y = entity.position.y, w = entity.width, h = entity.height;
    const cx = x + w / 2, cy = y + h * 0.52;
    const ratio = Math.max(0, entity.health / entity.maxHealth);
    const pulse = 1 + Math.sin(entity.time * 2.8) * 0.035;
    const flicker = entity.hitFlash > 0 ? 1.75 : 1;
    ctx.save();
    const groundGlow = ctx.createRadialGradient(cx, y + h, 0, cx, y + h, w * 1.25);
    groundGlow.addColorStop(0, `rgba(220,150,255,${0.34 * ratio})`); groundGlow.addColorStop(1, "rgba(113,53,164,0)");
    ctx.fillStyle = groundGlow; ctx.beginPath(); ctx.ellipse(cx, y + h, w * 1.25, h * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
    ctx.shadowColor = entity.hitFlash > 0 ? "#fff3ff" : "#b467ff"; ctx.shadowBlur = 28 * entity.scale * flicker;
    const core = ctx.createRadialGradient(-w * 0.12, -h * 0.16, w * 0.03, 0, 0, h * 0.46);
    core.addColorStop(0, `rgba(255,246,255,${0.92 * ratio})`); core.addColorStop(0.25, `rgba(238,147,255,${0.92 * ratio})`); core.addColorStop(0.68, `rgba(125,65,216,${0.88 * ratio})`); core.addColorStop(1, `rgba(33,15,69,${0.82 * ratio})`);
    ctx.fillStyle = core; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.34, h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.2 + ratio * 0.55; ctx.strokeStyle = "#fff2ff"; ctx.lineWidth = 2 * entity.scale;
    for (let i = 0; i < 3; i++) { const phase = entity.time * (0.9 + i * 0.18) + i * 2.1; ctx.beginPath(); ctx.ellipse(Math.sin(phase) * w * 0.05, Math.cos(phase * 0.7) * h * 0.05, w * (0.13 + i * 0.06), h * (0.28 - i * 0.035), phase * 0.18, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    const segments = 14;
    for (let i = 0; i < segments; i++) {
      const threshold = (((i * 5) % segments) + 1) / segments; if (ratio + 0.001 < threshold) continue;
      const angle = -Math.PI * 0.92 + (Math.PI * 1.84 * i) / (segments - 1); const sx = cx + Math.cos(angle) * w * 0.47; const sy = cy + Math.sin(angle) * h * 0.46;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(angle + Math.PI / 2);
      const stone = ctx.createLinearGradient(-w * 0.1, 0, w * 0.1, 0); stone.addColorStop(0, "#402b58"); stone.addColorStop(0.5, "#a17bb7"); stone.addColorStop(1, "#4c3263");
      ctx.fillStyle = stone; ctx.strokeStyle = "#e6c9ec"; ctx.lineWidth = entity.scale; ctx.beginPath(); ctx.moveTo(-w * 0.11, -h * 0.055); ctx.lineTo(w * 0.1, -h * 0.065); ctx.lineTo(w * 0.125, h * 0.055); ctx.lineTo(-w * 0.09, h * 0.07); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(255,213,248,.55)"; ctx.lineWidth = entity.scale * 0.8; ctx.beginPath(); ctx.moveTo(-w * 0.035, -h * 0.025); ctx.lineTo(0, h * 0.025); ctx.lineTo(w * 0.035, -h * 0.025); ctx.stroke(); ctx.restore();
    }
    const crackCount = Math.floor((1 - ratio) * 8); ctx.strokeStyle = "#ffb5d6"; ctx.shadowColor = "#ff3d83"; ctx.shadowBlur = 8; ctx.lineWidth = 1.6 * entity.scale;
    for (let i = 0; i < crackCount; i++) { const side = i % 2 ? 1 : -1, yy = y + h * (0.22 + i * 0.075); ctx.beginPath(); ctx.moveTo(cx + side * w * 0.32, yy); ctx.lineTo(cx + side * w * (0.18 + (i % 3) * 0.035), yy + h * 0.065); ctx.lineTo(cx + side * w * 0.25, yy + h * 0.115); ctx.stroke(); }
    ctx.restore();
  }
};
