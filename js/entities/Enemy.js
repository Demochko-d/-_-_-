"use strict";
GameApp.entities.Enemy = class extends GameApp.entities.Entity {
  constructor(kind, spawn) {
    const c = GameApp.config.game.enemies[kind];
    const scale = spawn.scale || 1;
    super({ ...spawn, width: c.width * scale, height: c.height * scale });
    this.scale = scale;
    this.kind = kind;
    this.health = c.health;
    this.maxHealth = c.health;
    this.speed = c.speed * scale;
    this.damage = c.damage;
    this.portalDamage = c.portalDamage;
    this.attackCooldown = c.attackCooldown;
    this.ignoresPlayer = kind === "runner2" || kind === "runner3";
    this.attackRange = (c.attackRange || 0) * scale;
    this.chargeMultiplier = c.chargeMultiplier || 1;
    this.isCharging = kind === "gigant";
    this.chargeTrail = [];
    this.chargeParticleTimer = 0;
    this.attackTimer = 0;
    this.isAttacking = false;
    this.alive = true;
    this.deathTimer = 0;
    this.visualHurtTimer = 0;
    this.facing = 1;
    this.color = c.color;
    this.pendingSplit = false;
    this.frozen = false;
    this.isStealthed = false;
    this.stunTimer = 0;
    this.lastPortalWaveId = 0;
    this.spawnSide = spawn.spawnSide || null;
    this.appearanceDuration = spawn.emerging ? GameApp.config.game.spawn.appearanceDuration : 0;
    this.appearanceTimer = this.appearanceDuration;
    this.appearanceProgress = spawn.emerging ? 0 : 1;
    this.isEmerging = !!spawn.emerging;
    const poses = kind === "brute" || kind === "gigant" ? GameApp.animation.characterPoses.bigGhost : GameApp.animation.characterPoses.ghost;
    this.animation = new GameApp.animation.AnimationStateMachine(poses);
  }

  hurt() { this.visualHurtTimer = GameApp.config.game.animation.hurtDuration; }
  stun(duration) { this.stunTimer = Math.max(this.stunTimer, duration); this.frozen = true; this.isAttacking = false; this.velocity.x = 0; this.velocity.y = 0; }
  die(reason = "removed") { if (!this.alive) return; this.deathPose = { ...this.animation.getPose(this) }; this.alive = false; this.deathTimer = GameApp.config.game.animation.deathDuration; this.pendingSplit = this.kind === "splitter" && reason === "combat"; this.animation.setState("death", true); }
  setScale(scale) { const c = GameApp.config.game.enemies[this.kind]; this.scale = scale; this.width = c.width * scale; this.height = c.height * scale; this.speed = c.speed * scale; this.attackRange = (c.attackRange || 0) * scale; }

  canShootPlayer(player) {
    return this.kind === "sniper" && player.health > 0 && Math.hypot(this.centerX - player.centerX,
      this.position.y + this.height / 2 - player.position.y - player.height / 2) <= this.attackRange;
  }

  updateStealth(player) {
    const distance = GameApp.config.game.enemies[this.kind].stealthDistance;
    this.isStealthed = this.kind === "ninja" && this.alive && !this.isEmerging &&
      Math.hypot(this.centerX - player.centerX, this.position.y + this.height / 2 - (player.position.y + player.height / 2)) <= distance * this.scale;
  }

  update(dt, portal, player, collision) {
    if (this.chargeTrail.length) {
      this.chargeTrail.forEach((mark) => { mark.life -= dt; });
      this.chargeTrail = this.chargeTrail.filter((mark) => mark.life > 0);
    }
    if (!this.alive) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.active = false;
      this.animation.setState("death");
      this.animation.update(dt);
      return;
    }
    if (this.appearanceTimer > 0) {
      this.appearanceTimer = Math.max(0, this.appearanceTimer - dt);
      this.appearanceProgress = 1 - this.appearanceTimer / this.appearanceDuration;
      this.isEmerging = this.appearanceTimer > 0;
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.isAttacking = false;
      this.animation.setState("idle");
      this.animation.update(dt * 0.45);
      return;
    }
    this.appearanceProgress = 1;
    this.isEmerging = false;
    if (this.stunTimer > 0) {
      this.frozen = true;
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.isAttacking = false;
      this.animation.setState("idle");
      this.animation.update(dt * 0.12);
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      return;
    }
    this.frozen = false;
    const previousBottom = this.position.y + this.height;
    if (this.canShootPlayer(player) || (!this.ignoresPlayer && this.isAttacking && collision.overlaps(this, player))) { this.velocity.x = 0; this.facing = Math.sign(player.centerX - this.centerX) || this.facing; }
    else {
      this.isAttacking = false;
      const direction = this.centerX > portal.centerX ? -1 : 1;
      this.velocity.x = direction * this.speed * (this.isCharging ? this.chargeMultiplier : 1);
      this.facing = Math.sign(this.velocity.x) || this.facing;
    }
    this.visualFacing = (this.visualFacing ?? this.facing) + (this.facing - (this.visualFacing ?? this.facing)) * (1 - Math.exp(-12 * dt));
    this.velocity.y += GameApp.config.game.world.gravity * this.scale * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    // Не зажимаем X: противники входят в арену из-за границы экрана.
    collision.keepInWorld(this, previousBottom, false);
    if (this.isCharging && Math.abs(this.velocity.x) > 0) {
      this.chargeTrail.push({ x: this.centerX, y: this.position.y + this.height * .55, life: .26 });
      if (this.chargeTrail.length > 12) this.chargeTrail.shift();
    }
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.visualHurtTimer = Math.max(0, this.visualHurtTimer - dt);
    if (this.isCharging) this.animation.setState("charge");
    else if (this.visualHurtTimer > 0) this.animation.setState("hurt");
    else if (this.isAttacking) this.animation.setState("attack");
    else this.animation.setState(Math.abs(this.velocity.x) > 0 ? "move" : "idle");
    this.animation.update(dt);
  }
};
