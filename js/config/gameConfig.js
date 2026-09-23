"use strict";
GameApp.config.game = {
  // Резервный размер нужен только если браузер не сообщает размер окна.
  // Игра всегда рассчитывается в 16:9. Браузер масштабирует этот кадр целиком и добавляет чёрные полосы.
  canvas: { logicalWidth: 1920, logicalHeight: 1080 },
  // Единственная константа общего размера. 1.25 означает увеличение всего на 25%.
  layout: { referenceWidth: 900, referenceHeight: 480, globalScale: 0.6 },
  // Горизонтальное сжатие всего заголовочного шрифта Bezmiar.
  typography: { headingScaleX: 0.8 },
  ui: { showPlayerHealthBar: false },
  // Размеры окружения задаются долями Canvas, а не фиксированными пикселями.
  world: { gravity: 1700, groundHeightRatio: 0.23, portalBurialRatio: 0.045, platformHeightRatio: 0.045 },
  // Здесь меняются все характеристики игрока.
  player: { width: 42, height: 42, speed: 220, jumpSpeed: 720, maxHealth: 100, attackCooldown: 0.5, attackRange: 80, regenerationPerSecond: 4, regenerationDelay: 3 },
  portal: { width: 70, height: 112, maxHealth: 10, abilityCooldown: 25, abilityDuration: 3, abilityWaveDuration: 0.9 },

  // Здесь меняются характеристики каждого типа врага.

  enemies: {
    runner: { name: "Кошмарик", description: "Маленький и быстрый, может лишь раздрожать.", width: 26, height: 34, speed: 56, health: 15, damage: 3, portalDamage: 1, attackCooldown: 0.6, color: "#f03d49" },
    brute: { name: "Старший кошмар", description: "Большой, крепкий и сильный!", width: 38, height: 48, speed: 30, health: 350, damage: 10, portalDamage: 1, attackCooldown: 0.9, color: "#ad38bd" },
    splitter: { name: "Породитель", description: "Видишь еще двоих? А они есть.", width: 36, height: 45, speed: 54, health: 140, damage: 7, portalDamage: 1, attackCooldown: 0.8, color: "#d8268e" }
  },

  // Сторона появления задаётся ключом side: "left" или "right" внутри каждой волны уровня.
  spawn: { interval: 0.6, maxEnemies: 100, portalWidth: 58, portalHeight: 112, appearanceDuration: 0.48, appearanceStartScale: 0.16, appearanceStartAlpha: 0.06 },

  // Дальняя атака работае только между rangedMinDistance и rangedMaxDistance.
  combat: { meleeDamage: 20, projectileSpeed: 400, projectileDamage: 14, projectileCooldown: 0.7, projectileSize: 10, projectileHoming: 5, rangedMinDistance: 80, rangedMaxDistance: 430, particleLifetime: 0.32, particleCount: 10, particleSpeed: 150 },
  // Длительность одноразотвых визуальных состояний, в секундах.
  animation: { attackDuration: 0.16, playerMeleeDuration: 0.22, playerRangedDuration: 0.32, hurtDuration: 0.2, deathDuration: 0.85 },
  // Оставьте путь пустым, чтобы звук был отключён. Поддерживаются mp3, ogg и wav.
  audio: {
    musicVolume: 0.35,
    soundVolume: 0.65,
    proceduralEffects: true,
    musicFadeDuration: 1.2,
    music: { menu: "asset/audio/background.mp3", game: "asset/audio/music.mp3" },
    sounds: { meleeAttack: "", rangedAttack: "", enemyDeath: "", playerHurt: "", portalHit: "", levelComplete: "" }
  },
  environment: { mushroomAssetPath: "asset/гриб.png", mushroomHeight: 105, grassHeight: 18, soilTop: "#6c4b38", soilBottom: "#2f2b32", grassLight: "#8fcf72", grassDark: "#3f7d4c" },
  // Награда за первое прохождение и время показа экрана победы.
  progression: { completionDelay: 2.5 },
  background: { solidColor: "#3f4268", waveFlashDuration: 2.4, lightningCount: 4 },
  colors: { background: "#3f4268", ground: "#43523a", island: "#63714b", player: "#f5c84b", portal: "#a77bff", health: "#55df87", enemyHealth: "#ff8a93", meleeParticle: "#fff0a5", projectileParticle: "#ffe48a" },
  debug: { showHitboxes: false }
};
