import RendererWebGL from "./CLASSES/RENDER_WEBGL.js";
import Renderer2D from "./CLASSES/RENDER2_2D.js";
import Game from "./CLASSES/GAME.js";
// import { renderer } from "./functions/utils.js";
import { step } from "./functions/utils.js";


let game = null;


(() => {
  const legacy = new URLSearchParams(document.location.search).has("legacy");

  const canvas = document.getElementById("game-canvas");
  const renderer = (() => {
      if (!legacy) {
          const gl = canvas.getContext("webgl");
          if (!gl) {
              throw new Error(`Unable to initilize WebGL. Your browser probably does not support that.`);
          }

          const ext = gl.getExtension('ANGLE_instanced_arrays');
          if (!ext) {
              throw new Error(`Unable to initialize Instanced Arrays extension for WebGL. Your browser probably does not support that.`);
          }

          return new RendererWebGL(gl, ext);
      } else {
          return new Renderer2D(canvas.getContext("2d"));
      }
  })();

  let windowWasResized = true;

  game = new Game(renderer);

  // https://drafts.csswg.org/mediaqueries-4/#mf-interaction
  // https://patrickhlauke.github.io/touch/pointer-hover-any-pointer-any-hover/
  if (window.matchMedia("(pointer: coarse)").matches) {
      game.tutorial.playerMoved();
  }

  let start;
  function step(timestamp) {
      if (start === undefined) {
          start = timestamp;
      }
      const dt = (timestamp - start) * 0.001;
      start = timestamp;

      game.renderer.setTimestamp(timestamp * 0.001);

      if (windowWasResized) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          game.renderer.setViewport(window.innerWidth, window.innerHeight);
          windowWasResized = false;
      }

      game.update(dt);
      game.render();

      window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);

  // TODO(#30): game is not playable on mobile without external keyboard

  document.addEventListener('keydown', event => {
      game.keyDown(event);
  });

  document.addEventListener('keyup', event => {
      game.keyUp(event);
  });

  document.addEventListener('pointermove', event => {
      game.mouseMove(event);
  });

  document.addEventListener('pointerdown', event => {
      game.mouseDown(event);
  });

  document.addEventListener('pointerup', event => {
      game.mouseUp(event);
  });

  window.addEventListener('resize', event => {
      windowWasResized = true;
  });

  window.addEventListener('blur', event => {
      if (game.player.health > 0.0) {
          game.paused = true;
      }
  });

  window.addEventListener('focus', event => {
      start = performance.now() - 1000 / 60;
  });
})();