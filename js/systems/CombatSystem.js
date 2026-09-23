"use strict";
GameApp.systems.CombatSystem = class {
  constructor(events, particles) { this.events = events; this.particles = particles; this.projectiles = []; this.rangedTimer = 0; }

  hit(enemy, damage, color) {
    enemy.health -= damage;
    if (enemy.health > 0) this.particles.burst(enemy.centerX, enemy.position.y + enemy.height / 2, color);
    enemy.hurt();
    if (enemy.health <= 0) { enemy.die("combat"); this.events.emit("enemyKilled", enemy); }
  }

  fireVisualProjectile(player, target, combat) {
    const startX = player.centerX;
    const startY = player.position.y + player.height / 2;
    const direction = Math.sign(target.centerX - startX) || 1;
    this.projectiles.push({ x: startX, y: startY, originX: startX, originY: startY, vx: direction * combat.projectileSpeed * player.scale, vy: 0, scale: player.scale, target, active: true });
  }

  update(dt, player, enemies, portal) {
    const playerConfig = GameApp.config.game.player;
    const combat = GameApp.config.game.combat;
    const alive = enemies.filter((enemy) => enemy.active && enemy.alive && !enemy.isEmerging);
    const verticalOverlap = (enemy) => player.position.y < enemy.position.y + enemy.height && player.position.y + player.height > enemy.position.y;
    const meleeTarget = alive.filter(verticalOverlap).sort((a, b) => Math.abs(a.centerX - player.centerX) - Math.abs(b.centerX - player.centerX))[0];
    const rangedTarget = alive.sort((a, b) => Math.hypot(a.centerX - player.centerX, a.position.y - player.position.y) - Math.hypot(b.centerX - player.centerX, b.position.y - player.position.y))[0];
    this.rangedTimer = Math.max(0, this.rangedTimer - dt);

    if (meleeTarget && Math.abs(meleeTarget.centerX - player.centerX) <= playerConfig.attackRange * player.scale && player.attackTimer <= 0) {
        player.attack("melee", Math.sign(meleeTarget.centerX - player.centerX) || player.facing);
        this.events.emit("meleeAttack", meleeTarget);
        this.hit(meleeTarget, combat.meleeDamage, GameApp.config.game.colors.meleeParticle);
        player.attackTimer = playerConfig.attackCooldown;
    } else if (rangedTarget) {
      const rangedDistance = Math.hypot(rangedTarget.centerX - player.centerX, rangedTarget.position.y + rangedTarget.height / 2 - (player.position.y + player.height / 2));
      const targetIsAboveOrBelow = !verticalOverlap(rangedTarget);
      const outsideMeleeZone = rangedDistance > combat.rangedMinDistance * player.scale;
      if ((targetIsAboveOrBelow || outsideMeleeZone) && rangedDistance <= combat.rangedMaxDistance * player.scale && this.rangedTimer <= 0) {
        // Урон считается сразу, а светящийся снаряд ниже остаётся только визуальным эффектом.
        player.attack("ranged", Math.sign(rangedTarget.centerX - player.centerX) || player.facing);
        this.events.emit("rangedAttack", rangedTarget);
        this.hit(rangedTarget, combat.projectileDamage, GameApp.config.game.colors.projectileParticle);
        this.fireVisualProjectile(player, rangedTarget, combat);
        this.particles.burst(player.centerX, player.position.y + player.height / 2, GameApp.config.game.colors.projectileParticle, Math.ceil(combat.particleCount / 2));
        this.rangedTimer = combat.projectileCooldown;
      }
    }

    this.projectiles.forEach((shot) => {
      const targetX = shot.target.centerX;
      const targetY = shot.target.position.y + shot.target.height / 2;
      const dx = targetX - shot.x;
      const dy = targetY - shot.y;
      const distance = Math.hypot(dx, dy) || 1;
      const desiredX = dx / distance * combat.projectileSpeed * shot.scale;
      const desiredY = dy / distance * combat.projectileSpeed * shot.scale;
      const turn = Math.min(1, combat.projectileHoming * dt);
      shot.vx += (desiredX - shot.vx) * turn;
      shot.vy += (desiredY - shot.vy) * turn;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      if (distance < combat.projectileSize * shot.scale * 1.5 || Math.hypot(shot.x - shot.originX, shot.y - shot.originY) > combat.rangedMaxDistance * shot.scale) shot.active = false;
    });
    this.projectiles = this.projectiles.filter((shot) => shot.active);

    alive.filter((enemy) => enemy.alive && !enemy.frozen).forEach((enemy) => {
      const touchesPlayer = Math.abs(enemy.centerX - player.centerX) < (enemy.width + player.width) / 2 && Math.abs(enemy.position.y - player.position.y) < Math.max(enemy.height, player.height);
      enemy.isAttacking = touchesPlayer;
      if (touchesPlayer) {
        enemy.velocity.x = 0;
        if (enemy.attackTimer <= 0) {
          player.health = Math.max(0, player.health - enemy.damage);
          player.hurt();
          enemy.attackTimer = enemy.attackCooldown;
          this.particles.burst(player.centerX, player.position.y + player.height / 2, GameApp.config.game.colors.enemyHealth);
          this.events.emit("playerDamaged", enemy.damage);
        }
      } else {
        const touchesPortal = enemy.position.x < portal.position.x + portal.width &&
          enemy.position.x + enemy.width > portal.position.x &&
          enemy.position.y < portal.position.y + portal.height &&
          enemy.position.y + enemy.height > portal.position.y;
        if (!touchesPortal) return;
        enemy.die();
        portal.health = Math.max(0, portal.health - enemy.portalDamage);
        portal.hurt();
        this.events.emit("portalDamaged", enemy.portalDamage);
      }
    });
  }

  draw(ctx) {
    ctx.fillStyle = GameApp.config.game.colors.projectileParticle;
    ctx.shadowColor = GameApp.config.game.colors.projectileParticle;
    this.projectiles.forEach((shot) => { const size = GameApp.config.game.combat.projectileSize * shot.scale; ctx.shadowBlur = size * 2; ctx.beginPath(); ctx.arc(shot.x, shot.y, size / 2, 0, Math.PI * 2); ctx.fill(); });
    ctx.shadowBlur = 0;
  }
};
