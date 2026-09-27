"use strict";
// Скорость восстановления здоровья героя, HP в секунду.
const PLAYER_REGENERATION_PER_SECOND = 2;
// Интервал появления сердца после подбора (секунды) и мгновенное лечение (HP).
const MUSHROOM_HEART_INTERVAL = 20;
const MUSHROOM_HEART_HEAL = 30;
GameApp.config.game = {
  // Резервный размер нужен только если браузер не сообщает размер окна.
  // Игра всегда рассчитывается в 16:9. Браузер масштабирует этот кадр целиком и добавляет чёрные полосы.
  canvas: { logicalWidth: 1920, logicalHeight: 1080 },
  // Единственная константа общего размера. 1.25 означает увеличение всего на 25%.
  layout: { referenceWidth: 900, referenceHeight: 480, globalScale: 0.6 },
  // Горизонтальное сжатие всего заголовочного шрифта Bezmiar.
  typography: { headingScaleX: 0.67 },
  ui: { showPlayerHealthBar: false },
  mushroomHearts: { interval: MUSHROOM_HEART_INTERVAL, heal: MUSHROOM_HEART_HEAL, initialStagger: 3, size: 18 },
  help: { text: "Не дай кошмарам попасть в наш мир! Защищай портал любой ценой. Для перемещения используй A / D или ← / →. Для прыжка используй W или ↑. Ты атакуешь автоматически: дальняя атака действует на расстоянии, ближняя атака используется, когда противник находится рядом. Ближняя атака наносит больше урона в секунду, но заставляет тебя подходить к врагам. Для использования способности нажми на неё или клавишу Enter. За прохождение уровней ты получаешь монеты, за которые можешь покупать новые способности, а затем экипировать понравившуюся. Если портал будет разрушен или твоё здоровье опустится до 0, кошмары победят. Твое здоровье со временем восстанавливается, что бы восстоновить здоровье быстрее собирай сердечки, которые дают грибы." },
  // Размеры окружения задаются долями Canvas, а не фиксированными пикселями.
  world: { gravity: 1700, groundHeightRatio: 0.23, portalBurialRatio: 0.006, platformHeightRatio: 0.045 },
  // Здесь меняются все характеристики игрока.
  player: { width: 42, height: 42, speed: 220, jumpSpeed: 720, maxHealth: 100, attackCooldown: 0.5, attackRange: 80, regenerationPerSecond: PLAYER_REGENERATION_PER_SECOND, regenerationDelay: 3 },
  portal: { width: 70, height: 112, maxHealth: 10, damageThresholds: [0.75, 0.5, 0.25, 0], abilityCooldown: 25, abilityDuration: 3, abilityWaveDuration: 0.9 },
  abilities: {
    portalWave: { name: "Волна сна", description: "Останавливает всех противников на 3 секунды", price: 0, cooldown: 20 },
    giantShot: { name: "Звёздное ядро", description: "Гигантский снаряд наносит ближайшему противнику 175 урона", price: 1, cooldown: 18, damage: 175, speed: 520, size: 42 },
    nightSpeed: { name: "Скорость ночи", description: "Удваивает скорость героя на 20 секунд", price: 1, cooldown: 25, duration: 20, multiplier: 2 },
    strongMasonry: { name: "Крепкая кладка", description: "Пассивно увеличивает здоровье портала на 2", price: 1, passive: true, portalHealthBonus: 2 },
    fullHeal: { name: "Живое сердце", description: "Мгновенно восстанавливает всё здоровье хранителя", price: 1, cooldown: 21 },
    strongSpirit: { name: "Сильный духом", description: "Пассивно увеличивает здоровье хранителя на 30", price: 1, passive: true, playerHealthBonus: 30 },
    multiShot: { name: "Мультивыстрел", description: "Выпускает снаряд по каждому видимому противнику, нанося 30 урона", price: 1, cooldown: 17, damage: 30, speed: 600, size: 16 }
  },
  abilityIcons: {
    portalWave: '<circle cx="32" cy="32" r="5"/><circle cx="32" cy="32" r="16"/><circle cx="32" cy="32" r="27"/>',
    giantShot: '<path d="M5 23h13M3 32h11M7 41h11"/><circle cx="38" cy="32" r="17"/>',
    fullHeal: '<path d="M24 8h16v16h16v16H40v16H24V40H8V24h16Z"/>',
    strongMasonry: '<path d="M32 6 53 14v17c0 13-8 21-21 27C19 52 11 44 11 31V14Z"/><path d="M32 17v28M20 26h24"/>',
    strongSpirit: '<path d="M32 53 12 33C1 21 17 8 32 22 47 8 63 21 52 33Z"/><path d="M32 27v12M26 33h12"/>',
    nightSpeed: '<path d="M35 5 16 35h15l-3 24 20-32H33Z"/>',
    multiShot: '<path d="M5 10h12M3 17h11M5 29h12M3 36h11M5 48h12M3 55h11"/><circle cx="39" cy="13" r="6"/><circle cx="43" cy="32" r="6"/><circle cx="39" cy="51" r="6"/>'
  },

  // Здесь меняются характеристики каждого типа врага.

  enemies: {
    runner: { name: "Кошмарик", description: "Твой первый кошмар. К счастью, он не особо силён, но всё равно будет раздражать.", width: 26, height: 34, speed: 56, health: 15, damage: 3, portalDamage: 1, attackCooldown: 0.6, color: "#f03d49" },
    brute: { name: "Силач", description: "Приснится же такое… Большой и сильный противник, зато не слишком быстрый.", width: 38, height: 48, speed: 30, health: 350, damage: 10, portalDamage: 1, attackCooldown: 0.9, color: "#ad38bd" },
    splitter: { name: "Породитель", description: "Видишь ещё двоих? А они есть. После смерти Породитель распадается на двух комариков.", width: 36, height: 45, speed: 54, health: 140, damage: 7, portalDamage: 2, attackCooldown: 0.8, color: "#d8268e" },
    ninja: { name: "Ниндзя", description: "Хитрый кошмар. При твоём приближении становится невидимым, поэтому атакуй его издалека.", width: 25, height: 33, speed: 50, health: 100, damage: 14, portalDamage: 1, attackCooldown: 0.6, color: "#050103", stealthDistance: 115 },
    runner2: { name: "Дух", description: "Такой маленький и милый… А ещё ему совершенно всё равно на тебя. Он проходит сквозь игрока и атакует только портал.", width: 21, height: 29, speed: 70, health: 55, damage: 0, portalDamage: 1, attackCooldown: 1, color: "#00ee14" },
    sniper: { name: "Стрелок", description: "Не особо силен, зато атакует издалека.", width: 30, height: 39, speed: 38, health: 80, damage: 5, portalDamage: 1, attackCooldown: 0.8, color: "#f0dbdb", attackRange: 260 },
    runner3: { name: "Кошмарный дух", description: "Постарайся не пускать его близко к порталу. Он проходит сквозь игрока и атакует только портал, но сильнее брата!", width: 27, height: 35, speed: 72, health: 190, damage: 0, portalDamage: 3, attackCooldown: 1, color: "#f5be09" },
    gigant: { name: "Гигант", description: "Просто машина. При появлении идёт на таран — его скорость и сила атаки удваиваются!", width: 50, height: 60, speed: 29, health: 950, damage: 35, portalDamage: 5, attackCooldown: 1.2, color: "#1b0ce9", chargeMultiplier: 2 },
  },

  // Сторона появления задаётся ключом side: "left" или "right" внутри каждой волны уровня.
  spawn: { interval: 0.6, maxEnemies: 100, portalWidth: 58, portalHeight: 112, appearanceDuration: 0.48, appearanceStartScale: 0.16, appearanceStartAlpha: 0.06 },

  // Дальняя атака работае только между rangedMinDistance и rangedMaxDistance.
  combat: { meleeDamage: 20, projectileSpeed: 400, projectileDamage: 14, projectileCooldown: 0.7, projectileSize: 10, projectileHoming: 5, rangedMinDistance: 80, rangedMaxDistance: 430, particleLifetime: 0.32, particleCount: 10, particleSpeed: 150 },
  // Длительность одноразотвых визуальных состояний, в секундах.
  animation: { attackDuration: 0.16, playerMeleeDuration: 0.22, playerRangedDuration: 0.32, hurtDuration: 0.2, deathDuration: 0.525 },
  // Оставьте путь пустым, чтобы звук был отключён. Поддерживаются mp3, ogg и wav.
  audio: {
    musicVolume: 0.35,
    soundVolume: 0.65,
    proceduralEffects: true,
    musicFadeDuration: 1.2,
    music: { menu: "asset/audio/background.mp3", game: "asset/audio/music.mp3" },
    sounds: { meleeAttack: "", rangedAttack: "", enemyDeath: "", playerHurt: "", portalHit: "", levelComplete: "" }
  },
  environment: { mushroomHeight: 105, mushroomCaps: ["#f17dab", "#b48bea", "#ffb878"], mushroomStem: "#fff0d5", grassHeight: 18, soilTop: "#c787a5", soilBottom: "#936a99", grassLight: "#c1f3b3", grassDark: "#76c9aa", outline: "#654765" },
  // Награда за первое прохождение и время показа экрана победы.
  progression: { completionDelay: 2.5 },
  background: { solidColor: "#3f4268", waveFlashDuration: 2.4, lightningCount: 4 },
  colors: { background: "#3f4268", ground: "#43523a", island: "#63714b", player: "#f5c84b", portal: "#a77bff", health: "#55df87", enemyHealth: "#ff8a93", meleeParticle: "#fff0a5", projectileParticle: "#ffe48a" },
  debug: { showHitboxes: false }
};
