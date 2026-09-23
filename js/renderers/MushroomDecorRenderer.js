"use strict";
GameApp.renderers.MushroomDecorRenderer = class {
  constructor() {
    this.time = 0;
    this.image = new Image();
    this.processed = null;
    this.image.onload = () => this.removeWhiteBackground();
    this.image.src = GameApp.config.game.environment.mushroomAssetPath;
  }

  removeWhiteBackground() {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = this.image.naturalWidth;
      canvas.height = this.image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(this.image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const brightness = Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]);
        if (brightness > 238) pixels.data[i + 3] = Math.max(0, 255 - (brightness - 238) * 15);
      }
      context.putImageData(pixels, 0, 0);
      this.processed = canvas;
    } catch { this.processed = this.image; }
  }

  update(dt) { this.time += dt; }

  draw(ctx, platforms, decorations, entityScale) {
    const source = this.processed || (this.image.complete ? this.image : null);
    if (!source) return;
    decorations.forEach((decor, index) => {
      const platform = platforms[decor.platformIndex];
      if (!platform || decor.type !== "mushroom") return;
      const height = GameApp.config.game.environment.mushroomHeight * entityScale * (decor.scale || 1);
      const width = height * source.width / source.height;
      const x = platform.x + platform.width * decor.offset - width / 2;
      const y = platform.y - height + 3;
      ctx.save();
      ctx.translate(x + width / 2, y + height);
      ctx.rotate(Math.sin(this.time * 1.2 + index * 2.4) * 0.025);
      ctx.shadowColor = "#aa83ff";
      ctx.shadowBlur = 12;
      ctx.drawImage(source, -width / 2, -height, width, height);
      ctx.restore();
    });
  }
};
