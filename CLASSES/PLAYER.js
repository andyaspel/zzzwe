class Player {
    health = PLAYER_MAX_HEALTH;
    shooting = false;
    lastShoot = 0.0;
    trail = new Trail(PLAYER_RADIUS, PLAYER_COLOR, PLAYER_TRAIL_RATE);

    constructor(pos) {
        this.pos = pos;
        this.accuracy = 0;
        this.shootCount = window.localStorage.getItem(LOCAL_STORAGE_TUTORIAL) == TutorialState.Finished ? 0 : -1;
    }

    render(renderer) {
        this.trail.render(renderer);

        if (this.health > 0.0) {
            renderer.fillCircle(this.pos, PLAYER_RADIUS, PLAYER_COLOR);
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
        const bulletDir = target
              .sub(this.pos)
              .normalize();
        const bulletVel = bulletDir.scale(BULLET_SPEED);
        const bulletPos = this
              .pos
              .add(bulletDir.scale(PLAYER_RADIUS + BULLET_RADIUS));

        return new Bullet(bulletPos, bulletVel);
    }

    damage(value) {
        this.health = Math.max(this.health - value, 0.0);
    }

    heal(value) {
        if (this.health > 0.0) {
            this.health = Math.min(this.health + value, PLAYER_MAX_HEALTH);
        }
    }
}