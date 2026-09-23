"use strict";
GameApp.renderers.PlayerRenderer = {
  draw(ctx, entity) {
    const pose = entity.animation.getPose(entity);
    if (pose.dissolve > 0) { GameApp.renderers.effects.DeathDissolveRenderer.drawShattered(ctx, entity, pose.dissolve, this); return; }
    const width = entity.width, height = entity.height;
    const facing = entity.visualFacing || entity.facing || 1;
    ctx.save();
    ctx.translate(entity.position.x + width / 2 + (pose.x || 0), entity.position.y + height / 2 + (pose.y || 0));
    ctx.rotate(pose.rotation || 0); ctx.scale(pose.scaleX ?? 1, pose.scaleY ?? 1);

    if ((pose.slash || 0) > 0) {
      const p = pose.slash;
      const alpha = Math.sin(p * Math.PI);
      ctx.save(); ctx.scale(facing, 1); ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#fff6bb"; ctx.shadowColor = "#ffd857"; ctx.shadowBlur = 18; ctx.lineCap = "round"; ctx.lineWidth = Math.max(4, width * 0.1);
      ctx.beginPath(); ctx.arc(width * 0.06, 0, width * (0.62 + p * 0.18), -1.12, 1.12); ctx.stroke();
      ctx.globalAlpha = alpha * 0.48; ctx.lineWidth *= 0.42;
      ctx.beginPath(); ctx.arc(width * 0.05, 0, width * (0.83 + p * 0.12), -0.92, 0.92); ctx.stroke();
      ctx.restore();
    }

    if ((pose.cast || 0) > 0) {
      const p = pose.cast;
      const pulse = Math.sin(p * Math.PI);
      const orbX = facing * width * (0.6 + p * 0.13);
      const orb = ctx.createRadialGradient(orbX, -height * 0.04, 0, orbX, -height * 0.04, width * 0.28);
      orb.addColorStop(0, "rgba(255,255,235,.98)"); orb.addColorStop(.42, "rgba(255,230,103,.86)"); orb.addColorStop(1, "rgba(255,203,63,0)");
      ctx.globalAlpha = pulse; ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(orbX, -height * 0.04, width * 0.28, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }

    const body = ctx.createRadialGradient(-width * 0.18, -height * 0.22, 1, 0, 0, width * 0.58);
    body.addColorStop(0, "#fffbd1"); body.addColorStop(.38, "#ffe36f"); body.addColorStop(1, "#e5a62f");
    ctx.fillStyle = body; ctx.shadowColor = "#f8cf4f"; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.ellipse(0, 0, width * 0.47, height * 0.47, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,244,.94)"; ctx.lineWidth = Math.max(1.5, 1.6 * (entity.scale || 1)); ctx.stroke();

    ctx.shadowBlur = 0;
    const highlight = ctx.createRadialGradient(-width * 0.2, -height * 0.25, 0, -width * 0.12, -height * 0.15, width * 0.34);
    highlight.addColorStop(0, "rgba(255,255,248,.68)"); highlight.addColorStop(.48, "rgba(255,250,210,.22)"); highlight.addColorStop(1, "rgba(255,245,190,0)");
    ctx.fillStyle = highlight; ctx.beginPath(); ctx.ellipse(-width * 0.12, -height * 0.15, width * 0.28, height * 0.3, -.55, 0, Math.PI * 2); ctx.fill();

    const blink = pose.eyeScaleY ?? 1;
    [-0.16, 0.16].forEach((offset) => {
      ctx.save(); ctx.translate(offset * width, -height * 0.04); ctx.scale(1, blink);
      ctx.fillStyle = "#fffdf2"; ctx.beginPath(); ctx.ellipse(0, 0, width * 0.105, height * 0.145, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5c4760"; ctx.beginPath(); ctx.ellipse(facing * width * 0.026, height * 0.012, width * 0.052, height * 0.078, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#241e35"; ctx.beginPath(); ctx.ellipse(facing * width * 0.032, height * 0.018, width * 0.029, height * 0.052, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(facing * width * 0.015, -height * 0.02, width * 0.017, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }
};
