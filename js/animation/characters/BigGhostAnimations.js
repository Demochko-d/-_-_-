"use strict";
GameApp.animation.characterPoses ??= {};
GameApp.animation.characterPoses.bigGhost = {
  idle: (t) => ({ y: Math.sin(t * 1.8) * 5, scaleX: 1 + Math.sin(t * 1.6) * 0.05, scaleY: 1 - Math.sin(t * 1.6) * 0.04, rotation: Math.sin(t) * 0.035 }),
  move: (t) => ({ y: Math.sin(t * 4.2) * 6, scaleX: 1 + Math.sin(t * 4.2) * 0.045, scaleY: 1 - Math.sin(t * 4.2) * 0.07, rotation: Math.sin(t * 2.8) * 0.07 }),
  charge: (t, entity) => { const direction = entity.visualFacing ?? entity.facing; return { x: direction * (3 + Math.sin(t * 18) * 1.5), y: Math.sin(t * 22) * 2, scaleX: 1.19 + Math.sin(t * 15) * .025, scaleY: .88, rotation: direction * .13, eyeScaleY: .72 }; },
  attack: (t, entity) => { const pulse = (1 - Math.cos(t * Math.PI * 2 / entity.attackCooldown)) * 0.5; const direction = entity.visualFacing ?? entity.facing; return { x: direction * pulse * 6, y: -pulse * 2, scaleX: 1 + pulse * 0.14, scaleY: 1 - pulse * 0.12, rotation: direction * pulse * 0.08, eyeScaleY: 1 - pulse * 0.18 }; },
  hurt: (t) => { const impact = Math.sin(Math.min(t * 3.6, Math.PI)); return { x: -impact * 6, scaleX: 1 + impact * 0.2, scaleY: 1 - impact * 0.15, rotation: -impact * 0.11, eyeScaleX: 1 + impact * 0.9, eyeScaleY: 1 - impact * 0.35, eyeJitter: Math.sin(t * 38) * impact * 2 }; },
  death: (t) => ({ dissolve: Math.min(1, t / GameApp.config.game.animation.deathDuration) })
};
