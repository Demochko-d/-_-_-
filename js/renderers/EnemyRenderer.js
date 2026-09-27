"use strict";
GameApp.renderers.EnemyRenderer = { draw(ctx, entity) {
  ctx.save();
  if (entity.isStealthed) ctx.globalAlpha *= 0.28;
  if (entity.chargeTrail?.length) {
    const alpha = ctx.globalAlpha;
    ctx.fillStyle = "#dca9f5";
    entity.chargeTrail.forEach((mark) => {
      ctx.globalAlpha = alpha * .14 * mark.life / .26;
      ctx.beginPath();
      ctx.ellipse(mark.x, mark.y, entity.width * .45, entity.height * .27, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = alpha;
  }
  const pose = entity.animation.getPose(entity);
  const visual = entity.kind === "brute" || entity.kind === "gigant" ? GameApp.renderers.characters.BigGhostVisual : GameApp.renderers.characters.GhostVisual;
  const progress = entity.appearanceProgress ?? 1;
  if (progress >= 1 || !entity.alive) { visual.draw(ctx, entity, pose); ctx.restore(); return; }
  const eased = 1 - Math.pow(1 - progress, 3);
  const spawnConfig = GameApp.config.game.spawn;
  const scale = spawnConfig.appearanceStartScale + (1 - spawnConfig.appearanceStartScale) * eased;
  const alpha = spawnConfig.appearanceStartAlpha + (1 - spawnConfig.appearanceStartAlpha) * eased;
  const anchorX = entity.centerX;
  const anchorY = entity.position.y + entity.height;
  ctx.save();
  ctx.translate(anchorX, anchorY); ctx.scale(scale, scale); ctx.translate(-anchorX, -anchorY);
  ctx.globalAlpha *= alpha;
  visual.draw(ctx, entity, pose);
  ctx.restore();
  ctx.restore();
} };
