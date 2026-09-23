"use strict";
GameApp.renderers.characters ??= {};
GameApp.renderers.characters.GhostVisual = {
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

    // Силуэт без углов: купол плавно перетекает в волнистый низ.
    const body = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
    if (enemy.kind === "splitter") { body.addColorStop(0, "#f8c1d8"); body.addColorStop(0.38, "#e996bb"); body.addColorStop(1, "#b95683"); }
    else { body.addColorStop(0, "#ffd0e1"); body.addColorStop(0.52, enemy.color); body.addColorStop(1, "#a65482"); }
    ctx.fillStyle = body;
    ctx.shadowColor = enemy.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, -height * 0.12, width * 0.46, Math.PI, 0);
    ctx.bezierCurveTo(width * 0.48, height * 0.02, width * 0.45, height * 0.2, width * 0.38, height * 0.3 + flutter);
    ctx.quadraticCurveTo(width * 0.25, height * 0.16, width * 0.1, height * 0.3 + flutter);
    ctx.quadraticCurveTo(0, height * 0.17, -width * 0.1, height * 0.3 + flutter);
    ctx.quadraticCurveTo(-width * 0.27, height * 0.16, -width * 0.4, height * 0.3 + flutter);
    ctx.bezierCurveTo(-width * 0.47, height * 0.17, -width * 0.48, height * 0.02, -width * 0.46, -height * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(1.5, 1.5 * (enemy.scale || 1));
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.globalAlpha = inheritedAlpha * bodyAlpha;
    const highlight = ctx.createRadialGradient(-width * 0.17, -height * 0.27, 0, -width * 0.12, -height * 0.22, width * 0.3);
    highlight.addColorStop(0, "rgba(255,250,253,.46)"); highlight.addColorStop(0.48, "rgba(255,240,250,.18)"); highlight.addColorStop(1, "rgba(255,240,250,0)");
    ctx.fillStyle = highlight;
    ctx.beginPath(); ctx.ellipse(-width * 0.12, -height * 0.22, width * 0.25, height * 0.27, -0.45, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = inheritedAlpha * bodyAlpha;
    ctx.shadowBlur = 0;

    // Один боковой глаз: его положение показывает направление, куда смотрит призрак.
    GameApp.renderers.effects.DeathDissolveRenderer.drawEye(ctx, enemy, pose, width, height);
    ctx.restore();
  }
};
