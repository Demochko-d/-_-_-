"use strict";
GameApp.animation.characterPoses ??= {};
// Каждая поза описывает трансформацию, а не Canvas-рисование.
GameApp.animation.characterPoses.ghost = {
  idle: (t) => ({ y: Math.sin(t * 3) * 5, scaleX: 1 + Math.sin(t * 2) * 0.055, scaleY: 1 - Math.sin(t * 2) * 0.055, rotation: Math.sin(t * 1.5) * 0.055 }),
  move: (t) => ({ y: Math.sin(t * 3.6) * 5, scaleX: 1 + Math.sin(t * 3.6) * 0.045, scaleY: 1 - Math.sin(t * 3.6) * 0.04, rotation: Math.sin(t * 2.4) * 0.1 }),
  attack: (t, entity) => { const pulse = (1 - Math.cos(t * Math.PI * 2 / entity.attackCooldown)) * 0.5; const direction = entity.visualFacing ?? entity.facing; return { x: direction * pulse * 6, y: -pulse * 2, scaleX: 1 + pulse * 0.14, scaleY: 1 - pulse * 0.12, rotation: direction * pulse * 0.08, eyeScaleY: 1 - pulse * 0.18 }; },
  hurt: (t) => { const impact = Math.sin(Math.min(t * 14, Math.PI)); return { x: -impact * 3.6, scaleX: 1 + impact * 0.25, scaleY: 1 - impact * 0.22, rotation: -impact * 0.2, eyeScaleX: 1 + impact * 1.15, eyeScaleY: 1 - impact * 0.4, eyeJitter: Math.sin(t * 2.45) * impact * 2 }; },
  death: (t) => ({ dissolve: Math.min(1, t / GameApp.config.game.animation.deathDuration) })
};
