"use strict";
GameApp.audio.AudioManager = class {
  constructor(config) {
    this.config = config;
    this.settingsKey = "portalGuardAudioSettings";
    try { Object.assign(this.config, JSON.parse(localStorage.getItem(this.settingsKey) || "{}")); } catch {}
    this.currentMusic = null;
    this.musicTracks = new Set();
    this.currentMusicName = null;
    this.pendingMusic = null;
    this.musicFadeToken = 0;
    this.unlocked = false;
    this.context = null;
    addEventListener("pointerdown", () => this.unlock(), { once: true });
    addEventListener("keydown", () => this.unlock(), { once: true });
  }

  saveSettings() { try { localStorage.setItem(this.settingsKey, JSON.stringify({ musicVolume: this.config.musicVolume, soundVolume: this.config.soundVolume })); } catch {} }
  setMusicVolume(value) { this.config.musicVolume = Math.max(0, Math.min(1, value)); if (this.currentMusic) this.currentMusic.volume = this.config.musicVolume; this.saveSettings(); }
  setSoundVolume(value) { this.config.soundVolume = Math.max(0, Math.min(1, value)); this.saveSettings(); }

  unlock() {
    this.unlocked = true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !this.context) this.context = new AudioContextClass();
    this.context?.resume?.();
    if (this.pendingMusic && this.currentMusic) {
      const pendingName = this.pendingMusic;
      this.currentMusic.play().then(() => { if (this.pendingMusic === pendingName) this.pendingMusic = null; }).catch(() => {});
    }
  }

  playSound(name) {
    const path = this.config.sounds[name];
    if (path) { const sound = new Audio(path); sound.volume = this.config.soundVolume; sound.play().catch(() => {}); }
    else if (this.config.proceduralEffects) this.synthesize(name);
  }

  tone(startFrequency, endFrequency, duration, type = "sine", volume = 0.1, delay = 0) {
    if (!this.context) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * this.config.soundVolume), start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  noise(duration, volume = 0.05) {
    if (!this.context) return;
    const length = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.value = volume * this.config.soundVolume;
    source.connect(filter).connect(gain).connect(this.context.destination);
    source.start();
  }

  synthesize(name) {
    if (!this.context) return;
    if (name === "meleeAttack") { this.tone(230, 70, 0.13, "sawtooth", 0.1); this.noise(0.08, 0.035); }
    else if (name === "rangedAttack") { this.tone(760, 210, 0.24, "sine", 0.11); this.tone(1140, 420, 0.18, "triangle", 0.045); }
    else if (name === "enemyDeath") { this.tone(280, 45, 0.48, "triangle", 0.1); this.noise(0.32, 0.045); }
    else if (name === "playerHurt") { this.tone(150, 82, 0.2, "square", 0.07); }
    else if (name === "portalHit") { this.tone(95, 52, 0.34, "sine", 0.14); this.noise(0.16, 0.03); }
    else if (name === "levelComplete") { [523, 659, 784, 1047].forEach((note, index) => this.tone(note, note * 1.01, 0.34, "sine", 0.075, index * 0.1)); }
  }

  playMusic(name) {
    const path = this.config.music[name];
    if (!path) return;
    if (this.currentMusicName === name && this.currentMusic) {
      this.musicFadeToken += 1;
      this.musicTracks.forEach((track) => {
        if (track === this.currentMusic) return;
        track.pause(); track.currentTime = 0; this.musicTracks.delete(track);
      });
      this.currentMusic.loop = true;
      this.currentMusic.volume = this.config.musicVolume;
      this.currentMusic.play().then(() => { if (this.currentMusicName === name) this.pendingMusic = null; }).catch(() => { this.pendingMusic = name; });
      return;
    }
    const previousTracks = [...this.musicTracks].map((track) => ({ track, volume: track.volume }));
    const music = new Audio(path);
    music.loop = true;
    music.volume = 0;
    this.currentMusic = music;
    this.musicTracks.add(music);
    this.currentMusicName = name;
    music.play().then(() => { if (this.currentMusic === music) this.pendingMusic = null; }).catch(() => { if (this.currentMusic === music) this.pendingMusic = name; });
    const token = ++this.musicFadeToken;
    const duration = Math.max(0.05, this.config.musicFadeDuration || 1.2) * 1000;
    const startedAt = performance.now();
    const fade = (time) => {
      if (token !== this.musicFadeToken || this.currentMusic !== music) return;
      const progress = Math.min(1, (time - startedAt) / duration);
      music.volume = this.config.musicVolume * progress;
      previousTracks.forEach(({ track, volume }) => { track.volume = volume * (1 - progress); });
      if (progress < 1) requestAnimationFrame(fade);
      else previousTracks.forEach(({ track }) => { track.pause(); track.currentTime = 0; this.musicTracks.delete(track); });
    };
    requestAnimationFrame(fade);
  }

  stopMusic() {
    this.musicFadeToken += 1;
    this.musicTracks.forEach((track) => { track.pause(); track.currentTime = 0; });
    this.musicTracks.clear();
    this.currentMusic = null;
    this.currentMusicName = null;
    this.pendingMusic = null;
  }

  bind(events) {
    events.on("levelStarted", () => this.playMusic("game"));
    events.on("meleeAttack", () => this.playSound("meleeAttack"));
    events.on("rangedAttack", () => this.playSound("rangedAttack"));
    events.on("enemyKilled", () => this.playSound("enemyDeath"));
    events.on("playerDamaged", () => this.playSound("playerHurt"));
    events.on("portalDamaged", () => this.playSound("portalHit"));
    events.on("levelCompleted", () => this.playSound("levelComplete"));
  }
};
