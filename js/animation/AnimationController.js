"use strict";
GameApp.animation.AnimationController = class { constructor() { this.tweens = []; } add(tween) { this.tweens.push(tween); return tween; } update(dt) { this.tweens.forEach((tween) => tween.tick(dt)); this.tweens = this.tweens.filter((tween) => !tween.done); } };
