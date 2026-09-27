"use strict";
// Уровень автоматически находится загрузчиком по имени файла level8.js.
GameApp.levels.level9 = {
  ...GameApp.levels.level1,
  id: "level9",
  order: 9,
  name: "12 ночи",
  reward: 250,
  waves: [
    { type: "gigant", count: 1, delay: 0, side: "left", storm: false },
    { type: "gigant", count: 1, delay: 0, side: "right", storm: false },

  ]
};
