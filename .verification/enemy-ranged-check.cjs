const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
global.window = global;
const root = path.resolve(__dirname, '..');
for (const file of ['js/app.js', 'js/config/gameConfig.js', 'js/entities/Entity.js',
  'js/animation/AnimationStateMachine.js', 'js/animation/characters/GhostAnimations.js',
  'js/entities/Enemy.js', 'js/systems/CombatSystem.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
}
const sniperConfig = GameApp.config.game.enemies.sniper;
const healthAfterHit = 100 - sniperConfig.damage;
const player = { position: { x: 200, y: 0 }, width: 42, height: 42, scale: 1,
  health: 100, attackTimer: 100, hurt() {}, get centerX() { return this.position.x + this.width / 2; } };
const portal = { position: { x: 600, y: 0 }, width: 50, height: 100, health: 10, hurt() {}, get centerX() { return this.position.x + this.width / 2; } };
const events = [];
const combat = new GameApp.systems.CombatSystem({ emit: (...args) => events.push(args) }, { burst() {} });
combat.rangedTimer = 100;
const sniper = new GameApp.entities.Enemy('sniper', { x: 0, y: 0, scale: 1 });
assert.equal(sniper.canShootPlayer(player), true);
combat.update(0, player, [sniper], portal);
assert.equal(player.health, 100, 'No damage before impact');
assert.equal(combat.projectiles.length, 1);
assert.equal(combat.projectiles[0].color, sniper.color);
assert.equal(sniper.animation.state, 'attack');
combat.update(0, player, [sniper], portal);
assert.equal(combat.projectiles.length, 1, 'Cooldown prevents repeated shots');
combat.update(1, player, [], portal);
assert.equal(player.health, healthAfterHit, 'Swept collision catches fast projectile');
assert.equal(combat.projectiles.length, 0);
assert.ok(events.some(([name]) => name === 'playerDamaged'));
sniper.attackTimer = 0;
combat.update(0, player, [sniper], portal);
player.position.y = 200;
combat.update(1, player, [], portal);
assert.equal(player.health, healthAfterHit, 'Moving away dodges the shot');
player.position.x = 1000;
assert.equal(sniper.canShootPlayer(player), false);
sniper.setScale(2);
assert.equal(sniper.attackRange, sniperConfig.attackRange * 2);
const runner = new GameApp.entities.Enemy('runner3', { x: player.position.x, y: player.position.y });
combat.update(0, player, [runner], portal);
assert.equal(player.health, healthAfterHit);
assert.equal(runner.isAttacking, false);
runner.update(.01, portal, player, { overlaps: () => true, keepInWorld() {} });
assert.notEqual(runner.velocity.x, 0, 'Runner moves through the player');
runner.position = { ...portal.position };
combat.update(0, player, [runner], portal);
assert.equal(runner.alive, false);
assert.equal(portal.health, 10 - runner.portalDamage);
console.log('Enemy checks passed: range, cooldown, shot animation, impact damage, dodging, scale, runner3 bypass and portal damage.');
