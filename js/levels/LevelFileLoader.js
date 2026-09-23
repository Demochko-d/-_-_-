"use strict";
// Автоматически загружает level1.js, level2.js, level3.js... до первого отсутствующего файла.
GameApp.levelsReady = (async () => {
  for (let number = 1; number <= 99; number += 1) {
    const loaded = await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `js/levels/level${number}.js`;
      script.async = false;
      script.onload = () => resolve(true);
      script.onerror = () => { script.remove(); resolve(false); };
      document.head.appendChild(script);
    });
    if (!loaded) break;
  }
  return Object.keys(GameApp.levels).length;
})();
