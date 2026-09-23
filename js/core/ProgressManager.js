"use strict";
GameApp.core.ProgressManager = class {
  constructor() { this.storageKey = "portalGuardProgress"; this.data = this.load(); }
  defaults() { return { coins: 0, unlockedLevels: ["level1"], completedLevels: [] }; }
  load() { try { return { ...this.defaults(), ...JSON.parse(localStorage.getItem(this.storageKey) || "{}") }; } catch { return this.defaults(); } }
  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.data)); }
  isUnlocked(levelId) { return this.data.unlockedLevels.includes(levelId); }
  complete(levelId, nextLevelId) { const alreadyCompleted = this.data.completedLevels.includes(levelId); if (nextLevelId && !this.data.unlockedLevels.includes(nextLevelId)) this.data.unlockedLevels.push(nextLevelId); const reward = GameApp.levels[levelId]?.reward || 0; if (!alreadyCompleted) this.data.completedLevels.push(levelId); this.data.coins += reward; this.save(); return reward; }
  reset() { this.data = this.defaults(); this.save(); }
};
