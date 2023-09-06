import { drawNameEntry, drawWinnerMessage, drawNameCursor, updateTopScoresInfo, drawPreGameOverlay } from "./canvasDrawingFunctions.js";
import { setupPilotsImageSources, setupPilotsImages } from "./drawingUtils.js";
import { forces } from "./entities.js";
import { drawScene } from "./gameDrawing.js";
import { tryNextId, attemptConnections, connectToPeers, updateConnections, isPlayerMasterPeer } from "./connectionHandlers.js";
import { sendPlayerStates } from "./handleData.js";
import { setupCanvas, setupSpikeyBallPoints } from "./drawingUtils.js";
import { addScore } from "./db.js";
import {
  checkWinner,
  generatePowerups,
  generateMines,
  checkPowerupCollision,
  endGameMessage,
  setGameWon,
  resetPowerLevels,
  pilot1,
  pilot2,
  updateEnemies,
  updatePowerups,
  detectCollisions,
  masterPeerUpdateGame,
  shuffleArray,
  setEndGameMessage,
} from "./gameLogic.js";
import {
  handleInputEvents,
  mousePos,
  addPilotEventListners,
  removePilotsEventListeners,
  setupNameEventListeners,
  removeNameEventListeners,
  setupGameEventListeners,
  removeGameStateEventListeners,
  setupWinStateEventListeners,
  removeWinStateEventListeners,
} from "./inputHandlers.js";
import { Player } from "./player.js";

export const { canvas, ctx } = setupCanvas();
export const worldDimensions = { width: 3600, height: 2400 };
export const colors = [
  "red",
  "blue",
  "SpringGreen",
  "green",
  "lime",
  "cyan",
  "indigo",
  "purple",
  "orange",
  "pink",
  "MediumVioletRed",
  "violet",
  "maroon",
  "crimson",
  "white",
];

export const acceleration = 0.25;

let lastTime = Date.now();
export let executionTime = 6;

export const GameState = {
  PILOT_SELECT: "pilotSelect",
  INTRO: "intro",
  FINISHED: "finished",
  GAME: "game",
  UNSET: "",
};

export const PilotName = {
  PILOT_1: "pilot1",
  PILOT_2: "pilot2",
};

let gameState = GameState.UNSET;
let accumulator = 0;
let fixedDeltaTime = 1 / 60; // 60 updates per second
let playerToSpectate = null;
//if below is true if there are any connected humans they will first be used to spectate if possible
let prioritizeHumanSpectate = false;

export const player = new Player(null, null, null, 0, null, 0, "", "", false, true);
// player.isPlaying = false;
// player.isUserControlledCharacter = true;
export let otherPlayers = [];
export let bots = [];
export let mines = [];
export let globalPowerUps = [];

export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;

export function setCam(newCamX, newCamY) {
  if (newCamX != null) {
    camX = newCamX;
  }
  if (newCamX != null) {
    camY = newCamY;
  }
}

const camSpeedX = 0.065;
const camSpeedY = 0.11;

export function getCanvas() {
  return canvas;
}

export function setBots(newBots) {
  bots = newBots;
}

function updateCamera(playerToFollow, deltaTime) {
  const targetCamX = playerToFollow.x - canvas.width / 2;
  let targetCamY = playerToFollow.y - (canvas.height * 2) / 4;

  // Calculate the interpolation factor based on deltaTime and camSpeed
  const interpolationFactorX = Math.min(deltaTime * camSpeedX, 1);
  const interpolationFactorY = Math.min(deltaTime * camSpeedY, 1);

  // Smoothly interpolate the camera's position
  camX = camX + (targetCamX - camX) * interpolationFactorX;
  camY = camY + (targetCamY - camY) * interpolationFactorY;

  // Make sure the camera stays within the bounds of the world
  camX = Math.max(Math.min(camX, worldDimensions.width - canvas.width), 0);
  camY = Math.max(Math.min(camY, worldDimensions.height - canvas.height), 0);
}

function updateGame(deltaTime, playerActive) {
  //scale deltaTime
  deltaTime *= 100;
  if (playerActive) {
    updateCamera(player, deltaTime);
    player.updateTick(deltaTime);
  }
  // if (player.invincibleTimer > 0) {
  //   player.invincibleTimer -= 1;
  // }

  if (playerActive || isPlayerMasterPeer(player)) {
    // Detect collisions with powerups or other ships
    detectCollisions(player, globalPowerUps, bots, otherPlayers,forces);

    //todo might have to uncomment the condition
    // if (isPlayerMasterPeer(player)) {
    // This peer is the master, so it runs the game logic for shared objects
    masterPeerUpdateGame(player, globalPowerUps, otherPlayers, bots, deltaTime);
    // }
  }

  if (playerActive) {
    drawScene(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  } else {
    camFollowPlayer(deltaTime);
    drawScene(null, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  }
  // if (isPlayerMasterPeer(player)) {
  //   masterPeerUpdateGame(globalPowerUps,otherPlayers,bots,deltaTime);
  // }
  updateConnections(player, otherPlayers, globalPowerUps);

  if (checkWinner(player, otherPlayers) || player.isDead) {
    setGameState(GameState.FINISHED);
    player.resetState(true, true);
  }
}

function camFollowPlayer(deltaTime) {
  if (playerToSpectate != null) {
    updateCamera(playerToSpectate, deltaTime);
  } else {
    let allPlayers = null;
    if (prioritizeHumanSpectate) {
      allPlayers = [...bots, player];
      shuffleArray(allPlayers);
      //let shuffledOtherPlayers = shuffleArray([...otherPlayers]);
      allPlayers = [...otherPlayers, ...bots, player];
    } else {
      allPlayers = [...bots, ...otherPlayers, player];
      shuffleArray(allPlayers);
    }

    for (let candidate of allPlayers) {
      if (candidate != null && candidate.id != player.id) {
        playerToSpectate = candidate;
        updateCamera(playerToSpectate, deltaTime);
        break; // Exit the loop once a valid playerToSpectate is found
      }
    }
  }
}

function setupPilots(canvas, ctx) {
  setupPilotsImageSources();
  addPilotEventListners(canvas, ctx);
  pilot1.selected = true;
}

function updatePilot() {
  drawPreGameOverlay(canvas, ctx);
}

function updateName() {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  drawNameEntry(canvas, ctx, player.name, canvas.width / 2 - 100, 80);
}

function updateWinState() {
  //drawScene(player, otherPlayers, bots, mines,ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  drawWinnerMessage(ctx, canvas, endGameMessage);
}

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
}
export function setMines(newMines) {
  mines = newMines;
}

export function getGlobalPowerUps() {
  return globalPowerUps;
}
export function getGameState() {
  return gameState;
}

export function setGameState(newState) {
  if (gameState === newState) {
    return;
  }
  let prevGameState = gameState;
  gameState = newState;
  if (newState === GameState.PILOT_SELECT && prevGameState !== GameState.PILOT_SELECT) {
    setupPilots(canvas, ctx);
  }

  if (newState !== GameState.PILOT_SELECT && prevGameState === GameState.PILOT_SELECT) {
    removePilotsEventListeners(canvas);
  }

  if (newState === GameState.INTRO && prevGameState !== GameState.INTRO) {
    updateTopScoresInfo();
    setupPilots(canvas, ctx);
    setupNameEventListeners(window);
    updateName();
  }

  if (newState !== GameState.INTRO && prevGameState === GameState.INTRO) {
    removeNameEventListeners(window);
  }

  if (newState === GameState.FINISHED && prevGameState !== GameState.FINISHED) {
    var date = new Date();
    var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    var score = Math.floor(Math.random() * 100) + 1;
    addScore("daily-" + dateString, player.name, player.powerUps * 100);

    setupWinStateEventListeners(window, canvas);
    if (isPlayerMasterPeer(player)) {
      sendPlayerStates(player, globalPowerUps);
    }
  }

  if (newState !== GameState.FINISHED && prevGameState === GameState.FINISHED) {
    resetPowerLevels(player, otherPlayers, globalPowerUps);
    setGameWon(false);
    // pilot2.selected = false;
    // pilot1.selected = true;
    removeWinStateEventListeners(window, canvas);
  }

  if (newState === GameState.GAME && prevGameState !== GameState.GAME) {
    // fixedDeltaTime = 1 / 60;
    // setupGameEventListeners(window);

    //todo add back in if not to blame
    player.isPlaying = true;
    setTimeout(() => connectToPeers(player, otherPlayers, globalPowerUps), 1000);
    removePilotsEventListeners(canvas);
  }

  if (newState !== GameState.GAME && prevGameState === GameState.GAME) {
    //for now moving to showing game underneath all the time
    //  fixedDeltaTime = 1 / 30; //30 fps is plenty if not in game
    //  removeGameStateEventListeners(window);
    player.resetState(true, true);

    //todo add back in if not to blame
    player.isPlaying = false;
    player.centerCameraOnPlayer(canvas.width, canvas.height);
    globalPowerUps = [];
  }
}

function update() {
  const startTime = Date.now();
  let now = Date.now();
  let deltaTime = (now - lastTime) / 1000; // Time since last frame in seconds
  lastTime = now;

  accumulator += deltaTime;

  while (accumulator >= fixedDeltaTime) {
    if (gameState != GameState.GAME) {
      //since we show the ongoing game at all times alway do this
      updateGame(fixedDeltaTime, false);
    }
    if (gameState === GameState.INTRO) {
      updateName();
      drawNameCursor(canvas, ctx, player.name);
      updatePilot();
    } else if (gameState === GameState.PILOT_SELECT) {
      updatePilot();
    } else if (gameState === GameState.GAME) {
      updateGame(fixedDeltaTime, true);
    } else if (gameState === GameState.FINISHED) {
      updateWinState();
    }
    accumulator -= fixedDeltaTime;
  }

  const endTime = Date.now();
  executionTime = endTime - startTime;

  requestAnimationFrame(update);
}

window.addEventListener("load", function () {
  /* START CONNECTION HANDLERS  */
  tryNextId(player);

  setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 500);
  //do we need to keep doing this??
  // setInterval(() => connectToPeers(player, otherPlayers, globalPowerUps), 6000);
  setTimeout(() => connectToPeers(player, otherPlayers, globalPowerUps), 6000);

  setTimeout(() => generatePowerups(globalPowerUps, worldDimensions.width, worldDimensions.height, colors), 300);
  setTimeout(() => generateMines(worldDimensions.width, worldDimensions.height, colors), 310);

  setInterval(() => generatePowerups(globalPowerUps, worldDimensions.width, worldDimensions.height, colors), 3000);
  setInterval(() => generateMines(worldDimensions.width, worldDimensions.height, colors), 3100);

  setInterval(() => connectToPeers(player, otherPlayers, globalPowerUps), 35000);

  setupSpikeyBallPoints();
  //don;t need to under master system
  //setInterval(() => sendPowerups(globalPowerUps), 3000);

  /* END CONNECTION HANDLERS  */
  //for now just do this at game start and transition, in future do this periodically
  updateTopScoresInfo();
  handleInputEvents(canvas, player);
  // Call setupPilotsImages once at the start of the game
  setupPilotsImages(canvas);

  update();
  setupGameEventListeners(window);
  setGameState(GameState.INTRO);
});

window.addEventListener("resize", function (event) {
  setupCanvas();
});
