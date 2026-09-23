"use strict";
GameApp.core.LevelManager = class {
  get(id) { return GameApp.levels[id]; }
  all() { return Object.values(GameApp.levels).sort((a, b) => (a.order ?? Number(a.id.replace(/\D/g, ""))) - (b.order ?? Number(b.id.replace(/\D/g, "")))); }
  nextId(id) { const levels = this.all(); const index = levels.findIndex((level) => level.id === id); return levels[index + 1]?.id || null; }
};
