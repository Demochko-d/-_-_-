"use strict";
GameApp.renderers.characters ??= {};
GameApp.renderers.characters.BigGhostVisual = {
  draw(ctx, enemy, pose) {
    if (pose.dissolve > 0) { GameApp.renderers.effects.DeathDissolveRenderer.drawShattered(ctx, enemy, pose.dissolve, this); return; }
    const width = enemy.width;
    const height = enemy.height;
    const flutter = Math.sin((enemy.animation.time || 0) * 3.1) * height * 0.022;
    ctx.save();
    const inheritedAlpha = ctx.globalAlpha;
    ctx.translate(enemy.position.x + width / 2 + (pose.x || 0), enemy.position.y + height / 2 + (pose.y || 0));
    ctx.rotate(pose.rotation || 0);
    ctx.scale(pose.scaleX ?? 1, pose.scaleY ?? 1);
    const bodyAlpha = 1 - (pose.dissolve || 0);
    ctx.globalAlpha = inheritedAlpha * bodyAlpha;

    const body = ctx.createRadialGradient(-width * 0.16, -height * 0.24, 2, 0, 0, Math.max(width, height) * 0.62);
    body.addColorStop(0, "#ffd2fa");
    body.addColorStop(0.48, enemy.color);
    body.addColorStop(1, "#783e9d");
    ctx.fillStyle = body;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.1, width * 0.49, height * 0.43, 0, Math.PI, Math.PI * 2);
    ctx.bezierCurveTo(width * 0.5, height * 0.04, width * 0.47, height * 0.25, width * 0.36, height * 0.33 + flutter);
    ctx.quadraticCurveTo(width * 0.2, height * 0.19, 0, height * 0.36 - flutter);
    ctx.quadraticCurveTo(-width * 0.2, height * 0.19, -width * 0.38, height * 0.33 + flutter);
    ctx.bezierCurveTo(-width * 0.48, height * 0.22, -width * 0.5, height * 0.04, -width * 0.49, -height * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(1.5, 1.5 * (enemy.scale || 1));
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.globalAlpha = inheritedAlpha * bodyAlpha;
    const highlight = ctx.createRadialGradient(-width * 0.2, -height * 0.29, 0, -width * 0.14, -height * 0.22, width * 0.34);
    highlight.addColorStop(0, "rgba(255,248,255,.42)"); highlight.addColorStop(0.5, "rgba(249,232,255,.16)"); highlight.addColorStop(1, "rgba(249,232,255,0)");
    ctx.fillStyle = highlight;
    ctx.beginPath(); ctx.ellipse(-width * 0.15, -height * 0.22, width * 0.28, height * 0.3, -0.45, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = inheritedAlpha * bodyAlpha;
    ctx.shadowBlur = 0;

    GameApp.renderers.effects.DeathDissolveRenderer.drawEye(ctx, enemy, pose, width, height);
    ctx.restore();
  }
};
