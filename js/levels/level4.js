"use strict";
// Уровень автоматически находится загрузчиком по имени файла level4.js.
GameApp.levels.level4 = {
  ...GameApp.levels.level1,
  id: "level4",
  order: 4,
  name: "Забытый сад",
  reward: 180,
  waves: [
    { type: "runner", count: 6, delay: 1, side: "left", storm: true },
    { type: "brute", count: 3, delay: 2.5, side: "right", storm: false },
    { type: "runner", count: 8, delay: 1.5, side: "left", storm: true },
    { type: "brute", count: 5, delay: 2, side: "right", storm: true }
  ]
};
