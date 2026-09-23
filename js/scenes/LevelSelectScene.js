"use strict";
GameApp.scenes.LevelSelectScene = class {
  constructor(game) { this.game = game; }
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
    this.game.root.innerHTML = '<section class="panel hub-panel"><div class="hub-top"><button id="back">← Назад</button><p class="coins">✦ ' + progress.data.coins + ' монет</p></div><div class="hub-grid"><section class="upgrade-area"><span class="eyebrow">Персонаж</span><div class="character-placeholder"><div class="character-silhouette"><i></i></div><h2>Хранитель сна</h2><p>Раздел развития появится позже</p></div><div class="upgrade-actions"><button disabled><span>Сила атаки</span><b>120 ✦</b></button><button disabled><span>Запас здоровья</span><b>180 ✦</b></button></div></section><section class="levels-area"><span class="eyebrow">Путь сквозь сон</span><h2>Выбери уровень</h2><div class="level-list">' + levelRows + '</div></section></div></section>';
    this.game.root.querySelectorAll("[data-level]:not(:disabled)").forEach((button) => { button.onclick = () => this.game.sceneManager.change(GameApp.scenes.GameScene, button.dataset.level); });
    this.game.root.querySelector("#back").onclick = () => this.game.sceneManager.change(GameApp.scenes.MainMenuScene);
  }
};
