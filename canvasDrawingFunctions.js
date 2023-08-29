import { distanceFactor } from "./astroids.js";
import { pilot1, pilot2 } from "./gameLogic.js";

let backLayer = new Image();
let midBackLayer = new Image();
let middleLayer = new Image();
let midFrontLayer = new Image();
let frontLayer = new Image();
backLayer.src = "images/parallax-space-backgound.png";
midBackLayer.src = "images/parallax-space-stars.png";
middleLayer.src = "images/parallax-space-far-planets.png";
midFrontLayer.src = "images/parallax-space-ring-planet.png";
frontLayer.src = "images/parallax-space-big-planet.png";
let cursorBlink = true;
let cursorBlinkInterval = setInterval(() => (cursorBlink = !cursorBlink), 450);

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
  let backX = (camX * backScrollSpeedX) % canvas.width;
  let midBackX = (camX * midBackScrollSpeedX) % canvas.width;
  let middleX = (camX * middleScrollSpeedX) % canvas.width;
  // let midFrontX = camX * midFrontScrollSpeedX % canvas.width;
  // let frontX = camX * frontScrollSpeedX % canvas.width;
  let midFrontX = camX * midFrontScrollSpeedX;
  let frontX = camX * frontScrollSpeedX;

  // Calculate new vertical positions for each layer
  let backY = (camY * backScrollSpeedY) % canvas.height;
  let midBackY = (camY * midBackScrollSpeedY) % canvas.height;
  let middleY = (camY * middleScrollSpeedY) % canvas.height;
  // let midFrontY = camY * midFrontScrollSpeedY % canvas.height;
  let midFrontY = camY * midFrontScrollSpeedY;
  // let frontY = camY * frontScrollSpeedY % canvas.height;
  let frontY = camY * frontScrollSpeedY;

  // Draw each layer at its new position
  ctx.drawImage(backLayer, backX, backY, newWidth, newHeight);

  //ctx.drawImage(backLayer, backX - newWidth, backY, newWidth, newHeight);

  //this is an image to the right of the main background to cover the righthand edge (aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)
  ctx.drawImage(backLayer, newWidth + backX - 1, backY, newWidth, newHeight);

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

  // Draw a semi-transparent background with a border
  minimapCtx.fillStyle = "rgba(0, 128, 0, 0.2)"; // Semi-transparent green
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimapCtx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // White border
  minimapCtx.lineWidth = 3; // Border width
  minimapCtx.strokeRect(0, 0, minimapCanvas.width, minimapCanvas.height);

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
  let textWidth = ctx.measureText(player.name).width;
  const myPowerupText = `${player.name}: ${player.powerUps}`;
  ctx.fillStyle = player.color;
  ctx.textAlign = "start";
  ctx.fillText(myPowerupText, 199.5 - textWidth * 0.99, topGap - textHeight);

  // Draw other players' powerups
  otherPlayers.forEach((player, index) => {
    // const playerPowerupText = `Player ${player.id.slice(0, 7)} Powerups: ${player.powerUps}`; // Showing only the first 7 digits of id for readability
    const playerPowerupText = `${player.name}: ${player.powerUps}`; 
    let textWidth = ctx.measureText(player.name).width;
    const y = topGap - textHeight + (1 + index) * gap; // calculate y position for each player's text
    ctx.fillStyle = player.color; // individual ship color for each player
    ctx.fillText(playerPowerupText, 200 - textWidth, y);
  });
}

export function renderMyId(ctx, player) {
  ctx.textAlign = "start";
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

export const loreTablet = {
  x: 0,
  y: -300,
  width: 450,
  height: 450,
  image: new Image(),
};

let loreIndex = 0;
let lineCount = 0;
let maxCharsPerLine = 20; // Adjust this value based on the width of your tablet

export function drawPilots(canvas, ctx) {
  // Draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw title
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Select Your Pilot", canvas.width / 2, 50);

  // Draw lore tablet
  ctx.drawImage(loreTablet.image, loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  // Draw pilot options
  ctx.drawImage(pilot1.image, pilot1.x, pilot1.y, pilot1.width, pilot1.height);
  ctx.drawImage(pilot2.image, pilot2.x, pilot2.y, pilot2.width, pilot2.height);

  // Highlight selected pilot
  if (pilot1.selected) {
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(pilot1.x, pilot1.y, pilot1.width, pilot1.height);
  }
  if (pilot2.selected) {
    ctx.strokeStyle = "yellow";
    ctx.strokeRect(pilot2.x, pilot2.y, pilot2.width, pilot2.height);
  }

  // Reset lore index and line count
  if (!pilot1.selected && !pilot2.selected) {
    loreIndex = 0;
    lineCount = 0;
  }

  let x = loreTablet.x + 60;
  let y = loreTablet.y + 65; // Initial y value

  // Animate lore text
  if (pilot1.selected) {
    // animateLoreText(ctx, pilot1.lore, loreIndex, lineCount);
    renderLoreText(ctx, pilot1.lore, x, y, 330);
  }
  if (pilot2.selected) {
    // animateLoreText(ctx, pilot2.lore, loreIndex, lineCount);
    renderLoreText(ctx, pilot2.lore, x, y, 330);
  }
}

function renderLoreText(ctx, lore, x, y, maxWidth) {
  // Set font and color
  ctx.font = "23px Gothic";
  ctx.fillStyle = "coral";
  ctx.textAlign = "start";

  let words = lore.split(" ");
  let line = "";
  let lineHeight = 25; // Line height

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + " ";
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

//wip
function animateLoreText(ctx, lore, loreIndex, lineCount) {
  // Set font and color
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "start";

  // Increment lore index
  while (loreIndex < lore.length - 1) {
    // Calculate line breaks
    if (loreIndex % maxCharsPerLine === 0 && loreIndex !== 0) {
      lineCount++;
    }

    // Draw text
    ctx.fillText(lore[loreIndex], loreTablet.x + 50 + loreIndex * 10, loreTablet.y + 130 + lineCount * 20);

    loreIndex++;
  }
}

export function setupPilotsImages(canvas) {
  pilot1.image.src = "images/pilot1.gif";
  pilot2.image.src = "images/pilot2.gif";
  loreTablet.image.src = "images/tablet.png";

  // Center the pilots
  pilot1.x = canvas.width / 2 - pilot1.width * 2;
  pilot2.x = canvas.width / 2 + pilot2.width;

  pilot1.y = canvas.height / 6;
  pilot2.y = canvas.height / 6;

  // Position the lore tablet
  loreTablet.x = canvas.width / 2 - loreTablet.width / 2;
  loreTablet.y = canvas.height / 2 - 100;
}

export function drawNameEntry(canvas, ctx, name) {
  // Reset context to preserve consistency when this function is called
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the canvas transform
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.textAlign = "center";
  // Reset fill and stroke styles
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";

  // Reset font
  ctx.font = "30px Arial";

  // Draw background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  let enterNameText = "Enter Your Name";
  // Draw title
  ctx.fillText(enterNameText, canvas.width / 2, 50);

  // Draw name entry box
  ctx.strokeStyle = "white";
  ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
  ctx.textAlign = "start";
  // Draw player's name
  ctx.font = "20px Arial";
  ctx.fillText(name, canvas.width / 2 - 50, canvas.height / 2);
  drawNameCursor(canvas, ctx, name);
}

export function drawNameCursor(canvas, ctx, name) {
  var forDebug = ctx.measureText(name).width;
  // Draw text cursor
  if (cursorBlink) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fillRect(canvas.width / 2 - 50 + ctx.measureText(name).width, canvas.height / 2 - 17, 2, 20);
  ctx.fillStyle = "pink";
}
