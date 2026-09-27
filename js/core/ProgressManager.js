"use strict";
GameApp.core.ProgressManager = class {
  constructor() { this.storageKey = "portalGuardProgress"; this.data = this.load(); }
  defaults() { return { coins: 0, unlockedLevels: ["level1"], completedLevels: [], ownedAbilities: ["portalWave"], equippedAbility: "portalWave" }; }
  load() {
    try {
      const data = { ...this.defaults(), ...JSON.parse(localStorage.getItem(this.storageKey) || "{}") };
      if (!Array.isArray(data.ownedAbilities)) data.ownedAbilities = ["portalWave"];
      if (!data.ownedAbilities.includes("portalWave")) data.ownedAbilities.unshift("portalWave");
      if (!data.ownedAbilities.includes(data.equippedAbility)) data.equippedAbility = "portalWave";
      return data;
    } catch { return this.defaults(); }
  }
  save() { localStorage.setItem(this.storageKey, JSON.stringify(this.data)); }
  isUnlocked(levelId) { return this.data.unlockedLevels.includes(levelId); }
  complete(levelId, nextLevelId) { const alreadyCompleted = this.data.completedLevels.includes(levelId); if (nextLevelId && !this.data.unlockedLevels.includes(nextLevelId)) this.data.unlockedLevels.push(nextLevelId); const reward = GameApp.levels[levelId]?.reward || 0; if (!alreadyCompleted) this.data.completedLevels.push(levelId); this.data.coins += reward; this.save(); return reward; }
  ownsAbility(id) { return this.data.ownedAbilities.includes(id); }
  buyAbility(id, price) { if (this.ownsAbility(id) || this.data.coins < price) return false; this.data.coins -= price; this.data.ownedAbilities.push(id); this.data.equippedAbility = id; this.save(); return true; }
  equipAbility(id) { if (!this.ownsAbility(id)) return false; this.data.equippedAbility = id; this.save(); return true; }
  reset() { this.data = this.defaults(); this.save(); }
};
