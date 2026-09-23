"use strict";
addEventListener("DOMContentLoaded", async () => { await GameApp.levelsReady; const game = new GameApp.core.Game(document.querySelector("#app")); game.sceneManager.change(GameApp.scenes.MainMenuScene); game.start(); });
