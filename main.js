import {
  drawInputField,
  drawNameEntry,
  drawGameOverMessage,
  drawTextCursorFromText,
  updateTopScoresInfo,
  drawPreGameOverlay,
  drawDailyScores,
  drawAchievements,
} from "./canvasDrawingFunctions.js";
import {
  createPeer,
  isPlayerMasterPeer,
  removeClosedConnections,
  setTicksSinceLastConnectionAttempt,
  ticksSinceLastConnectionAttempt,
  setTicksSinceLastFullSendRequestResponse,
  ticksSinceLastFullSendRequestResponse,
  setTimeSinceAnyMessageRecieved,
  timeSinceAnyMessageRecieved,
  timeSinceMessageFromMaster,
  setTimeSinceMessageFromMaster,
  setMasterPeerId,
  chooseNewMasterPeer,
} from "./connectionHandlers.js";
import { addScoreToDB, getFirebase, incrementFirebaseGivenPropertyValue } from "./db.js";
import { setupPilotsImageSources, setupPilotsImages, setupCanvas, setupSpikeyBallPoints } from "./drawingUtils.js";
import { drawScene } from "./gameDrawing.js";
import { endGameMessage, setGameWon, pilots, masterUpdateGame } from "./gameLogic.js";
import { shuffleArray } from "./gameUtils.js";
import {
  handleInputEvents,
  addPilotEventListners,
  removePilotsEventListeners,
  setupNameEventListeners,
  removeNameEventListeners,
  setupGameEventListeners,
  setupWinStateEventListeners,
  removeWinStateEventListeners,
  addLoginHandler,
  removeLoginHandler,
} from "./inputHandlers.js";
import { drawLoginForm, autoSignInWithGoogle } from "./login.js";
import { sendPlayerStates } from "./sendData.js";
import { Player } from "./player.js";

export let gameTimer = 0;
export function setGameTimer(newTime) {
  gameTimer = newTime;
}
export const { canvas, ctx } = setupCanvas();
export const worldDimensions = { width: 7200, height: 5400 };
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
];

export const powerUpColors = [
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
];
export const selectedColors = [];

export const acceleration = 0.25;

// let lastTime = Date.now();
let lastTime = performance.now();
export let executionTime = 0;
export const GameState = {
  PILOT_SELECT: "pilotSelect",
  INTRO: "intro",
  FINISHED: "finished",
  GAME: "game",
  UNSET: "",
};

let gameState = GameState.UNSET;
let accumulator = 0;
export let fixedDeltaTime = 1 / 60; // 60 updates per second
let playerToSpectate = null;
//if below is true if there are any connected humans they will first be used to spectate if possible
let prioritizeHumanSpectate = false;

export const player = new Player(null, null, null, 0, null, 0, "", "", false, true);
player.isMaster = true;
player.isLocal = true;
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
  if (newBots !== bots) {
    bots.length = 0;
    bots.push(...newBots);
  }
}

function setOtherPlayers(newPlayers) {
  if (newPlayers !== otherPlayers) {
    //update original array
    otherPlayers.length = 0;
    otherPlayers.push(...newPlayers);

    // Remove player from otherPlayers array
    otherPlayers = otherPlayers.filter((otherPlayer) => otherPlayer.id !== player.id);
  }
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

  //todo work out what to do here, do we do this for every local or not?
  if (true || playerActive || isPlayerMasterPeer(player)) {
    //dealing with error state, not sure best approach yet
    if (player.name == "" && player.pilot == "") {
      setGameState(GameState.INTRO);
      // return;
    }
    //todo might have to uncomment the condition
    // if (isPlayerMasterPeer(player)) {
    // This peer is the master, so it runs the game logic for shared objects
    masterUpdateGame(player, globalPowerUps, otherPlayers, bots, mines, deltaTime);
    // }
  }

  if (playerActive) {
    updateCamera(player, deltaTime);
    drawScene(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  } else {
    camFollowPlayer(deltaTime);
    drawScene(null, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  }
  removeClosedConnections(otherPlayers);
  if (player.isDead) {
    setGameState(GameState.FINISHED);
    player.resetState(true, true);
    //set player.isPlayer = false here?
  }

  setTicksSinceLastFullSendRequestResponse(ticksSinceLastFullSendRequestResponse + 1);
  setTicksSinceLastConnectionAttempt(ticksSinceLastConnectionAttempt + 1);
  setTimeSinceAnyMessageRecieved(timeSinceAnyMessageRecieved + 1);
  if (timeSinceAnyMessageRecieved > 100 && ticksSinceLastConnectionAttempt > 3000) {
    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
    //todo do we need to attemptConnections here?
  }
  if (timeSinceMessageFromMaster > 60 * 15 && !isPlayerMasterPeer(player)) {
    setTimeSinceMessageFromMaster(0);
    //try removing the current master
    //issue could be that peer doesn't think it is the master because it is connected to others.. need to sync connected lists I think.
    // Remove player from otherPlayers array, connections array and connectedPeers (array of id's of the connected peers)
    // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
    // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
    // connectedPeers.splice(0, 1);
    // setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
    // //what about "connections" how is connections and connectedPeers synced?
    setMasterPeerId(chooseNewMasterPeer(player, otherPlayers));

    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  }
}

function camFollowPlayer(deltaTime) {
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
  let inPlayersList = allPlayers.includes(playerToSpectate);
  if (!inPlayersList && playerToSpectate != null) {
    for (let candidate of allPlayers) {
      if (candidate != null && candidate.id === playerToSpectate.id && candidate.name === playerToSpectate.name) {
        playerToSpectate = candidate;
        inPlayersList = true;
        break; // Exit the loop once a matching player is found
      }
    }
  }
  let recentlyActive = false;
  if (playerToSpectate != null) {
    recentlyActive = playerToSpectate.howLongSinceActive() < 1000;
  }
  if (
    playerToSpectate != null &&
    inPlayersList &&
    (recentlyActive || playerToSpectate.isBot) &&
    !playerToSpectate.isDead &&
    playerToSpectate.isPlaying
  ) {
    updateCamera(playerToSpectate, deltaTime);
  } else {
    for (let candidate of allPlayers) {
      if (candidate != null && candidate.id != player.id && (candidate.howLongSinceActive() < 1000 || candidate.isBot)) {
        if (!candidate.isDead && candidate.isPlaying) {
          playerToSpectate = candidate;
          updateCamera(playerToSpectate, deltaTime);
          break; // Exit the loop once a valid playerToSpectate is found
        }
      }
    }
  }
}

function setupPilots(canvas, ctx) {
  setupPilotsImageSources();
  addPilotEventListners(canvas, ctx);
  //todo will need to update this if multiple pilots
  let anySelected = false;
  for (let pilot of pilots) {
    if (pilot.selected) {
      anySelected = true;
    }
  }
  if (!anySelected) {
    pilots[0].setSelected(true);
  }
}

function updatePilot() {
  for (let pilot of pilots) {
    if (pilot.selected) {
      pilot.pilotAnimationFrame++;
    }
  }
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
  drawGameOverMessage(ctx, canvas, endGameMessage);
  drawDailyScores(ctx);
  drawAchievements(ctx);
}

export function setGlobalPowerUps(newPowerUps) {
  if (newPowerUps !== globalPowerUps) {
    //update original array while keeping the reference
    globalPowerUps.length = 0;
    globalPowerUps.push(...newPowerUps);
  }
}

export function setMines(newMines) {
  if (newMines !== mines) {
    //update original array while keeping the reference
    mines.length = 0;
    mines.push(...newMines);
  }
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
    player.isPlaying = false;
    player.isDead = false;
    updateTopScoresInfo();
    setupPilots(canvas, ctx);
    setupNameEventListeners(window);
    updateName();
    addLoginHandler(ctx);
  }

  if (newState !== GameState.INTRO && prevGameState === GameState.INTRO) {
    removeNameEventListeners(window);
    removeLoginHandler(ctx);
  }

  if (newState === GameState.FINISHED && prevGameState !== GameState.FINISHED) {
    var date = new Date();
    var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    var score = Math.floor(Math.random() * 100) + 1;
    addScoreToDB("daily-" + dateString, player.name, player.powerUps * 100);

    setupWinStateEventListeners(window, canvas);
    removeLoginHandler(ctx);
    if (isPlayerMasterPeer(player)) {
      //do we need this special send?
      sendPlayerStates(player, true, true, true);
    }
  }

  if (newState !== GameState.FINISHED && prevGameState === GameState.FINISHED) {
    //do we need resetPowerLevels anymore?
    // resetPowerLevels(player, otherPlayers, globalPowerUps);
    setGameWon(false);
    removeWinStateEventListeners(window, canvas);
  }

  if (newState === GameState.GAME && prevGameState !== GameState.GAME) {
    // fixedDeltaTime = 1 / 60;
    // setupGameEventListeners(window);

    //todo add back in if not to blame
    player.resetState(true, true);
    player.isPlaying = true;
    player.setIsDead(false);
    sendPlayerStates(player, isPlayerMasterPeer(player), true, true);

    // setTimeout(() => connectToPeers(player, otherPlayers, globalPowerUps), 1000);
    removePilotsEventListeners(canvas);
    removeLoginHandler(ctx);
  }

  if (newState !== GameState.GAME && prevGameState === GameState.GAME) {
    //for now moving to showing game underneath all the time
    player.resetState(true, true);

    player.isPlaying = false;
    player.x = -600;
    player.y = -600;
    player.centerCameraOnPlayer(canvas.width, canvas.height);

    //todo addback in if there was a good reason for this
    // globalPowerUps = [];
  }
}

function update() {
  // const startTime = Date.now();
  // let now = Date.now();
  const startTime = performance.now();
  let now = performance.now();
  let deltaTime = (now - lastTime) / 1000; // Time since last frame in seconds
  // let deltaTime = (now - lastTime); // Time since last frame in seconds
  lastTime = now;

  accumulator += deltaTime;

  while (accumulator >= fixedDeltaTime) {
    if (gameState != GameState.GAME) {
      //since we show the ongoing game at all times alway do this
      updateGame(fixedDeltaTime, false);
    }
    if (gameState === GameState.INTRO) {
      updateName();
      drawTextCursorFromText(ctx, player.name);
      updatePilot();
      drawLoginForm(ctx);
    } else if (gameState === GameState.PILOT_SELECT) {
      updatePilot();
    } else if (gameState === GameState.GAME) {
      updateGame(fixedDeltaTime, true);
    } else if (gameState === GameState.FINISHED) {
      updateWinState();
    }
    accumulator -= fixedDeltaTime;
  }

  // const endTime = Date.now();
  const endTime = performance.now();
  executionTime = endTime - startTime;

  requestAnimationFrame(update);
}

window.addEventListener("load", function () {
  /* START CONNECTION HANDLERS  */
  createPeer(player, otherPlayers, globalPowerUps);

  setupSpikeyBallPoints();

  //for now just do this at game start and transition, in future do this periodically?
  updateTopScoresInfo();
  handleInputEvents(canvas, player);
  // Call setupPilotsImages once at the start of the game
  setupPilotsImages(canvas);

  update();
  setupGameEventListeners(window);
  setGameState(GameState.INTRO);

  setTimeout(() => autoSignInWithGoogle(getFirebase()), 500);
});

window.addEventListener("resize", function (event) {
  setupCanvas();
});
