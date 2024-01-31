class Game {
    restart() {
        // TODO(#37): a player respawn animation similar to the enemy's one
        this.player = new Player(new V2(0, 0));
        this.score = 0;
        this.mousePos = new V2(0, 0);
        this.pressedKeys = new Set();
        this.tutorial = new Tutorial();
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemySpawnRate = ENEMY_SPAWN_COOLDOWN;
        this.enemySpawnCooldown = ENEMY_SPAWN_COOLDOWN;
        this.paused = false;
        this.renderer.cameraPos = new V2(0.0, 0.0);
        this.renderer.cameraVel = new V2(0.0, 0.0);
    }

    constructor(renderer) {
        this.renderer = renderer;
        this.restart();
    }

    update(dt) {
        if (this.paused) {
            this.renderer.grayness = 1.0;
            return;
        } else {
            this.renderer.grayness = 1.0 - this.player.health / PLAYER_MAX_HEALTH;
        }

        if (this.player.health <= 0.0) {
            dt /= 50;
        }

        this.renderer.setTarget(this.player.pos);
        this.renderer.update(dt);

        let vel = new V2(0, 0);
        let moved = false;
        for (let key of this.pressedKeys) {
            if (key in directionMap) {
                vel = vel.add(directionMap[key]);
                moved = true;
            }
        }
        vel = vel.normalize().scale(PLAYER_SPEED);
        if (moved) {
            this.tutorial.playerMoved();
        }

        this.player.update(dt, vel);
        if (this.player.shooting) {
            if (performance.now() * 0.001 - this.player.lastShoot > PLAYER_SHOOT_COOLDOWN) {
                this.bullets.push(this.player.shootAt(this.renderer.screenToWorld(this.mousePos)));
            }
        }

        this.tutorial.update(dt);

        for (let enemy of this.enemies) {
            if (!enemy.ded) {
                for (let bullet of this.bullets) {
                    if (enemy.pos.dist(bullet.pos) <= BULLET_RADIUS + ENEMY_RADIUS) {
                        this.score += ENEMY_KILL_SCORE;
                        this.player.heal(ENEMY_KILL_HEAL);
                        if (bullet.lifetime > 0.0) this.player.accuracy += 1;
                        bullet.lifetime = 0.0;
                        enemy.ded = true;
                        particleBurst(this.particles, enemy.pos, ENEMY_COLOR);
                    }
                }
            }

            if (this.player.health > 0.0 && !enemy.ded) {
                if (enemy.pos.dist(this.player.pos) <= PLAYER_RADIUS + ENEMY_RADIUS) {
                    this.player.damage(ENEMY_DAMAGE);
                    if (this.player.health <= 0.0) {
                        this.player.trail.disabled = true;
                        for (let enemy of this.enemies) {
                            enemy.trail.disabled = true;
                        }
                    }
                    enemy.ded = true;
                    particleBurst(this.particles, enemy.pos, PLAYER_COLOR);
                }
            }
        }

        for (let bullet of this.bullets) {
            bullet.update(dt);
        }
        this.bullets = this.bullets.filter(bullet => bullet.lifetime > 0.0);

        for (let particle of this.particles) {
            particle.update(dt);
        }
        this.particles = this.particles.filter(particle => particle.lifetime > 0.0);

        for (let enemy of this.enemies) {
            enemy.update(dt, this.player.pos);
        }
        this.enemies = this.enemies.filter(enemy => {
            return !enemy.ded && enemy.pos.dist(this.player.pos) < ENEMY_DESPAWN_DISTANCE;
        });

        if (this.tutorial.state == TutorialState.Finished) {
            this.enemySpawnCooldown -= dt;
            if (this.enemySpawnCooldown <= 0.0) {
                this.spawnEnemy();
                this.enemySpawnCooldown = this.enemySpawnRate;
                this.enemySpawnRate /= ENEMY_SPAWN_GROWTH;
            }
        }
    }

    renderEntities(entities) {
        for (let entity of entities) {
            entity.render(this.renderer);
        }
    }

    render() {
        this.renderer.clear();

        this.renderer.background();
        this.player.render(this.renderer);

        this.renderEntities(this.bullets);
        this.renderEntities(this.particles);
        this.renderEntities(this.enemies);

        if (this.paused) {
            this.renderer.fillMessage("PAUSED (SPACE to resume)", MESSAGE_COLOR);
        } else if(this.player.health <= 0.0) {
            const accuracy = Math.ceil(100 * this.player.accuracy / Math.max(this.player.shootCount, 1.0));
            this.renderer.fillMessage(`YOUR SCORE: ${this.score}\nACCURACY: ${accuracy}%\n(SPACE to restart)`, MESSAGE_COLOR);
        } else {
            this.tutorial.render(this.renderer);
        }

        this.renderer.present();
    }

    spawnEnemy() {
        let dir = randomAngle();
        this.enemies.push(new Enemy(this.player.pos.add(V2.polar(ENEMY_SPAWN_DISTANCE, dir))));
    }

    togglePause() {
        this.paused = !this.paused;
    }

    keyDown(event) {
        if (this.player.health <= 0.0 && event.code == 'Space') {
            this.restart();
            return;
        }

        if (event.code == 'Space') {
            this.togglePause();
        }

        this.pressedKeys.add(event.code);
    }

    keyUp(event) {
        this.pressedKeys.delete(event.code);
    }

    mouseMove(event) {
        this.mousePos = new V2(event.offsetX, event.offsetY);
    }

    mouseDown(event) {
        if (this.paused) {
            return;
        }

        if (this.player.health <= 0.0) {
            return;
        }

        this.player.shooting = true;
        this.tutorial.playerShot();
        this.mousePos = new V2(event.offsetX, event.offsetY);
        this.bullets.push(this.player.shootAt(this.renderer.screenToWorld(this.mousePos)));
    }

    mouseUp(event) {
        this.player.shooting = false;
    }
}