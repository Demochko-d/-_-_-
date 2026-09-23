"use strict";
GameApp.scenes.GameScene = class {
  constructor(game, levelId) { this.game = game; this.level = game.levels.get(levelId); }

  enter() {
    this.enemies = [];
    this.completed = false;
    this.reward = 0;
    this.animations = new GameApp.animation.AnimationController();
    this.particles = new GameApp.systems.ParticleSystem();
    this.combat = new GameApp.systems.CombatSystem(this.game.events, this.particles);
    this.background = new GameApp.renderers.DreamBackgroundRenderer();
    this.terrain = new GameApp.renderers.TerrainRenderer();
    this.mushroomDecor = new GameApp.renderers.MushroomDecorRenderer();
    this.game.setCanvas();
    this.paused = false;
    this.defeated = false;
    this.portalAbilityCooldown = GameApp.config.game.portal.abilityCooldown;
    this.portalWaveTimer = 0;
    this.portalWaveRadius = 0;
    this.portalWaveId = 0;
    this.noiseCanvas = document.createElement("canvas");
    this.noiseCanvas.width = 640; this.noiseCanvas.height = 360;
    this.noiseContext = this.noiseCanvas.getContext("2d");
    this.noiseRefreshTimer = 0;
    this.spawner = new GameApp.systems.SpawnSystem(this.level, (number, wave) => {
      if (wave.storm) this.background.triggerWave(number);
    });
    this.resize(this.game.canvas.width, this.game.canvas.height);
    this.createGameFieldUi();
    this.createPortalAbilityButton();
    this.createPauseButton();
    this.createGameOverlay();
    this.game.events.emit("levelStarted", this.level);
  }

  resize(width, height) {
    const config = GameApp.config.game;
    const shortSide = Math.min(width, height);
    const scale = Math.min(width / config.layout.referenceWidth, height / config.layout.referenceHeight) * config.layout.globalScale;
    const groundHeight = height * config.world.groundHeightRatio;
    const groundY = height - groundHeight;
    const previousWidth = this.viewportWidth || width;
    const previousHeight = this.viewportHeight || height;
    const ratioX = width / previousWidth;
    const ratioY = height / previousHeight;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.entityScale = scale;
    this.groundHeight = groundHeight;
    this.level.world.width = width;
    this.platforms = this.level.islands.map((island) => ({
      x: width * island.x,
      y: groundY - shortSide * island.heightAboveGroundRatio,
      width: width * island.width,
      height: shortSide * config.world.platformHeightRatio
    }));
    if (!this.player) this.player = new GameApp.entities.Player({ x: width * this.level.playerSpawn.x, y: groundY - config.player.height * scale, scale });
    else { this.player.position.x *= ratioX; this.player.position.y *= ratioY; this.player.setScale(scale); }
    this.player.position.x = GameApp.utils.clamp(this.player.position.x, 0, width - this.player.width);
    this.player.position.y = Math.min(this.player.position.y, groundY - this.player.height);
    if (!this.portal) this.portal = new GameApp.entities.Portal({ x: 0, y: 0, scale });
    else this.portal.setScale(scale);
    this.portal.position.x = width * this.level.portalSpawn.x;
    this.portal.position.y = groundY - this.portal.height + shortSide * config.world.portalBurialRatio;
    this.enemies.forEach((enemy) => { enemy.position.x *= ratioX; enemy.position.y *= ratioY; enemy.setScale(scale); });
    this.collision = new GameApp.systems.CollisionSystem(width, groundY, this.platforms);
    this.background.resize(width, height);
    if (this.spawner) { this.spawner.entityScale = scale; this.spawner.worldWidth = width; this.spawner.groundY = groundY; }
  }

  exit() { this.gameUiLayer?.remove(); this.gameOverlay?.remove(); this.game.clearCanvas(); }

  update(dt) {
    if (this.game.input.consume("pause")) {
      if (!this.defeated) this.paused ? this.resumeGame() : this.pauseGame();
      return;
    }
    if (this.paused) return;
    if (this.defeated) { if (this.player.health <= 0) this.player.updateDeathAnimation(dt); return; }
    if (this.game.input.consume("portalAbility")) this.usePortalAbility();
    this.particles.update(dt);
    this.animations.update(dt);
    this.background.update(dt);
    this.terrain.update(dt);
    this.mushroomDecor.update(dt);
    this.portal.update(dt);
    this.updateCriticalNoise(dt);
    if (!this.completed && this.player.health > 0 && this.portal.health > 0) {
      this.portalAbilityCooldown = Math.max(0, this.portalAbilityCooldown - dt);
    }
    this.updatePortalAbilityButton();
    if (this.completed) {
      this.finishTimer -= dt;
      if (this.finishTimer <= 0) this.game.sceneManager.change(GameApp.scenes.LevelSelectScene);
      return;
    }
    if (this.player.health <= 0 || this.portal.health <= 0) { this.showDefeatMenu(); return; }
    this.player.update(dt, this.game.input, this.collision);
    this.spawner.update(dt, this.enemies);
    this.updatePortalShockwave(dt);
    this.enemies.filter((enemy) => enemy.active).forEach((enemy) => enemy.update(dt, this.portal, this.player, this.collision));
    this.combat.update(dt, this.player, this.enemies, this.portal);
    if (this.player.health <= 0 || this.portal.health <= 0) { this.showDefeatMenu(); return; }
    const splitChildren = [];
    this.enemies.forEach((enemy) => {
      if (!enemy.pendingSplit) return;
      enemy.pendingSplit = false;
      const runnerWidth = GameApp.config.game.enemies.runner.width * enemy.scale;
      [-1, 1].forEach((direction) => splitChildren.push(new GameApp.entities.Enemy("runner", { x: enemy.centerX + direction * runnerWidth * 0.7 - runnerWidth / 2, y: enemy.position.y + enemy.height - GameApp.config.game.enemies.runner.height * enemy.scale, scale: enemy.scale })));
    });
    this.enemies.push(...splitChildren);
    this.enemies = this.enemies.filter((enemy) => enemy.active);
    if (this.spawner.isFinished() && this.enemies.length === 0) {
      this.reward = this.game.progress.complete(this.level.id, this.game.levels.nextId(this.level.id));
      this.completed = true;
      this.finishTimer = GameApp.config.game.progression.completionDelay;
      this.game.events.emit("levelCompleted", { level: this.level, reward: this.reward });
    }
  }

  drawBar(ctx, entity, color) {
    const scale = entity.scale || 1;
    const width = Math.max(entity.width, 38 * scale);
    const height = Math.max(7, 6 * scale);
    const border = Math.max(1.5, 1.5 * scale);
    const x = entity.centerX - width / 2;
    const y = entity.position.y - 14 * scale;
    const ratio = GameApp.utils.clamp(entity.health / entity.maxHealth, 0, 1);
    ctx.save();
    ctx.fillStyle = "rgba(31,24,39,.82)"; ctx.strokeStyle = "#fffaf0"; ctx.lineWidth = border;
    ctx.beginPath(); ctx.roundRect(x, y, width, height, height / 2); ctx.fill(); ctx.stroke();
    const innerX = x + border, innerY = y + border, innerHeight = Math.max(1, height - border * 2), innerWidth = Math.max(0, (width - border * 2) * ratio);
    if (innerWidth > 0) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(innerX, innerY, innerWidth, innerHeight, innerHeight / 2); ctx.fill(); }
    ctx.restore();
  }
  drawMessage(ctx, text) { ctx.fillStyle = "#fff8ed"; ctx.font = "32px 'Bezmiar Cyrillic', sans-serif"; this.drawHeading(ctx, text, this.game.canvas.width / 2, this.game.canvas.height * 0.2, "center"); }

  createGameFieldUi() {
    const layer = document.createElement("div");
    layer.className = "game-field-ui";
    this.game.root.append(layer);
    this.gameUiLayer = layer;
    this.syncGameFieldUi();
  }

  syncGameFieldUi() {
    if (!this.gameUiLayer || !this.game.canvas) return;
    const canvasRect = this.game.canvas.getBoundingClientRect();
    const rootRect = this.game.root.getBoundingClientRect();
    Object.assign(this.gameUiLayer.style, {
      left: (canvasRect.left - rootRect.left) + "px",
      top: (canvasRect.top - rootRect.top) + "px",
      width: canvasRect.width + "px",
      height: canvasRect.height + "px"
    });
  }

  createPauseButton() {
    const button = document.createElement("button");
    button.className = "game-pause-button";
    button.type = "button";
    button.setAttribute("aria-label", "Пауза");
    button.innerHTML = '<span aria-hidden="true">Ⅱ</span><b>Пауза</b>';
    button.onclick = () => this.pauseGame();
    this.gameUiLayer.append(button);
    this.pauseButton = button;
  }

  createGameOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "game-overlay";
    overlay.hidden = true;
    overlay.innerHTML = '<section class="game-dialog"><span class="game-dialog__eyebrow"></span><h2 class="game-dialog__title"></h2><p class="game-dialog__text"></p><div class="game-dialog__actions"><button data-action="resume">Продолжить</button><button data-action="restart">Заново</button><button data-action="levels">В меню</button></div></section>';
    overlay.querySelector('[data-action="resume"]').onclick = () => this.resumeGame();
    overlay.querySelector('[data-action="restart"]').onclick = () => this.restartLevel();
    overlay.querySelector('[data-action="levels"]').onclick = () => this.game.sceneManager.change(GameApp.scenes.LevelSelectScene);
    this.game.root.append(overlay);
    this.gameOverlay = overlay;
    this.resumeButton = overlay.querySelector('[data-action="resume"]');
  }

  pauseGame() {
    if (this.paused || this.defeated || this.completed) return;
    this.paused = true;
    this.gameOverlay.hidden = false;
    this.gameOverlay.className = "game-overlay is-pause";
    this.gameOverlay.querySelector(".game-dialog__eyebrow").textContent = "Игра остановлена";
    this.gameOverlay.querySelector(".game-dialog__title").textContent = "Пауза";
    this.gameOverlay.querySelector(".game-dialog__text").textContent = "Передохни — сон подождёт.";
    this.resumeButton.hidden = false;
  }

  resumeGame() {
    if (!this.paused || this.defeated) return;
    this.paused = false;
    this.gameOverlay.hidden = true;
  }

  restartLevel() { this.game.sceneManager.change(GameApp.scenes.GameScene, this.level.id); }

  showDefeatMenu() {
    if (this.defeated) return;
    this.defeated = true;
    this.paused = false;
    if (this.player.health <= 0) this.player.updateDeathAnimation(0);
    this.portalAbilityButton.hidden = true;
    this.pauseButton.hidden = true;
    this.gameOverlay.hidden = false;
    this.gameOverlay.className = "game-overlay is-defeat";
    this.gameOverlay.querySelector(".game-dialog__eyebrow").textContent = "Сон рассыпался";
    this.gameOverlay.querySelector(".game-dialog__title").textContent = "Поражение";
    this.gameOverlay.querySelector(".game-dialog__text").textContent = this.portal.health <= 0 ? "Портал был разрушен." : "Хранитель потерял все силы.";
    this.resumeButton.hidden = true;
  }

  createPortalAbilityButton() {
    const button = document.createElement("button");
    button.className = "portal-ability is-cooling";
    button.type = "button";
    button.setAttribute("aria-label", "Ударная волна портала — Enter");
    button.innerHTML = '<span class="portal-ability__icon" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M9 21c8-8 16-8 24 0s16 8 23 0M9 32c8-8 16-8 24 0s16 8 23 0M9 43c8-8 16-8 24 0s16 8 23 0"/></svg></span><span class="portal-ability__shade"></span><span class="portal-ability__time"></span><span class="portal-ability__key">ENTER</span>';
    button.onclick = () => this.usePortalAbility();
    this.gameUiLayer.append(button);
    this.portalAbilityButton = button;
    this.portalAbilityShade = button.querySelector(".portal-ability__shade");
    this.portalAbilityTime = button.querySelector(".portal-ability__time");
    this.updatePortalAbilityButton();
  }

  updatePortalAbilityButton() {
    if (!this.portalAbilityButton) return;
    const total = GameApp.config.game.portal.abilityCooldown;
    const ratio = GameApp.utils.clamp(this.portalAbilityCooldown / total, 0, 1);
    const ready = ratio <= 0 && !this.completed && this.player.health > 0 && this.portal.health > 0;
    this.portalAbilityShade.style.height = (ratio * 100) + "%";
    this.portalAbilityTime.textContent = ready ? "ГОТОВО" : Math.ceil(this.portalAbilityCooldown) + "с";
    this.portalAbilityButton.classList.toggle("is-ready", ready);
    this.portalAbilityButton.classList.toggle("is-cooling", !ready);
    this.portalAbilityButton.setAttribute("aria-disabled", String(!ready));
  }

  usePortalAbility() {
    if (this.portalAbilityCooldown > 0 || this.paused || this.defeated || this.completed || this.player.health <= 0 || this.portal.health <= 0) return;
    const config = GameApp.config.game.portal;
    this.portalAbilityCooldown = config.abilityCooldown;
    this.portalWaveTimer = config.abilityWaveDuration;
    this.portalWaveRadius = 0;
    this.portalWaveId += 1;
    this.updatePortalAbilityButton();
  }

  updatePortalShockwave(dt) {
    if (this.portalWaveTimer <= 0) return;
    const config = GameApp.config.game.portal;
    const previousRadius = this.portalWaveRadius;
    this.portalWaveTimer = Math.max(0, this.portalWaveTimer - dt);
    const progress = 1 - this.portalWaveTimer / config.abilityWaveDuration;
    const maxRadius = Math.hypot(this.viewportWidth, this.viewportHeight);
    this.portalWaveRadius = maxRadius * progress;
    const centerX = this.portal.centerX;
    const centerY = this.portal.position.y + this.portal.height * 0.55;
    this.enemies.forEach((enemy) => {
      if (!enemy.active || !enemy.alive || enemy.lastPortalWaveId === this.portalWaveId) return;
      const distance = Math.hypot(enemy.centerX - centerX, enemy.position.y + enemy.height / 2 - centerY);
      const enemyRadius = Math.hypot(enemy.width, enemy.height) / 2;
      const touched = distance - enemyRadius <= this.portalWaveRadius && distance + enemyRadius >= previousRadius;
      if (!touched) return;
      enemy.lastPortalWaveId = this.portalWaveId;
      enemy.stun(config.abilityDuration);
    });
  }

  updateCriticalNoise(dt) {
    const ratio = this.player.health / this.player.maxHealth;
    if (this.player.health <= 0 || this.portal.health <= 0 || ratio >= 0.7) return;
    this.noiseRefreshTimer -= dt;
    if (this.noiseRefreshTimer > 0) return;
    this.noiseRefreshTimer = 0.045;
    const image = this.noiseContext.createImageData(this.noiseCanvas.width, this.noiseCanvas.height);
    for (let pixel = 0; pixel < image.data.length; pixel += 4) {
      const x = (pixel / 4) % this.noiseCanvas.width;
      const edge = Math.pow(Math.abs(x / (this.noiseCanvas.width - 1) - 0.5) * 2, 1.7);
      const grain = Math.random();
      image.data[pixel] = 0; image.data[pixel + 1] = 0; image.data[pixel + 2] = 0;
      image.data[pixel + 3] = grain > 0.58 ? Math.round((18 + grain * 190) * (0.12 + edge * 0.88)) : 0;
    }
    this.noiseContext.putImageData(image, 0, 0);
  }

  drawCriticalNoise(ctx, width, height) {
    const ratio = Math.max(0, this.player.health / this.player.maxHealth);
    if (this.player.health <= 0 || this.portal.health <= 0 || ratio >= 0.7 || !this.noiseCanvas) return;
    const strength = (0.7 - ratio) / 0.5;
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.18 + strength * 0.66;
    ctx.drawImage(this.noiseCanvas, 0, 0, width, height);
    ctx.restore();
  }

  drawPortalShockwave(ctx, width, height) {
    if (this.portalWaveTimer <= 0) return;
    const duration = GameApp.config.game.portal.abilityWaveDuration;
    const progress = 1 - this.portalWaveTimer / duration;
    const centerX = this.portal.centerX;
    const centerY = this.portal.position.y + this.portal.height * 0.55;
    const radius = this.portalWaveRadius;
    ctx.save();
    ctx.globalAlpha = Math.pow(1 - progress, 0.55);
    ctx.strokeStyle = "#ffe7f1"; ctx.lineWidth = 18 - progress * 11;
    ctx.shadowColor = "#d9a2c2"; ctx.shadowBlur = 34;
    ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha *= 0.45; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(centerX, centerY, radius * 0.86, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  drawSpawnPortals(ctx, width, height) {
    const spawn = GameApp.config.game.spawn;
    const portalWidth = spawn.portalWidth * this.entityScale;
    const portalHeight = spawn.portalHeight * this.entityScale;
    const groundY = height - this.groundHeight;
    ctx.save();
    ctx.fillStyle = "#382c49";
    ctx.fillRect(0, groundY - portalHeight, portalWidth, portalHeight);
    ctx.fillRect(width - portalWidth, groundY - portalHeight, portalWidth, portalHeight);
    ctx.restore();
  }

  heartPath(ctx, x, y, size) {
    ctx.beginPath(); ctx.moveTo(x + size * 0.5, y + size * 0.92);
    ctx.bezierCurveTo(x + size * 0.42, y + size * 0.82, x + size * 0.08, y + size * 0.58, x + size * 0.08, y + size * 0.31);
    ctx.bezierCurveTo(x + size * 0.08, y + size * 0.08, x + size * 0.36, y, x + size * 0.5, y + size * 0.2);
    ctx.bezierCurveTo(x + size * 0.64, y, x + size * 0.92, y + size * 0.08, x + size * 0.92, y + size * 0.31);
    ctx.bezierCurveTo(x + size * 0.92, y + size * 0.58, x + size * 0.58, y + size * 0.82, x + size * 0.5, y + size * 0.92); ctx.closePath();
  }

  drawHeading(ctx, text, x, y, align = "start") {
    const scale = GameApp.config.game.typography.headingScaleX;
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, 1); ctx.textAlign = align;
    ctx.fillText(text, 0, 0); ctx.restore();
  }

  drawHud(ctx, width) {
    const playerRatio = Math.max(0, this.player.health / this.player.maxHealth);
    const pad = 34, panelY = 28, panelH = 104, playerW = 290, portalW = 250;
    const panel = (x, w) => {
      ctx.fillStyle = "rgba(96,66,86,.28)"; ctx.beginPath(); ctx.roundRect(x, panelY + 7, w, panelH, 24); ctx.fill();
      const fill = ctx.createLinearGradient(x, panelY, x + w, panelY + panelH); fill.addColorStop(0, "#fff1d8"); fill.addColorStop(.52, "#c5e0ee"); fill.addColorStop(1, "#e8a9be");
      ctx.fillStyle = fill; ctx.strokeStyle = "#fff9ed"; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, panelY, w, panelH, 24); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(105,145,171,.72)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x + 5, panelY + 5, w - 10, panelH - 10, 20); ctx.stroke();
    };
    ctx.save(); panel(pad, playerW); panel(width - pad - portalW, portalW);
    const heartX = pad + 18, heartY = panelY + 13, heartSize = 78;
    this.heartPath(ctx, heartX, heartY, heartSize); ctx.fillStyle = "#7ca3bd"; ctx.fill();
    ctx.save(); this.heartPath(ctx, heartX, heartY, heartSize); ctx.clip();
    const fillTop = heartY + heartSize * (1 - playerRatio);
    const heartFill = ctx.createLinearGradient(0, heartY, 0, heartY + heartSize); heartFill.addColorStop(0, "#ff6b8e"); heartFill.addColorStop(1, "#c91e52");
    ctx.fillStyle = heartFill; ctx.fillRect(heartX, fillTop, heartSize, heartY + heartSize - fillTop); ctx.restore();
    this.heartPath(ctx, heartX, heartY, heartSize); ctx.strokeStyle = "#fff8ed"; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "#4f6682"; ctx.font = "17px 'Bezmiar Cyrillic', sans-serif"; this.drawHeading(ctx, "ХРАНИТЕЛЬ", pad + 112, panelY + 37);
    ctx.fillStyle = "#5e4057"; ctx.font = "26px Mariinavo, sans-serif"; ctx.fillText(Math.ceil(this.player.health) + " HP", pad + 112, panelY + 72);
    if (this.player.regenerationTimer <= 0 && this.player.health < this.player.maxHealth && this.player.health > 0) { ctx.fillStyle = "#6a8b7c"; ctx.font = "13px Mariinavo, sans-serif"; ctx.fillText("+ РЕГЕНЕРАЦИЯ", pad + 112, panelY + 93); }
    const portalX = width - pad - portalW;
    ctx.strokeStyle = "#e68cae"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(portalX + 48, panelY + panelH / 2, 25, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = "#6f9fc0"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(portalX + 48, panelY + panelH / 2, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#4f6682"; ctx.font = "17px 'Bezmiar Cyrillic', sans-serif"; this.drawHeading(ctx, "ПОРТАЛ", portalX + 88, panelY + 37);
    ctx.fillStyle = "#5e4057"; ctx.font = "30px Mariinavo, sans-serif"; ctx.fillText(Math.ceil(this.portal.health) + "/" + this.portal.maxHealth, portalX + 88, panelY + 75);
    ctx.restore();
  }

  draw(ctx) {
    if (!ctx) return;
    this.syncGameFieldUi();
    const config = GameApp.config.game;
    const width = this.game.canvas.width;
    const height = this.game.canvas.height;
    this.background.draw(ctx, width, height);
    this.drawSpawnPortals(ctx, width, height);
    this.platforms.forEach((platform) => this.terrain.drawPlatform(ctx, platform));
    this.mushroomDecor.draw(ctx, this.platforms, this.level.decorations || [], this.entityScale);
    this.portal.draw(ctx, GameApp.renderers.PortalRenderer);
    this.player.draw(ctx, GameApp.renderers.PlayerRenderer);
    this.enemies.forEach((enemy) => enemy.draw(ctx, GameApp.renderers.EnemyRenderer));
    this.combat.draw(ctx);
    this.particles.draw(ctx);
    this.drawPortalShockwave(ctx, width, height);
    this.terrain.drawGround(ctx, 0, height - this.groundHeight, width, this.groundHeight);
    this.enemies.filter((enemy) => enemy.alive && !enemy.isEmerging).forEach((enemy) => this.drawBar(ctx, enemy, config.colors.enemyHealth));
    if (config.ui.showPlayerHealthBar && this.player.health > 0) this.drawBar(ctx, this.player, config.colors.health);
    this.drawHud(ctx, width);
    if (this.completed) this.drawMessage(ctx, this.reward > 0 ? "Уровень пройден! +" + this.reward + " монет" : "Уровень пройден!");
    this.drawCriticalNoise(ctx, width, height);
  }
};
