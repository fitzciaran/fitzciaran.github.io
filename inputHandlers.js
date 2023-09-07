import { camX, camY, getGameState, setGameState, getCanvas, GameState, PilotName, player } from "./astroids.js";
import { drawNameEntry, playButtonX, playButtonY, playButtonWidth, playButtonHeight , menuButtonX, menuButtonY, menuButtonWidth, menuButtonHeight } from "./canvasDrawingFunctions.js";
import { pilot1, pilot2, calculateAngle, getRandomName, max_player_name } from "./gameLogic.js";

let pilotMouseMoveListener;
let pilotClickListener;
let pilotSelected = "";
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
  });

  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
      player.space = false;
      keys.space = false;
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
      // Check if mouse is over a pilot
      if (
        event.clientX > pilot1.x &&
        event.clientX < pilot1.x + pilot1.width &&
        event.clientY > pilot1.y &&
        event.clientY < pilot1.y + pilot1.height
      ) {
        pilot1.selected = true;
        pilot2.selected = false;
      } else {
        //pilot1.selected = false;
      }
      if (
        event.clientX > pilot2.x &&
        event.clientX < pilot2.x + pilot2.width &&
        event.clientY > pilot2.y &&
        event.clientY < pilot2.y + pilot2.height
      ) {
        pilot2.selected = true;
        pilot1.selected = false;
      } else {
        //pilot2.selected = false;
      }
    }
  };

  //selectPilot();
  pilotClickListener = function (event) {
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
  };

  canvas.addEventListener("click", pilotClickListener);
  canvas.addEventListener("mousemove", pilotMouseMoveListener);
}

function selectPilot() {
  if (getGameState() === GameState.PILOT_SELECT || getGameState() === GameState.INTRO) {
    // Check if a pilot was clicked
    if (pilot1.selected) {
      pilotSelected = PilotName.PILOT_1;
    }
    if (pilot2.selected) {
      pilotSelected = PilotName.PILOT_2;
    }
    if (pilot1.selected || pilot2.selected) {
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
  window.addEventListener("keydown", handleWinStateKeyDown);
  canvas.addEventListener("click", handleWinStateClick);
}

export function removeWinStateEventListeners(window, canvas) {
  window.removeEventListener("keydown", handleWinStateKeyDown);
  canvas.removeEventListener("click", handleWinStateClick);
}

function handleWinStateClick(event) {
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
