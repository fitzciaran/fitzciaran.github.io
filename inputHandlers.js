import { camX, camY, getGameState, setGameState, getCanvas, GameState, player } from "./main.js";
import {
  drawNameEntry,
  playButtonX,
  playButtonY,
  playButtonWidth,
  playButtonHeight,
  menuButtonX,
  menuButtonY,
  menuButtonWidth,
  menuButtonHeight,
} from "./canvasDrawingFunctions.js";
import { pilots, calculateAngle, getRandomName, max_player_name } from "./gameLogic.js";

let pilotMouseMoveListener;
let pilotClickListener;
let keysDown = {};

let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  shift: false,
  u: false,
};

export let mousePos = { x: 0, y: 0 };
export { handleInputEvents };

function handleInputEvents(canvas, player) {
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      player.space = true;
      keys.space = true;
    }
    if (e.code === "Shift") {
      player.shift = true;
      keys.shift = true;
    }
    if (e.ctrlKey && e.key === "b") {
      player.setDevMode(true);
    }
  });

  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
      player.space = false;
      keys.space = false;
    }
    if (e.code === "Shift") {
      player.shift = false;
      keys.shift = false;
    }
  });

  canvas.addEventListener(
    "mousemove",
    function (evt) {
      let coords = getMousePos(canvas, evt);
      mousePos.x = coords.x + camX;
      mousePos.y = coords.y + camY;
      player.mousePosX = mousePos.x;
      player.mousePosY = mousePos.y;
      player.angle = calculateAngle(player);
    },
    false
  );

  canvas.addEventListener("mousedown", function (e) {
    if (e.button === 2) {
      player.shift = true;
      keys.shift = true;
    } else if (e.button === 1) {
      player.u = true;
      keys.u = true;
      if (keys.shift && keys.space) {
        player.setDevMode(true);
      }
    } else {
      player.space = true;
      keys.space = true;
    }
  });

  canvas.addEventListener("mouseup", function (e) {
    if (e.button === 2) {
      player.shift = false;
      keys.shift = false;
    } else if (e.button === 1) {
      player.u = false;
      keys.u = false;
    } else {
      player.space = false;
      keys.space = false;
    }
  });

  canvas.addEventListener("touchstart", function (e) {
    player.space = true;
    keys.space = true;

    // Update mouse position on touch start
    if (e.touches) {
      mousePos.x = e.touches[0].clientX + camX;
      mousePos.y = e.touches[0].clientY + camY;
      player.mousePosX = mousePos.x;
      player.mousePosY = mousePos.y;
      player.angle = calculateAngle(player);
    }
  });

  canvas.addEventListener("touchend", function (e) {
    player.space = false;
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
        player.mousePosX = mousePos.x;
        player.mousePosY = mousePos.y;
        player.angle = calculateAngle(player);
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

export function addPilotEventListners(canvas, ctx) {
  pilotMouseMoveListener = function (event) {
    if (getGameState() === GameState.PILOT_SELECT || getGameState() === GameState.INTRO) {
    }
  };

  //selectPilot();
  pilotClickListener = function (event) {
    //just in case set canvas back
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    //x and y that are passed to drawNameEntry, need to remove the need for this duplication
    let x = canvas.width / 2 - 100;
    let y = 80;
    // Play button dimensions and location
    let buttonX = x + 50;
    let buttonY = y + 70;
    let buttonWidth = 100;
    let buttonHeight = 20;

    // Check if the mouse click is within the bounds of the play button
    if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
      // Play button has been clicked
      // selectPilot();
      // setGameState(GameState.GAME);
      startGame();
    }
    // Iterate over pilots
    for (let i = 0; i < pilots.length; i++) {
      let pilot = pilots[i];

      if (event.clientX > pilot.x && event.clientX < pilot.x + pilot.width && event.clientY > pilot.y && event.clientY < pilot.y + pilot.height) {
        pilot.setSelected(true);
        for (let i = 0; i < pilots.length; i++) {
          let otherPilot = pilots[i];
          if (pilot != otherPilot) {
            otherPilot.setSelected(false);
          }
        }
      }
    }
  };

  canvas.addEventListener("click", pilotClickListener);
  canvas.addEventListener("mousemove", pilotMouseMoveListener);
}

function selectPilot() {
  if (getGameState() === GameState.PILOT_SELECT || getGameState() === GameState.INTRO) {
    // Check if a pilot was clicked
    let pilotSelected = null; // Initialize pilotSelected to null

    for (let i = 0; i < pilots.length; i++) {
      let pilot = pilots[i];

      if (pilot.selected) {
        pilotSelected = pilot.name;
        break; // Exit the loop once a pilot is selected
      }
    }

    if (pilotSelected) {
      // If a pilot was selected, update the player object and change the game state to 'game'
      player.setPilot(pilotSelected);
    }
  }
}

export function removePilotsEventListeners(canvas) {
  canvas.removeEventListener("mousemove", pilotMouseMoveListener);
  canvas.removeEventListener("click", pilotClickListener);
}

function handleNameKeyDown(event) {
  // Check if the key is already down
  if (keysDown[event.key]) {
    return;
  }
  keysDown[event.key] = true;

  // Check if the key pressed is a printable character
  if (/^[\x20-\x7E]$/.test(event.key) && player.getPlayerName().length < max_player_name) {
    // player.name += event.key;
    player.setPlayerName(player.getPlayerName() + event.key);
  } else if (event.key === "Backspace") {
    //player.name = player.name.slice(0, -1);
    player.setPlayerName(player.getPlayerName().slice(0, -1));
  }
  // Check if the key pressed is enter
  else if (event.key === "Enter") {
    // setGameState(GameState.PILOT_SELECT);
    //setGameState(GameState.GAME);
    startGame();
  }

  if (player.getPlayerName().length >= max_player_name) {
    //inform the user somehow
  }

  // Redraw name entry
  drawNameEntry(getCanvas(), getCanvas().getContext("2d"), player.getPlayerName(), getCanvas().width / 2 - 100, 80);
}

function startGame() {
  if (player.getPlayerName() == "") {
    player.setPlayerName(getRandomName());
  }
  selectPilot();
  setGameState(GameState.GAME);
}

export function handleNameKeyUp(event) {
  // Remove the key from the keysDown object
  delete keysDown[event.key];
}

export function handleWinStateKeyDown(event) {
  // Check if the key pressed is enter
  if (event.key === "Enter") {
    setGameState(GameState.GAME);
  }
  if (event.key === "r") {
    setGameState(GameState.INTRO);
  }
}

export function handleGameKeyDown(event) {
  // Handle game-specific keydown events here
}

export function handleGameKeyUp(event) {
  // Handle game-specific keyup events here
}

export function setupNameEventListeners(window) {
  window.addEventListener("keydown", handleNameKeyDown);
  window.addEventListener("keyup", handleNameKeyUp);
}
export function removeNameEventListeners(window) {
  window.removeEventListener("keydown", handleNameKeyDown);
  window.removeEventListener("keyup", handleNameKeyUp);
}

export function setupGameEventListeners() {}
export function removeGameStateEventListeners() {}
export function setupWinStateEventListeners(window, canvas) {
  // window.addEventListener("keydown", handleWinStateKeyDown);
  canvas.addEventListener("click", handleWinStateClick);
}

export function removeWinStateEventListeners(window, canvas) {
  // window.removeEventListener("keydown", handleWinStateKeyDown);
  canvas.removeEventListener("click", handleWinStateClick);
}

function handleWinStateClick(event) {
  //just in case set canvas back
  this.style.left = "0px";
  this.style.top = "0px";
  // Play button dimensions and location
  let buttonX = playButtonX;
  let buttonY = playButtonY;
  let buttonWidth = playButtonWidth;
  let buttonHeight = playButtonHeight;

  // Check if the mouse click is within the bounds of the play button
  if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
    // Play button has been clicked
    setGameState(GameState.GAME);
  }
  buttonX = menuButtonX;
  buttonY = menuButtonY;
  buttonWidth = menuButtonWidth;
  buttonHeight = menuButtonHeight;
  // Check if the mouse click is within the bounds of the menu button
  if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
    // Menu button has been clicked
    setGameState(GameState.INTRO);
  }
}
