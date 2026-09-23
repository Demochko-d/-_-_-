"use strict";
GameApp.animation.characterPoses ??= {};
GameApp.animation.characterPoses.player = {
  idle: (t) => ({ y: Math.sin(t * 2.5) * 3.2, scaleX: 1 + Math.sin(t * 2.5) * 0.025, scaleY: 1 - Math.sin(t * 2.5) * 0.025, rotation: Math.sin(t * 1.4) * 0.025, eyeScaleY: 1 }),
  move: (t, entity) => ({ y: Math.sin(t * 9) * 2.3 - 2, scaleX: 1.04 + Math.sin(t * 9) * 0.045, scaleY: 0.96 - Math.sin(t * 9) * 0.035, rotation: (entity.visualFacing || 1) * Math.sin(t * 7) * 0.07, eyeScaleY: 0.92 }),
  meleeAttack: (t, entity) => { const p = Math.min(1, t / GameApp.config.game.animation.playerMeleeDuration); const pulse = Math.sin(p * Math.PI); return { x: (entity.facing || 1) * pulse * 8, scaleX: 1 + pulse * 0.16, scaleY: 1 - pulse * 0.12, rotation: -(entity.facing || 1) * pulse * 0.12, slash: p, eyeScaleY: 0.72 }; },
  rangedAttack: (t, entity) => { const p = Math.min(1, t / GameApp.config.game.animation.playerRangedDuration); const pulse = Math.sin(p * Math.PI); return { x: -(entity.facing || 1) * pulse * 3, y: -pulse * 3, scaleX: 1 - pulse * 0.1, scaleY: 1 + pulse * 0.14, rotation: (entity.facing || 1) * pulse * 0.06, cast: p, eyeScaleY: 1.18 }; },
  hurt: (t) => ({ x: Math.sin(t * 42) * 5, scaleX: 0.82, scaleY: 1.18, rotation: Math.sin(t * 31) * 0.08, eyeScaleY: 0.45 }),
  death: (t) => ({ y: Math.min(t * 34, 20), scaleX: 1 + Math.min(t, .35) * 0.35, scaleY: Math.max(0.18, 1 - t * 1.25), rotation: Math.min(t * 2.2, Math.PI * 0.75), eyeScaleY: Math.max(0.08, 1 - t * 4), dissolve: Math.min(1, t / GameApp.config.game.animation.deathDuration) })
};
