import { BotState } from "./astroids.js";
import { isPlayerMasterPeer, getTopScores } from "./connectionHandlers.js";
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
var topDailyScoresString = "";

// Export a setupCanvas function that initializes the canvas and returns it
export function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.style.position = "absolute"; // positioning the canvas to start from the top left corner.
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Adding event listener to handle window resizing
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //since we can now scale the canvas need to adjust the positions
    centerPilots(canvas);
  });

  return { canvas, ctx };
}

function centerPilots(canvas) {
  // Center the pilots
  pilot1.x = canvas.width / 2 - pilot1.width * 2;
  pilot2.x = canvas.width / 2 + pilot2.width;

  pilot1.y = canvas.height / 6;
  pilot2.y = canvas.height / 6;

  // Position the lore tablet
  loreTablet.x = canvas.width / 2 - loreTablet.width / 2;
  loreTablet.y = canvas.height / 2 - 100;
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
  let centerX = player.x;
  let centerY = player.y;
  let angle = player.angle;
  let color = player.color;
  let name = player.name;

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
  ctx.closePath();
  // Calculate position for the name (above the unrotated center of the ship)
  const namePositionX = centerX - camX;
  const namePositionY = centerY - camY - 15; // You can adjust this value for the desired distance

  // Draw the name
  ctx.fillStyle = color;
  ctx.font = "14px Arial"; // Adjust font size and family as needed
  ctx.textAlign = "center";
  ctx.fillText(name, namePositionX, namePositionY);
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

function drawPowerupLevels(ctx, player, otherPlayers, bots) {
  const topGap = 100;
  const textHeight = 75; // Adjust this to the size of your text
  const gap = 16; // Gap between lines
  ctx.font = "14px Arial";

  if (player != null) {
    let textWidth = ctx.measureText(player.name).width;
    const score = player.powerUps * 100;
    const myPowerupText = `${player.name}: ${score}`;
    ctx.fillStyle = player.color;
    ctx.textAlign = "start";
    ctx.fillText(myPowerupText, 199.5 - textWidth * 0.99, topGap - textHeight);
  }
  // Draw other players' powerups
  otherPlayers.forEach((player, index) => {
    // const playerPowerupText = `Player ${player.id.slice(0, 7)} Powerups: ${player.powerUps}`; // Showing only the first 7 digits of id for readability
    let playerName = player.name;
    if (playerName == null || playerName == "") {
      //todo maybe just skip over this player if not setup correctly?
      return;
      playerName = "Unknown";
    }
    const score = player.powerUps * 100;
    const playerPowerupText = playerName + `: ${score}`;
    let textWidth = ctx.measureText(playerName).width;
    const y = topGap - textHeight + (1 + index) * gap; // calculate y position for each player's text
    ctx.fillStyle = player.color; // individual ship color for each player
    ctx.fillText(playerPowerupText, 200 - textWidth, y);
  });

  bots.forEach((bot, index) => {
    // const playerPowerupText = `Player ${player.id.slice(0, 7)} Powerups: ${player.powerUps}`; // Showing only the first 7 digits of id for readability
    let playerName = bot.name;
    if (playerName == null || playerName == "") {
      playerName = "Unknown";
    }
    const score = bot.powerUps * 100;
    const playerPowerupText = playerName + `: ${score}`;
    let textWidth = ctx.measureText(playerName).width;
    const y = topGap - textHeight + (1 + index + otherPlayers.length) * gap; // calculate y position for each player's text
    ctx.fillStyle = bot.color; // individual ship color for each player
    ctx.fillText(playerPowerupText, 200 - textWidth, y);
  });
}

export function renderDebugInfo(ctx, player, bots) {
  ctx.textAlign = "start";
  const topGap = 100;
  const gap = 16; // Gap between lines
  const textHeight = 75; // Adjust this to the size of your text
  ctx.font = "14px Arial";
  const myIDText = `My ID: ${player.id}`;
  ctx.fillStyle = player.color;
  ctx.fillText(myIDText, 558, topGap - textHeight);
  //also render some other useful debug stuff
  const myDistanceFactorText = `distanceFactor ${player.distanceFactor}`;
  ctx.fillStyle = player.color;
  ctx.fillText(myDistanceFactorText, 558, topGap + gap - textHeight);

  const isMasterText = `is Master =  ${isPlayerMasterPeer(player)}`;
  ctx.fillStyle = player.color;
  ctx.fillText(isMasterText, 558, topGap + gap * 2 - textHeight);

  // if (topDailyScoresString != "") {
  //   var scores = topDailyScoresString.split("; ");
  //   for (var i = 0; i < scores.length; i++) {
  //     ctx.fillText(scores[i], 558, topGap + gap * (3 + i) - textHeight);
  //   }
  // }
  bots.forEach((bot, index) => {
    let botInfo;
    if (bot.botState == BotState.FOLLOW_PLAYER) {
      botInfo = `bot state: ${bot.botState} following: ${bot.followingPlayerID} `;
    } else {
      botInfo = `bot state: ${bot.botState} aiming: ${bot.randomTarget.x},${bot.randomTarget.y} `;
    }
    ctx.fillText(botInfo, 958, topGap + gap * index - textHeight);
  });
}

export function updateTopScoresInfo() {
  var date = new Date();
  var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  getTopScores("daily-" + dateString, 10)
    .then((scores) => {
      topDailyScoresString = scores.join("; ");
    })
    .catch((error) => {
      console.error("Error getting scores: ", error);
    });
}

export function drawWinnerMessage(ctx, canvas, message) {
  ctx.font = "70px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("press enter to play again", canvas.width / 2, canvas.height / 2 + 40);

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("press r to return to main menu", canvas.width / 2, canvas.height / 2 + 65);
}

export function drawScene(player, otherPlayers, bots, ctx, camX, camY, worldDimensions, canvas, shipPoints, globalPowerUps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer);
  drawWorldBounds(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  otherPlayers.forEach((player) => drawRotatedShip(ctx, camX, camY, player, shipPoints));
  bots.forEach((bot) => drawRotatedShip(ctx, camX, camY, bot, shipPoints));
  drawPowerups(globalPowerUps, ctx, camX, camY);
  drawMinimap(player, otherPlayers, bots, worldDimensions.width, worldDimensions.height);
  drawMinimapPowerups(globalPowerUps, worldDimensions.width, worldDimensions.height);
  if (player != null) {
    drawRotatedShip(ctx, camX, camY, player, shipPoints);
    renderDebugInfo(ctx, player, bots);
  }
  drawPowerupLevels(ctx, player, otherPlayers, bots);
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

export function drawPreGameOverlay(canvas, ctx) {
  const bestScoresXOffset = 250;
  const bestScoresYOffset = 300;
  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "blue");
  gradient.addColorStop("1.0", "red");

  // Draw border
  ctx.lineWidth = 10;
  ctx.strokeStyle = gradient;
  ctx.strokeRect(bestScoresXOffset - 170, bestScoresYOffset - 50, 360, 320);

  // Draw title
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.fillText("Best Scores Today!", bestScoresXOffset, bestScoresYOffset);

  // Draw table headers
  ctx.font = "16px Arial";
  ctx.fillText("Rank", bestScoresXOffset - 100, bestScoresYOffset + 30);
  ctx.fillText("Score", bestScoresXOffset, bestScoresYOffset + 30);
  ctx.fillText("Player", bestScoresXOffset + 100, bestScoresYOffset + 30);

  // Draw scores
  ctx.font = "14px Arial";
  let gap = 20;
  const textHeight = 75;
  if (topDailyScoresString != "") {
    var scores = topDailyScoresString.split("; ");
    for (var i = 0; i < scores.length; i++) {
      let scoreData = scores[i].split(", "); // Assuming score data is in format "score, player"
      ctx.fillText((i + 1).toString(), bestScoresXOffset - 100, bestScoresYOffset + 130 + gap * i - textHeight); // Rank
      ctx.fillText(scoreData[0], bestScoresXOffset, bestScoresYOffset + 130 + gap * i - textHeight); // Score
      ctx.fillText(scoreData[1], bestScoresXOffset + 100, bestScoresYOffset + 130 + gap * i - textHeight); // Player
    }
  }

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
  ctx.lineWidth = 7;
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
  centerPilots(canvas);
}

export function drawNameEntry(canvas, ctx, name, x, y) {
  // Reset context to preserve consistency when this function is called
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the canvas transform
  // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.textAlign = "center";
  // Reset fill and stroke styles
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";

  // Reset font
  ctx.font = "12px Arial";

  // Draw background
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  let enterNameText = "Enter Your Name";
  // Draw title
  ctx.fillText(enterNameText, canvas.width / 2, y + 15);

  // Draw name entry box
  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, 200, 100);
  ctx.textAlign = "start";
  // Draw player's name
  ctx.font = "20px Arial";
  let nameAdjustment = 30;
  // ctx.fillText(name, x + nameAdjustment, y + 50);
  // if (document.hasFocus()) {
  //   drawNameCursor(canvas, ctx, name, x + ctx.measureText(name).width + nameAdjustment, y + 38);
  // }

  // Calculate the center of the box
  let centerX = x + 100;
  let centerY = y + 50;

  // Calculate the width of the text
  let textWidth = ctx.measureText(name).width;

  // Calculate the start position of the text so that it's centered in the box
  let textStartX = centerX - textWidth / 2;

  // Draw player's name
  ctx.fillText(name, textStartX, centerY);

  // Draw the cursor just to the right of the text
  if (document.hasFocus()) {
    drawNameCursor(canvas, ctx, name, textStartX + textWidth, centerY - 12);
  }
  // Draw play button
  let buttonX = x + 50;
  let buttonY = y + 70;
  let buttonWidth = 100;
  let buttonHeight = 20;
  let radius = 10; // Radius for rounded corners

  // Create gradient
  let gradient;
  try {
    gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    gradient.addColorStop(0, "green");
    gradient.addColorStop(1, "darkgreen");

    ctx.fillStyle = gradient;
  } catch (Exception) {
    console.log("gradient issue");
  }
  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(buttonX + radius, buttonY);
  ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
  ctx.arcTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + radius, radius);
  ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - radius);
  ctx.arcTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - radius, buttonY + buttonHeight, radius);
  ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
  ctx.arcTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - radius, radius);
  ctx.lineTo(buttonX, buttonY + radius);
  ctx.arcTo(buttonX, buttonY, buttonX + radius, buttonY, radius);
  ctx.closePath();
  ctx.fill();

  // Write "Play" on the button
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Play", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

export function drawNameCursor(canvas, ctx, name, x, y) {
  var forDebug = ctx.measureText(name).width;
  // Draw text cursor
  if (cursorBlink) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "transparent";
  }
  //adjust by 0.5 so cursor just to the right of the text
  ctx.fillRect(x + 0.5, y, 2, 20);
  //ctx.fillStyle = "pink";
}
