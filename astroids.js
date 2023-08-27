import {
  setupCanvas,
  drawScene,
  drawPilots, setupPilotsImages, pilot1, pilot2, drawNameEntry
} from "./canvasDrawingFunctions.js";
import { checkWinner, generatePowerups, checkPowerupCollision } from "./gameLogic.js";
import {
  peerIds,
  connections,
  tryNextId,
  sendPowerups,
  attemptConnections,
  connectToPeers,
  updateConnections,
} from "./connectionHandlers.js";
import { keys, handleInputEvents, mousePos } from "./inputHandlers.js";

const { canvas, ctx } = setupCanvas();
const worldDimensions = { width: 3600, height: 2400 };
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "violet", "maroon", "crimson", "white"];
const shipPoints = [
  { x: 0, y: -20 },
  { x: -10, y: 20 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];
const acceleration = 0.65;
const friction = 0.95;
let vel = { x: 0, y: 0 };
export let distanceFactor;
let otherPlayers = [];
let globalPowerUps = [];
let currentSpeed = 0;

//switch this to intro once built that section
let gameState = 'game';
let pilotSelected = '';

const player = {
  id: null,
  x: 100 + Math.random() * (worldDimensions.width - 200),
  y: 100 + Math.random() * (worldDimensions.height - 200),
  powerUps: 0,
  color: colors[Math.floor(Math.random() * colors.length)],
  angle: 0,
  pilot: "",
  name: "",
};

export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;
const radius = 50;
const maxDistance = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
const bounceFactor = 1.5;
const offset = 1;
const camSpeedX = 0.025;
const camSpeedY = 0.05;
const minBounceSpeed = 5;

/* START CONNECTION HANDLERS  */
tryNextId(player, peerIds);

setTimeout(() => attemptConnections(player, otherPlayers, peerIds, connections, globalPowerUps), 500);
setInterval(() => connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps), 6000);
setInterval(() => generatePowerups(globalPowerUps, connections, worldDimensions.width, worldDimensions.height, colors), 3000);
setInterval(() => sendPowerups(globalPowerUps, connections), 3000);

/* END CONNECTION HANDLERS  */

handleInputEvents(canvas, player, keys);

function updateCamera() {
  const targetCamX = player.x - canvas.width / 2;
  let targetCamY;
  if (player.ySpeed < 0) { // Moving up
    targetCamY = player.y - canvas.height * 2 / 4;
  } else { // Moving down or not moving vertically
    targetCamY = player.y - canvas.height * 2 / 4;
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

function updatePlayerAngle() {
  let dx = player.x - mousePos.x;
  let dy = player.y - mousePos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  player.angle = Math.atan2(dy, dx) + Math.PI / 2;
  return { dx, dy, distance };
}

function updatePlayerVelocity({ dx, dy, distance }) {
  let squareFactor = currentSpeed * currentSpeed;
  let newFriction = Math.max(0.99 - squareFactor * 0.001, 0.7);
  let pilotBoostFactor = 1;
  if (player.pilot == "pilot1") {
    pilotBoostFactor = 1.5;
  }
  else if (player.pilot == "pilot2") {
    pilotBoostFactor = 0.5;
  }
  vel.x *= newFriction;
  vel.y *= newFriction;

  if (keys.space) {
    let mouseToCenter = { x: dx / distance, y: dy / distance };
    let maxForceDistance = 250;
    let minForceDistance = 20;

    if (distance > maxForceDistance) {
      distanceFactor = 1;
    } else {
      let normalizedDistance = distance / (canvas.width * 1 / 5);
      distanceFactor = Math.min(1, normalizedDistance);
      distanceFactor = Math.max(0.25, distanceFactor);
    }
    vel.x += acceleration * distanceFactor * mouseToCenter.x * pilotBoostFactor;
    vel.y += acceleration * distanceFactor * mouseToCenter.y * pilotBoostFactor;
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

function updatePlayerPosition() {
  player.x += vel.x;
  player.y += vel.y;
}

function updateGame() {
  updateCamera();
  const playerAngleData = updatePlayerAngle();
  updatePlayerVelocity(playerAngleData);
  bouncePlayer();
  updatePlayerPosition();
  checkPowerupCollision(player, globalPowerUps, connections);
  drawScene(player, otherPlayers, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps);
  updateConnections(player, otherPlayers, connections);

  if (checkWinner(player, otherPlayers, connections, ctx, canvas)) {
    gameState = "win";
  }
}

// Call setupPilots once at the start of the game 
setupPilotsImages(canvas, ctx);
setupPilots(canvas, ctx);

function setupPilots(canvas, ctx) {
  pilot1.image.src = 'images/pilot1.gif';
  pilot2.image.src = 'images/pilot2.gif';

  canvas.addEventListener('mousemove', function (event) {
    // Check if mouse is over a pilot
    if (event.clientX > pilot1.x && event.clientX < pilot1.x + pilot1.width &&
      event.clientY > pilot1.y && event.clientY < pilot1.y + pilot1.height) {
      pilot1.selected = true;
    } else {
      pilot1.selected = false;
    }
    if (event.clientX > pilot2.x && event.clientX < pilot2.x + pilot2.width &&
      event.clientY > pilot2.y && event.clientY < pilot2.y + pilot2.height) {
      pilot2.selected = true;
    } else {
      pilot2.selected = false;
    }

    // Redraw pilots with new selection state
    drawPilots(canvas, ctx);
  });

  canvas.addEventListener('click', function (event) {
    // Check if a pilot was clicked
    if (pilot1.selected) {
      console.log('Pilot 1 selected');
    }
    if (pilot2.selected) {
      console.log('Pilot 2 selected');
    }
  });
}

function updatePilot() {
  drawPilots(canvas, ctx);

  // Listen for clicks on the canvas
  canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if the user clicked on pilot 1
    if (x >= pilot1.x && x <= pilot1.x + pilot1.width && y >= pilot1.y && y <= pilot1.y + pilot1.height) {
      pilotSelected = 'pilot1';
    }

    // Check if the user clicked on pilot 2
    if (x >= pilot2.x && x <= pilot2.x + pilot2.width && y >= pilot2.y && y <= pilot2.y + pilot2.height) {
      pilotSelected = 'pilot2';
    }

    // If a pilot was selected, update the player object and change the game state to 'game'
    if (pilotSelected) {
      player.pilot = pilotSelected;
      gameState = 'game';
    }
  });
}

let keysDown = {};
const max_player_name = 10;

function updateName() {
  drawNameEntry(canvas, ctx, player.name);

  window.addEventListener('keydown', function (event) {
    // Check if the key is already down
    if (keysDown[event.key]) {
      return;
    }
    keysDown[event.key] = true;

    // Check if the key pressed is a printable character
    if (/^[\x20-\x7E]$/.test(event.key) && player.name.length < 10) {
      player.name += event.key;
    }
    // Check if the key pressed is backspace
    else if (event.key === 'Backspace') {
      player.name = player.name.slice(0, -1);
    }
    // Check if the key pressed is enter
    else if (event.key === 'Enter') {
      gameState = 'pilotSelect';
    }

    // Redraw name entry
    drawNameEntry(canvas, ctx);
  });

  window.addEventListener('keyup', function (event) {
    // Remove the key from the keysDown object
    delete keysDown[event.key];
  });
}

function update() {
  if (gameState === 'intro') {
    updateName();
  } else if (gameState === 'pilotSelect') {
    updatePilot();
  } else if (gameState === 'game') {
    updateGame();
  }
  requestAnimationFrame(update);
}

update();

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
}
