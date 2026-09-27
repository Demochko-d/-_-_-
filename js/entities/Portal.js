"use strict";
GameApp.entities.Portal = class extends GameApp.entities.Entity {
  constructor(spawn) {
    const c = GameApp.config.game.portal, scale = spawn.scale || 1;
    super({ ...spawn, width: c.width * scale, height: c.height * scale });
    this.scale = scale; this.health = c.maxHealth; this.maxHealth = c.maxHealth;
    this.time = 0; this.hitFlash = 0; this.damageStage = 0; this.debris = [];
  }
  setScale(scale) { const c = GameApp.config.game.portal; this.scale = scale; this.width = c.width * scale; this.height = c.height * scale; }
  getStoneLayout() {
    return Array.from({ length: 15 }, (_, i) => {
      if (i >= 11) return { x: i % 2 ? .1 : .9, y: i < 13 ? .73 : .9, angle: 0, stage: 4 };
      const a = Math.PI - i * Math.PI / 10;
      return { x: .5 + Math.cos(a) * .4, y: .56 - Math.sin(a) * .45, angle: Math.PI / 2 - a,
        stage: [4, 3, 3, 2, 2, 1, 2, 2, 3, 3, 4][i] };
    });
  }
  syncDamage() {
    const ratio = Math.max(0, this.health / this.maxHealth);
    const stage = GameApp.config.game.portal.damageThresholds.filter(threshold => ratio <= threshold).length;
    if (stage <= this.damageStage) return;
    this.getStoneLayout().forEach((stone, i) => {
      if (stone.stage > this.damageStage && stone.stage <= stage) {
        this.debris.push({ ...stone, age: 0, vx: (stone.x - .5) * .8, vy: -.25 - i % 3 * .06, spin: (i % 2 ? 1 : -1) * 2 });
      }
    });
    this.damageStage = stage;
  }
  hurt() { this.hitFlash = .28; this.syncDamage(); }
  update(dt) {
    this.time += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.syncDamage();
    for (const stone of this.debris) {
      stone.age += dt;
      if (stone.y < .94 || stone.vy < 0) {
        stone.x += stone.vx * dt; stone.vy += 2.6 * dt; stone.y += stone.vy * dt; stone.angle += stone.spin * dt;
        if (stone.y >= .94 && stone.vy > 0) { stone.y = .94; stone.vy = 0; }
      }
    }
  }
};
