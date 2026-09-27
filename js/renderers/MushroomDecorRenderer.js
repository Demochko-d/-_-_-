"use strict";
GameApp.renderers.MushroomDecorRenderer = class {
  constructor() { this.time = 0; this.mushrooms = []; this.pickups = []; }
  layout(platforms, decorations, entityScale) {
    return platforms.map((platform, index) => {
      const decor = decorations.find((item) => item.type === "mushroom" && item.platformIndex === index);
      const seed = index * 19 + 1;
      const height = GameApp.config.game.environment.mushroomHeight * entityScale * (decor?.scale ?? .65) * (.58 + this.noise(seed + 5) * .35);
      return { x: platform.x + platform.width * (decor?.offset ?? .5), y: platform.y + 3, height, seed, index, platform, scale: entityScale };
    });
  }
  configure(platforms, decorations, entityScale) {
    const layout = this.layout(platforms, decorations, entityScale);
    const order = [...layout].sort((a, b) => a.platform.y - b.platform.y).map((item) => item.index);
    const config = GameApp.config.game.mushroomHearts;
    this.mushrooms = layout.map((item) => ({ timer: config.interval + order.indexOf(item.index) * config.initialStagger, heart: null, spawnPulse: 0, ...this.mushrooms[item.index], ...item }));
  }
  update(dt, player) {
    this.time += dt;
    this.pickups.forEach((effect) => { effect.age += dt; });
    this.pickups = this.pickups.filter((effect) => effect.age < .55);
    if (!player || player.health <= 0) return;
    const config = GameApp.config.game.mushroomHearts;
    this.mushrooms.forEach((mushroom) => {
      mushroom.spawnPulse = Math.max(0, mushroom.spawnPulse - dt);
      if (!mushroom.heart) {
        mushroom.timer = Math.max(0, mushroom.timer - dt);
        if (mushroom.timer > 1e-8) return;
        mushroom.timer = null;
        mushroom.spawnPulse = .6;
        mushroom.heart = { x: 0, y: -mushroom.height / mushroom.scale * .9, vx: mushroom.index % 2 ? 30 : -30, vy: -90, age: 0, landed: false };
        return;
      }
      const heart = mushroom.heart, scale = mushroom.scale;
      heart.age += dt;
      if (!heart.landed) {
        heart.vy += 500 * dt;
        heart.x += heart.vx * dt;
        heart.y += heart.vy * dt;
        const margin = config.size * scale;
        heart.x = Math.max((mushroom.platform.x + margin - mushroom.x) / scale, Math.min((mushroom.platform.x + mushroom.platform.width - margin - mushroom.x) / scale, heart.x));
        const floor = -config.size / 2 - 3 / scale;
        if (heart.y >= floor) { heart.y = floor; heart.landed = true; }
      }
      const x = mushroom.x + heart.x * scale, y = mushroom.y + heart.y * scale;
      const radius = config.size * scale * .65;
      if (heart.age < .15 || x + radius < player.position.x || x - radius > player.position.x + player.width || y + radius < player.position.y || y - radius > player.position.y + player.height) return;
      const healed = Math.min(config.heal, player.maxHealth - player.health);
      player.health = Math.min(player.maxHealth, player.health + config.heal);
      this.pickups.push({ x, y, scale, healed, age: 0 });
      mushroom.heart = null;
      mushroom.timer = config.interval;
    });
  }
  noise(seed) { const v = Math.sin(seed * 91.733 + 17.137) * 43758.5453; return v - Math.floor(v); }
  drawMushroom(ctx, x, groundY, height, seed, index, spawnPulse = 0) {
    const env = GameApp.config.game.environment, t = this.time;
    const breathe = Math.sin(t * 1.9 + seed), capY = -height * .65;
    ctx.save(); ctx.translate(x, groundY); ctx.rotate(Math.sin(t * 1.35 + seed) * .045);
    const pulse = Math.sin((1 - spawnPulse / .6) * Math.PI) * (spawnPulse > 0 ? 1 : 0);
    ctx.scale((1 - breathe * .025) * (1 + pulse * .16), (1 + breathe * .035) * (1 - pulse * .2));
    ctx.strokeStyle = env.outline; ctx.lineWidth = Math.max(2, height * .035); ctx.lineJoin = "round";
    ctx.fillStyle = env.mushroomStem;
    ctx.beginPath(); ctx.moveTo(-height * .1, 0);
    ctx.bezierCurveTo(-height * .14, -height * .13, -height * .05, -height * .4, -height * .08, capY);
    ctx.lineTo(height * .08, capY);
    ctx.bezierCurveTo(height * .05, -height * .4, height * .16, -height * .1, height * .11, 0);
    ctx.quadraticCurveTo(0, height * .035, -height * .1, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = env.mushroomCaps[index % env.mushroomCaps.length];
    const w = height * .38;
    ctx.beginPath(); ctx.moveTo(-w, capY + height * .05);
    ctx.bezierCurveTo(-w * .98, -height * 1.05, w * .8, -height * 1.03, w, capY + height * .05);
    ctx.bezierCurveTo(w * .6, capY + height * .16, -w * .6, capY + height * .16, -w, capY + height * .05);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff0d5";
    for (const [sx, sy, r] of [[-.15, -.81, .067], [.09, -.85, .08], [.23, -.72, .043]]) {
      ctx.beginPath(); ctx.ellipse(height * sx, height * sy, height * r, height * r * .72, -.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "#fff7e5"; ctx.lineWidth = Math.max(1.5, height * .022); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-w * .72, capY + height * .055); ctx.quadraticCurveTo(0, capY + height * .12, w * .72, capY + height * .055); ctx.stroke();
    ctx.restore();
    // Two quiet spores rise from each cap, with independent phases.
    for (let i = 0; i < 2; i++) {
      const p = (t * .18 + this.noise(seed + i)) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * .55; ctx.fillStyle = "#fff6d9";
      ctx.beginPath(); ctx.arc(x + Math.sin(t * .8 + seed + i) * height * .22, groundY - height * (.9 + p * .55), Math.max(1.5, height * .025), 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  draw(ctx, platforms, decorations, entityScale) {
    const mushrooms = this.mushrooms.length ? this.mushrooms : this.layout(platforms, decorations, entityScale);
    mushrooms.forEach((mushroom) => {
      this.drawMushroom(ctx, mushroom.x, mushroom.y, mushroom.height, mushroom.seed, mushroom.index, mushroom.spawnPulse);
    });
  }
  drawHeart(ctx, x, y, size, rotation = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation);
    ctx.fillStyle = "#f04a63"; ctx.strokeStyle = "#fff0d5"; ctx.lineWidth = Math.max(1.5, size * .1); ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(0, size * .48);
    ctx.bezierCurveTo(-size * .9, -size * .05, -size * .45, -size * .72, 0, -size * .28);
    ctx.bezierCurveTo(size * .45, -size * .72, size * .9, -size * .05, 0, size * .48);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  drawHearts(ctx, player) {
    const config = GameApp.config.game.mushroomHearts;
    this.mushrooms.forEach((mushroom) => {
      const heart = mushroom.heart;
      if (!heart) return;
      const scale = mushroom.scale, bob = heart.landed ? Math.sin(heart.age * 3) * scale * 2 : 0;
      const grow = Math.min(1, heart.age / .16);
      this.drawHeart(ctx, mushroom.x + heart.x * scale, mushroom.y + heart.y * scale + bob, config.size * scale * grow, heart.landed ? Math.sin(heart.age * 2) * .06 : Math.sin(heart.age * 8) * .22);
    });
    this.pickups.forEach((effect) => {
      const p = effect.age / .55;
      const targetX = player.centerX, targetY = player.position.y + player.height * .4;
      ctx.save(); ctx.globalAlpha *= 1 - p;
      this.drawHeart(ctx, effect.x + (targetX - effect.x) * p, effect.y + (targetY - effect.y) * p - Math.sin(p * Math.PI) * 24 * effect.scale, config.size * effect.scale * (1 - p * .75));
      ctx.strokeStyle = "#ffb8bf"; ctx.lineWidth = 2 * effect.scale;
      ctx.beginPath(); ctx.arc(targetX, targetY, player.width * (.4 + p * .8), 0, Math.PI * 2); ctx.stroke();
      if (effect.healed > 0) {
        const text = `+${Math.round(effect.healed)}`, y = player.position.y - (12 + p * 26) * effect.scale;
        ctx.fillStyle = "#fff0d5"; ctx.strokeStyle = "#654765"; ctx.lineWidth = 3 * effect.scale; ctx.lineJoin = "round";
        ctx.font = `${28 * effect.scale}px Mariinavo, sans-serif`; ctx.textAlign = "center";
        ctx.strokeText(text, targetX, y); ctx.fillText(text, targetX, y);
      }
      ctx.restore();
    });
  }
};
