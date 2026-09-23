"use strict";
GameApp.renderers.effects ??= {};
GameApp.renderers.effects.DeathDissolveRenderer = {
  // Shared triangle vertices reconstruct the exact drawing at progress zero.
  // Capture once, then move the actual body, outline and eye together in pieces.
  drawShattered(ctx, entity, progress, renderer) {
    if (!entity.deathArtwork) {
      const pad = Math.ceil(Math.max(entity.width, entity.height) * 0.65);
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(entity.width + pad * 2);
      canvas.height = Math.ceil(entity.height + pad * 2);
      const frozen = { ...(entity.deathPose || {}), dissolve: 0 };
      const copy = { ...entity, position: { x: pad, y: pad }, animation: { time: entity.animation.time, getPose: () => frozen } };
      renderer.draw(canvas.getContext("2d"), copy, frozen);
      const fragments = [];
      const columns = 5, rows = 6;
      const vertices = Array.from({ length: rows + 1 }, (_, row) =>
        Array.from({ length: columns + 1 }, (_, col) => ({
          x: canvas.width * (col + (col > 0 && col < columns ? Math.sin(row * 17 + col * 31) * 0.22 : 0)) / columns,
          y: canvas.height * (row + (row > 0 && row < rows ? Math.cos(row * 23 + col * 11) * 0.22 : 0)) / rows
        })));
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        const a = vertices[row][col], b = vertices[row][col + 1];
        const c = vertices[row + 1][col], d = vertices[row + 1][col + 1];
        for (const points of [[a, b, c], [b, d, c]]) {
          const x = points.reduce((sum, p) => sum + p.x, 0) / 3;
          const y = points.reduce((sum, p) => sum + p.y, 0) / 3;
          const seed = Math.sin(x * 12.989 + y * 7.233);
          fragments.push({ points, x, y, vx: (x - canvas.width / 2) * (1.2 + Math.abs(seed)), vy: (y - canvas.height / 2) * 0.8 - entity.height * 0.65, spin: seed * 2.8 });
        }
      }
      entity.deathArtwork = { canvas, pad, fragments };
    }
    const { canvas, pad, fragments } = entity.deathArtwork;
    const p = Math.max(0, Math.min(1, progress));
    const travel = p * p * (2 - p);
    const fade = Math.max(0, (p - 0.48) / 0.52);
    ctx.save();
    ctx.translate(entity.position.x - pad, entity.position.y - pad);
    ctx.globalAlpha *= 1 - fade * fade * (3 - 2 * fade);
    if (p === 0) { ctx.drawImage(canvas, 0, 0); ctx.restore(); return; }
    for (const part of fragments) {
      ctx.save();
      ctx.translate(part.x + part.vx * travel, part.y + part.vy * travel + entity.height * 0.65 * p * p);
      ctx.rotate(part.spin * travel);
      ctx.translate(-part.x, -part.y);
      ctx.beginPath();
      part.points.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath(); ctx.clip(); ctx.drawImage(canvas, 0, 0); ctx.restore();
    }
    ctx.restore();
  },
  drawEye(ctx, enemy, pose, width, height) {
    const time = enemy.animation.time || 0;
    const phase = time % 4.7;
    const blink = phase < 0.18 ? 1 - Math.sin(phase / 0.18 * Math.PI) * 0.94 : 1;
    const look = enemy.visualFacing ?? enemy.facing ?? 1;
    const y = -height * 0.12 + Math.sin(time * 1.7) * height * 0.008;
    const eyes = enemy.kind === "splitter" ? [-0.14, 0.14] : [look * 0.17];
    eyes.forEach((offset) => {
      const eyeScale = enemy.kind === "splitter" ? 0.82 : 1;
      ctx.save(); ctx.translate(offset * width + (pose.eyeJitter || 0), y);
      ctx.scale((pose.eyeScaleX ?? 1) * eyeScale, (pose.eyeScaleY ?? 1) * blink * eyeScale);
      ctx.fillStyle = "#fffaff";
      ctx.beginPath(); ctx.ellipse(0, 0, width * 0.11, height * 0.135, -look * 0.08, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#624178";
      ctx.beginPath(); ctx.ellipse(look * width * 0.029, Math.sin(time * 1.1) * height * 0.012, width * 0.057, height * 0.078, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#241c3b";
      ctx.beginPath(); ctx.ellipse(look * width * 0.036, 0, width * 0.033, height * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(look * width * 0.025 - width * 0.018, -height * 0.033, width * 0.024, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }
};
