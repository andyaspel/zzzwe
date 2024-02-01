"use strict";
import * as csnt from "../CONSTANTS.js";
import  Trail  from "./TRAIL.js";
import Bullet from "./BULLIT.js"

export default class Player {
  health = csnt.PLAYER_MAX_HEALTH;
  shooting = false;
  lastShoot = 0.0;
  trail = new Trail(
    csnt.PLAYER_RADIUS,
    csnt.PLAYER_COLOR,
    csnt.PLAYER_TRAIL_RATE
  );

  constructor(pos) {
    this.pos = pos;
    this.accuracy = 0;
    this.shootCount =
      window.localStorage.getItem(csnt.LOCAL_STORAGE_TUTORIAL) ==
      csnt.TUTORIAL_STATE.Finished
        ? 0
        : -1;
  }

  render(renderer) {
    this.trail.render(renderer);

    if (this.health > 0.0) {
      renderer.fillCircle(this.pos, csnt.PLAYER_RADIUS, csnt.PLAYER_COLOR);
    }
  }

  update(dt, vel) {
    this.trail.push(this.pos);
    this.pos = this.pos.add(vel.scale(dt));
    this.trail.update(dt);
  }

  shootAt(target) {
    this.shootCount += 1;
    this.lastShoot = performance.now() * 0.001;
    const bulletDir = target.sub(this.pos).normalize();
    const bulletVel = bulletDir.scale(csnt.BULLET_SPEED);
    const bulletPos = this.pos.add(
      bulletDir.scale(csnt.PLAYER_RADIUS + csnt.BULLET_RADIUS)
    );

    return new Bullet(bulletPos, bulletVel);
  }

  damage(value) {
    this.health = Math.max(this.health - value, 0.0);
  }

  heal(value) {
    if (this.health > 0.0) {
      this.health = Math.min(this.health + value, csnt.PLAYER_MAX_HEALTH);
    }
  }
}
