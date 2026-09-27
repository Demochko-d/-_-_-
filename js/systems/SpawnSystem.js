"use strict";
GameApp.systems.SpawnSystem = class {
  constructor(level, onWaveStart, onSpawn) {
    this.entityScale = 1; this.worldWidth = 1; this.groundY = 0;
    this.waves = level.waves; this.waveIndex = 0; this.remaining = 0; this.kind = null; this.side = "left";
    this.timer = 0; this.spawnDelay = level.spawn.interval; this.spawnCount = 0; this.waveAnnounced = false;
    this.onWaveStart = onWaveStart;
    this.onSpawn = onSpawn;
  }
  update(dt, enemies) {
    this.timer -= dt;
    if (this.remaining === 0 && this.waveIndex < this.waves.length && this.timer <= 0) {
      const wave = this.waves[this.waveIndex++];
      this.remaining = wave.count; this.kind = wave.type; this.side = wave.side === "right" ? "right" : "left"; this.timer = wave.delay; this.waveAnnounced = false;
    }
    if (this.remaining > 0 && this.timer <= 0 && enemies.length < GameApp.config.game.spawn.maxEnemies) {
      if (!this.waveAnnounced) { this.onWaveStart?.(this.waveIndex, this.waves[this.waveIndex - 1]); this.waveAnnounced = true; }
      const enemyWidth = GameApp.config.game.enemies[this.kind].width * this.entityScale;
      const spawnPortalWidth = GameApp.config.game.spawn.portalWidth * this.entityScale;
      const x = this.side === "left" ? (spawnPortalWidth - enemyWidth) / 2 : this.worldWidth - spawnPortalWidth + (spawnPortalWidth - enemyWidth) / 2;
      const y = this.groundY - GameApp.config.game.enemies[this.kind].height * this.entityScale;
      enemies.push(new GameApp.entities.Enemy(this.kind, { x, y, scale: this.entityScale, emerging: true, spawnSide: this.side }));
      this.onSpawn?.(this.side);
      this.spawnCount += 1; this.remaining -= 1;
      this.timer = this.remaining > 0 ? this.spawnDelay : 0;
    }
  }
  isFinished() { return this.waveIndex >= this.waves.length && this.remaining === 0; }
};
