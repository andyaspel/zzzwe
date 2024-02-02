"use strict";

import {
  DEFAULT_RESOLUTION,
  TRIANGLE_PAIR,
  TRIANGLE_VERTICIES,
  FONT_CHAR_WIDTH,
  FONT_CHAR_HEIGHT,
  FONT_SHEET_WIDTH,
  FONT_SHEET_HEIGHT,
  FONT_SHEET_COLS,
} from "../CONSTANTS.js";
import { compileShaderSource, linkShaderProgram } from "../functions/utils.js";

export class BitmapFontProgram {
  vertexShaderSource = `#version 100

precision mediump float;

attribute vec2 meshPosition;
attribute vec2 letterSlot;

uniform vec2 resolution;
uniform float messageScale;
uniform vec2 messagePosition;
uniform float letterCount;

varying vec2 uv;

void main() {
    float letterCode = letterSlot.x;
    float letterCol = letterSlot.y;

    vec2 meshPositionUV = (meshPosition + vec2(1.0, 1.0)) / 2.0;
    vec2 screenPosition = 
        meshPositionUV * vec2(float(${FONT_CHAR_WIDTH}), float(${FONT_CHAR_HEIGHT})) * messageScale +
        messagePosition +
        vec2(float(${FONT_CHAR_WIDTH}) * messageScale * letterCol, 0.0);

    gl_Position = vec4(2.0 * screenPosition / resolution, 0.0, 1.0);

    float charIndex = letterCode - 32.0;
    float charU = (floor(mod(charIndex, float(${FONT_SHEET_COLS}))) + meshPositionUV.x) * float(${FONT_CHAR_WIDTH}) / float(${FONT_SHEET_WIDTH});
    float charV = (floor(charIndex / float(${FONT_SHEET_COLS})) + (1.0 - meshPositionUV.y)) * float(${FONT_CHAR_HEIGHT}) / float(${FONT_SHEET_HEIGHT});
    
    uv = vec2(charU, charV);
}
`;

  fragmentShaderSource = `#version 100

precision mediump float;

uniform sampler2D font;
uniform vec4 messageColor;

varying vec2 uv;

void main() {
    vec4 tex = texture2D(font, uv);
    gl_FragColor = tex * vec4(messageColor.r, messageColor.g, messageColor.b, messageColor.a * tex.r);
}
`;

  constructor(gl, ext, vertexAttribs) {
    this.gl = gl;
    this.ext = ext;

    let vertexShader = compileShaderSource(
      gl,
      this.vertexShaderSource,
      gl.VERTEX_SHADER
    );
    let fragmentShader = compileShaderSource(
      gl,
      this.fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    this.program = linkShaderProgram(
      gl,
      [vertexShader, fragmentShader],
      vertexAttribs
    );
    gl.useProgram(this.program);

    this.resolutionUniform = gl.getUniformLocation(this.program, "resolution");
    this.messageScaleUniform = gl.getUniformLocation(
      this.program,
      "messageScale"
    );
    this.messageColorUniform = gl.getUniformLocation(
      this.program,
      "messageColor"
    );
    gl.uniform4f(this.messageColorUniform, 1.0, 1.0, 1.0, 1.0);
    this.timeUniform = gl.getUniformLocation(this.program, "time");
    this.letterCountUniform = gl.getUniformLocation(
      this.program,
      "letterCount"
    );
    this.messagePositionUniform = gl.getUniformLocation(
      this.program,
      "messagePosition"
    );
  }

  use() {
    this.gl.useProgram(this.program);
  }

  setViewport(width, height) {
    const scale = Math.min(
      width / DEFAULT_RESOLUTION.w,
      height / DEFAULT_RESOLUTION.h
    );

    this.unitsPerPixel = 1 / scale;
    this.gl.uniform2f(this.resolutionUniform, width, height);
  }

  setTimestamp(timestamp) {
    this.gl.uniform1f(this.timeUniform, timestamp);
  }

  setColor(color) {
    this.gl.uniform4f(
      this.messageColorUniform,
      color.r,
      color.g,
      color.b,
      color.a
    );
  }

  setMessagePosition(x, y) {
    this.gl.uniform2f(this.messagePositionUniform, x, y + 75);
  }

  setMessageScale(scale) {
    this.gl.uniform1f(this.messageScaleUniform, scale);
  }

  draw(letterCount) {
    this.gl.uniform1f(this.letterCountUniform, letterCount);
    this.ext.drawArraysInstancedANGLE(
      this.gl.TRIANGLES,
      0,
      TRIANGLE_PAIR * TRIANGLE_VERTICIES,
      letterCount
    );
  }
}

export class BackgroundProgram {
  vertexShaderSource = `#version 100
precision mediump float;

attribute vec2 meshPosition;

varying vec2 position;

void main() {
    gl_Position = vec4(meshPosition, 0.0, 1.0);
    position = vec2(meshPosition.x, -meshPosition.y);
}
`;

  fragmentShaderSource = `#version 100
precision mediump float;

uniform vec2 resolution;
uniform vec2 cameraPosition;
uniform float time;

varying vec2 position;

void main() {
    float gridSize = 2000.0;
    float radius = gridSize * 0.4;

    float scale = min(resolution.x / float(${DEFAULT_RESOLUTION.w}), resolution.y / float(${DEFAULT_RESOLUTION.h}));
    vec2 coord = (position * resolution * 0.5 / scale + cameraPosition);
    vec2 cell = floor(coord / gridSize);
    vec2 center = cell * gridSize + vec2(gridSize * 0.5);

    if (length(center - coord) < radius) {
        float value = (sin(cell.x + cell.y + time) + 1.0) / 2.0 * 0.1;
        gl_FragColor = vec4(value, value, value, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
`;

  constructor(gl, vertexAttribs) {
    this.gl = gl;

    let vertexShader = compileShaderSource(
      gl,
      this.vertexShaderSource,
      gl.VERTEX_SHADER
    );
    let fragmentShader = compileShaderSource(
      gl,
      this.fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    this.program = linkShaderProgram(
      gl,
      [vertexShader, fragmentShader],
      vertexAttribs
    );
    gl.useProgram(this.program);

    this.resolutionUniform = gl.getUniformLocation(this.program, "resolution");
    this.cameraPositionUniform = gl.getUniformLocation(
      this.program,
      "cameraPosition"
    );
    this.timeUniform = gl.getUniformLocation(this.program, "time");
  }

  use() {
    this.gl.useProgram(this.program);
  }

  setViewport(width, height) {
    const scale = Math.min(
      width / DEFAULT_RESOLUTION.w,
      height / DEFAULT_RESOLUTION.h
    );

    this.unitsPerPixel = 1 / scale;
    this.gl.uniform2f(this.resolutionUniform, width, height);
  }

  setCameraPosition(pos) {
    this.gl.uniform2f(this.cameraPositionUniform, pos.x, pos.y);
  }

  setTimestamp(timestamp) {
    this.gl.uniform1f(this.timeUniform, timestamp);
  }

  draw() {
    this.gl.drawArrays(
      this.gl.TRIANGLES,
      0,
      TRIANGLE_PAIR * TRIANGLE_VERTICIES
    );
  }
}

export class CirclesProgram {
  vertexShaderSource = `#version 100
precision mediump float;

uniform vec2 resolution;
uniform vec2 cameraPosition;

attribute vec2 meshPosition;

attribute vec2 circleCenter;
attribute float circleRadius;
attribute vec4 circleColor;

varying vec4 vertexColor;
varying vec2 vertexUV;

vec2 camera_projection(vec2 position) {
    float scale = min(resolution.x / float(${DEFAULT_RESOLUTION.w}), resolution.y / float(${DEFAULT_RESOLUTION.h}));
    vec2 result = 2.0 * scale * (position - cameraPosition) / resolution;
    return vec2(result.x, -result.y);
}

void main() {
    gl_Position = vec4(camera_projection(meshPosition * circleRadius + circleCenter), 0.0, 1.0);
    vertexColor = circleColor;
    vertexUV = meshPosition;
}
`;

  fragmentShaderSource = `#version 100
precision mediump float;

uniform float grayness;

varying vec4 vertexColor;
varying vec2 vertexUV;

vec4 grayScale(vec4 color, float t) {
    float v = (color.x + color.y + color.z) / 3.0;
    return vec4(
        mix(color.x, v, t),
        mix(color.y, v, t),
        mix(color.z, v, t),
        color.w);
}

void main() {
    vec4 color = vertexColor;
    gl_FragColor = length(vertexUV) < 1.0 ? grayScale(color, grayness) : vec4(0.0);
}
`;

  constructor(gl, ext, vertexAttribs) {
    this.gl = gl;
    this.ext = ext;

    let vertexShader = compileShaderSource(
      gl,
      this.vertexShaderSource,
      gl.VERTEX_SHADER
    );
    let fragmentShader = compileShaderSource(
      gl,
      this.fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    this.program = linkShaderProgram(
      gl,
      [vertexShader, fragmentShader],
      vertexAttribs
    );
    gl.useProgram(this.program);

    this.resolutionUniform = gl.getUniformLocation(this.program, "resolution");
    this.cameraPositionUniform = gl.getUniformLocation(
      this.program,
      "cameraPosition"
    );
    this.graynessUniform = gl.getUniformLocation(this.program, "grayness");
  }

  use() {
    this.gl.useProgram(this.program);
  }

  // TODO: Rename Renderer(WebGL|2D).setViewport() to setResolution()
  setViewport(width, height) {
    this.gl.uniform2f(this.resolutionUniform, width, height);
  }

  setCameraPosition(pos) {
    this.gl.uniform2f(this.cameraPositionUniform, pos.x, pos.y);
  }

  setGrayness(grayness) {
    this.gl.uniform1f(this.graynessUniform, grayness);
  }

  draw(circlesCount) {
    this.ext.drawArraysInstancedANGLE(
      this.gl.TRIANGLES,
      0,
      TRIANGLE_PAIR * TRIANGLE_VERTICIES,
      circlesCount
    );
  }
}
