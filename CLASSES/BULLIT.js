"use strict";

import { BULLET_LIFETIME,BULLET_RADIUS,PLAYER_COLOR } from "../CONSTANTS.js";
// import { renderer  } from "../functions/utils";
export default class Bullet {
    
    constructor(pos, vel) {
        this.pos = pos;
        this.vel = vel;
        this.lifetime = BULLET_LIFETIME;
        // this.renderer = renderer;
    }
    


    update(dt) {
        this.pos = this.pos.add(this.vel.scale(dt));
        this.lifetime -= dt;
    }

    render(renderer) {
        renderer.fillCircle(this.pos, BULLET_RADIUS, PLAYER_COLOR);
    }
}