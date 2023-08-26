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
  everConnected,
  peerIds,
  getPeer,
  setPeer,
  connections,
  tryNextId,
  sendPlayerStates,
  sendPowerups,
  attemptConnections,
  connectToPeers,
} from "./connectionHandlers.js";
import { keys, handleInputEvents, mousePos } from "./inputHandlers.js";

const { canvas, ctx } = setupCanvas();

const worldWidth = 3600;
const worldHeight = 2400;

let globalPowerUps = [];

let powerUps = 0;
// Random initial position, at least 100 units away from each edge
let centerX = 100 + Math.random() * (worldWidth - 200);
let centerY = 100 + Math.random() * (worldHeight - 200);
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "violet", "maroon", "crimson", "white"];
let color = colors[Math.floor(Math.random() * colors.length)];
let angle = 0;
let player = {
  id: null,
  x: centerX,
  y: centerY,
  powerUps: powerUps,
  color: color,
  angle: angle,
};

// Initial camera position at start of game
export let camX = player.x - canvas.width / 2;
export let camY = player.y - canvas.height / 2;
const radius = 50;
const maxDistance = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
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

/* START CONNECTION HANDLERS  */
setPeer(tryNextId(peerIds, getPeer(), player));

setTimeout(function () {
  setPeer(attemptConnections(player, getPeer(), peerIds, otherPlayers, connections, globalPowerUps));
}, 500);
setInterval(function () {
  connectToPeers(peerIds, player, otherPlayers, connections, globalPowerUps);
}, 6000);

setInterval(function () {
  generatePowerups(globalPowerUps, connections, worldWidth, worldHeight, colors);
}, 3000);
setInterval(function () {
  sendPowerups(globalPowerUps, connections);
}, 3000);

/* END CONNECTION HANDLERS  */

handleInputEvents(canvas, player, keys);

function update() {
  const bounceFactor = 1.5; // Adjust this to control bounce behavior
  const offset = 1; // Adjust this to make sure ship doesn't get "stuck" in the wall
  const camSpeed = 0.025; // Adjust this to control camera "lag"
  const minBounceSpeed = 5;

  // camera gradually moves towards the ship
  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;
  camX += (targetCamX - camX) * camSpeed;
  camY += (targetCamY - camY) * camSpeed;

  // prevent camera from going outside of world
  camX = Math.min(camX, worldWidth - canvas.width);
  camX = Math.max(camX, 0);
  camY = Math.min(camY, worldHeight - canvas.height);
  camY = Math.max(camY, 0);

  // compute a unit vector pointing from the mouse to the center
  let dx = player.x - mousePos.x;
  let dy = player.y - mousePos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  player.angle = Math.atan2(dy, dx) + Math.PI / 2;

  let speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  let squareFactor = speed * speed;
  let newFriction = 0.99 - squareFactor * 0.001;
  newFriction = Math.max(newFriction, 0.7);

  vel.x *= newFriction;
  vel.y *= newFriction;

  if (keys.space) {
    let mouseToCenter = { x: dx / distance, y: dy / distance };
    let maxForceDistance = 2 * 30;

    if (distance > maxForceDistance) {
      distanceFactor = 1;
    } else {
      distanceFactor = Math.min(1, distance / (canvas.width / 2));
    }

    vel.x += acceleration * distanceFactor * mouseToCenter.x;
    vel.y += acceleration * distanceFactor * mouseToCenter.y;
  }
  // If the ship hits the edge of the world, bounce
  if (player.x < 0) {
    vel.x = -vel.x * bounceFactor;
    player.x = offset;
    if (Math.abs(vel.x) < minBounceSpeed) {
      vel.x = (vel.x < 0 ? -1 : 1) * minBounceSpeed;
    }
  } else if (player.x > worldWidth) {
    vel.x = -vel.x * bounceFactor;
    player.x = worldWidth - offset;
    if (Math.abs(vel.x) < minBounceSpeed) {
      vel.x = (vel.x < 0 ? -1 : 1) * minBounceSpeed;
    }
  }

  if (player.y < 0) {
    vel.y = -vel.y * bounceFactor;
    player.y = offset;
    if (Math.abs(vel.y) < minBounceSpeed) {
      vel.y = (vel.y < 0 ? -1 : 1) * minBounceSpeed;
    }
  } else if (player.y > worldHeight) {
    vel.y = -vel.y * bounceFactor;
    player.y = worldHeight - offset;
    if (Math.abs(vel.y) < minBounceSpeed) {
      vel.y = (vel.y < 0 ? -1 : 1) * minBounceSpeed;
    }
  }

  // The position needs to be restricted to within the world
  player.x += vel.x;
  player.y += vel.y;
  // Check collision for you
  checkPowerupCollision(player, globalPowerUps, connections);
  // Don't Check collision for other players let each player do it for themselves

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, camX, camY, canvas);
  drawWorldBounds(ctx, camX, camY, worldWidth, worldHeight);

  ctx.lineWidth = 2;

  // Draw other players
  otherPlayers.forEach((player) => {
    drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color);
  });

  drawPowerups(globalPowerUps, ctx, camX, camY);
  drawMinimap(player, otherPlayers, worldWidth, worldHeight);
  drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight);
  drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color);
  renderPowerupLevels(ctx, player, otherPlayers);
  if (everConnected) {
    sendPlayerStates(player, connections);
  } else {
    connections.forEach((conn) => {
      if (conn && conn.closed) {
        console.log("Connection closed with peer:", conn.peer);
        // Remove player from otherPlayers array
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
      } else if (!conn) {
        console.log("Connection null, removing from otherplayers list and from connections", conn.peer);
        // Remove player from otherPlayers array
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
        //is it ok to do this in the foreach iterating over connections?
        connections = connections.filter((player) => player.id !== conn.peer);
      }
    });
  }
  if (checkWinner(player, otherPlayers, connections, ctx, canvas)) {
    return;
  }
  requestAnimationFrame(update);
}

export function setGlobalPowerUps(newPowerUps) {
  globalPowerUps = newPowerUps;
}

update();
