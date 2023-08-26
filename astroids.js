import {
  setupCanvas,
  drawBackground,
  drawWorldBounds,
  drawMinimap,
  drawRotatedShip,
  drawPowerups,
  drawMinimapPowerups,
  renderPowerupLevels,
} from "./canvasDrawingFunctions.js";
import { checkWinner, generatePowerups, checkPowerupCollision } from "./gameLogic.js";
import {
  peerIds,
  getPeer,
  setPeer,
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
const acceleration = 0.25;
const friction = 0.95;
let vel = { x: 0, y: 0 };
let distanceFactor;
let otherPlayers = [];
let globalPowerUps = [];

const player = {
  id: null,
  x: 100 + Math.random() * (worldDimensions.width - 200),
  y: 100 + Math.random() * (worldDimensions.height - 200),
  powerUps: 0,
  color: colors[Math.floor(Math.random() * colors.length)],
  angle: 0,
};

export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;
const radius = 50;
const maxDistance = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
const bounceFactor = 1.5;
const offset = 1;
const camSpeed = 0.025;
const minBounceSpeed = 5;

/* START CONNECTION HANDLERS  */
setPeer(tryNextId(peerIds, getPeer(), player));

setTimeout(() => setPeer(attemptConnections(player, getPeer(), peerIds, otherPlayers, connections, globalPowerUps)), 500);
setInterval(() => connectToPeers(peerIds, player, otherPlayers, connections, globalPowerUps), 6000);
setInterval(() => generatePowerups(globalPowerUps, connections, worldDimensions.width, worldDimensions.height, colors), 3000);
setInterval(() => sendPowerups(globalPowerUps, connections), 3000);

/* END CONNECTION HANDLERS  */

handleInputEvents(canvas, player, keys);


function updateCamera() {
  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;
  camX += (targetCamX - camX) * camSpeed;
  camY += (targetCamY - camY) * camSpeed;

  camX = Math.max(Math.min(camX, worldDimensions.width - canvas.width), 0);
  camY = Math.max(Math.min(camY, worldDimensions.height - canvas.height), 0);
}

function updatePlayerAngle() {
  let dx = player.x - mousePos.x;
  let dy = player.y - mousePos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  player.angle = Math.atan2(dy, dx) + Math.PI / 2;
  return { dx, dy, distance };
}

function updatePlayerVelocity({ dx, dy, distance }) {
  let speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  let squareFactor = speed * speed;
  let newFriction = Math.max(0.99 - squareFactor * 0.001, 0.7);

  vel.x *= newFriction;
  vel.y *= newFriction;

  if (keys.space) {
    let mouseToCenter = { x: dx / distance, y: dy / distance };
    let maxForceDistance = 2 * 30;
    distanceFactor = distance > maxForceDistance ? 1 : Math.min(1, distance / (canvas.width / 2));

    vel.x += acceleration * distanceFactor * mouseToCenter.x;
    vel.y += acceleration * distanceFactor * mouseToCenter.y;
  }
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

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, camX, camY, canvas);
  drawWorldBounds(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  otherPlayers.forEach((player) => drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color));
  drawPowerups(globalPowerUps, ctx, camX, camY);
  drawMinimap(player, otherPlayers, worldDimensions.width, worldDimensions.height);
  drawMinimapPowerups(globalPowerUps, worldDimensions.width, worldDimensions.height);
  drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color);
  renderPowerupLevels(ctx, player, otherPlayers);
}

function update() {
  updateCamera();
  const playerAngleData = updatePlayerAngle();
  updatePlayerVelocity(playerAngleData);
  bouncePlayer();
  updatePlayerPosition();
  checkPowerupCollision(player, globalPowerUps, connections);
  drawScene();
  updateConnections(player,otherPlayers,connections);

  if (!checkWinner(player, otherPlayers, connections, ctx, canvas)) {
    requestAnimationFrame(update);
  }
}

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
}

update();
