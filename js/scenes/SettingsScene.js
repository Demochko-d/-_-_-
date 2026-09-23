"use strict";
GameApp.scenes.SettingsScene = class {
  constructor(game) { this.game = game; }
  enter() {
    this.game.clearCanvas();
    this.game.audio.playMusic("menu");
    const audio = this.game.audio;
    const percent = (value) => Math.round(value * 100);
    const healthBarEnabled = GameApp.config.game.ui.showPlayerHealthBar;
    this.game.root.innerHTML = '<section class="panel settings-panel"><span class="eyebrow">Параметры игры</span><h1>Настройки</h1><div class="settings-list"><label><span>Музыка <b id="music-value">' + percent(audio.config.musicVolume) + '%</b></span><input id="music" type="range" min="0" max="100" value="' + percent(audio.config.musicVolume) + '"></label><label><span>Эффекты <b id="sound-value">' + percent(audio.config.soundVolume) + '%</b></span><input id="sound" type="range" min="0" max="100" value="' + percent(audio.config.soundVolume) + '"></label><label class="settings-toggle"><span>Полоска здоровья над персонажем <b id="health-bar-value">' + (healthBarEnabled ? "Вкл" : "Выкл") + '</b></span><input id="health-bar" type="checkbox"' + (healthBarEnabled ? " checked" : "") + '></label></div><div class="settings-footer"><button id="back">← Назад</button><button class="danger" id="reset">Сбросить прогресс</button></div><p class="settings-note" id="status"></p></section>';
    const bindVolume = (inputId, valueId, setter) => { const input = this.game.root.querySelector(inputId); input.oninput = () => { const value = Number(input.value); this.game.root.querySelector(valueId).textContent = value + "%"; setter.call(audio, value / 100); }; };
    bindVolume("#music", "#music-value", audio.setMusicVolume);
    bindVolume("#sound", "#sound-value", audio.setSoundVolume);
    const healthBar = this.game.root.querySelector("#health-bar");
    healthBar.onchange = () => { this.game.setPlayerHealthBarVisible(healthBar.checked); this.game.root.querySelector("#health-bar-value").textContent = healthBar.checked ? "Вкл" : "Выкл"; };
    this.game.root.querySelector("#reset").onclick = () => { this.game.progress.reset(); this.game.root.querySelector("#status").textContent = "Прогресс сброшен"; };
    this.game.root.querySelector("#back").onclick = () => this.game.sceneManager.change(GameApp.scenes.MainMenuScene);
  }
};
