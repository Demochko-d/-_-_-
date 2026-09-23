"use strict";
GameApp.renderers.EnemyRenderer = { draw(ctx, entity) {
  const pose = entity.animation.getPose(entity);
  const visual = entity.kind === "brute" ? GameApp.renderers.characters.BigGhostVisual : GameApp.renderers.characters.GhostVisual;
  const progress = entity.appearanceProgress ?? 1;
  if (progress >= 1 || !entity.alive) { visual.draw(ctx, entity, pose); return; }
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
} };
