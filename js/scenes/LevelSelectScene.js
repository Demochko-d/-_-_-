"use strict";
GameApp.scenes.LevelSelectScene = class {
  constructor(game) { this.game = game; }

  abilityCard(id, ability, progress) {
    const owned = progress.ownsAbility(id);
    const equipped = progress.data.equippedAbility === id;
    const canBuy = progress.data.coins >= ability.price;
    const icon = '<svg viewBox="0 0 64 64">' + GameApp.config.game.abilityIcons[id] + '</svg>';
    const overlay = equipped ? '<span class="ability-state ability-equipped">✓</span>' :
      owned ? '' : '<span class="ability-state ability-locked"><i>◆</i><b>' + ability.price + ' монет</b></span>';
    const action = equipped ? "Экипировано" : owned ? "Выбрать" : canBuy ? "Купить" : "Не хватает монет";
    const cooldown = ability.passive ? "Пассивная · без перезарядки" : "Перезарядка: " + ability.cooldown + " с";
    return '<button class="ability-card' + (equipped ? ' is-equipped' : '') + '" data-ability="' + id + '"' + (!owned && !canBuy ? ' disabled' : '') +
      '><span class="ability-icon">' + icon + overlay + '</span><span class="ability-copy"><b>' + ability.name + '</b><small>' + ability.description + '</small><span class="ability-cooldown">' + cooldown + '</span><em>' + action + '</em></span></button>';
  }

  refreshAbilities() {
    const progress = this.game.progress;
    const list = this.game.root.querySelector(".ability-list");
    if (!list) return;
    list.innerHTML = Object.entries(GameApp.config.game.abilities).map(([id, ability]) => this.abilityCard(id, ability, progress)).join("");
    this.game.root.querySelector(".coins").textContent = "✦ " + progress.data.coins + " монет";
  }

  enter() {
    this.game.clearCanvas();
    this.game.audio.playMusic("menu");
    const progress = this.game.progress;
    const levels = this.game.levels.all();
    const levelRows = levels.map((level, index) => {
      const unlocked = progress.isUnlocked(level.id);
      const completed = progress.data.completedLevels.includes(level.id);
      const darkness = Math.max(18, 62 - index * 11);
      return '<button class="level-row' + (completed ? " completed" : "") + '" style="--level-darkness:' + darkness + '%" data-level="' + level.id + '"' + (unlocked ? "" : " disabled") + '><small>' + String(level.order ?? index + 1).padStart(2, "0") + '</small><span><b>' + level.name + '</b><em>' + (completed ? "Пройдено" : unlocked ? "Награда " + level.reward + " ✦" : "Закрыто") + '</em></span><strong>' + (completed ? "✓" : unlocked ? "→" : "⌁") + '</strong></button>';
    }).join("");
    const abilities = Object.entries(GameApp.config.game.abilities).map(([id, ability]) => this.abilityCard(id, ability, progress)).join("");
    this.game.root.innerHTML = '<section class="panel hub-panel"><div class="almanac-head hub-top"><p class="coins">✦ ' + progress.data.coins + ' монет</p><button id="back">← Назад</button></div><div class="hub-grid"><section class="upgrade-area"><span class="eyebrow">Способности</span><h2>Выбери одну</h2><p class="ability-help">Активная способность используется клавишей Enter, пассивная действует постоянно.</p><div class="ability-list">' + abilities + '</div></section><section class="levels-area"><span class="eyebrow">Путь сквозь сон</span><h2>Выбери уровень</h2><div class="level-list">' + levelRows + '</div></section></div></section>';
    this.game.root.querySelectorAll("[data-level]:not(:disabled)").forEach((button) => { button.onclick = () => this.game.sceneManager.change(GameApp.scenes.GameScene, button.dataset.level); });
    this.game.root.querySelector(".ability-list").onclick = (event) => {
      const button = event.target.closest("[data-ability]:not(:disabled)");
      if (!button) return;
      const id = button.dataset.ability;
      const ability = GameApp.config.game.abilities[id];
      if (progress.ownsAbility(id)) progress.equipAbility(id);
      else progress.buyAbility(id, ability.price);
      this.refreshAbilities();
    };
    this.game.root.querySelector("#back").onclick = () => this.game.sceneManager.change(GameApp.scenes.MainMenuScene);
  }
};
