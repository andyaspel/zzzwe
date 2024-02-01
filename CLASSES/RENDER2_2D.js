"use strict";

import * as csnt from "../CONSTANTS.js";
import  V2 from "./PLAYER_CONTROLLER.js";

export default class Renderer2D {
  cameraPos = new V2(0, 0);
  cameraVel = new V2(0, 0);
  grayness = 0.0;
  unitsPerPixel = 1.0;

  constructor(context2d) {
    this.context2d = context2d;
  }

  update(dt) {
    this.cameraPos = this.cameraPos.add(this.cameraVel.scale(dt));
  }

  width() {
    return this.context2d.canvas.width * this.unitsPerPixel;
  }

  height() {
    return this.context2d.canvas.height * this.unitsPerPixel;
  }

  getScreenWorldBounds() {
    let topLeft = this.screenToWorld(new V2(0, 0));
    let bottomRight = this.screenToWorld(
      new V2(this.context2d.canvas.width, this.context2d.canvas.height)
    );
    return [topLeft, bottomRight];
  }

  screenToWorld(point) {
    const width = this.context2d.canvas.width;
    const height = this.context2d.canvas.height;
    return point
      .sub(new csnt.V2(width / 2, height / 2))
      .scale(this.unitsPerPixel)
      .add(this.cameraPos);
  }

  worldToCamera(point) {
    const width = this.width();
    const height = this.height();
    return point.sub(this.cameraPos).add(new csnt.V2(width / 2, height / 2));
  }

  clear() {
    const width = this.width();
    const height = this.height();
    this.context2d.clearRect(0, 0, width, height);
  }

  setTarget(target) {
    this.cameraVel = target.sub(this.cameraPos);
  }

  fillCircle(center, radius, color) {
    const screenCenter = this.worldToCamera(center);
    this.context2d.fillStyle = color.grayScale(this.grayness).toRgba();
    this.context2d.beginPath();
    this.context2d.arc(
      screenCenter.x,
      screenCenter.y,
      radius,
      0,
      2 * Math.PI,
      false
    );
    this.context2d.fill();
  }

  fillRect(x, y, w, h, color) {
    const screenPos = this.worldToCamera(new V2(x, y));
    this.context2d.fillStyle = color.grayScale(this.grayness).toRgba();
    this.context2d.fillRect(screenPos.x, screenPos.y, w, h);
  }

  fillMessage(text, color) {
    const width = this.width();
    const height = this.height();

    this.context2d.fillStyle = color.toRgba();
    this.context2d.font = `${csnt.FONT_SIZE}px LexendMega`;
    this.context2d.textAlign = "center";
    this.context2d.textBaseline = "middle";
    const lines = text.split("\n");
    const MESSAGE_HEIGTH =
      (csnt.FONT_SIZE + csnt.LINE_PADDING) * (lines.length - 1);
    for (let i = 0; i < lines.length; ++i) {
      this.context2d.fillText(
        lines[i],
        width / 2,
        (height - MESSAGE_HEIGTH) / 2 + (csnt.FONT_SIZE + csnt.LINE_PADDING) * i
      );
    }
  }

  drawLine(points, color) {
    this.context2d.beginPath();
    for (let i = 0; i < points.length; ++i) {
      let screenPoint = this.worldToCamera(points[i]);
      if (i == 0) this.context2d.moveTo(screenPoint.x, screenPoint.y);
      else this.context2d.lineTo(screenPoint.x, screenPoint.y);
    }
    this.context2d.strokeStyle = color.toRgba();
    this.context2d.stroke();
  }

  setViewport(width, height) {
    const IDENTITY = new DOMMatrix();

    const scale = Math.min(
      width / csnt.DEFAULT_RESOLUTION.w,
      height / csnt.DEFAULT_RESOLUTION.h
    );

    this.unitsPerPixel = 1 / scale;

    this.context2d.setTransform(IDENTITY);
    this.context2d.scale(scale, scale);
  }

  present() {
    // Nothing to do. Everything is already presented by the 2D HTML canvas
  }

  setTimestamp(timestamp) {
    // Nothing to do. We don't use absolute value of the time to animate anything in here.
  }

  background() {
    let bounds = this.getScreenWorldBounds();
    let gridBoundsXMin = Math.floor(bounds[0].x / csnt.BACKGROUND_CELL_WIDTH);
    let gridBoundsXMax = Math.floor(bounds[1].x / csnt.BACKGROUND_CELL_WIDTH);
    let gridBoundsYMin = Math.floor(bounds[0].y / csnt.BACKGROUND_CELL_HEIGHT);
    let gridBoundsYMax = Math.floor(bounds[1].y / csnt.BACKGROUND_CELL_HEIGHT);

    for (let cellX = gridBoundsXMin; cellX <= gridBoundsXMax + 1; ++cellX) {
      for (let cellY = gridBoundsYMin; cellY <= gridBoundsYMax; ++cellY) {
        let offset = new V2(
          cellX * csnt.BACKGROUND_CELL_WIDTH,
          (cellY + (cellX % 2 == 0 ? 0.5 : 0)) * csnt.BACKGROUND_CELL_HEIGHT
        );
        let points = csnt.BACKGROUND_CELL_POINTS.map((p) => p.add(offset));
        this.drawLine(points, csnt.BACKGROUND_LINE_COLOR);
      }
    }
  }
}
