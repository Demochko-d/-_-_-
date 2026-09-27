"use strict";
GameApp.systems.CombatSystem = class {
  constructor(events, particles) { this.events = events; this.particles = particles; this.projectiles = []; this.rangedTimer = 0; }

  hit(enemy, damage, color) {
    if (!enemy.active || !enemy.alive || enemy.isStealthed) return;
    enemy.health -= damage;
    if (enemy.health > 0) this.particles.burst(enemy.centerX, enemy.position.y + enemy.height / 2, color);
    enemy.hurt();
    if (enemy.health <= 0) { enemy.die("combat"); this.events.emit("enemyKilled", enemy); }
  }

  fireProjectile(player, target, combat) {
    const startX = player.centerX;
    const startY = player.position.y + player.height / 2;
    const direction = Math.sign(target.centerX - startX) || 1;
    this.projectiles.push({ x: startX, y: startY, originX: startX, originY: startY, vx: direction * combat.projectileSpeed * player.scale, vy: 0, scale: player.scale, target, active: true });
  }

  fireGiantProjectile(player, enemies) {
    const config = GameApp.config.game.abilities.giantShot;
    const target = enemies.filter((enemy) => enemy.active && enemy.alive && !enemy.isEmerging && !enemy.isStealthed)
      .sort((a, b) => Math.hypot(a.centerX - player.centerX, a.position.y - player.position.y) - Math.hypot(b.centerX - player.centerX, b.position.y - player.position.y))[0];
    if (!target) return false;
    const direction = Math.sign(target.centerX - player.centerX) || player.facing || 1;
    player.attack("ranged", direction);
    this.projectiles.push({ x: player.centerX, y: player.position.y + player.height / 2, vx: direction * config.speed * player.scale, vy: 0, scale: player.scale, target, active: true, giant: true });
    this.particles.burst(player.centerX, player.position.y + player.height / 2, "#fff0d5", 18);
    return true;
  }

  fireMultiProjectiles(player, enemies) {
    const targets = enemies.filter((enemy) => enemy.active && enemy.alive && !enemy.isEmerging && !enemy.isStealthed);
    if (!targets.length) return false;
    player.attack("ranged", Math.sign(targets[0].centerX - player.centerX) || player.facing);
    targets.forEach((target, index) => {
      this.projectiles.push({ x: player.centerX, y: player.position.y + player.height / 2 + (index % 3 - 1) * player.scale * 5,
        vx: 0, vy: 0, scale: player.scale, target, active: true, multi: true });
    });
    this.particles.burst(player.centerX, player.position.y + player.height / 2, "#fff0d5", 14);
    return true;
  }

  fireEnemyProjectile(enemy, player) {
    const config = GameApp.config.game.enemies[enemy.kind];
    const x = enemy.centerX, y = enemy.position.y + enemy.height / 2;
    const dx = player.centerX - x, dy = player.position.y + player.height / 2 - y;
    const distance = Math.hypot(dx, dy) || 1;
    const speed = (config.projectileSpeed || GameApp.config.game.combat.projectileSpeed) * enemy.scale;
    this.projectiles.push({ x, y, vx: dx / distance * speed, vy: dy / distance * speed,
      hostile: true, active: true, scale: enemy.scale, color: enemy.color, damage: enemy.damage,
      size: config.projectileSize || GameApp.config.game.combat.projectileSize,
      life: enemy.attackRange / speed + 1 });
    enemy.animation.setState("attack", true);
  }

  updateEnemyProjectile(shot, dt, player) {
    const startX = shot.x, startY = shot.y;
    shot.x += shot.vx * dt; shot.y += shot.vy * dt; shot.life -= dt;
    if (player.health > 0) {
      // Проверяем весь путь за кадр: быстрый шарик не проскочит сквозь героя.
      const radius = shot.size * shot.scale / 2;
      let enter = 0, leave = 1;
      const axes = [[startX, shot.x - startX, player.position.x - radius, player.position.x + player.width + radius],
        [startY, shot.y - startY, player.position.y - radius, player.position.y + player.height + radius]];
      for (const [start, delta, min, max] of axes) {
        if (Math.abs(delta) < .000001) { if (start < min || start > max) { enter = 2; break; } }
        else {
          const a = (min - start) / delta, b = (max - start) / delta;
          enter = Math.max(enter, Math.min(a, b)); leave = Math.min(leave, Math.max(a, b));
        }
      }
      if (enter <= leave) {
        const damage = Math.min(player.health, shot.damage);
        player.health = Math.max(0, player.health - shot.damage); player.hurt();
        this.particles.burst(player.centerX, player.position.y + player.height / 2, shot.color);
        this.events.emit("playerDamaged", damage); shot.active = false;
      }
    }
    if (shot.life <= 0) shot.active = false;
  }

  update(dt, player, enemies, portal) {
    const playerConfig = GameApp.config.game.player;
    const combat = GameApp.config.game.combat;
    const alive = enemies.filter((enemy) => enemy.active && enemy.alive && !enemy.isEmerging);
    const visible = alive.filter((enemy) => !enemy.isStealthed);
    const verticalOverlap = (enemy) => player.position.y < enemy.position.y + enemy.height && player.position.y + player.height > enemy.position.y;
    const meleeTarget = visible.filter(verticalOverlap).sort((a, b) => Math.abs(a.centerX - player.centerX) - Math.abs(b.centerX - player.centerX))[0];
    const rangedTarget = visible.sort((a, b) => Math.hypot(a.centerX - player.centerX, a.position.y - player.position.y) - Math.hypot(b.centerX - player.centerX, b.position.y - player.position.y))[0];
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
        player.attack("ranged", Math.sign(rangedTarget.centerX - player.centerX) || player.facing);
        this.events.emit("rangedAttack", rangedTarget);
        this.fireProjectile(player, rangedTarget, combat);
        this.particles.burst(player.centerX, player.position.y + player.height / 2, GameApp.config.game.colors.projectileParticle, Math.ceil(combat.particleCount / 2));
        this.rangedTimer = combat.projectileCooldown;
      }
    }

    this.projectiles.forEach((shot) => {
      if (shot.hostile) { this.updateEnemyProjectile(shot, dt, player); return; }
      if (shot.giant && (!shot.target?.active || !shot.target?.alive || shot.target?.isStealthed)) {
        shot.target = visible.filter((enemy) => enemy.active && enemy.alive)
          .sort((a, b) => Math.hypot(a.centerX - shot.x, a.position.y - shot.y) - Math.hypot(b.centerX - shot.x, b.position.y - shot.y))[0];
        if (!shot.target) { shot.active = false; return; }
      }
      if (!shot.giant && (!shot.target?.active || !shot.target?.alive || shot.target?.isStealthed)) { shot.active = false; return; }
      const targetX = shot.target.centerX;
      const targetY = shot.target.position.y + shot.target.height / 2;
      const dx = targetX - shot.x;
      const dy = targetY - shot.y;
      const distance = Math.hypot(dx, dy) || 1;
      const projectileConfig = shot.giant ? GameApp.config.game.abilities.giantShot : shot.multi ? GameApp.config.game.abilities.multiShot : combat;
      const projectileSpeed = projectileConfig.speed || combat.projectileSpeed;
      const desiredX = dx / distance * projectileSpeed * shot.scale;
      const desiredY = dy / distance * projectileSpeed * shot.scale;
      const turn = Math.min(1, (shot.giant || shot.multi ? 7 : combat.projectileHoming) * dt);
      shot.vx += (desiredX - shot.vx) * turn;
      shot.vy += (desiredY - shot.vy) * turn;
      const previousX = shot.x, previousY = shot.y;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      if (shot.giant && distance < projectileConfig.size * shot.scale * .75) {
        this.hit(shot.target, projectileConfig.damage, "#fff0d5"); shot.active = false;
        this.particles.burst(shot.x, shot.y, "#f5a6d0", 28);
      } else if (shot.multi && distance < projectileConfig.size * shot.scale) {
        this.hit(shot.target, projectileConfig.damage, "#fff0d5"); shot.active = false;
      } else if (!shot.giant && !shot.multi) {
        // Учитываем весь путь за кадр, чтобы пуля не пролетала сквозь цель.
        const stepX = shot.x - previousX, stepY = shot.y - previousY;
        const stepLengthSquared = stepX * stepX + stepY * stepY;
        const t = stepLengthSquared > 0 ? Math.max(0, Math.min(1,
          ((targetX - previousX) * stepX + (targetY - previousY) * stepY) / stepLengthSquared)) : 0;
        const hitDistance = Math.hypot(targetX - previousX - stepX * t, targetY - previousY - stepY * t);
        if (hitDistance < combat.projectileSize * shot.scale * 1.5) {
          this.hit(shot.target, combat.projectileDamage, GameApp.config.game.colors.projectileParticle);
          shot.active = false;
        } else if (Math.hypot(shot.x - shot.originX, shot.y - shot.originY) > combat.rangedMaxDistance * shot.scale) shot.active = false;
      }
    });
    this.projectiles = this.projectiles.filter((shot) => shot.active);

    alive.filter((enemy) => enemy.alive && !enemy.frozen).forEach((enemy) => {
      if (enemy.canShootPlayer(player)) {
        enemy.isAttacking = true; enemy.velocity.x = 0;
        enemy.facing = Math.sign(player.centerX - enemy.centerX) || enemy.facing;
        if (enemy.attackTimer <= 0) {
          this.fireEnemyProjectile(enemy, player); enemy.attackTimer = enemy.attackCooldown;
        }
        return;
      }
      const touchesPlayer = !enemy.ignoresPlayer && enemy.kind !== "sniper" && Math.abs(enemy.centerX - player.centerX) < (enemy.width + player.width) / 2 && Math.abs(enemy.position.y - player.position.y) < Math.max(enemy.height, player.height);
      enemy.isAttacking = touchesPlayer;
      if (touchesPlayer) {
        enemy.velocity.x = 0;
        if (enemy.isCharging || enemy.attackTimer <= 0) {
          const damage = enemy.damage * (enemy.isCharging ? enemy.chargeMultiplier : 1);
          player.health = Math.max(0, player.health - damage);
          player.hurt();
          enemy.attackTimer = enemy.attackCooldown;
          enemy.isCharging = false;
          this.particles.burst(player.centerX, player.position.y + player.height / 2, GameApp.config.game.colors.enemyHealth);
          this.events.emit("playerDamaged", damage);
        }
      } else {
        const touchesPortal = enemy.position.x < portal.position.x + portal.width &&
          enemy.position.x + enemy.width > portal.position.x &&
          enemy.position.y < portal.position.y + portal.height &&
          enemy.position.y + enemy.height > portal.position.y;
        if (!touchesPortal) return;
        const portalDamage = enemy.portalDamage;
        enemy.die();
        portal.health = Math.max(0, portal.health - portalDamage);
        portal.hurt();
        this.events.emit("portalDamaged", portalDamage);
      }
    });
  }

  draw(ctx) {
    this.projectiles.forEach((shot) => {
      const size = (shot.hostile ? shot.size : shot.giant ? GameApp.config.game.abilities.giantShot.size : shot.multi ? GameApp.config.game.abilities.multiShot.size : GameApp.config.game.combat.projectileSize) * shot.scale;
      ctx.fillStyle = shot.hostile ? shot.color : shot.giant ? "#f19ac2" : shot.multi ? "#f8b8e8" : GameApp.config.game.colors.projectileParticle;
      ctx.strokeStyle = shot.giant || shot.hostile ? "#fff0d5" : "transparent"; ctx.lineWidth = Math.max(2, shot.scale * 2.5);
      ctx.shadowColor = shot.giant ? "#dc73ad" : shot.multi ? "#e67bd3" : GameApp.config.game.colors.projectileParticle; ctx.shadowBlur = size * (shot.giant ? .8 : 2);
      if (shot.hostile) { ctx.shadowColor = shot.color; ctx.shadowBlur = size * .6; }
      ctx.beginPath(); ctx.arc(shot.x, shot.y, size / 2, 0, Math.PI * 2); ctx.fill(); if (shot.giant || shot.hostile) ctx.stroke();
      if (shot.giant) { ctx.fillStyle = "rgba(255,255,235,.68)"; ctx.beginPath(); ctx.arc(shot.x - size * .15, shot.y - size * .16, size * .12, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.shadowBlur = 0;
  }
};
