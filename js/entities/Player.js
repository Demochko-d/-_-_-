"use strict";
GameApp.entities.Player = class extends GameApp.entities.Entity {
  constructor(spawn) {
    const c = GameApp.config.game.player;
    const scale = spawn.scale || 1;
    super({ ...spawn, width: c.width * scale, height: c.height * scale });
    this.scale = scale;
    this.health = c.maxHealth;
    this.maxHealth = c.maxHealth;
    this.attackTimer = 0;
    this.visualAttackTimer = 0;
    this.visualHurtTimer = 0;
    this.attackKind = "melee";
    this.facing = 1;
    this.visualFacing = 1;
    this.attackFacing = 1;
    this.attackOrigin = null;
    this.trailStrength = 0;
    this.trailAngle = 0;
    this.visualBlendDuration = 0.2;
    this.grounded = false;
    this.landTimer = 0;
    this.regenerationTimer = 0;
    this.speedBoostTimer = 0;
    this.animation = new GameApp.animation.AnimationStateMachine(GameApp.animation.characterPoses.player);
  }

  attack(kind = "melee", direction = this.facing) {
    this.attackKind = kind;
    this.attackFacing = direction || this.facing;
    this.attackOrigin = { x: this.centerX, y: this.position.y + this.height / 2 };
    this.facing = this.attackFacing;
    const animation = GameApp.config.game.animation;
    this.visualAttackTimer = kind === "ranged" ? animation.playerRangedDuration : animation.playerMeleeDuration;
  }
  hurt() { this.visualHurtTimer = GameApp.config.game.animation.hurtDuration; this.regenerationTimer = GameApp.config.game.player.regenerationDelay; }
  updateDeathAnimation(dt) { if (!this.deathPose) this.deathPose = { ...this.animation.getPose(this) }; this.animation.setState("death"); this.animation.update(dt); }
  setScale(scale) { const c = GameApp.config.game.player; this.scale = scale; this.width = c.width * scale; this.height = c.height * scale; }

  update(dt, input, collision) {
    const c = GameApp.config.game.player;
    const previousX = this.position.x, previousY = this.position.y;
    const previousBottom = this.position.y + this.height;
    const wasGrounded = collision.isOnGround(this);
    const speedMultiplier = this.speedBoostTimer > 0 ? GameApp.config.game.abilities.nightSpeed.multiplier : 1;
    this.velocity.x = (input.pressed("right") - input.pressed("left")) * c.speed * this.scale * speedMultiplier;
    if (this.velocity.x && this.visualAttackTimer <= 0) this.facing = Math.sign(this.velocity.x);
    const visualDirection = this.visualAttackTimer > 0 ? this.attackFacing : this.facing;
    this.visualFacing += (visualDirection - this.visualFacing) * (1 - Math.exp(-14 * dt));
    const dropped = input.consume("drop") && collision.dropThrough(this);
    if (input.consume("jump") && !dropped && collision.isOnGround(this)) this.velocity.y = -c.jumpSpeed * this.scale;
    this.velocity.y += GameApp.config.game.world.gravity * this.scale * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    const fallingSpeed = this.velocity.y;
    collision.keepInWorld(this, previousBottom);
    const dx = this.position.x - previousX, dy = this.position.y - previousY;
    const speed = dt > 0 ? Math.hypot(dx, dy) / dt : 0;
    if (speed > this.scale) {
      const angle = Math.atan2(dy, dx);
      const delta = Math.atan2(Math.sin(angle - this.trailAngle), Math.cos(angle - this.trailAngle));
      this.trailAngle = this.trailStrength < .01 ? angle : this.trailAngle + delta * (1 - Math.exp(-18 * dt));
      const target = Math.min(1, speed / (c.speed * this.scale));
      this.trailStrength += (target - this.trailStrength) * (1 - Math.exp(-12 * dt));
    } else this.trailStrength = 0;
    this.grounded = collision.isOnGround(this);
    if (this.grounded && !wasGrounded && fallingSpeed > 80 * this.scale) this.landTimer = 0.14;
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.visualAttackTimer = Math.max(0, this.visualAttackTimer - dt);
    this.visualHurtTimer = Math.max(0, this.visualHurtTimer - dt);
    this.landTimer = Math.max(0, this.landTimer - dt);
    this.regenerationTimer = Math.max(0, this.regenerationTimer - dt);
    this.speedBoostTimer = Math.max(0, this.speedBoostTimer - dt);
    if (this.regenerationTimer <= 0 && this.health > 0 && this.health < this.maxHealth) this.health = Math.min(this.maxHealth, this.health + c.regenerationPerSecond * dt);
    if (this.health <= 0) this.animation.setState("death");
    else if (this.visualHurtTimer > 0) this.animation.setState("hurt");
    else if (this.visualAttackTimer > 0) this.animation.setState(this.attackKind === "ranged" ? "rangedAttack" : "meleeAttack");
    else if (!this.grounded) this.animation.setState(this.velocity.y < 0 ? "jump" : "fall");
    else if (this.landTimer > 0) this.animation.setState("land");
    else this.animation.setState(Math.abs(this.velocity.x) > 0 ? "move" : "idle");
    this.animation.update(dt);
    this.animation.getPose(this);
  }
};
