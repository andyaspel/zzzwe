"use strict";

import {
  PARTICLES_COUNT_RANGE,
  PARTICLE_LIFETIME_RANGE,
  PARTICLE_MAG_RANGE,
  PARTICLE_RADIUS_RANGE,
  RANDOM_ANGLE,
} from "../CONSTANTS.js";
import V2 from "../CLASSES/PLAYER_CONTROLLER.js";
import Particle from "../CLASSES/PARTICLES.js";

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function randomBetween(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export function shaderTypeToString(gl, shaderType) {
  switch (shaderType) {
    case gl.VERTEX_SHADER:
      return "Vertex";
    case gl.FRAGMENT_SHADER:
      return "Fragment";
    default:
      return shaderType;
  }
}

export function compileShaderSource(gl, source, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Could not compile ${this.shaderTypeToString(
        shaderType
      )} shader: ${gl.getShaderInfoLog(shader)}`
    );
  }
  return shader;
}

export function linkShaderProgram(gl, shaders, vertexAttribs) {
  const program = gl.createProgram();
  for (let shader of shaders) {
    gl.attachShader(program, shader);
  }

  for (let vertexName in vertexAttribs) {
    gl.bindAttribLocation(program, vertexAttribs[vertexName], vertexName);
  }

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      `Could not link shader program: ${gl.getProgramInfoLog(program)}`
    );
  }
  return program;
}

// TODO(#2): burst particle in a particular direction;
export function particleBurst(particles, center, color) {
  const N = randomBetween(...PARTICLES_COUNT_RANGE);
  for (let i = 0; i < N; ++i) {
    particles.push(
      new Particle(
        center,
        V2.polar(randomBetween(...PARTICLE_MAG_RANGE), RANDOM_ANGLE()),
        randomBetween(...PARTICLE_LIFETIME_RANGE),
        randomBetween(...PARTICLE_RADIUS_RANGE),
        color
      )
    );
  }
}
let windowWasResized = true;

export function step(timestamp) {
  const canvas = document.getElementById("game-canvas");
  if (start === undefined) {
    start = timestamp;
  }
  const dt = (timestamp - start) * 0.001;
  start = timestamp;

  render.setTimestamp(timestamp * 0.001);

  if (windowWasResized) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render.setViewport(window.innerWidth, window.innerHeight);
    windowWasResized = false;
  }

  game.update(dt);
  game.render();

  window.requestAnimationFrame(step);
}
