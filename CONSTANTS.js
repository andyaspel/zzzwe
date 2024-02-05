"use strict";

import V2 from "./CLASSES/PLAYER_CONTROLLER.js";
import COLOUR from "./CLASSES/COLOUR.js";
import { randomBetween } from "./functions/utils.js";

export const DEFAULT_RESOLUTION = { w: 3840, h: 2160 };
export const TRIANGLE_PAIR = 2;
export const TRIANGLE_VERTICIES = 3;
export const QUAD_VERTICIES = 4;
export const VEC2_COUNT = 2;
export const VEC2_X = 0;
export const VEC2_Y = 1;
export const RGBA_COUNT = 4;
export const RGBA_R = 0;
export const RGBA_G = 1;
export const RGBA_B = 2;
export const RGBA_A = 3;
export const TRAIL_COOLDOWN = 1 / 60;
export const RANDOM_ANGLE = () => randomBetween(0, 2 * Math.PI);
export const DIRECTION_MAP = {
  KeyS: new V2(0, 1.0),
  KeyW: new V2(0, -1.0),
  KeyA: new V2(-1.0, 0),
  KeyD: new V2(1.0, 0),
};

export const PLAYER_COLOR = COLOUR.hex("#f43841");
export const PLAYER_SPEED = 1000;
export const PLAYER_RADIUS = 69;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_SHOOT_COOLDOWN = 0.25 / 2.0;
export const PLAYER_TRAIL_RATE = 3.0;

export const ENEMY_SPEED = PLAYER_SPEED / 3;
export const ENEMY_RADIUS = PLAYER_RADIUS;
export const ENEMY_SPAWN_ANIMATION_SPEED = ENEMY_RADIUS * 8;
export const ENEMY_COLOR = COLOUR.hex("#9e95c7");
export const ENEMY_SPAWN_COOLDOWN = 1.0;
export const ENEMY_SPAWN_GROWTH = 1.01;
export const ENEMY_SPAWN_DISTANCE = 1500.0;
export const ENEMY_DESPAWN_DISTANCE = ENEMY_SPAWN_DISTANCE * 2;
export const ENEMY_DAMAGE = PLAYER_MAX_HEALTH / 5;
export const ENEMY_KILL_HEAL = PLAYER_MAX_HEALTH / 10;
export const ENEMY_KILL_SCORE = 100;
export const ENEMY_TRAIL_RATE = 2.0;

export const BULLET_RADIUS = 42;
export const BULLET_SPEED = 2000;
export const BULLET_LIFETIME = 5.0;

export const PARTICLES_COUNT_RANGE = [0, 50];
export const PARTICLE_RADIUS_RANGE = [10.0, 20.0];
export const PARTICLE_MAG_RANGE = [0, BULLET_SPEED];
export const PARTICLE_MAX_LIFETIME = 1.0;
export const PARTICLE_LIFETIME_RANGE = [0, PARTICLE_MAX_LIFETIME];

export const TUTORIAL_POPUP_SPEED = 1.7;
export const TUTORIAL_STATE = Object.freeze({
  LearningMovement: 0,
  LearningShooting: 1,
  Finished: 2,
});

export const TUTORIAL_MESSAGES = Object.freeze([
  " ( W, A, S, D ) KEYS TO MOVE ",
  " LEFT CLICK TO SHOOT ",
  "",
]);

export const LOCAL_STORAGE_TUTORIAL = "tutorial";
export const MESSAGE_COLOR = COLOUR.hex("#4fd909");

export const CIRCLE_BATCH_CAPACITY = 1024 * 10;
export const LETTER_SLOTS_CAPACITY = 1024;
export const LETTER_SLOT_COUNT = VEC2_COUNT;
export const LETTER_SLOT_CODE = 0;
export const LETTER_SLOT_COL = 1;
export const FONT_SIZE = 48;
export const LINE_PADDING = 32;
export const FONT_SHEET_WIDTH = 295;
export const FONT_SHEET_HEIGHT = 12;
export const FONT_SHEET_COLS = 59;
export const FONT_SHEET_ROWS = 1;
export const FONT_CHAR_WIDTH = Math.floor(FONT_SHEET_WIDTH / FONT_SHEET_COLS);
export const FONT_CHAR_HEIGHT = Math.floor(FONT_SHEET_HEIGHT / FONT_SHEET_ROWS);
export const FONT_MESSAGE_SCALE = 8.0;

export const BACKGROUND_CELL_RADIUS = 220;
export const BACKGROUND_LINE_COLOR = COLOUR.hex("#ffffff").withAlpha(0.5);
export const BACKGROUND_CELL_WIDTH = 1.5 * BACKGROUND_CELL_RADIUS;
export const BACKGROUND_CELL_HEIGHT = Math.sqrt(3) * BACKGROUND_CELL_RADIUS;
export const BACKGROUND_CELL_POINTS = (() => {
  let points = [];
  for (let i = 0; i < 4; ++i) {
    let angle = (2 * Math.PI * i) / 2;
    points.push(
      new V2(Math.cos(angle), Math.sin(angle)).scale(BACKGROUND_CELL_RADIUS)
    );
  }
  return points;
})();
