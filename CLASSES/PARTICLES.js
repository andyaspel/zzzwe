"use strict";

import { PARTICLE_MAX_LIFETIME } from "../CONSTANTS.js";

export default class Particle {
  constructor(pos, vel, lifetime, radius, color) {
    this.pos = pos;
    this.vel = vel;
    this.lifetime = lifetime;
    this.radius = radius;
    this.color = color;
  }

  render(renderer) {
    const a = this.lifetime / PARTICLE_MAX_LIFETIME;
    renderer.fillCircle(this.pos, this.radius, this.color.withAlpha(a));
  }

  update(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.lifetime -= dt;
  }
}
