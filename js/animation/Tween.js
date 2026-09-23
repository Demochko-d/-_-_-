"use strict";
GameApp.animation.Tween = class { constructor(duration, update, easing = GameApp.animation.easing.linear) { this.duration = duration; this.update = update; this.easing = easing; this.elapsed = 0; this.done = false; } tick(dt) { this.elapsed += dt; this.update(this.easing(Math.min(this.elapsed / this.duration, 1))); this.done = this.elapsed >= this.duration; } };
