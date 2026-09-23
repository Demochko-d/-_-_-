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
    this.regenerationTimer = 0;
    this.animation = new GameApp.animation.AnimationStateMachine(GameApp.animation.characterPoses.player);
  }

  attack(kind = "melee", direction = this.facing) {
    this.attackKind = kind;
    this.facing = direction || this.facing;
    const animation = GameApp.config.game.animation;
    this.visualAttackTimer = kind === "ranged" ? animation.playerRangedDuration : animation.playerMeleeDuration;
  }
  hurt() { this.visualHurtTimer = GameApp.config.game.animation.hurtDuration; this.regenerationTimer = GameApp.config.game.player.regenerationDelay; }
  updateDeathAnimation(dt) { if (!this.deathPose) this.deathPose = { ...this.animation.getPose(this) }; this.animation.setState("death"); this.animation.update(dt); }
  setScale(scale) { const c = GameApp.config.game.player; this.scale = scale; this.width = c.width * scale; this.height = c.height * scale; }

  update(dt, input, collision) {
    const c = GameApp.config.game.player;
    const previousBottom = this.position.y + this.height;
    this.velocity.x = (input.pressed("right") - input.pressed("left")) * c.speed * this.scale;
    if (this.velocity.x) this.facing = Math.sign(this.velocity.x);
    this.visualFacing += (this.facing - this.visualFacing) * (1 - Math.exp(-14 * dt));
    if (input.consume("jump") && collision.isOnGround(this)) this.velocity.y = -c.jumpSpeed * this.scale;
    this.velocity.y += GameApp.config.game.world.gravity * this.scale * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    collision.keepInWorld(this, previousBottom);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.visualAttackTimer = Math.max(0, this.visualAttackTimer - dt);
    this.visualHurtTimer = Math.max(0, this.visualHurtTimer - dt);
    this.regenerationTimer = Math.max(0, this.regenerationTimer - dt);
    if (this.regenerationTimer <= 0 && this.health > 0 && this.health < this.maxHealth) this.health = Math.min(this.maxHealth, this.health + c.regenerationPerSecond * dt);
    if (this.health <= 0) this.animation.setState("death");
    else if (this.visualHurtTimer > 0) this.animation.setState("hurt");
    else if (this.visualAttackTimer > 0) this.animation.setState(this.attackKind === "ranged" ? "rangedAttack" : "meleeAttack");
    else this.animation.setState(Math.abs(this.velocity.x) > 0 ? "move" : "idle");
    this.animation.update(dt);
  }
};
