"use strict";
GameApp.systems.CollisionSystem = class {
  constructor(worldWidth, groundY, platforms = []) { this.worldWidth = worldWidth; this.groundY = groundY; this.platforms = platforms; }
  overlaps(a, b) { return a.position.x < b.position.x + b.width && a.position.x + a.width > b.position.x && a.position.y < b.position.y + b.height && a.position.y + a.height > b.position.y; }
  supportingPlatform(entity) {
    const tolerance = 2 * (entity.scale || 1);
    return this.platforms.find(p => p !== entity.dropPlatform && entity.position.x + entity.width > p.x &&
      entity.position.x < p.x + p.width && Math.abs(entity.position.y + entity.height - p.y) < tolerance);
  }
  isOnGround(entity) {
    const tolerance = 2 * (entity.scale || 1);
    return entity.position.y + entity.height >= this.groundY - tolerance || !!this.supportingPlatform(entity);
  }
  dropThrough(entity) {
    if (entity.velocity.y < 0 || entity.position.y + entity.height >= this.groundY - 2 * (entity.scale || 1)) return false;
    const platform = this.supportingPlatform(entity);
    if (!platform) return false;
    entity.dropPlatform = platform;
    entity.position.y += 3 * (entity.scale || 1);
    entity.velocity.y = Math.max(entity.velocity.y, 60 * (entity.scale || 1));
    return true;
  }
  keepInWorld(entity, previousBottom, clampHorizontal = true) {
    if (entity.dropPlatform && (entity.position.y > entity.dropPlatform.y || !this.platforms.includes(entity.dropPlatform))) entity.dropPlatform = null;
    let landingY = this.groundY;
    this.platforms.forEach(p => {
      if (p === entity.dropPlatform) return;
      const overlapsX = entity.position.x + entity.width > p.x && entity.position.x < p.x + p.width;
      if (entity.velocity.y >= 0 && overlapsX && previousBottom <= p.y && entity.position.y + entity.height >= p.y) landingY = Math.min(landingY, p.y);
    });
    if (entity.position.y + entity.height >= landingY) { entity.position.y = landingY - entity.height; entity.velocity.y = 0; }
    if (clampHorizontal) entity.position.x = GameApp.utils.clamp(entity.position.x, 0, this.worldWidth - entity.width);
  }
};
