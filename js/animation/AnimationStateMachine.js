"use strict";
GameApp.animation.AnimationStateMachine = class {
  constructor(poses, initialState = "idle") {
    this.poses = poses; this.state = initialState; this.stateTime = 0;
    this.time = Math.random() * 8; this.lastPose = {}; this.fromPose = {};
  }
  setState(nextState, restart = false) {
    if (!this.poses[nextState] || (!restart && this.state === nextState)) return;
    this.fromPose = { ...this.lastPose }; this.state = nextState; this.stateTime = 0;
  }
  update(dt) { this.stateTime += dt; this.time += dt; }
  getPose(entity) {
    const resting = this.state === "idle" || this.state === "move";
    const target = (this.poses[this.state] || this.poses.idle)(resting ? this.time : this.stateTime, entity);
    const action = this.state === "meleeAttack" || this.state === "rangedAttack";
    const duration = this.state === "hurt" || action ? 0.08 : (this.state === "land" ? 0.055 : (entity.visualBlendDuration || 0.14));
    const t = Math.min(1, this.stateTime / duration);
    const blend = t * t * (3 - 2 * t);
    const result = {};
    for (const key of new Set([...Object.keys(this.fromPose), ...Object.keys(target)])) {
      const fallback = key.startsWith("scale") || key.startsWith("eyeScale") ? 1 : 0;
      result[key] = key === "dissolve" ? (target[key] || 0) :
        (this.fromPose[key] ?? fallback) + ((target[key] ?? fallback) - (this.fromPose[key] ?? fallback)) * blend;
    }
    this.lastPose = result;
    return result;
  }
};
