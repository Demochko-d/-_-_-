"use strict";
// Уровень автоматически находится загрузчиком по имени файла level5.js.
GameApp.levels.level5 = {
  ...GameApp.levels.level1,
  id: "level5",
  order: 5,
  name: "Сердце кошмара",
  reward: 250,
  waves: [
    { type: "runner", count: 6, delay: 1, side: "right", storm: true },
    { type: "brute", count: 3, delay: 2.5, side: "left", storm: false },
    { type: "runner", count: 8, delay: 1.5, side: "right", storm: true },
    { type: "brute", count: 5, delay: 2, side: "left", storm: true }
  ]
};
