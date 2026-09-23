"use strict";
GameApp.ui.HUD = class { constructor(element) { this.element = element; } update(player, portal, enemies) { this.element.innerHTML = '<span>Игрок: ' + Math.ceil(player.health) + '/' + player.maxHealth + ' HP</span><span>Портал: ' + Math.ceil(portal.health) + '/' + portal.maxHealth + ' HP</span><span>Враги: ' + enemies.filter((e) => e.active).length + '</span>'; } };
