"use strict";
GameApp.animation.characterPoses ??= {};
GameApp.animation.characterPoses.player = {
  idle: (t) => ({ y: Math.sin(t * 2.5) * 3.2, scaleX: 1 + Math.sin(t * 2.5) * 0.025, scaleY: 1 - Math.sin(t * 2.5) * 0.025, rotation: Math.sin(t * 1.4) * 0.025, eyeScaleY: 1 }),
  move: (t, entity) => ({ y: Math.sin(t * 6) * 1.8 - 1, x: Math.sin(t * 6) * (entity.visualFacing ?? entity.facing ?? 1) * 1.4, scaleX: 1.06 + Math.sin(t * 6) * 0.025, scaleY: 0.94 - Math.sin(t * 6) * 0.025, rotation: (entity.visualFacing ?? entity.facing ?? 1) * (-0.13 + Math.sin(t * 8) * 0.045), eyeScaleY: 0.9, tailWave: Math.sin(t * 6) }),
  jump: (t, entity) => ({ y: -Math.min(5, t * 18), scaleX: 0.93, scaleY: 1.09, rotation: (entity.visualFacing ?? entity.facing ?? 1) * -0.1, eyeScaleY: 1.12, tailWave: -0.75 }),
  fall: (t, entity) => ({ y: Math.sin(t * 6) * 1.2, scaleX: 1.06, scaleY: 0.95, rotation: (entity.visualFacing ?? entity.facing ?? 1) * 0.07, eyeScaleY: 1.08, tailWave: 0.75 }),
  land: (t) => { const p = Math.min(1, t / 0.14); const squash = Math.sin(p * Math.PI); return { y: squash * 4, scaleX: 1 + squash * 0.2, scaleY: 1 - squash * 0.22, eyeScaleY: 0.72, tailWave: squash }; },
  meleeAttack: (t, entity) => { const p = Math.min(1, t / GameApp.config.game.animation.playerMeleeDuration); const pulse = Math.sin(p * Math.PI); const direction = entity.attackFacing; return { x: direction * pulse * 8, scaleX: 1 + pulse * 0.16, scaleY: 1 - pulse * 0.12, rotation: -direction * pulse * 0.12, slash: p, eyeScaleY: 0.72 }; },
  rangedAttack: (t, entity) => { const p = Math.min(1, t / GameApp.config.game.animation.playerRangedDuration); const pulse = Math.sin(p * Math.PI); const direction = entity.attackFacing; return { x: -direction * pulse * 3, y: -pulse * 3, scaleX: 1 - pulse * 0.1, scaleY: 1 + pulse * 0.14, rotation: direction * pulse * 0.06, cast: p, eyeScaleY: 1.18 }; },
  hurt: (t) => { const p = Math.min(1, t / GameApp.config.game.animation.hurtDuration); const kick = Math.sin(p * Math.PI) * (1 - p); return { x: -kick * 5, scaleX: 1 - kick * .12, scaleY: 1 + kick * .12, rotation: -kick * .06, eyeScaleY: 1 - kick * .55 }; },
  death: (t) => ({ y: Math.min(t * 34, 20), scaleX: 1 + Math.min(t, .35) * 0.35, scaleY: Math.max(0.18, 1 - t * 1.25), rotation: Math.min(t * 2.2, Math.PI * 0.75), eyeScaleY: Math.max(0.08, 1 - t * 4), dissolve: Math.min(1, t / GameApp.config.game.animation.deathDuration) })
};
