import { renderDebugInfo, drawPowerupLevels, drawInvincibilityGauge,drawSpecialGauge } from "./drawGameUI.js";
import { rotateAndScalePoint, interpolate, spikeyBallPoints } from "./drawingUtils.js";
import { shipScale, mineScale } from "./gameLogic.js";

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

const shipPoints = [
  { x: 0, y: -20 },
  { x: -10, y: 20 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];

export function drawScene(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer);
  drawWorldBounds(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  otherPlayers.forEach((player) => drawRotatedShip(ctx, camX, camY, player, shipPoints));
  bots.forEach((bot) => drawRotatedShip(ctx, camX, camY, bot, shipPoints));
  drawPowerups(globalPowerUps, ctx, camX, camY);
  mines.forEach((mine) => drawEnemy(ctx, camX, camY, mine, spikeyBallPoints));
  drawMinimap(player, otherPlayers, bots, worldDimensions.width, worldDimensions.height);
  drawMinimapPowerups(globalPowerUps, worldDimensions.width, worldDimensions.height);
  if (player != null) {
    drawRotatedShip(ctx, camX, camY, player, shipPoints);
    renderDebugInfo(ctx, player, bots);
    drawInvincibilityGauge(ctx, player, canvas.width / 2, canvas.height - 70);
    drawSpecialGauge(ctx, player, canvas.width / 2, canvas.height - 20);
  }
  drawPowerupLevels(ctx, player, otherPlayers, bots);
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

  //this is an image to the right of the main background to cover the righthand edge ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)
  ctx.drawImage(backLayer, newWidth + backX - 1, backY, newWidth, newHeight);

  //these are an images below the main background to cover the bottom edge offset because they don't match up top to bottom ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)
  // ctx.drawImage(backLayer, newWidth + backX - 1, backY + newHeight - 1, newWidth, newHeight);
  // Calculate the aspect ratio difference
  let backAspectRatio = 272 / 160;
  let canvasAspectRatio = canvas.width / canvas.height;
  const aspectRatioDiff = backAspectRatio - canvasAspectRatio;

  // Calculate offsets based on the aspect ratio difference and window dimensions
  //sometimes 890 seems to be good sometime 620 (regardless of window resize and refreshes)
  // let xOffset = 890;
  let xOffset = 620;
  let yOffset = 12.5;
  //xOffset += (Math.abs(aspectRatioDiff) * window.innerHeight) / 2;
  if (aspectRatioDiff > 0) {
    // If background is taller, adjust yOffset
    // yOffset += (aspectRatioDiff * window.innerWidth) / 2;
  } else if (aspectRatioDiff < 0) {
    // If background is wider, adjust xOffset
    //xOffset += (Math.abs(aspectRatioDiff) * window.innerHeight) / 2;
  }
  ctx.drawImage(backLayer, backX + xOffset - newWidth + 1, backY + newHeight - yOffset, newWidth, newHeight);
  ctx.drawImage(backLayer, backX + xOffset, backY + newHeight - yOffset, newWidth, newHeight);

  //this is an image below and to the right of the main background to cover the bottom edge  ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)

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
  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, worldWidth, worldHeight);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "blue");
  gradient.addColorStop("1.0", "red");

  // Draw border
  ctx.lineWidth = 20;
  ctx.strokeStyle = gradient;
  ctx.strokeRect(-camX, -camY, worldWidth, worldHeight);
}

// Export a drawMinimap function
function drawMinimap(player, otherPlayers, bots, worldWidth, worldHeight) {
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

  if (player != null && player.isPlaying) {
    // Draw the player's ship on the minimap
    minimapCtx.fillStyle = player.color;
    minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);
  }
  // Draw other players on the minimap
  otherPlayers.forEach((player) => {
    if (player != null && player.isPlaying) {
      minimapCtx.fillStyle = player.color;
      minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);
    }
  });

  // Draw bots on the minimap
  bots.forEach((bot) => {
    minimapCtx.fillStyle = bot.color;
    minimapCtx.fillRect(bot.x * scaleX, bot.y * scaleY, dotSize, dotSize);
  });
}

function drawRotatedShip(ctx, camX, camY, player, points) {
  if (!player.isPlaying) {
    return;
  }

  function applyGlowingEffect(transitionColor, glowColor) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = glowColor;

    const transitionDuration = 2000;
    const currentTime = Date.now();
    const elapsedTime = currentTime - player.starTransitionStartTime;

    if (!player.starTransitionStartTime || elapsedTime >= transitionDuration) {
      player.starTransitionStartTime = currentTime;
      player.starTransitionStartColor = color;
    }

    const colorProgress = Math.min(1, elapsedTime / transitionDuration);
    const r = Math.floor(interpolate(player.starTransitionStartColor.r, transitionColor.r, colorProgress));
    const g = Math.floor(interpolate(player.starTransitionStartColor.g, transitionColor.g, colorProgress));
    const b = Math.floor(interpolate(player.starTransitionStartColor.b, transitionColor.b, colorProgress));

    ctx.strokeStyle = `rgb(${r},${g},${b})`;
  }

  let centerX = player.x;
  let centerY = player.y;
  let angle = player.angle;
  let color = player.color;
  let name = player.name;

  if (player.invincibleTimer > 10 || (player.invincibleTimer > 0 && !player.isUserControlledCharacter)) {
    applyGlowingEffect("gold", "gold");
  }

  ctx.beginPath();

  let rotatedPoint = rotateAndScalePoint(points[0].x, points[0].y, angle, shipScale);
  ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, shipScale);
    ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  }

  try {
    if (typeof player.isInSpawnProtectionTime === "function") {
      if (player.isInSpawnProtectionTime()) {
        applyGlowingEffect("white", "white");
      } else {
        ctx.strokeStyle = color;
      }
    } else {
      // console.log("isInSpawnProtectionTime method does not exist");
    }
  } catch (error) {
    console.log("An error occurred:", error);
  }

  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();

  ctx.globalAlpha = 1;

  const namePositionX = centerX - camX;
  const namePositionY = centerY - camY - 15;

  ctx.fillStyle = color;
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, namePositionX, namePositionY);

  if (player.recentKillTicks > 0) {
    player.recentKillTicks -= 1;
    drawKillInfo(ctx, player, player.recentKillText, camX, camY);
  }

  ctx.shadowBlur = 0;
}

export function drawEnemy(ctx, camX, camY, mine, points) {
  let centerX = mine.x;
  let centerY = mine.y;
  let color = mine.color;
  let angle = 0;
  ctx.beginPath();

  let rotatedPoint = rotateAndScalePoint(points[0].x, points[0].y, angle, mineScale);
  ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, mineScale);
    ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  }

  ctx.stroke();
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}

export function drawPowerups(globalPowerUps, ctx, camX, camY) {
  // Draw each dot
  globalPowerUps.forEach((powerUp) => {
    if (powerUp.isStar) {
      // Apply a glowing effect for star ships
      ctx.shadowBlur = 10;
      ctx.shadowColor = "gold"; // Adjust the glow color as needed
      ctx.strokeStyle = "gold"; // Adjust the stroke color to match the glow

      // Gradually change the star ship's color
      const transitionColor = "gold"; // Final color
      const transitionDuration = 2000; // Transition duration in milliseconds

      const currentTime = Date.now();
      const elapsedTime = currentTime - powerUp.starTransitionStartTime;

      if (!powerUp.starTransitionStartTime || elapsedTime >= transitionDuration) {
        powerUp.starTransitionStartTime = currentTime;
        powerUp.starTransitionStartColor = powerUp.color;
      }

      const colorProgress = Math.min(1, elapsedTime / transitionDuration);
      const r = Math.floor(interpolate(powerUp.starTransitionStartColor.r, transitionColor.r, colorProgress));
      const g = Math.floor(interpolate(powerUp.starTransitionStartColor.g, transitionColor.g, colorProgress));
      const b = Math.floor(interpolate(powerUp.starTransitionStartColor.b, transitionColor.b, colorProgress));

      ctx.strokeStyle = `rgb(${r},${g},${b})`;
    }
    ctx.beginPath();
    ctx.arc(powerUp.x - camX, powerUp.y - camY, powerUp.radius, 0, Math.PI * 2);
    ctx.fillStyle = powerUp.color;
    ctx.fill();
    ctx.shadowBlur = 0;
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

export function drawKillInfo(ctx, player, score, camX, camY) {
  let centerX = player.x;
  let centerY = player.y;
  // Calculate position for the score (above the unrotated center of the ship)
  const scorePositionX = centerX - camX;
  const scorePositionY = centerY - camY - 35; // You can adjust this value for the desired distance

  // Draw the score
  ctx.fillStyle = player.color;
  ctx.font = "25px Arial"; // Adjust font size and family as needed
  ctx.textAlign = "center";
  ctx.fillText(score, scorePositionX, scorePositionY);
}