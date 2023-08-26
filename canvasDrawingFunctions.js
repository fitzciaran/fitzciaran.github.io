
import {
  distanceFactor,
} from "./astroids.js";

let backLayer = new Image();
let midBackLayer = new Image();
let middleLayer = new Image();
let midFrontLayer = new Image();
let frontLayer = new Image();
backLayer.src = 'images/parallax-space-backgound.png';
midBackLayer.src = 'images/parallax-space-stars.png';
middleLayer.src = 'images/parallax-space-far-planets.png';
midFrontLayer.src = 'images/parallax-space-ring-planet.png';
frontLayer.src = 'images/parallax-space-big-planet.png';

// Export a setupCanvas function that initializes the canvas and returns it
export function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1200;
  canvas.height = 600;
  return { canvas, ctx };
}

// Export a Basic function that takes the canvas context as an argument as well as camera position
export function drawBasicBackground(ctx, camX, camY, canvas) {
  ctx.fillStyle = "#999";
  ctx.fillRect(camX, camY, canvas.width, canvas.height);

  const gridSize = 100; // change as needed
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 0.5;

  // horizontal lines
  for (let i = camY - (camY % gridSize); i < camY + canvas.height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i - camY);
    ctx.lineTo(canvas.width, i - camY);
    ctx.stroke();
  }

  // vertical lines
  for (let i = camX - (camX % gridSize); i < camX + canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i - camX, 0);
    ctx.lineTo(i - camX, canvas.height);
    ctx.stroke();
  }
}

export function drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer) {
  // Define scroll speeds for each layer
  let backScrollSpeedX = -0.06; // Back layer scrolls slowest
  let midBackScrollSpeedX = -0.12; // Mid-back layer scrolls slower
  let middleScrollSpeedX = -0.18; // Middle layer scrolls at medium speed
  let midFrontScrollSpeedX = -0.34; // Mid-front layer scrolls faster
  let frontScrollSpeedX = -0.51; // Front layer scrolls fastest

  // Define vertical scroll speeds for each layer
  let backScrollSpeedY = -0.06; // Back layer scrolls slowest
  let midBackScrollSpeedY = -0.12; // Mid-back layer scrolls slower
  let middleScrollSpeedY = -0.18; // Middle layer scrolls at medium speed
  let midFrontScrollSpeedY = -0.34; // Mid-front layer scrolls faster
  let frontScrollSpeedY = -0.51; // Front layer scrolls fastest

  let scaleX = canvas.width / backLayer.width;
  let scaleY = canvas.height / backLayer.height;

  // Use the larger scale factor
  let scale = Math.max(scaleX, scaleY);

  // Calculate the new width and height
  let newWidth = backLayer.width * scale;
  let newHeight = backLayer.height * scale;

  // Calculate new positions for each layer
  let backX = camX * backScrollSpeedX % canvas.width;
  let midBackX = camX * midBackScrollSpeedX % canvas.width;
  let middleX = camX * middleScrollSpeedX % canvas.width;
  // let midFrontX = camX * midFrontScrollSpeedX % canvas.width;
  // let frontX = camX * frontScrollSpeedX % canvas.width;
  let midFrontX = camX * midFrontScrollSpeedX;
  let frontX = camX * frontScrollSpeedX;

  // Calculate new vertical positions for each layer
  let backY = camY * backScrollSpeedY % canvas.height;
  let midBackY = camY * midBackScrollSpeedY % canvas.height;
  let middleY = camY * middleScrollSpeedY % canvas.height;
  // let midFrontY = camY * midFrontScrollSpeedY % canvas.height;
  let midFrontY = camY * midFrontScrollSpeedY;
  // let frontY = camY * frontScrollSpeedY % canvas.height;
  let frontY = camY * frontScrollSpeedY;

  // Draw each layer at its new position
  ctx.drawImage(backLayer, backX, backY, newWidth, newHeight);

  //ctx.drawImage(backLayer, backX - newWidth, backY, newWidth, newHeight);
  ctx.drawImage(backLayer, newWidth + backX, backY, newWidth, newHeight);

  //we don't need these because the aspect ratio of current background means it will be the width that will wrap
  // ctx.drawImage(backLayer, backX, backY - newHeight, newWidth, newHeight);
  // ctx.drawImage(backLayer, backX - newWidth, backY - newHeight, newWidth, newHeight);

  ctx.drawImage(midBackLayer, midBackX, midBackY, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX - newWidth, midBackY, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX, midBackY - newHeight, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX - newWidth, midBackY - newHeight, newWidth, newHeight);

  ctx.drawImage(middleLayer, middleX, middleY, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX - newWidth, middleY, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX, middleY - newHeight, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX - newWidth, middleY - newHeight, newWidth, newHeight);

  let frontMidOffsetX = 800; // Adjust as needed
  let frontMidOffsetY = 650; // Adjust as needed
  ctx.drawImage(midFrontLayer, midFrontX + frontMidOffsetX, midFrontY + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX - newWidth + frontMidOffsetX, midFrontY + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX + frontMidOffsetX, midFrontY - newHeight + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX - newWidth + frontMidOffsetX, midFrontY - newHeight + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);

  let frontOffsetX = 700; // Adjust as needed
  let frontOffsetY = 250; // Adjust as needed
  ctx.drawImage(frontLayer, frontX + frontOffsetX, frontY + frontOffsetY, frontLayer.width * scale, frontLayer.height * scale);

  //draw a second smaller planet
  frontOffsetX = 1500; // Adjust as needed
  frontOffsetY = 1050; // Adjust as needed
  ctx.drawImage(frontLayer, frontX + frontOffsetX, frontY + frontOffsetY, frontLayer.width * scale * 0.6, frontLayer.height * scale * 0.6);

}

// Export a drawWorldBounds function that takes the canvas context as an argument
export function drawWorldBounds(ctx, camX, camY, worldWidth, worldHeight) {
  ctx.lineWidth = 10; // Line width increased
  ctx.strokeStyle = "blue";
  ctx.strokeRect(-camX, -camY, worldWidth, worldHeight);
}

// Export a drawMinimap function
export function drawMinimap(player, otherPlayers, worldWidth, worldHeight) {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");

  const dotSize = 5; // Size of the dot
  const scaleX = (minimapCanvas.width - dotSize) / worldWidth; // Adjust scale
  const scaleY = (minimapCanvas.height - dotSize) / worldHeight; // Adjust scale

  // Clear the minimap
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  // Draw the player's ship on the minimap
  minimapCtx.fillStyle = player.color;
  minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);

  // Draw other players on the minimap
  otherPlayers.forEach((player) => {
    minimapCtx.fillStyle = player.color;
    minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);
  });
}

export function drawRotatedShip(ctx, camX, camY, centerX, centerY, angle, points, color) {
  ctx.beginPath();

  // Move to the first point after rotating
  let rotatedPoint = rotatePoint(points[0].x, points[0].y, angle);
  ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);

  // Create a line for each point
  for (let i = 1; i < points.length; i++) {
    rotatedPoint = rotatePoint(points[i].x, points[i].y, angle);
    ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  }

  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
}

// Rotate a point (x, y) by a certain angle
export function rotatePoint(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

export function drawPowerups(globalPowerUps, ctx, camX, camY) {
  // Draw each dot
  globalPowerUps.forEach((powerup) => {
    ctx.beginPath();
    ctx.arc(powerup.x - camX, powerup.y - camY, 10, 0, Math.PI * 2);
    ctx.fillStyle = powerup.color;
    ctx.fill();
  });
}

export function drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight) {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");

  const powerupSize = 3; // Smaller size for powerups on the minimap
  const scaleX = (minimapCanvas.width - powerupSize) / worldWidth; // Adjust scale
  const scaleY = (minimapCanvas.height - powerupSize) / worldHeight; // Adjust scale

  // Draw each powerup on the minimap
  globalPowerUps.forEach((powerup) => {
    minimapCtx.fillStyle = powerup.color;
    minimapCtx.fillRect(powerup.x * scaleX, powerup.y * scaleY, powerupSize, powerupSize);
  });
}

export function renderPowerupLevels(ctx, player, otherPlayers) {
  const topGap = 100;
  const textHeight = 75; // Adjust this to the size of your text
  const gap = 16; // Gap between lines
  ctx.font = "14px Arial";
  const myPowerupText = `My Powerups: ${player.powerUps}`;
  ctx.fillStyle = player.color; 
  ctx.fillText(myPowerupText, 115.5, topGap - textHeight);

  // Draw other players' powerups
  otherPlayers.forEach((player, index) => {
    const playerPowerupText = `Player ${player.id.slice(0, 7)} Powerups: ${player.powerUps}`; // Showing only the first 7 digits of id for readability
    const y = topGap - textHeight + (1 + index) * gap; // calculate y position for each player's text
    ctx.fillStyle = player.color; // individual ship color for each player
    ctx.fillText(playerPowerupText, 40, y);
  });
}

export function renderMyId(ctx, player) {
  const topGap = 100;
  const gap = 16; // Gap between lines
  const textHeight = 75; // Adjust this to the size of your text
  ctx.font = "14px Arial";
  const myIDText = `My ID: ${player.id}`;
  ctx.fillStyle = player.color; 
  ctx.fillText(myIDText, 558, topGap - textHeight);

  const myDistanceFactorText = `distanceFactor ${distanceFactor}`;
  ctx.fillStyle = player.color; 
  ctx.fillText(myDistanceFactorText, 558, topGap + gap - textHeight);
}

export function drawWinnerMessage(ctx, canvas, message) {
  ctx.font = "70px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

export function drawScene(player, otherPlayers, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer);
  drawWorldBounds(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  otherPlayers.forEach((player) => drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color));
  drawPowerups(globalPowerUps, ctx, camX, camY);
  drawMinimap(player, otherPlayers, worldDimensions.width, worldDimensions.height);
  drawMinimapPowerups(globalPowerUps, worldDimensions.width, worldDimensions.height);
  drawRotatedShip(ctx, camX, camY, player.x, player.y, player.angle, shipPoints, player.color);
  renderPowerupLevels(ctx, player, otherPlayers);
  renderMyId(ctx, player);
}