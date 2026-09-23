"use strict";
// Редактор волн Level 1: type — тип врага, count — количество,
// delay — задержка перед пачкой, side — портал появления ("left" или "right"), storm — включать ли грозу.
GameApp.levels.level1 = {
  id: "level1",
  order: 1,
  name: "Небесные руины",
  reward: 50,
  world: { width: 1 },
  playerSpawn: { x: 0.18, y: 100 },
  portalSpawn: { x: 0.74, y: 100 },
  // Все значения — доли экрана. Высота считается от меньшей стороны Canvas.
  islands: [{ x: 0.15, heightAboveGroundRatio: 0.1, width: 0.18 }, { x: 0.4, heightAboveGroundRatio: 0.14, width: 0.16 }, { x: 0.59, heightAboveGroundRatio: 0.21, width: 0.23 }],
  // Декор привязан к платформе, но не участвует в коллизиях.
  decorations: [{ type: "mushroom", platformIndex: 0, offset: 0.72, scale: 0.78 }, { type: "mushroom", platformIndex: 2, offset: 0.22, scale: 0.55 }],
  waves: [
    { type: "runner", count: 1, delay: 4, side: "left", storm: true },
    { type: "runner", count: 3, delay: 5, side: "left", storm: false },
    { type: "runner", count: 5, delay: 4, side: "left", storm: false },
    { type: "brute", count: 1, delay: 9, side: "left", storm: true },
    { type: "runner", count: 4, delay: 4, side: "left", storm: false },
    { type: "runner", count: 3, delay: 3, side: "left", storm: false },
    { type: "runner", count: 2, delay: 1, side: "right", storm: false },
    { type: "brute", count: 1, delay: 6, side: "left", storm: true },
    { type: "brute", count: 2, delay: 6, side: "left", storm: false },
    { type: "runner", count: 3, delay: 6, side: "left", storm: false },
    { type: "runner", count: 2, delay: 1, side: "right", storm: false },
    { type: "runner", count: 8, delay: 7, side: "left", storm: false },
    { type: "brute", count: 3, delay: 7, side: "left", storm: false },
    { type: "runner", count: 5, delay: 5, side: "left", storm: false },
    { type: "runner", count: 4, delay: 1, side: "right", storm: false },
  ],
  spawn: { interval: GameApp.config.game.spawn.interval }
};
