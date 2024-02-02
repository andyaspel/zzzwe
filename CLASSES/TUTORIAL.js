"use strict";

import {
  LOCAL_STORAGE_TUTORIAL,
  TUTORIAL_POPUP_SPEED,
  MESSAGE_COLOR,
  TUTORIAL_STATE,
  TUTORIAL_MESSAGES,
} from "../CONSTANTS.js";

export class Tutorial {
  constructor() {
    const state = parseInt(window.localStorage.getItem(LOCAL_STORAGE_TUTORIAL));
    this.state =
      !isNaN(state) && 0 <= state && state < TUTORIAL_MESSAGES.length
        ? state
        : 0;
    this.popup = new TutorialPopup(TUTORIAL_MESSAGES[this.state]);
    this.popup.fadeIn();
    this.popup.onFadedOut = () => {
      this.popup.text = TUTORIAL_MESSAGES[this.state];
      this.popup.fadeIn();
    };
  }

  update(dt) {
    this.popup.update(dt);
  }

  render(renderer) {
    this.popup.render(renderer);
  }

  playerMoved() {
    if (this.state == TUTORIAL_STATE.LearningMovement) {
      this.popup.fadeOut();
      this.state += 1;
      window.localStorage.setItem(LOCAL_STORAGE_TUTORIAL, this.state);
    }
  }

  playerShot() {
    if (this.state == TUTORIAL_STATE.LearningShooting) {
      this.popup.fadeOut();
      this.state += 1;
      window.localStorage.setItem(LOCAL_STORAGE_TUTORIAL, this.state);
    }
  }
}

class TutorialPopup {
  constructor(text) {
    this.alpha = 0.0;
    this.dalpha = 1.0;
    this.text = text;
    this.onFadedOut = undefined;
    this.onFadedIn = undefined;
  }

  update(dt) {
    this.alpha += this.dalpha * dt;

    if (this.dalpha < 0.0 && this.alpha <= 0.0) {
      this.dalpha = 0.0;
      this.alpha = 0.0;

      this.onFadedOut?.();
    } else if (this.dalpha > 0.0 && this.alpha >= 1.0) {
      this.dalpha = 0.0;
      this.alpha = 1.0;

      this.onFadedIn?.();
    }
  }

  render(renderer) {
    renderer.fillMessage(this.text, MESSAGE_COLOR.withAlpha(this.alpha));
  }

  fadeIn() {
    this.dalpha = TUTORIAL_POPUP_SPEED;
  }

  fadeOut() {
    this.dalpha = -TUTORIAL_POPUP_SPEED;
  }
}
