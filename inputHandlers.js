import { camX, camY, getGameState, setGameState, getCanvas, GameState, PilotName, player } from "./astroids.js";
import { pilot1, pilot2 } from "./gameLogic.js";
import { drawPilots, drawNameEntry } from "./canvasDrawingFunctions.js";

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
};

const max_player_name = 15;

export let mousePos = { x: 0, y: 0 };
export { keys, handleInputEvents };

function calculateAngle(mousePos, player) {
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
      player.angle = calculateAngle(mousePos, player);
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
      player.angle = calculateAngle(mousePos, player);
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
        player.angle = calculateAngle(mousePos, player);
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

      // Redraw pilots with new selection state
      //drawPilots(canvas, ctx);
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
export function setupWinStateEventListeners() {
  window.addEventListener("keydown", handleWinStateKeyDown);
}

export function removeWinStateEventListeners() {
  window.removeEventListener("keydown", handleWinStateKeyDown);
}

function getRandomName() {
  const prefixes = ["Astro", "Galaxy", "Star", "Cosmo", "Rocket", "Lunar", "Solar", "Quasar", "Pulsar", "Meteor","Poopy","Sneaky","Stinky","Drunk"];
  const suffixes = ["Rider", "Pilot", "Crusher", "Dasher", "Blaster", "Buster", "Zoomer", "Flyer", "Racer", "Striker","Butthole","Tosser","Wanker","Killer","Chubb"];

  // Generate a random index for prefix and suffix
  const prefixIndex = Math.floor(Math.random() * prefixes.length);
  const suffixIndex = Math.floor(Math.random() * suffixes.length);

  // Generate a random number between 10 and 99
  const randomNumber = Math.floor(Math.random() * 90) + 10;

  // Concatenate prefix, suffix and random number to form the name
  let randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;

  // If the name is longer than 10 characters, regenerate it
  while (randomName.length > max_player_name) {
    const prefixIndex = Math.floor(Math.random() * prefixes.length);
    const suffixIndex = Math.floor(Math.random() * suffixes.length);
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;
  }

  return randomName;
}
