import { setupCanvas, drawScene, drawPilots, setupPilotsImages, drawNameEntry, drawWinnerMessage, drawNameCursor } from "./canvasDrawingFunctions.js";
import { checkWinner, generatePowerups, checkPowerupCollision, endGameMessage, setGameWon, resetPowerLevels, pilot1, pilot2 } from "./gameLogic.js";
import { peerIds, connections, tryNextId, sendPowerups, attemptConnections, connectToPeers, updateConnections } from "./connectionHandlers.js";
import {
  keys,
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

const { canvas, ctx } = setupCanvas();
const worldDimensions = { width: 3600, height: 2400 };
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "violet", "maroon", "crimson", "white"];
const shipPoints = [
  { x: 0, y: -20 },
  { x: -10, y: 20 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];
const acceleration = 0.25;
let vel = { x: 0, y: 0 };
export let distanceFactor;
let otherPlayers = [];
let globalPowerUps = [];
let currentSpeed = 0;
let lastTime = Date.now();

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

//switch this to intro once built that section
let gameState = GameState.UNSET;
// let pilotSelected = "";
let accumulator = 0;
let fixedDeltaTime = 1 / 60; // 60 updates per second

export class Player {
  constructor(id = null, x = null, y = null, powerUps = 0, color = null, angle = 0, pilot = "", name = "", worldDimensions, colors) {
    this.id = id;
    this.x = x !== null ? x : 600 + Math.random() * (worldDimensions.width - 1200);
    this.y = y !== null ? y : 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = powerUps;
    this.color = color !== null ? color : colors[Math.floor(Math.random() * colors.length)];
    this.angle = angle;
    this.pilot = pilot;
    this.name = name;
    this.worldDimensions = worldDimensions;
    this.colors = colors;
  }

  resetState(keepName) {
    this.id = null;
    this.x = 100 + Math.random() * (this.worldDimensions.width - 200);
    this.y = 100 + Math.random() * (this.worldDimensions.height - 200);
    this.powerUps = 0;
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.angle = 0;
    this.pilot = "";
    if (!keepName) {
      this.name = "";
    }
  }
  setPilot(newPilot) {
    this.pilot = newPilot;
  }

  getPlayerName() {
    return this.name;
  }

  setPlayerName(newName) {
    this.name = newName;
  }
}

export const player = new Player(null, null, null, 0, null, 0, "", "", worldDimensions, colors);

export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;
//const radius = 50;
//const maxDistance = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
const bounceFactor = 1.5;
const offset = 1;
const camSpeedX = 0.045;
const camSpeedY = 0.08;
const minBounceSpeed = 5;
//const frameRate = 1000 / 60; // Frame rate in ms

export function getCanvas() {
  return canvas;
}

function updateCamera() {
  const targetCamX = player.x - canvas.width / 2;
  let targetCamY;
  if (player.ySpeed < 0) {
    // Moving up
    targetCamY = player.y - (canvas.height * 2) / 4;
  } else {
    // Moving down or not moving vertically
    targetCamY = player.y - (canvas.height * 2) / 4;
  }
  let newCamX = camX + (targetCamX - camX) * camSpeedX;
  let newCamY = camY + (targetCamY - camY) * camSpeedY;

  // Define the size of the buffer zone
  let bufferZoneX = 200;
  let bufferZoneY = 100;

  // Calculate the distance to the edge of the world
  let distanceToEdgeX = worldDimensions.width - player.x;
  let distanceToEdgeY = worldDimensions.height - player.y;

  // If the ship is within the buffer zone, slow down the camera
  if (distanceToEdgeX < bufferZoneX) {
    let slowdownFactor = distanceToEdgeX / bufferZoneX;
    newCamX = camX + (targetCamX - camX) * camSpeedX * slowdownFactor;
  }
  if (distanceToEdgeY < bufferZoneY) {
    let slowdownFactor = (distanceToEdgeY / bufferZoneY) * (bufferZoneX / bufferZoneY); // Adjusted this line
    newCamY = camY + (targetCamY - camY) * camSpeedY * slowdownFactor;
  }

  camX = Math.max(Math.min(newCamX, worldDimensions.width - canvas.width), 0);
  camY = Math.max(Math.min(newCamY, worldDimensions.height - canvas.height), 0);
}

function centerCameraOnPlayer() {
  const targetCamX = player.x - canvas.width / 2;
  let targetCamY;
  if (player.ySpeed < 0) {
    // Moving up
    targetCamY = player.y - (canvas.height * 2) / 4;
  } else {
    // Moving down or not moving vertically
    targetCamY = player.y - (canvas.height * 2) / 4;
  }
  let newCamX = targetCamX;
  let newCamY = targetCamY;

  camX = Math.max(Math.min(newCamX, worldDimensions.width - canvas.width), 0);
  camY = Math.max(Math.min(newCamY, worldDimensions.height - canvas.height), 0);
}

function updatePlayerAngle() {
  let dx = player.x - mousePos.x;
  let dy = player.y - mousePos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  player.angle = Math.atan2(dy, dx) + Math.PI / 2;
  return { dx, dy, distance };
}

function updatePlayerVelocity({ dx, dy, distance }, deltaTime) {
  let squareFactor = currentSpeed * currentSpeed;
  let newFriction = Math.pow(Math.max(0.99 - squareFactor * 0.0001, 0.95), deltaTime);

  let pilotBoostFactor = 1;
  if (player.pilot == PilotName.PILOT_1) {
    pilotBoostFactor = 1.1;
  } else if (player.pilot == PilotName.PILOT_2) {
    pilotBoostFactor = 0.2;
  }
  vel.x *= newFriction;
  vel.y *= newFriction;

  if (keys.space) {
    let mouseToCenter = { x: dx / distance, y: dy / distance };
    let maxForceDistance = 250;
    let minForceDistance = 100;

    distanceFactor = 1;
    if (distance < minForceDistance) {
      distanceFactor = 0.1; // minimum force
    } else if (distance < maxForceDistance) {
      let normalizedDistance = (distance - minForceDistance) / (maxForceDistance - minForceDistance);
      distanceFactor = 0.1 + normalizedDistance * 0.9; // gradually increase force
    }
    vel.x += acceleration * distanceFactor * mouseToCenter.x * pilotBoostFactor * deltaTime;
    vel.y += acceleration * distanceFactor * mouseToCenter.y * pilotBoostFactor * deltaTime;
  }
  currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
}

function bouncePlayer() {
  if (player.x < 0 || player.x > worldDimensions.width) {
    vel.x = -vel.x * bounceFactor;
    player.x = player.x < 0 ? offset : worldDimensions.width - offset;
    vel.x = (vel.x < 0 ? -1 : 1) * Math.max(Math.abs(vel.x), minBounceSpeed);
  }

  if (player.y < 0 || player.y > worldDimensions.height) {
    vel.y = -vel.y * bounceFactor;
    player.y = player.y < 0 ? offset : worldDimensions.height - offset;
    vel.y = (vel.y < 0 ? -1 : 1) * Math.max(Math.abs(vel.y), minBounceSpeed);
  }
}

function updatePlayerPosition(deltaTime) {
  player.x += vel.x * deltaTime;
  player.y += vel.y * deltaTime;
}

function updateGame(deltaTime, playerActive) {
  //scale deltaTime
  deltaTime *= 100;
  if (playerActive) {
    updateCamera();
    const playerAngleData = updatePlayerAngle();
    updatePlayerVelocity(playerAngleData, deltaTime);
    bouncePlayer();
    updatePlayerPosition(deltaTime);
    checkPowerupCollision(player, globalPowerUps, connections);
  }
  if (playerActive) {
    drawScene(player, otherPlayers, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  } else {
    drawScene(null, otherPlayers, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  }
  updateConnections(player, otherPlayers, connections);

  if (checkWinner(player, otherPlayers, connections, ctx, canvas)) {
    setGameState(GameState.FINISHED);
  }
}

function setupPilots(canvas, ctx) {
  pilot1.image.src = "images/pilot1.gif";
  pilot2.image.src = "images/pilot2.gif";
  addPilotEventListners(canvas, ctx);
  pilot1.selected = true;
}

function updatePilot() {
  drawPilots(canvas, ctx);
}

function updateName() {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  drawNameEntry(canvas, ctx, player.name,canvas.width / 2 - 100,80);
}

function updateWinState() {
  //drawScene(player, otherPlayers, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  drawWinnerMessage(ctx, canvas, endGameMessage);
}

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
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
    setupPilots(canvas, ctx);
    setupNameEventListeners(window);
    updateName();
  }

  if (newState !== GameState.INTRO && prevGameState === GameState.INTRO) {
    removeNameEventListeners(window);
  }

  if (newState === GameState.FINISHED && prevGameState !== GameState.FINISHED) {
    setupWinStateEventListeners(window);
  }

  if (newState !== GameState.FINISHED && prevGameState === GameState.FINISHED) {
    resetPowerLevels(player, otherPlayers, connections);
    setGameWon(false);
    removeWinStateEventListeners(window);
  }

  if (newState === GameState.GAME && prevGameState !== GameState.GAME) {
    // fixedDeltaTime = 1 / 60;
    // setupGameEventListeners(window);
    setTimeout(() => connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps), 1000);
    removePilotsEventListeners(canvas);
  }

  if (newState !== GameState.GAME && prevGameState === GameState.GAME) {
    //for now moving to showing game underneath all the time
    //  fixedDeltaTime = 1 / 30; //30 fps is plenty if not in game
    //  removeGameStateEventListeners(window);
    player.resetState(true);
    centerCameraOnPlayer();
    globalPowerUps = [];
  }
}

function update() {
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

  requestAnimationFrame(update);
}

window.addEventListener("load", function () {
  /* START CONNECTION HANDLERS  */
  tryNextId(player, peerIds);

  setTimeout(() => attemptConnections(player, otherPlayers, peerIds, connections, globalPowerUps), 500);
  //do we need to keep doing this??
  // setInterval(() => connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps), 6000);
  setTimeout(() => connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps), 6000);

  setInterval(() => generatePowerups(globalPowerUps, connections, worldDimensions.width, worldDimensions.height, colors), 3000);
  setInterval(() => sendPowerups(globalPowerUps, connections), 3000);

  /* END CONNECTION HANDLERS  */

  handleInputEvents(canvas, player, keys);
  // Call setupPilotsImages once at the start of the game
  setupPilotsImages(canvas);

  update();
  setupGameEventListeners(window);
  setGameState(GameState.INTRO);
});
