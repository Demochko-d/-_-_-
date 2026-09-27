require('./enemy-ranged-check.cjs');
const assert = require('node:assert/strict');
const config = GameApp.config.game.combat;
const player = { position: { x: 0, y: 0 }, width: 42, height: 42, scale: 1, health: 100,
  attackTimer: 100, facing: 1, attack() {}, hurt() {}, get centerX() { return this.position.x + this.width / 2; } };
const portal = { position: { x: 1000, y: 0 }, width: 50, height: 100, health: 10 };
const makeCombat = () => new GameApp.systems.CombatSystem({ emit() {} }, { burst() {} });
const makeTarget = () => new GameApp.entities.Enemy('runner2', { x: 250, y: 0, scale: 1 });
const combat = makeCombat(), target = makeTarget(), initialHealth = target.health;
combat.update(0, player, [target], portal);
assert.equal(target.health, initialHealth, 'Firing causes no damage');
assert.equal(combat.projectiles.length, 1);
combat.rangedTimer = 100;
combat.update(.1, player, [target], portal);
assert.equal(target.health, initialHealth, 'Bullet still travelling causes no damage');
for (let i = 0; i < 120; i++) combat.update(1 / 60, player, [target], portal);
assert.equal(target.health, initialHealth - config.projectileDamage, 'Impact deals damage exactly once');
assert.equal(combat.projectiles.length, 0);
const fastCombat = makeCombat(), fastTarget = makeTarget();
fastCombat.fireProjectile(player, fastTarget, config); fastCombat.rangedTimer = 100;
fastCombat.update(1, player, [fastTarget], portal);
assert.equal(fastTarget.health, fastTarget.maxHealth - config.projectileDamage, 'Fast bullet crossing target still hits');
for (const state of ['stealthed', 'dead']) {
  const c = makeCombat(), enemy = makeTarget();
  c.fireProjectile(player, enemy, config); c.rangedTimer = 100;
  if (state === 'stealthed') enemy.isStealthed = true; else enemy.die();
  c.update(.1, player, [enemy], portal);
  assert.equal(enemy.health, enemy.maxHealth, 'Invalid target receives no damage');
  assert.equal(c.projectiles.length, 0);
}
const lethal = makeCombat(), victim = makeTarget(); let kills = 0;
lethal.events.emit = name => { if (name === 'enemyKilled') kills++; };
victim.health = config.projectileDamage;
lethal.fireProjectile(player, victim, config); lethal.rangedTimer = 100;
lethal.update(1, player, [victim], portal);
lethal.update(1, player, [victim], portal);
assert.equal(victim.alive, false); assert.equal(kills, 1);
console.log('Player bullets passed: no damage on launch or in flight, one hit, swept impact, invalid targets and death event.');
