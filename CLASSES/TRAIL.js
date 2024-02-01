"use strict";

import { TRAIL_COOLDOWN } from "../CONSTANTS.js";

export default class Trail {
  trail = [];
  cooldown = 0;
  disabled = false;

  constructor(radius, color, rate) {
    this.radius = radius;
    this.color = color;
    this.rate = rate;
  }

  render(renderer) {
    const n = this.trail.length;
    for (let i = 0; i < n; ++i) {
      renderer.fillCircle(
        this.trail[i].pos,
        this.radius * this.trail[i].a,
        this.color.withAlpha(0.2 * this.trail[i].a)
      );
    }
  }

  update(dt) {
    for (let dot of this.trail) {
      dot.a -= this.rate * dt;
    }

    while (this.trail.length > 0 && this.trail[0].a <= 0.0) {
      this.trail.shift();
    }

    this.cooldown -= dt;
  }

  push(pos) {
    if (!this.disabled && this.cooldown <= 0) {
      this.trail.push({
        pos: pos,
        a: 1.0,
      });
      this.cooldown = TRAIL_COOLDOWN;
    }
  }
}
