import { camX, camY } from "./astroids.js";

let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
};

export let mousePos = { x: 0, y: 0 };
export { keys, handleInputEvents };

function calculateAngle(mousePos,player) {
  return Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
}

function handleInputEvents(canvas, player, keys) {
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      keys.space = true;
    }
  });

  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
      keys.space = false;
    }
  });

  canvas.addEventListener(
    "mousemove",
    function (evt) {
      let coords = getMousePos(canvas, evt);
      mousePos.x = coords.x + camX;
      mousePos.y = coords.y + camY;
      player.angle = calculateAngle(mousePos,player);
    },
    false
  );

  canvas.addEventListener("mousedown", function (e) {
    keys.space = true;
  });

  canvas.addEventListener("mouseup", function (e) {
    keys.space = false;
  });

  canvas.addEventListener("touchstart", function (e) {
    keys.space = true;

    // Update mouse position on touch start
    if (e.touches) {
      mousePos.x = e.touches[0].clientX + camX;
      mousePos.y = e.touches[0].clientY + camY;
      player.angle = calculateAngle(mousePos,player);
    }
  });

  canvas.addEventListener("touchend", function (e) {
    keys.space = false;
  });

  canvas.addEventListener(
    "touchmove",
    function (e) {
      // Prevent scrolling when touching the canvas
      e.preventDefault();

      if (e.touches) {
        let coords = getMousePos(canvas, e.touches[0]);
        mousePos.x = coords.x + camX;
        mousePos.y = coords.y + camY;
        player.angle = calculateAngle(mousePos,player);
      }
    },
    { passive: false }
  ); // Set passive to false to prevent scrolling
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
