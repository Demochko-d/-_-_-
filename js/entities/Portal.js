"use strict";
GameApp.entities.Portal = class extends GameApp.entities.Entity {
  constructor(spawn) { const c = GameApp.config.game.portal; const scale = spawn.scale || 1; super({ ...spawn, width: c.width * scale, height: c.height * scale }); this.scale = scale; this.health = c.maxHealth; this.maxHealth = c.maxHealth; this.time = 0; this.hitFlash = 0; }
  setScale(scale) { const c = GameApp.config.game.portal; this.scale = scale; this.width = c.width * scale; this.height = c.height * scale; }
  hurt() { this.hitFlash = 0.28; }
  update(dt) { this.time += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); }
};
