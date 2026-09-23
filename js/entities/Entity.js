"use strict";
GameApp.entities.Entity = class { constructor({ x, y, width, height }) { this.position = { x, y }; this.velocity = { x: 0, y: 0 }; this.width = width; this.height = height; this.active = true; } get centerX() { return this.position.x + this.width / 2; } update() {} draw(ctx, renderer) { renderer.draw(ctx, this); } };
