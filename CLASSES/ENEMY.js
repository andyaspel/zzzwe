"use strict";
import {
  ENEMY_SPAWN_ANIMATION_SPEED,
  ENEMY_COLOR,
  ENEMY_RADIUS,
  ENEMY_SPEED,
  ENEMY_TRAIL_RATE,
} from "../CONSTANTS.js";
import Trail from "./TRAIL.js"

export default class Enemy {
  trail = new Trail(ENEMY_RADIUS, ENEMY_COLOR, ENEMY_TRAIL_RATE);

  constructor(pos) {
    this.pos = pos;
    this.ded = false;
    this.radius = 0.0;
  }

  update(dt, followPos) {
    let vel = followPos
      .sub(this.pos)
      .normalize()
      .scale(ENEMY_SPEED * dt);
    this.trail.push(this.pos);
    this.pos = this.pos.add(vel);
    this.trail.update(dt);

    if (this.radius < ENEMY_RADIUS) {
      this.radius += ENEMY_SPAWN_ANIMATION_SPEED * dt;
    } else {
      this.radius = ENEMY_RADIUS;
    }
  }

  render(renderer) {
    this.trail.render(renderer);
    renderer.fillCircle(this.pos, this.radius, ENEMY_COLOR);
  }
}
