import {
  setupCanvas,
  drawScene,
  drawPilots,
  setupPilotsImages,
  drawNameEntry,
  drawWinnerMessage,
  drawNameCursor,
  updateTopScoresInfo,
} from "./canvasDrawingFunctions.js";
import { peerIds, tryNextId, attemptConnections, connectToPeers, sendPlayerStates, updateConnections } from "./connectionHandlers.js";
import {
  checkWinner,
  generatePowerups,
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

const { canvas, ctx } = setupCanvas();
const worldDimensions = { width: 3600, height: 2400 };

const colors = ["red", "blue", "SpringGreen", "green","lime", "cyan",  "indigo", "purple", "orange", "pink", "MediumVioletRed", "violet", "maroon", "crimson", "white"];
const shipPoints = [
  { x: 0, y: -20 },
  { x: -10, y: 20 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];
const acceleration = 0.25;

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

export const BotState = {
  FOLLOW_PLAYER: "followPlayer",
  RANDOM: "random",
};

//switch this to intro once built that section
let gameState = GameState.UNSET;
// let pilotSelected = "";
let accumulator = 0;
let fixedDeltaTime = 1 / 60; // 60 updates per second

export class Player {
  constructor(id = null, x = null, y = null, powerUps = 0, color = null, angle = 0, pilot = "", name = "") {
    this.id = id;
    this.x = x !== null ? x : 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = y !== null ? y : 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = powerUps;
    this.color = color !== null ? color : colors[Math.floor(Math.random() * colors.length)];
    this.angle = angle;
    this.pilot = pilot;
    this.name = name;
    this.lives = 1;
    this.isMaster = true;
    this.isBot = false;
    this.playerAngleData = {};
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.distanceFactor = 0;
    this.space = false;
    this.ticksSincePowerUpCollection = -1;
    this.previousAngleDifference = 0;
    this.previousTurnDirection = 0;
    this.botState = BotState.FOLLOW_PLAYER;
    this.followingPlayer = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.randomTarget = { x: 0, y: 0 };
    this.targetedBy = [];
  }

  resetState(keepName) {
    //don't think we ever want to abandon id
    //this.id = null;
    this.x = 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = 0;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.angle = 0;
    this.pilot = "";
    if (!keepName) {
      this.name = "";
    }
    this.followingPlayer = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.randomTarget = { x: 0, y: 0 };
    this.targetedBy = [];
    this.space = false;
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

  getPlayerIsMaster() {
    return this.isMaster;
  }

  setPlayerIsMaster(isMaster) {
    this.isMaster = isMaster;
  }

  bouncePlayer() {
    if (this.x < 0 || this.x > worldDimensions.width) {
      this.vel.x = -this.vel.x * bounceFactor;
      this.x = this.x < 0 ? offset : worldDimensions.width - offset;
      this.vel.x = (this.vel.x < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.x), minBounceSpeed);
    }

    if (this.y < 0 || this.y > worldDimensions.height) {
      this.vel.y = -this.vel.y * bounceFactor;
      this.y = this.y < 0 ? offset : worldDimensions.height - offset;
      this.vel.y = (this.vel.y < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.y), minBounceSpeed);
    }
  }

  updatePlayerAngle() {
    let dx = this.x - this.mousePosX;
    let dy = this.y - this.mousePosY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (isNaN(dx) || isNaN(dy) || isNaN(distance)) {
      console.log("player angle NaN data");
    } else {
      this.playerAngleData = { dx, dy, distance };
    }
  }

  updatePlayerVelocity(deltaTime) {
    let dx = this.playerAngleData.dx;
    let dy = this.playerAngleData.dy;
    let distance = this.playerAngleData.distance;
    let squareFactor = this.currentSpeed * this.currentSpeed;
    let newFriction = Math.pow(Math.max(0.99 - squareFactor * 0.0001, 0.95), deltaTime);

    let pilotBoostFactor = 1;
    if (this.pilot == PilotName.PILOT_1) {
      pilotBoostFactor = 1.1;
    } else if (this.pilot == PilotName.PILOT_2) {
      pilotBoostFactor = 0.2;
    }
    this.vel.x *= newFriction;
    this.vel.y *= newFriction;

    if (this.space) {
      let mouseToCenter = { x: dx / distance, y: dy / distance };
      if (distance == 0 || isNaN(distance)) {
        mouseToCenter = { x: 0, y: 0 };
      }
      let maxForceDistance = 250;
      let minForceDistance = 100;

      this.distanceFactor = 1;
      if (distance < minForceDistance) {
        this.distanceFactor = 0.1; // minimum force
      } else if (distance < maxForceDistance) {
        let normalizedDistance = (distance - minForceDistance) / (maxForceDistance - minForceDistance);
        this.distanceFactor = 0.1 + normalizedDistance * 0.9; // gradually increase force
      }
      this.vel.x += acceleration * this.distanceFactor * mouseToCenter.x * pilotBoostFactor * deltaTime;
      this.vel.y += acceleration * this.distanceFactor * mouseToCenter.y * pilotBoostFactor * deltaTime;
      if (this.vel.x == null || isNaN(this.vel.x) || this.vel.y == null || isNaN(this.vel.y)) {
        console.log("Invalid velocity values: x =", this.vel.x, "y =", this.vel.y);
      }
    }
    this.currentSpeed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
  }

  updatePlayerPosition(deltaTime) {
    if (this.vel.x !== null && !isNaN(this.vel.x) && this.vel.y !== null && !isNaN(this.vel.y)) {
      this.x += this.vel.x * deltaTime;
      this.y += this.vel.y * deltaTime;
      if (this.vel.x != 0 && this.vel.y != 0) {
        this.timeOfLastActive = Date.now();
      }
    } else {
      console.log("Invalid velocity values: x =", this.vel.x, "y =", this.vel.y);
    }
  }
  centerCameraOnPlayer() {
    const targetCamX = this.x - canvas.width / 2;
    let targetCamY;
    if (this.ySpeed < 0) {
      // Moving up
      targetCamY = this.y - (canvas.height * 2) / 4;
    } else {
      // Moving down or not moving vertically
      targetCamY = this.y - (canvas.height * 2) / 4;
    }
    let newCamX = targetCamX;
    let newCamY = targetCamY;

    camX = Math.max(Math.min(newCamX, worldDimensions.width - canvas.width), 0);
    camY = Math.max(Math.min(newCamY, worldDimensions.height - canvas.height), 0);
  }
  updateTick(deltaTime) {
    this.updatePlayerAngle();
    this.updatePlayerVelocity(deltaTime);
    this.bouncePlayer();
    this.updatePlayerPosition(deltaTime);
    if (this.ticksSincePowerUpCollection > -1) {
      this.ticksSincePowerUpCollection++;
    }
    if (this.ticksSincePowerUpCollection > 5) {
      this.ticksSincePowerUpCollection = -1;
    }
  }
  updateBotInputs() {
    if (this.botState == BotState.FOLLOW_PLAYER) {
      if (this.followingPlayer == "") {
        let allPlayers = [...otherPlayers, player];
        shuffleArray(allPlayers);
        let playerToFollow = null;
        // Reset powerUps of other players
        allPlayers.forEach((candidate) => {
          //we are not targing any player currently so if we find we're in their array of followers remove ourselves
          candidate.targetedBy = candidate.targetedBy.filter((id) => id !== this.id);
          let candidateHowLongSinceActive = candidate.howLongSinceActive();
          if (candidateHowLongSinceActive < 300 && candidate.targetedBy.length < 2) {
            playerToFollow = candidate;
            // playerToFollow.targetedBy += 1;
            playerToFollow.targetedBy.push(this.id);
            this.followingPlayer = playerToFollow;
            //we'll skip updating inputs on this tick, picking a target is enough
            return;
          } else {
            console.log(candidate.name + " is inactive not targeting");
          }
        });
      }
      if (this.followingPlayer == "") {
        this.botState = BotState.RANDOM;
        return;
      }
      //for testing just aim towards the player(master player is running this code)
      let targetX = this.followingPlayer.x;
      let targetY = this.followingPlayer.y;
      this.aimAtTarget(targetX, targetY);
    } else if (this.botState == BotState.RANDOM) {
      if (this.randomTarget.x == 0 && this.randomTarget.y == 0) {
        this.randomTarget.x = 100 + Math.random() * (worldDimensions.width - 200);
        this.randomTarget.y = 100 + Math.random() * (worldDimensions.height - 200);
      }
      let targetX = this.randomTarget.x;
      let targetY = this.randomTarget.y;
      this.aimAtTarget(targetX, targetY);
    }
  }

  aimAtTarget(targetX, targetY) {
    let currentX = this.x;
    let currentY = this.y;

    // Calculate the distance between the target and current points
    let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

    if (distance < 100) {
      //once we get there move on to a new target

      if (this.followingPlayer && this.followingPlayer.targetedBy.length > 0) {
        // this.followingPlayer.targetedBy -= 1;
        this.followingPlayer.targetedBy = this.followingPlayer.targetedBy.filter((id) => id !== this.id);
      } else {
        console.log("followingPlayer null ");
      }
      this.followingPlayer = "";
      this.randomTarget.x = 0;
      this.randomTarget.y = 0;
      //randomly choose new state
      if (Math.random() > 0.7) {
        this.botState = BotState.FOLLOW_PLAYER;
      } else {
        this.botState = BotState.RANDOM;
      }
    }
    // If distance is closer than 300, adjust the target randomly
    // if (distance < 300) {
    //   // Define the range for adjustment, for example +/- 50 in both x and y directions
    //   let adjustmentRange = 50;

    //   // Calculate random adjustments within the range
    //   let randomAdjustmentX = Math.random() * adjustmentRange * 2 - adjustmentRange;
    //   let randomAdjustmentY = Math.random() * adjustmentRange * 2 - adjustmentRange;

    //   // Update the target point with the random adjustments
    //   targetX += randomAdjustmentX;
    //   targetY += randomAdjustmentY;
    // }
    //eventually this can just be a "target" state of multiple that the bot can switch between (probably should only target active players)
    //another state could be head towards a point until get close at which point a new random point is selected.
    let mousePos = this.mousePosToPositionAwayFromTarget(targetX, targetY, 200, this.mousePosX, this.mousePosY);
    if (!isNaN(mousePos.X) && !isNaN(mousePos.Y)) {
      this.mousePosX = mousePos.X;
      this.mousePosY = mousePos.Y;
    } else {
      console.log("mousePos NaN");
    }
    this.space = true;
  }

  mousePosToPositionAwayFromTarget(targetX, targetY, distanceFromCurrent, currentMousePosX, currentMousePosY) {
    let deltaX = targetX - this.x;
    let deltaY = targetY - this.y;

    // Calculate the distance between the target and current position
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    // Calculate the normalized direction vector
    let directionX = deltaX / distance;
    let directionY = deltaY / distance;

    // Calculate the new mouse position
    let mousePosX = this.x - directionX * distanceFromCurrent;
    let mousePosY = this.y - directionY * distanceFromCurrent;

    let currentAngle = Math.atan2(currentMousePosY - this.y, currentMousePosX - this.x);
    let desiredAngle = Math.atan2(mousePosY - this.y, mousePosX - this.x);

    // Calculate the angle difference
    let angleDifference = desiredAngle - currentAngle;

    // Wrap the angle difference between -π and π
    if (angleDifference > Math.PI) {
      angleDifference -= 2 * Math.PI;
    } else if (angleDifference < -Math.PI) {
      angleDifference += 2 * Math.PI;
    }

    // Interpolate between the current angle and the desired angle
    let interpolationFactor = 0.4; // Adjust this value to change the speed of the turn
    let interpolatedAngle = currentAngle + angleDifference * interpolationFactor;

    // Calculate the new mouse position based on the interpolated angle and the desired distance from the current position
    mousePosX = this.x + Math.cos(interpolatedAngle) * distanceFromCurrent;
    mousePosY = this.y + Math.sin(interpolatedAngle) * distanceFromCurrent;

    return { X: mousePosX, Y: mousePosY };
  }
  howLongSinceActive() {
    if (this.timeOfLastActive) {
      const currentTime = Date.now();
      const timeDifference = currentTime - this.timeOfLastActive;
      return timeDifference;
    } else {
      return 5000;
    }
  }
}

export const player = new Player(null, null, null, 0, null, 0, "", "");
export let otherPlayers = [];
export let bots = [];
let globalPowerUps = [];
export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;

const bounceFactor = 1.5;
const offset = 1;
const camSpeedX = 0.065;
const camSpeedY = 0.11;
const minBounceSpeed = 5;

export function getCanvas() {
  return canvas;
}

export function setBots(newBots) {
  bots = newBots;
}

// function legacyUpdateCamera(playerToFollow) {
//   const targetCamX = playerToFollow.x - canvas.width / 2;
//   let targetCamY;
//   //don't currently set ySpeed
//   // if (playerToFollow.ySpeed < 0) {
//   //   // Moving up
//   //   targetCamY = playerToFollow.y - (canvas.height * 2) / 4;
//   // } else {
//   // Moving down or not moving vertically
//   targetCamY = playerToFollow.y - (canvas.height * 2) / 4;
//   // }
//   let newCamX = camX + (targetCamX - camX) * camSpeedX;
//   let newCamY = camY + (targetCamY - camY) * camSpeedY;

//   // Define the size of the buffer zone
//   let bufferZoneX = 200;
//   let bufferZoneY = 100;

//   // Calculate the distance to the edge of the world
//   let distanceToEdgeX = worldDimensions.width - playerToFollow.x;
//   let distanceToEdgeY = worldDimensions.height - playerToFollow.y;

//   // If the ship is within the buffer zone, slow down the camera
//   if (distanceToEdgeX < bufferZoneX) {
//     let slowdownFactor = distanceToEdgeX / bufferZoneX;
//     newCamX = camX + (targetCamX - camX) * camSpeedX * slowdownFactor;
//   }
//   if (distanceToEdgeY < bufferZoneY) {
//     let slowdownFactor = (distanceToEdgeY / bufferZoneY) * (bufferZoneX / bufferZoneY); // Adjusted this line
//     newCamY = camY + (targetCamY - camY) * camSpeedY * slowdownFactor;
//   }

//   camX = Math.max(Math.min(newCamX, worldDimensions.width - canvas.width), 0);
//   camY = Math.max(Math.min(newCamY, worldDimensions.height - canvas.height), 0);
// }

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

  if (playerActive || player.getPlayerIsMaster()) {
    // Detect collisions with powerups or other ships
    detectCollisions(player, globalPowerUps, otherPlayers);

    if (player.getPlayerIsMaster()) {
      // This peer is the master, so it runs the game logic for shared objects
      masterPeerUpdateGame(globalPowerUps, bots, deltaTime);
    }
  }

  if (playerActive) {
    drawScene(player, otherPlayers, bots, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  } else {
    camFollowPlayer(deltaTime);
    drawScene(null, otherPlayers, bots, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  }
  // if (isPlayerMasterPeer(player)) {
  //   masterPeerUpdateGame(globalPowerUps,bots,deltaTime);
  // }
  updateConnections(player, otherPlayers, globalPowerUps);

  if (checkWinner(player, otherPlayers)) {
    setGameState(GameState.FINISHED);
  }
}
function camFollowPlayer(deltaTime) {
  //could choose spectaror who is active? but need to stick with one once choosen so maintain a playerToSpectate varible and only check if they become invalid.
  if (otherPlayers != null && otherPlayers[0] != null) {
    updateCamera(otherPlayers[0], deltaTime);
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
  drawNameEntry(canvas, ctx, player.name, canvas.width / 2 - 100, 80);
}

function updateWinState() {
  //drawScene(player, otherPlayers, bots, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  drawWinnerMessage(ctx, canvas, endGameMessage);
}

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
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
    setupPilots(canvas, ctx);
    setupNameEventListeners(window);
    updateName();
  }

  if (newState !== GameState.INTRO && prevGameState === GameState.INTRO) {
    removeNameEventListeners(window);
  }

  if (newState === GameState.FINISHED && prevGameState !== GameState.FINISHED) {
    setupWinStateEventListeners(window);
    if (player.getPlayerIsMaster()) {
      sendPlayerStates(player);
    }
  }

  if (newState !== GameState.FINISHED && prevGameState === GameState.FINISHED) {
    resetPowerLevels(player, otherPlayers);
    setGameWon(false);
    pilot2.selected = false;
    pilot1.selected = true;
    removeWinStateEventListeners(window);
  }

  if (newState === GameState.GAME && prevGameState !== GameState.GAME) {
    // fixedDeltaTime = 1 / 60;
    // setupGameEventListeners(window);
    //for now just do this at game start, in future do this periodically
    updateTopScoresInfo();
    setTimeout(() => connectToPeers(player, otherPlayers, peerIds, globalPowerUps), 1000);
    removePilotsEventListeners(canvas);
  }

  if (newState !== GameState.GAME && prevGameState === GameState.GAME) {
    //for now moving to showing game underneath all the time
    //  fixedDeltaTime = 1 / 30; //30 fps is plenty if not in game
    //  removeGameStateEventListeners(window);
    player.resetState(true);
    player.centerCameraOnPlayer();
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

  setTimeout(() => attemptConnections(player, otherPlayers, peerIds, globalPowerUps), 500);
  //do we need to keep doing this??
  // setInterval(() => connectToPeers(player, otherPlayers, peerIds, globalPowerUps), 6000);
  setTimeout(() => connectToPeers(player, otherPlayers, peerIds, globalPowerUps), 6000);

  setInterval(() => generatePowerups(globalPowerUps, worldDimensions.width, worldDimensions.height, colors), 3000);
  setInterval(() => connectToPeers(player, otherPlayers, peerIds, globalPowerUps), 35000);

  //don;t need to under master system
  //setInterval(() => sendPowerups(globalPowerUps), 3000);

  /* END CONNECTION HANDLERS  */

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
