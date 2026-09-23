"use strict";
GameApp.core.SceneManager = class { constructor(game) { this.game = game; this.current = null; } change(Scene, data) { this.current?.exit?.(); this.current = new Scene(this.game, data); this.current.enter?.(); } update(dt) { this.current?.update?.(dt); } draw(ctx) { this.current?.draw?.(ctx); } };
