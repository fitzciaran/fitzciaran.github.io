/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./backgroundDrawing.js":
/*!******************************!*\
  !*** ./backgroundDrawing.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawBackground: () => (/* binding */ drawBackground),
/* harmony export */   drawWorldBounds: () => (/* binding */ drawWorldBounds)
/* harmony export */ });
// Export a Basic function that takes the canvas context as an argument as well as camera position
function drawBasicBackground(ctx, camX, camY, canvas) {
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

function drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer) {
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

function drawWorldBounds(ctx, camX, camY, worldWidth, worldHeight) {
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


/***/ }),

/***/ "./canvasDrawingFunctions.js":
/*!***********************************!*\
  !*** ./canvasDrawingFunctions.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawAchievements: () => (/* binding */ drawAchievements),
/* harmony export */   drawDailyScores: () => (/* binding */ drawDailyScores),
/* harmony export */   drawGameOverMessage: () => (/* binding */ drawGameOverMessage),
/* harmony export */   drawInputField: () => (/* binding */ drawInputField),
/* harmony export */   drawNameEntry: () => (/* binding */ drawNameEntry),
/* harmony export */   drawPreGameOverlay: () => (/* binding */ drawPreGameOverlay),
/* harmony export */   drawTextCursor: () => (/* binding */ drawTextCursor),
/* harmony export */   drawTextCursorFromText: () => (/* binding */ drawTextCursorFromText),
/* harmony export */   menuButtonHeight: () => (/* binding */ menuButtonHeight),
/* harmony export */   menuButtonWidth: () => (/* binding */ menuButtonWidth),
/* harmony export */   menuButtonX: () => (/* binding */ menuButtonX),
/* harmony export */   menuButtonY: () => (/* binding */ menuButtonY),
/* harmony export */   playButtonHeight: () => (/* binding */ playButtonHeight),
/* harmony export */   playButtonWidth: () => (/* binding */ playButtonWidth),
/* harmony export */   playButtonX: () => (/* binding */ playButtonX),
/* harmony export */   playButtonY: () => (/* binding */ playButtonY),
/* harmony export */   setupCarrots: () => (/* binding */ setupCarrots),
/* harmony export */   updateTopScoresInfo: () => (/* binding */ updateTopScoresInfo)
/* harmony export */ });
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _drawGameUI_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./drawGameUI.js */ "./drawGameUI.js");
/* harmony import */ var _login_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./login.js */ "./login.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");







let cursorBlink = true;
let cursorBlinkInterval = setInterval(() => (cursorBlink = !cursorBlink), 450);
var topDailyScoresString = "";
let playButtonX = 0;
let playButtonY = 0;
let playButtonWidth = 0;
let playButtonHeight = 0;

let menuButtonX = 0;
let menuButtonY = 0;
let menuButtonWidth = 0;
let menuButtonHeight = 0;

//should probably refactor this so logic lives elsewhere
function updateTopScoresInfo() {
  var date = new Date();
  var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

  (0,_db_js__WEBPACK_IMPORTED_MODULE_0__.getTopScores)("daily-" + dateString, 10)
    .then((scores) => {
      topDailyScoresString = scores.join("; ");
    })
    .catch((error) => {
      console.error("Error getting scores: ", error);
    });
}

function drawGameOverMessage(ctx, canvas, message) {
  ctx.font = "70px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  // Check if the message contains a newline character
  if (message.includes("\n")) {
    const messageParts = message.split("\n");
    const lineHeight = 90; // Adjust this value as needed for spacing

    // Calculate the position for the first part of the message
    const firstPartY = canvas.height / 2 - (lineHeight * messageParts.length) / 2;

    // Draw each part of the message
    messageParts.forEach((part, index) => {
      const y = firstPartY + lineHeight * index;
      ctx.fillText(part, canvas.width / 2, y);
    });
  } else {
    // If there is no newline character, draw the message as-is
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  //ctx.fillText("press enter to play again", canvas.width / 2, canvas.height / 2 + 40);

  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  // ctx.fillText("press r to return to main menu", canvas.width / 2, canvas.height / 2 + 40);

  let buttonWidth = 200;
  let buttonHeight = 40;
  let buttonX = canvas.width / 2 - buttonWidth / 2;
  let buttonY = canvas.height / 2 + 80;
  let gap = 30;
  let radius = 10; // Radius for rounded corners
  drawButton(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius, "Play");
  playButtonX = buttonX;
  playButtonY = buttonY;
  playButtonWidth = buttonWidth;
  playButtonHeight = buttonHeight;

  buttonY = buttonY + buttonHeight + gap;
  drawButton(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius, "Menu", "blue", "darkblue");
  menuButtonX = buttonX;
  menuButtonY = buttonY;
  menuButtonWidth = buttonWidth;
  menuButtonHeight = buttonHeight;
}

let loreIndex = 0;
let lineCount = 0;
let maxCharsPerLine = 20; // Adjust this value based on the width of your tablet

function drawBorder(ctx, x, y, width, height) {
  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "blue");
  gradient.addColorStop("1.0", "red");

  // Draw border
  ctx.lineWidth = 10;
  ctx.strokeStyle = gradient;
  ctx.strokeRect(x, y, width, height);
}

function drawBoxBackground(ctx, x, y, width, height) {
  // Create a gradient for the box background
  const backGradient = ctx.createLinearGradient(x, y, x + width, y + height);
  backGradient.addColorStop(0, "rgba(0, 0, 0, 0.2)"); // Transparent black
  backGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)"); // Semi-transparent black

  // Draw the box background with gradient
  ctx.fillStyle = backGradient;
  ctx.fillRect(x, y, width, height);
}

function drawText(ctx, text, x, y, font, color, textAlign) {
  ctx.font = font;
  ctx.fillStyle = color;
  if (textAlign) {
    ctx.textAlign = textAlign;
  }
  ctx.fillText(text, x, y);
}

function drawDailyScores(ctx) {
  const bestScoresXPos = 70;
  const bestScoresYPos = 359;
  const boxWidth = 360;
  const boxHeight = 320;
  const bestScoreCenterX = bestScoresXPos + boxWidth / 2;
  let currentYpos = bestScoresYPos + 30;

  drawBorder(ctx, bestScoresXPos, bestScoresYPos, boxWidth, boxHeight);
  drawBoxBackground(ctx, bestScoresXPos, bestScoresYPos, boxWidth, boxHeight);
  ctx.textAlign = "center";
  // Draw title
  drawText(ctx, "Best Scores Today!", bestScoreCenterX, currentYpos, "20px Arial", "white");

  currentYpos += 30;
  // Draw table headers
  drawText(ctx, "Rank", bestScoreCenterX - 120, currentYpos, "16px Arial", "white");
  drawText(ctx, "Score", bestScoreCenterX - 70, currentYpos, "16px Arial", "white");
  drawText(ctx, "Player", bestScoreCenterX + 50, currentYpos, "16px Arial", "white");

  let gap = 5;
  const textHeight = 18;
  if (topDailyScoresString != "") {
    var scores = topDailyScoresString.split("; ");
    for (var i = 0; i < scores.length; i++) {
      let scoreData = scores[i].split(", ");
      currentYpos += gap + textHeight;
      drawText(ctx, (i + 1).toString(), bestScoreCenterX - 120, currentYpos, "14px Arial", "white");
      drawText(ctx, scoreData[0], bestScoreCenterX - 70, currentYpos, "14px Arial", "white");
      drawText(ctx, scoreData[1], bestScoreCenterX + 50, currentYpos, "14px Arial", "white");
    }
  }
}

function drawAchievements(ctx) {
  const boxWidth = 360;
  const boxHeight = 320;
  const achievementsAreaXPos = ctx.canvas.width - boxWidth - 70;
  const achievementsAreaYPos = 359;
  const achievementsAreaCenter = achievementsAreaXPos + boxWidth / 2;
  let currentYPos = achievementsAreaYPos + 30;

  drawBorder(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  drawBoxBackground(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  ctx.textAlign = "center";
  if (_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.achievementsTitle != _login_js__WEBPACK_IMPORTED_MODULE_3__.achievementsTitleText.YOUR_ACHIEVEMENTS) {
    drawText(ctx, _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.achievementsTitle, achievementsAreaCenter, currentYPos + 100, "20px Arial", "white", ctx.textAlign);
    return;
  }
  drawText(ctx, _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.achievementsTitle, achievementsAreaCenter, currentYPos, "20px Arial", "white", ctx.textAlign);
  currentYPos += 30;
  let xp = (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.getXp)();
  let level = (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.getLevel)(xp);
  let remainingNeededNextLevelXP = (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.getXpToNextLevel)(xp);
  let totalNeededNextLevelXP = (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.getNextLevelXP)(xp);

  ctx.textAlign = "left";
  drawText(ctx, "Level: " + level, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);

  const gaugeWidth = 150;
  const gaugeHeight = 30;
  const max = totalNeededNextLevelXP;
  const percentOfFilledAnimatedTo = Math.min(_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.levelAnimationFrame / 60, 1);
  const filled = (totalNeededNextLevelXP - remainingNeededNextLevelXP) * percentOfFilledAnimatedTo;

  currentYPos += 30;
  drawText(ctx, "Kills: " + _db_js__WEBPACK_IMPORTED_MODULE_0__.allTimeKills, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
  currentYPos += 30;
  drawText(ctx, "Points: " + _db_js__WEBPACK_IMPORTED_MODULE_0__.allTimePoints, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
  currentYPos += 40;

  (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_2__.drawFilledGauge)(ctx, achievementsAreaCenter, currentYPos + gaugeHeight / 2, gaugeWidth, gaugeHeight, 3, filled, max, "blue");

  currentYPos += 35;
  drawText(ctx, remainingNeededNextLevelXP + " XP to next level", achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
}

function drawPreGameOverlay(canvas, ctx) {
  drawDailyScores(ctx);
  drawAchievements(ctx);

  // Draw title for pilot selection
  drawText(ctx, "Select Your Pilot", canvas.width / 2, 50, "30px Arial", "white", "center");

  drawBoxBackground(ctx, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.x, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.y, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.width, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.height);

  ctx.strokeStyle = "white";
  ctx.strokeRect(_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.x, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.y, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.width, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.height);

  for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.length; i++) {
    let pilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots[i];
    const carrotCanvas = document.getElementById(pilot.src);
    drawCarrot(ctx, carrotCanvas, pilot.x, pilot.y);

    if (pilot.selected) {
      ctx.lineWidth = 7;
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(pilot.x, pilot.y, pilot.width, pilot.height);
    }
  }

  if (_gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.every((pilot) => !pilot.selected)) {
    loreIndex = 0;
    lineCount = 0;
  }

  let x = _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.x + 60;
  let y = _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.y + 55;

  for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.length; i++) {
    let pilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots[i];
    if (pilot.selected) {
      renderInfoText(ctx, pilot.lore, x, y, 350, pilot.pilotAnimationFrame);
      break;
    }
  }
}

function setupCarrots() {
  const carrot1Canvas = document.getElementById("carrot1Canvas");
  carrot1Canvas.style.display = "none";
  const carrot1Ctx = carrot1Canvas.getContext("2d");
  setupCarrot1(carrot1Ctx);
  const carrot2Canvas = document.getElementById("carrot2Canvas");
  carrot2Canvas.style.display = "none";
  const carrot2Ctx = carrot2Canvas.getContext("2d");
  setupCarrot2(carrot2Ctx);
  const carrot3Canvas = document.getElementById("carrot3Canvas");
  carrot3Canvas.style.display = "none";
  const carrot3Ctx = carrot3Canvas.getContext("2d");
  setupCarrot3(carrot3Ctx);
  const carrot4Canvas = document.getElementById("carrot4Canvas");
  carrot4Canvas.style.display = "none";
  const carrot4Ctx = carrot4Canvas.getContext("2d");
  setupCarrot4(carrot4Ctx);
}
function drawCarrots(ctx, mainX, mainY) {
  const carrot1Canvas = document.getElementById("carrot1Canvas");
  drawCarrot(ctx, carrot1Canvas, mainX, mainY);
  const carrot2Canvas = document.getElementById("carrot2Canvas");
  drawCarrot(ctx, carrot2Canvas, mainX + 120, mainY);
  const carrot3Canvas = document.getElementById("carrot3Canvas");
  drawCarrot(ctx, carrot3Canvas, mainX + 240, mainY);
  const carrot4Canvas = document.getElementById("carrot4Canvas");
  drawCarrot(ctx, carrot4Canvas, mainX + 360, mainY);
}
function drawCarrot(mainCtx, carrotCanvas, mainX, mainY) {
  mainCtx.drawImage(carrotCanvas, mainX, mainY);
}

function drawBackground(ctx, left, top, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(left, top, width, height);
}

function drawCarrotBody(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 50, top + 120);
  ctx.bezierCurveTo(left + 80, top + 10, left + 80, top + 10, left + 50, top + 10);
  ctx.bezierCurveTo(left + 20, top + 10, left + 20, top + 10, left + 50, top + 120);
  ctx.fillStyle = color;
  ctx.fill();

  // Add 3D rounded effect curved lines
  ctx.strokeStyle = "white"; // Color of the curved lines
  ctx.lineWidth = 2; // Adjust the width as needed
  ctx.beginPath();

  let x = left + 27;
  let y = top + 20;
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 5, y - 5, x + 10, y - 2);

  x += 0;
  y += 13;
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 5, y - 5, x + 10, y - 2);

  x += 35;
  y += -5;
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 5, y - 4, x + 10, y + 3);

  ctx.stroke();
}
function drawCarrotTop(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 50, top + 10);
  ctx.lineTo(left + 80, top + 30);
  ctx.lineTo(left + 50, top + 60);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCarrotFace(ctx, left, top, bodyColor) {
  // Draw face
  ctx.beginPath();
  ctx.arc(left + 50, top + 75, 20, 0, Math.PI * 2);
  ctx.fillStyle = bodyColor;
  ctx.fill();
}

function drawCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 70, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 70, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawCarrotMouth(ctx, left, top, mouthColor) {
  // Draw mouth
  ctx.beginPath();
  ctx.arc(left + 50, top + 85, 8, 0, Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = mouthColor;
  ctx.stroke();
}

function drawCarrotLimbs(ctx, left, top, color) {
  drawCarrotArms(ctx, left, top, color);
  // drawCarrotLegs(ctx, left, top, color);
}

function drawOtherCarrotLimbs(ctx, left, top, color) {
  drawCarrotHand(ctx, left, top, color);
}

function drawCarrotLegs(ctx, left, top, color) {
  // Draw legs
  ctx.beginPath();
  ctx.moveTo(left + 50, top + 100);
  ctx.lineTo(left + 30, top + 130);
  ctx.moveTo(left + 50, top + 100);
  ctx.lineTo(left + 70, top + 130);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawCarrotFoot(ctx, left, top, color) {
  ctx.beginPath();
  ctx.arc(left + 50, top + 120, 10, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Draw shoe
  ctx.beginPath();
  ctx.rect(left + 40, top + 120, 20, 10);
  ctx.fillStyle = "black";
  ctx.fill();
}

function drawShortCarrotArms(ctx, left, top, color) {
  // Draw arms
  ctx.beginPath();
  ctx.moveTo(left + 15, top + 70);
  ctx.lineTo(left + 30, top + 80);
  ctx.moveTo(left + 86, top + 70);
  ctx.lineTo(left + 70, top + 80);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawCarrotArms(ctx, left, top, color) {
  // Draw arms
  ctx.beginPath();
  ctx.moveTo(left + 20, top + 60);
  ctx.lineTo(left + 45, top + 85);
  ctx.moveTo(left + 80, top + 60);
  ctx.lineTo(left + 60, top + 77);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawCarrotHand(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 20, top + 70);
  ctx.lineTo(left + 30, top + 80);
  ctx.lineTo(left + 40, top + 70);
  ctx.lineTo(left + 30, top + 60);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Draw carrot
  ctx.beginPath();
  ctx.moveTo(left + 40, top + 70);
  ctx.lineTo(left + 60, top + 70);
  ctx.lineTo(left + 50, top + 80);
  ctx.closePath();
  ctx.fillStyle = "orange";
  ctx.fill();
}

function drawCarrotArmSign(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 20, top + 70);
  ctx.lineTo(left + 30, top + 80);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Draw sign
  ctx.beginPath();
  ctx.rect(left + 30, top + 60, 40, 20);
  ctx.fillStyle = "white";
  ctx.fill();

  // Write text on sign
  ctx.font = "10px Arial";
  ctx.fillStyle = "black";
  ctx.fillText("Carrot", left + 35, top + 75);
}

function drawCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  ctx.ellipse(left + 50, top + 10, 10, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 50, top + 30, 15, 25, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawGoofyCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, Math.PI / 4, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 70, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 70, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawUghCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 70, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 70, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawLookingUpCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 65, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 65, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawLookingDownCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 75, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 75, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();
}

function drawNarrowCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 70, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 70, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();

  // Draw eyelids
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 6, 0, 0, Math.PI);
  ctx.ellipse(left + 55, top + 70, 8, 6, 0, 0, Math.PI);
  ctx.fillStyle = eyeColor;
  ctx.fill();
}

function drawBleedingCarrotEyes(ctx, left, top, eyeColor, pupilColor) {
  // Draw eyes
  ctx.beginPath();
  ctx.ellipse(left + 45, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(left + 55, top + 70, 8, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = eyeColor;
  ctx.fill();

  // Draw pupils
  ctx.beginPath();
  ctx.arc(left + 45, top + 70, 3, 0, Math.PI * 2);
  ctx.arc(left + 55, top + 70, 3, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();

  // Draw heart symbols
  ctx.beginPath();
  ctx.moveTo(left + 45, top + 80);
  ctx.bezierCurveTo(left + 45, top + 80, left + 40, top + 75, left + 45, top + 70);
  ctx.bezierCurveTo(left + 50, top + 75, left + 45, top + 80, left + 45, top + 80);
  ctx.moveTo(left + 55, top + 80);
  ctx.bezierCurveTo(left + 55, top + 80, left + 50, top + 75, left + 55, top + 70);
  ctx.bezierCurveTo(left + 60, top + 75, left + 55, top + 80, left + 55, top + 80);
  ctx.fillStyle = "red";
  ctx.fill();
}

function drawScaredCarrotMouth(ctx, left, top, mouthColor) {
  // Draw mouth (scared)
  ctx.beginPath();
  ctx.arc(left + 50, top + 95, 8, 0, Math.PI, true); // Inverted arc for a scared mouth
  ctx.lineWidth = 2;
  ctx.strokeStyle = mouthColor;
  ctx.stroke();
}

function drawGrumpyCarrotMouth(ctx, left, top, mouthColor) {
  // Draw mouth (grumpy)
  ctx.beginPath();
  ctx.moveTo(left + 40, top + 90);
  ctx.lineTo(left + 60, top + 90); // Straight line for a grumpy mouth
  ctx.lineWidth = 2;
  ctx.strokeStyle = mouthColor;
  ctx.stroke();
}

function drawSurprisedCarrotMouth(ctx, left, top, mouthColor) {
  // Draw mouth (surprised)
  ctx.beginPath();
  ctx.arc(left + 50, top + 90, 3, 0, Math.PI * 2); // Circle for a surprised mouth
  ctx.lineWidth = 2;
  ctx.strokeStyle = mouthColor;
  ctx.stroke();
}

function drawHappyCarrotMouth(ctx, left, top, mouthColor) {
  // Draw mouth (happy)
  ctx.beginPath();
  ctx.arc(left + 50, top + 85, 8, 0, Math.PI, false); // Smiling arc for a happy mouth
  ctx.lineWidth = 2;
  ctx.strokeStyle = mouthColor;
  ctx.stroke();
}

function drawCurlyCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    let x = left + 50 + 10 * Math.cos(i);
    let y = top + 10 * Math.sin(i);
    ctx.arc(x, y, 5, 0, Math.PI * 2, false);
  }
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPigtailsCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 30, top + 10);
  ctx.bezierCurveTo(left + 30, top + 30, left + 20, top + 50, left + 30, top + 70);
  ctx.moveTo(left + 70, top + 10);
  ctx.bezierCurveTo(left + 70, top + 30, left + 80, top + 50, left + 70, top + 70);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawLongFlowingCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  top -= 20;
  left += 5;
  for (let i = -20; i <= 20; i += 4) {
    let rand = Math.random() * 10;
    ctx.moveTo(left + 50 + i, top);
    ctx.bezierCurveTo(left + 50 + i, top + 20, left + 30 + i + rand, top + 40 + rand, left + 50 + i, top + 60);
  }
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawAfroCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  for (let i = 0; i < 360; i += 10) {
    let x = left + 50 + 30 * Math.cos((i * Math.PI) / 180);
    let y = top + 20 + 30 * Math.sin((i * Math.PI) / 180);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSpikeCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    let x = left + 50 + 20 * Math.cos((i * Math.PI) / 2.5);
    let y = top + 20 * Math.sin((i * Math.PI) / 2.5);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function setupCarrot1(carrotCtx) {
  let left = 0;
  let top = 0;

  drawBackground(carrotCtx, left, top, 100, 130, "lightblue");
  drawCarrotBody(carrotCtx, left, top, "orange");
  drawCarrotEyes(carrotCtx, left, top - 15, "white", "black");
  drawCarrotMouth(carrotCtx, left, top - 15, "black");

  drawCarrotGreens(carrotCtx, left, top - 20, "darkgreen");
  drawCarrotLimbs(carrotCtx, left, top, "orange");
}

function setupCarrot2(carrotCtx) {
  let left = 0;
  let top = 0;

  drawBackground(carrotCtx, left, top, 100, 130, "lightblue");
  drawFatCarrotBody(carrotCtx, left, top, "orange");
  drawUghCarrotEyes(carrotCtx, left, top, "white", "black");
  drawScaredCarrotMouth(carrotCtx, left, top, "black");
  drawLongFlowingCarrotGreens(carrotCtx, left, top, "green");
  drawShortCarrotArms(carrotCtx, left, top, "orange");
  drawCarrotLegs(carrotCtx, left, top, "orange");
}

function setupCarrot3(carrotCtx) {
  let left = 0;
  let top = 0;

  drawBackground(carrotCtx, left, top, 100, 130, "lightblue");
  drawCarrotLimbs(carrotCtx, left, top, "orange");
  drawThinCarrotBody(carrotCtx, left, top, "orange");

  drawNarrowCarrotEyes(carrotCtx, left, top, "white", "black");
  drawGrumpyCarrotMouth(carrotCtx, left, top, "black");
  drawCarrotGreens(carrotCtx, left, top, "green");
}

function setupCarrot4(carrotCtx) {
  let left = 0;
  let top = 0;

  drawBackground(carrotCtx, left, top, 100, 130, "lightblue");
  drawCarrotLimbs(carrotCtx, left, top, "orange");
  drawCarrotBody(carrotCtx, left, top, "orange");

  drawBleedingCarrotEyes(carrotCtx, left, top, "white", "black");
  drawSurprisedCarrotMouth(carrotCtx, left, top, "black");
}

function drawUprightCarrotGreens(ctx, left, top, color) {
  ctx.beginPath();
  ctx.fillRect(left + 45, top - 20, 10, 20);
  ctx.fillRect(left + 55, top - 30, 10, 30);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFatCarrotBody(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 50, top + 10);
  ctx.bezierCurveTo(left + 90, top + 10, left + 90, top + 70, left + 50, top + 120); // Wider bezier curves for a fatter body
  ctx.bezierCurveTo(left + 10, top + 70, left + 10, top + 10, left + 50, top + 10);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawThinCarrotBody(ctx, left, top, color) {
  ctx.beginPath();
  ctx.moveTo(left + 50, top + 10);
  ctx.bezierCurveTo(left + 70, top + 10, left + 70, top + 70, left + 50, top + 120); // Narrower bezier curves for a thinner body
  ctx.bezierCurveTo(left + 30, top + 70, left + 30, top + 10, left + 50, top + 10);
  ctx.fillStyle = color;
  ctx.fill();
}

function renderInfoText(ctx, text, x, y, maxWidth, animationFrame) {
  // Set font and color
  ctx.textAlign = "start";
  let sections = text.split(";");
  let currentY = y;

  for (let i = 0; i < sections.length; i++) {
    let section = sections[i].trim();

    // Determine font size and line height based on section index
    let fontSize;
    let lineHeight;
    if (i === 0) {
      // First section (title) should be the biggest
      fontSize = 50;
      lineHeight = fontSize * 1.1; // Adjust the multiple as needed
    } else if (i === sections.length - 1 || i === sections.length - 2) {
      // Last sections (description) should be the smallest
      fontSize = 20;
      lineHeight = fontSize * 1.1; // Adjust the multiple as needed
    } else {
      // Other sections can have a default size
      fontSize = 33;
      lineHeight = fontSize * 1.2; // Adjust the multiple as needed
    }

    ctx.font = fontSize + "px Gothic";
    ctx.fillStyle = "coral";

    if (i === 1 && section.startsWith("Speed:")) {
      const speedValue = parseInt(section.split(":")[1].trim());
      if (!isNaN(speedValue)) {
        currentY = drawSectionGauge(ctx, animationFrame, fontSize, lineHeight, "Speed:", speedValue, 5, "blue", x, currentY);
        continue;
      }
    }

    if (i === 2 && section.startsWith("Invicible Time:")) {
      const invincibleValue = parseInt(section.split(":")[1].trim());
      if (!isNaN(invincibleValue)) {
        currentY = drawSectionGauge(ctx, animationFrame, fontSize, lineHeight, "Invicible Time:", invincibleValue, 15, "green", x, currentY);
        continue;
      }
    }

    let words = section.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
    currentY += lineHeight; // Move to the next section
  }
}

function drawSectionGauge(ctx, animationFrame, fontSize, lineHeight, label, value, max, color, x, currentY) {
  const percentOfFilledAnimatedTo = Math.min(animationFrame / 30, 1);

  ctx.fillText(label, x, currentY);

  const centerX = x + ctx.measureText(label).width + 50;
  const gaugeWidth = 100;
  const gaugeHeight = fontSize;
  const filled = value * percentOfFilledAnimatedTo;

  (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_2__.drawFilledGauge)(ctx, centerX, currentY + 15, gaugeWidth, gaugeHeight, 3, filled, max, color);
  currentY += lineHeight;
  return currentY;
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
    ctx.fillText(lore[loreIndex], _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.x + 50 + loreIndex * 10, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.loreTablet.y + 130 + lineCount * 20);

    loreIndex++;
  }
}
function drawInputField(canvas, ctx, inputText, x, y, width, height, inputTitle) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  // ctx.font = "12px Arial";

  if (inputTitle) {
    ctx.fillStyle = "white";
    // Draw title
    ctx.fillText(inputTitle, canvas.width / 2, y + 15);
  }
  // Draw input field background
  ctx.fillStyle = "white";
  ctx.fillRect(x, y, width, height); // Adjust the width and height as needed

  ctx.font = "20px Arial";
  ctx.fillStyle = "black";
  let ogTextAlign = ctx.textAlign;
  ctx.textAlign = "center";
  // Calculate the center of the box
  let centerX = x + width / 2;
  let centerY = y + 15;

  // Calculate the width of the text
  let textWidth = ctx.measureText(inputText).width;

  //text align center so we can just aim at the middle
  let textStartX = centerX;
  // Draw player's name
  ctx.fillText(inputText, textStartX, centerY);

  // Draw the cursor just to the right of the text
  if (document.hasFocus()) {
    drawTextCursor(ctx, textStartX + textWidth / 2, centerY - 10);
  }

  ctx.textAlign = ogTextAlign;
}

function drawCursor(ctx, x, startY, endY) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, startY);
  ctx.lineTo(x, endY);
  ctx.stroke();
}

function drawNameEntry(canvas, ctx, name, x, y) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.font = "12px Arial";

  // Draw background
  ctx.fillStyle = "white";
  let enterNameText = "Enter Your Name";
  ctx.fillText(enterNameText, canvas.width / 2, y + 15);

  // Draw name entry box
  ctx.strokeStyle = "white";
  ctx.strokeRect(x, y, 200, 100);

  let inputFieldWidth = 180;

  // Draw player's name using the new drawInputField function
  drawInputField(canvas, ctx, name, x + 10, y + 30, inputFieldWidth, 30);

  // Draw play button
  let buttonX = x + 50;
  let buttonY = y + 70;
  let buttonWidth = 100;
  let buttonHeight = 20;
  let radius = 10; // Radius for rounded corners

  drawButton(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius, "Play");
  playButtonX = buttonX;
  playButtonY = buttonY;
  playButtonWidth = buttonWidth;
  playButtonHeight = buttonHeight;
}

function drawButton(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius, text, color1 = "green", color2 = "darkgreen") {
  // Create gradient
  let gradient;
  try {
    gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
  } catch (Exception) {
    console.log("gradient issue");
  }

  (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.drawRoundedRectangle)(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius);

  // Write "Play" on the button
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

function drawTextCursor(ctx, x, y) {
  if (cursorBlink) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "transparent";
  }

  if (x && y) {
    ctx.fillRect(x, y, 2, 20);
  }
}

function drawTextCursorFromText(ctx, text) {
  let x = 0;
  let y = 0;

  drawTextCursor(ctx, x, y);
}


/***/ }),

/***/ "./collisionLogic.js":
/*!***************************!*\
  !*** ./collisionLogic.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HitByType: () => (/* binding */ HitByType),
/* harmony export */   checkForcesCollision: () => (/* binding */ checkForcesCollision),
/* harmony export */   checkMineCollision: () => (/* binding */ checkMineCollision),
/* harmony export */   checkPlayerCollision: () => (/* binding */ checkPlayerCollision),
/* harmony export */   checkPowerupCollision: () => (/* binding */ checkPowerupCollision),
/* harmony export */   detectCollisions: () => (/* binding */ detectCollisions),
/* harmony export */   isSpokeCollision: () => (/* binding */ isSpokeCollision),
/* harmony export */   mineScale: () => (/* binding */ mineScale),
/* harmony export */   shipScale: () => (/* binding */ shipScale)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entities.js */ "./entities.js");





//if mess with these need to change the collision detection - factor these in
const shipScale = 2;
const mineScale = 0.7;

const HitByType = {
  MINE: "a mine",
};

function detectCollisions(playerToCheck, globalPowerUps, bots, otherPlayers, forces) {
  // Detect collisions between the player's ship and the powerups or other ships
  // If a collision is detected, update the game state accordingly
  checkPowerupCollision(playerToCheck, globalPowerUps);
  checkMineCollision(playerToCheck, _main_js__WEBPACK_IMPORTED_MODULE_0__.mines);
  let allPlayers = [...bots, ...otherPlayers, _main_js__WEBPACK_IMPORTED_MODULE_0__.player];
  checkPlayerCollision(playerToCheck, allPlayers);
  checkForcesCollision(playerToCheck, forces);
}

function checkPowerupCollision(playerToCheck, globalPowerUps) {
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 * shipScale + globalPowerUps[i].radius && globalPowerUps[i].hitFrames == -1) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.ticksSincePowerUpCollection == -1) {
        //may need to make this an array of "recently collected / iteracted stuff" to be more robust in the future rather than a simple power up timer
        // playerToCheck.powerUps += globalPowerUps[i].value;
        let scoreToAdd = globalPowerUps[i].value;

        playerToCheck.gotPowerUp(globalPowerUps[i].isStar, scoreToAdd, i);
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
          (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendPowerUpsUpdate)(false);
        }
      }
      // sendPowerups(globalPowerUps);

      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      // break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
    }
  }
}
//todo more generic entity based collision function, maybe each entity has its own action upon collision
function checkMineCollision(playerToCheck, mines) {
  for (let i = 0; i < mines.length; i++) {
    let mine = mines[i];

    if (mineCollided(mine, playerToCheck)) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.isVulnerable() && mine.hitFrames == -1 && (mine.playerId == "" || mine.playerId != playerToCheck.id)) {
        if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.REGULAR) {
          playerToCheck.gotHit(HitByType.MINE);
        } else {
          resolveMineHit(playerToCheck, mine, _main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers, _main_js__WEBPACK_IMPORTED_MODULE_0__.bots, _main_js__WEBPACK_IMPORTED_MODULE_0__.player);
        }
        mine.hitFrames = 2;
        // mines.splice(i, 1);
      }
      // if (playerToCheck.invincibleTimer > 0 && !playerToCheck.isInSpawnProtectionTime() && mines[i].hitFrames == -1) {
      //if invincible ignore spawn protection
      if (playerToCheck.isInvincible() && mine.hitFrames == -1 && (mine.playerId == "" || mine.playerId != playerToCheck.id)) {
        if (playerToCheck.invincibleTimer > 115) {
          if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.REGULAR) {
            playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 100);
          } else if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.TRAIL) {
            playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 30);
          } else {
            resolveMineHit(playerToCheck, mine, _main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers, _main_js__WEBPACK_IMPORTED_MODULE_0__.bots, _main_js__WEBPACK_IMPORTED_MODULE_0__.player);
          }
        } else {
          //always leave a little bit of time to tick away (but don't increase if time already ticked nearly away)
          playerToCheck.setInvincibleTimer(Math.min(playerToCheck.invincibleTimer, 15));
        }
        mine.hitFrames = 2;
        let effectID = Math.floor(Math.random() * 10000);

        let effect = new _entities_js__WEBPACK_IMPORTED_MODULE_3__.Effect(effectID, mine.x, mine.y, 50, 30, "OrangeRed", _entities_js__WEBPACK_IMPORTED_MODULE_3__.EffectType.EXPLOSION);
        _entities_js__WEBPACK_IMPORTED_MODULE_3__.effects.push(effect);
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
          (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendEffectsUpdate)(true);
        }
        // mines.splice(i, 1);
      }
      // sendPowerups(globalPowerUps);
      // setMines(mines);
      if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
        (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendMinesUpdate)(true, true);
      }
      // break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
    }
  }
}

function mineCollided(mine, playerToCheck) {
  let collision = false;
  const relativeX = playerToCheck.x - mine.x;
  const relativeY = playerToCheck.y - mine.y;

  if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.REGULAR) {
    // Same as before, no changes needed
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    if (distance < 10 * shipScale + mine.radius) {
      collision = true;
    }
  } else if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.TRAIL) {
    // Calculate the ship's position in local coordinates of the mine
    const localX = relativeX * Math.cos(-mine.angle) - relativeY * Math.sin(-mine.angle);
    const localY = relativeX * Math.sin(-mine.angle) + relativeY * Math.cos(-mine.angle);

    // Calculate half of the trailLength and half of the trailWidth
    const halfTrailLength = mine.length / 2;
    const halfTrailWidth = mine.width / 2;

    // Check if the player is within the bounds of the end circles
    const inCircle1 = localX * localX + (localY - halfTrailLength) * (localY - halfTrailLength) < halfTrailWidth * halfTrailWidth;
    const inCircle2 = localX * localX + (localY + halfTrailLength) * (localY + halfTrailLength) < halfTrailWidth * halfTrailWidth;

    // Check if the player is within the bounds of the rectangle
    const inRectangle = Math.abs(localX) <= halfTrailWidth && Math.abs(localY) <= halfTrailLength;

    // If the player is within any of the shapes, there is a collision
    if (inCircle1 || inCircle2 || inRectangle) {
      collision = true;
    }
  }

  return collision;
}

function checkPlayerCollision(playerToCheck, allPlayers) {
  for (let i = 0; i < allPlayers.length; i++) {
    let hitCandidate = allPlayers[i];
    if (playerToCheck.id == hitCandidate.id) {
      //don't check collision against self
      continue;
    }
    if (playerToCheck.timeSinceSentMessageThatWasRecieved > 120) {
      //don't check collision against idle player
      continue;
    }
    let dx = playerToCheck.x - hitCandidate.x;
    let dy = playerToCheck.y - hitCandidate.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // treating hitbox/hurtbox of both ships as simple radius for now
    if (
      distance < 20 * shipScale &&
      playerToCheck.isPlaying == true &&
      hitCandidate.isPlaying == true &&
      !playerToCheck.isDead &&
      !hitCandidate.isDead &&
      !hitCandidate.timeSinceSentMessageThatWasRecieved <= 120 &&
      !(_main_js__WEBPACK_IMPORTED_MODULE_0__.player.name == "" && _main_js__WEBPACK_IMPORTED_MODULE_0__.player.pilot == "")
    ) {
      handlePlayerHit(playerToCheck, hitCandidate);
      handlePlayerHit(hitCandidate, playerToCheck);
    }
  }
}

function handlePlayerHit(playerOne, playerTwo) {
  if (playerTwo.isVulnerable()) {
    if (playerOne.isTangible()) {
      playerTwo.gotHit(playerOne.name, playerOne.isVulnerable());
    }
    // if (playerTwo.isBot) {
    //   playerTwo.delayReset(botRespawnDelay, true, true);
    // }
  }
  if (playerTwo.isInvincible() && playerOne.isVulnerable()) {
    playerTwo.hitOtherPlayer(playerOne);
  }
}

function checkForcesCollision(playerToCheck, forces) {
  for (let force of forces) {
    if (force.type == _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.DIRECTIONAL) {
      //for now we make directional forces not expire naturally
      force.duration = 10;
    }
    if (playerToCheck == force.tracks) {
      continue;
    }
    if (playerToCheck != null && force.tracks != null && playerToCheck.id === force.tracks.id && playerToCheck.name === force.tracks.name) {
      continue;
    }

    // Calculate the vector from the force to the player
    const dx = playerToCheck.x - force.x;
    const dy = playerToCheck.y - force.y;

    // Calculate the distance between the player and the force
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the angle between the ship's direction and the vector to the player
    const angleToPlayer = Math.atan2(dy, dx);
    const angleDifference = Math.abs(force.direction - angleToPlayer);

    if (force.type == _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.POINT) {
      // Check if the player is within the cone and distance range
      if (distance > force.radius || (angleDifference > force.coneAngle / 2 && force.coneAngle < 2 * Math.PI - 0.01)) {
        continue;
      }
      playerToCheck.inForce += 2;
      // Calculate the proportional force strength
      let strength = 0;
      const maxForce = force.force;

      if (distance > 0 && distance <= 50) {
        // Calculate strength based on the inverse square of the distance
        // strength = force.force / 2500 / (distance * distance);
        strength = maxForce;
      } else if (distance > 50 && distance <= force.radius) {
        // Gradual decrease in force from max at 50 to 40% at force.radius
        const minForce = 0.6 * maxForce;
        const forceRange = maxForce - minForce;
        const distanceRange = force.radius - 50;
        const forceIncrement = forceRange / distanceRange;
        strength = maxForce - forceIncrement * (distance - 50);
      }

      // Calculate the force components
      let forceX = (dx / distance) * strength;
      let forceY = (dy / distance) * strength;

      if (force.isAttractive) {
        forceX *= -1;
        forceY *= -1;
      }

      // Apply the force to playerToCheck's velocity
      playerToCheck.vel.x += forceX;
      playerToCheck.vel.y += forceY;
      playerToCheck.boundVelocity();
    } else if (force.type == _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.DIRECTIONAL) {
      // Calculate the vector from the force to the player
      const dx = playerToCheck.x - force.x;
      const dy = playerToCheck.y - force.y;

      // Rotate the player's position relative to the force direction
      const rotatedX = dx * Math.cos(-force.direction) - dy * Math.sin(-force.direction);
      const rotatedY = dx * Math.sin(-force.direction) + dy * Math.cos(-force.direction);

      // Calculate half of the width and length of the rectangle
      const halfWidth = force.width / 2;
      const halfLength = force.length / 2;

      // Check if the player is within the rotated rectangle and distance range
      if (Math.abs(rotatedX) <= halfWidth && Math.abs(rotatedY) <= halfLength) {
        playerToCheck.inForce += 5;
        // Calculate the proportional force strength
        let strength = 0;
        const maxForce = force.force;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance <= halfLength) {
          // Gradual decrease in force from max at 0 to 40% at halfLength
          const minForce = 0.6 * maxForce;
          const forceRange = maxForce - minForce;
          strength = maxForce - (distance / halfLength) * forceRange;
        }

        // Calculate the force components based on the force's direction
        const forceX = Math.cos(force.direction) * strength;
        const forceY = Math.sin(force.direction) * strength;

        if (force.isAttractive) {
          // If the force is attractive, apply it in the opposite direction
          playerToCheck.vel.x += -forceX;
          playerToCheck.vel.y += -forceY;
        } else {
          // If the force is repulsive, apply it in the specified direction
          playerToCheck.vel.x += forceX;
          playerToCheck.vel.y += forceY;
        }

        playerToCheck.boundVelocity();
      }
    }
  }
}

function isSpokeCollision(entity, playerRadius, centerX, centerY, angle, spokeLength, spokeWidth) {
  let playerX = entity.x;
  let playerY = entity.y;
  // Check for collision with each of the 8 spokes (or 4 diameters)
  for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += 45) {
    const spokeAngleRadians = (angleDegrees + angle) * (Math.PI / 180); // Convert to radians

    // Calculate the start and end points of the spoke
    const spokeStartX = centerX;
    const spokeStartY = centerY;
    const spokeEndX = centerX + spokeLength * Math.cos(spokeAngleRadians);
    const spokeEndY = centerY + spokeLength * Math.sin(spokeAngleRadians);

    // Calculate the vector from the player's position to the spoke's start point
    const dx = spokeStartX - playerX;
    const dy = spokeStartY - playerY;

    // Calculate the dot product of the vector from player to spoke and the spoke's direction vector
    const dotProduct = dx * (spokeEndX - spokeStartX) + dy * (spokeEndY - spokeStartY);

    // Check if the player is within the length of the spoke
    if (dotProduct >= 0 && dotProduct <= spokeLength * spokeLength) {
      // Calculate the perpendicular distance from the player to the spoke
      const distance = Math.abs(dx * (spokeEndY - spokeStartY) - dy * (spokeEndX - spokeStartX)) / spokeLength;

      // Check if the distance is less than the player's radius plus half of the spoke width
      if (distance <= playerRadius + spokeWidth / 2) {
        return true; // Collision detected with this spoke
      }
    }
  }

  // No collision with any spoke
  return false;
}

function resolveMineHit(playerToCheck, mine, otherPlayers, bots, player) {
  let mineOwner = otherPlayers.find((otherPlayer) => otherPlayer.id == mine.playerId);
  if (!mineOwner) {
    mineOwner = bots.find((bot) => bot.id == mine.playerId);
  }
  if (!mineOwner) {
    if (player.id == mine.playerId) {
      mineOwner = player;
    }
  }
  if (mineOwner) {
    playerToCheck.gotHit(mineOwner.name);
    mineOwner.hitOtherPlayer(playerToCheck);
  } else {
    playerToCheck.gotHit(HitByType.MINE);
  }
}


/***/ }),

/***/ "./connectionHandlers.js":
/*!*******************************!*\
  !*** ./connectionHandlers.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   attemptConnections: () => (/* binding */ attemptConnections),
/* harmony export */   checkAndReplaceConnection: () => (/* binding */ checkAndReplaceConnection),
/* harmony export */   checkAndReplaceConnectionsFromId: () => (/* binding */ checkAndReplaceConnectionsFromId),
/* harmony export */   chooseNewMasterPeer: () => (/* binding */ chooseNewMasterPeer),
/* harmony export */   compression: () => (/* binding */ compression),
/* harmony export */   connectToPeers: () => (/* binding */ connectToPeers),
/* harmony export */   connectedPeers: () => (/* binding */ connectedPeers),
/* harmony export */   connections: () => (/* binding */ connections),
/* harmony export */   createPeer: () => (/* binding */ createPeer),
/* harmony export */   createResolveConflictsWrapper: () => (/* binding */ createResolveConflictsWrapper),
/* harmony export */   everConnected: () => (/* binding */ everConnected),
/* harmony export */   getPeer: () => (/* binding */ getPeer),
/* harmony export */   getPlayerId: () => (/* binding */ getPlayerId),
/* harmony export */   isPlayerMasterPeer: () => (/* binding */ isPlayerMasterPeer),
/* harmony export */   peerIds: () => (/* binding */ peerIds),
/* harmony export */   removeClosedConnections: () => (/* binding */ removeClosedConnections),
/* harmony export */   setConnectedPeers: () => (/* binding */ setConnectedPeers),
/* harmony export */   setMasterPeerId: () => (/* binding */ setMasterPeerId),
/* harmony export */   setTicksSinceLastConnectionAttempt: () => (/* binding */ setTicksSinceLastConnectionAttempt),
/* harmony export */   setTicksSinceLastFullSendRequestResponse: () => (/* binding */ setTicksSinceLastFullSendRequestResponse),
/* harmony export */   setTimeSinceAnyMessageRecieved: () => (/* binding */ setTimeSinceAnyMessageRecieved),
/* harmony export */   setTimeSinceMessageFromMaster: () => (/* binding */ setTimeSinceMessageFromMaster),
/* harmony export */   ticksSinceLastConnectionAttempt: () => (/* binding */ ticksSinceLastConnectionAttempt),
/* harmony export */   ticksSinceLastFullSendRequestResponse: () => (/* binding */ ticksSinceLastFullSendRequestResponse),
/* harmony export */   timeSinceAnyMessageRecieved: () => (/* binding */ timeSinceAnyMessageRecieved),
/* harmony export */   timeSinceMessageFromMaster: () => (/* binding */ timeSinceMessageFromMaster),
/* harmony export */   versionNumber: () => (/* binding */ versionNumber),
/* harmony export */   wrappedResolveConflicts: () => (/* binding */ wrappedResolveConflicts)
/* harmony export */ });
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");
/* harmony import */ var _handleData_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./handleData.js */ "./handleData.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./player.js */ "./player.js");





let everConnected = false;
let connections = [];
const compression = false;

let versionNumber = 115;
let peerIds = [
  "a7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "b7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "c7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "d7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "e7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "a6ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "b6ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
];
if (!compression) {
  peerIds = [
    "a7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "b7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "c7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "d7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "e7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "a6ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "b6ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
  ];
}
let reconnectionAttempts = 0;
(0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_0__.shuffleArray)(peerIds);
let ticksSinceLastConnectionAttempt = 0;
function setTicksSinceLastConnectionAttempt(newTime) {
  ticksSinceLastConnectionAttempt = newTime;
}
let ticksSinceLastFullSendRequestResponse = 0;
function setTicksSinceLastFullSendRequestResponse(newTime) {
  ticksSinceLastFullSendRequestResponse = newTime;
}
let masterPeerId = peerIds[0]; // start off with the first peer as the master
function setMasterPeerId(newID) {
  masterPeerId = newID;
}
let timeSinceMessageFromMaster = 0;
function setTimeSinceMessageFromMaster(newTime) {
  timeSinceMessageFromMaster = newTime;
}
let timeSinceAnyMessageRecieved = 0;
function setTimeSinceAnyMessageRecieved(newTime) {
  timeSinceAnyMessageRecieved = newTime;
}
const wrappedResolveConflicts = createResolveConflictsWrapper();

let index = 0;

let peer;
let connectedPeers = [];
function setConnectedPeers(newConnectedPeers) {
  connectedPeers = newConnectedPeers;
}
let connectionBackOffTime = 0;

// Wait for a short delay to allow time for the connections to be attempted
function attemptConnections(player, otherPlayers, globalPowerUps, addHandlers = true, connectPeers = true) {
  if (player.id === null) {
    console.log("in attemptConnections Player id is null");
    connectionBackOffTime = (connectionBackOffTime + 500) * 2;
    setTimeout(() => createPeer(player, otherPlayers, globalPowerUps), connectionBackOffTime);
    return;
  }
  verifyPeerHealth(player, otherPlayers, globalPowerUps);
  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    everConnected = true;

    if (addHandlers) {
      addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
    }
    if (!connectedPeers.includes(conn.peer)) {
      connectedPeers.push(conn.peer);
    }
    connectedPeers.sort();

    masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    conn.on("close", function () {
      console.log("Connection closed with peer:", conn.peer);
      connectedPeers = connectedPeers.filter((id) => id !== conn.peer);
      connectedPeers.sort();
      masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    });
  });

  peer.on("error", function (err) {
    //console.log("PeerJS error:");
  });

  peer.on("disconnected", function () {
    console.log("Disconnected from server");

    // If the master peer has disconnected, choose a new master peer
    // if (isPlayerMasterPeer(player)) {
    masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    createPeer(player, otherPlayers, globalPowerUps);
    //  }
  });
  if (connectPeers) {
    connectToPeers(player, otherPlayers, globalPowerUps);
  }
}

function isPlayerMasterPeer(player) {
  if (player.id == null) {
    return true;
  }
  return player.id === masterPeerId;
}

function connectToPeers(player, otherPlayers, globalPowerUps) {
  // Connect to the other peers
  peerIds.forEach((id) => {
    if (id !== player.id) {
      checkAndReplaceConnectionsFromId(id, player, otherPlayers, globalPowerUps);
    }
  });
}

function checkAndReplaceConnectionsFromId(id, player, otherPlayers, globalPowerUps) {
  // Check if a connection with this id already exists
  let existingConnection = connections.find((conn) => conn.peer === id);
  if (!existingConnection || !existingConnection.open) {
    // If the connection doesn't exist or is closed, retry it
    let conn = null;
    verifyPeerHealth(player, otherPlayers, globalPowerUps);
    if (peer && !peer.disconnected) {
      conn = peer.connect(id);
    } else {
      console.log("peer undefined/closed/disconneced in connect to peers");
      if (peer) {
        // console.log("peer open: " + peer.open);
        // console.log("peer disconnected: " + peer.disconnected);
      }
    }
    checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps);
  } else {
    // The existing connection is open, so no action needed
  }
}

function checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps) {
  if (conn != null && conn != undefined) {
    // If the connection was successfully (re)established, update or replace it
    if (existingConnection) {
      // If there was an existing connection, replace it with the new one
      const index = connections.indexOf(existingConnection);
      if (index !== -1) {
        connections.splice(index, 1, conn);
      }
    } else {
      // If there wasn't an existing connection, add the new one to the array
      connections.push(conn);
    }
    everConnected = true;
    //todo carefully assess result of removing this
    addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
  }
}

function createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts = -1) {
  if (!reconnectionAttempts == -1) {
    reconnectionAttempts++;
    let rand = Math.random();
    if (reconnectionAttempts > 20) {
      if (rand > 0.1) {
        return;
      }
    }
    if (reconnectionAttempts > 10) {
      if (rand > 0.2) {
        return;
      }
    }
    if (reconnectionAttempts > 3) {
      if (rand > 0.5) {
        return;
      }
    }
  }
  if (index >= peerIds.length) {
    console.log("All IDs are in use - createPeer function");
    resolveConnectionConflicts(player, otherPlayers, globalPowerUps);
    return;
  }

  let id = peerIds[index];
  setPeer(new Peer(id)); // Assign the new Peer to the peer variable
  verifyPeerHealth(player, otherPlayers, globalPowerUps);
  peer.on("open", function () {
    // If the ID is already in use, this will not be called
    player.id = id;
    //when we connect initially we set ourselves as master
    masterPeerId = id;
    // Add the local player's ID to the connectedPeers array //why is our id in this list?
    connectedPeers.push(id);
    console.log("My peer ID is: " + id);
    attemptConnections(player, otherPlayers, globalPowerUps, true, true);
  });

  peer.on("error", function (err) {
    // If the ID is already in use, an error will be thrown
    if (err.type === "unavailable-id") {
      console.log("ID is in use:", id);
      index++;

      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    } else if (err.type === "browser-incompatible") {
      console.log("browser incompatible:", err);
    } else if (err.type === "network") {
      console.log("network error :", err);
      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    } else {
      console.log("Other error:", err);
    }
  });
  peer.on("close", () => {
    //peer.destroy();
    // console.log("Connection to signaling server closed. Attempting to reconnect...");
    // createPeer(player, otherPlayers, globalPowerUps);
    console.log("Connection to signaling server closed. ");
    if (peer.disconnected) {
      peer.destroy();
      createPeer(player, otherPlayers, globalPowerUps);
    }
  });
}

function verifyPeerHealth(player, otherPlayers, globalPowerUps) {
  // Check if peer.disconnected is true
  if (peer.disconnected) {
    console.log("peer was disconnected");
    try {
      // Attempt to reconnect
      peer.reconnect();
    } catch (error) {
      console.log("error reconnecting peer: " + error);
      index = 0;
      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    }
  }
}
function addConnectionHandlers(player, otherPlayers, conn, globalPowerUps) {
  // console.log("adding connection handlers");
  conn.on("open", function () {
    console.log("Connection opened with peer:", conn.peer);
    // Check if a connection with the same peer already exists
    const existingConnection = connections.find((existingConn) => existingConn.peer === conn.peer);

    if (existingConnection) {
      // // Close the existing connection
      // existingConnection.close();
      // // Remove the existing connection from the connections array
      // const index = connections.indexOf(existingConnection);
      // if (index !== -1) {
      //   connections.splice(index, 1);
      // }
    } else {
      // Push the new connection
      // connections.push(conn);
    }
    //not sure why this seems to be needed even if there is existing connection
    // connections.push(conn);
    checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps);
    let existingOtherPlayer = otherPlayers.some((player) => player.id === conn.peer);

    //todo check consequennces of removing below - I don't think we should be adding player to list based on connect
    if (!existingOtherPlayer) {
      let otherPlayerData = new _player_js__WEBPACK_IMPORTED_MODULE_3__.Player(conn.peer, -200, -200, 0, "blue", 0, "", "", player.worldDimensions, player.colors);
      otherPlayers.push(otherPlayerData);
      if (!connectedPeers.includes(otherPlayerData.id)) {
        connectedPeers.push(otherPlayerData.id);
      }
      connectedPeers.sort();
    }

    if (isPlayerMasterPeer(player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendEntitiesState)(conn.peer);
    }
  });

  conn.on("error", function (err) {
    console.log("Connection error with peer:", conn.peer, ", error:", err);
  });

  conn.on("close", function () {
    console.log("Connection closed with peer:", conn.peer);
    // Remove player from otherPlayers array
    otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
    //todo should remove from connnections too?
  });

  conn.on("data", function (data) {
    if (!data) {
      return;
    }
    if (compression) {
      // Decompress the data using Pako
      const inflatedData = pako.inflate(data);

      // Convert the decompressed Uint8Array directly to a JavaScript object
      data = JSON.parse(new TextDecoder().decode(inflatedData));
    }
    //console.log("Received data:", data);
    if ((data && data.id) || (data && data.gameState) || (data && data.requestForFullStates) || (data && data.requestFullUpdate)) {
      (0,_handleData_js__WEBPACK_IMPORTED_MODULE_1__.handleData)(player, otherPlayers, globalPowerUps, data);
    } else {
      console.log("Received unexpected data:", data);
    }
    // If there is a conflict between the local game state and the received game state,
    // update the local game state to match the received game state
    //todo not sure why this was a good place to do this but do need to have times to call this to try to resync
    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  });
}

function getPeer() {
  return peer;
}

function setPeer(newPeer) {
  peer = newPeer;
}

function removeClosedConnections(otherPlayers) {
  connections.forEach((conn, index) => {
    if (conn && conn.closed) {
      console.log("Connection closed with peer:", conn.peer);
      otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
      connections.splice(index, 1); // Remove the connection from the connections array
    } else if (!conn) {
      console.log("Connection null, removing from otherplayers list and from connections", conn.peer);
      otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
      connections = connections.filter((player) => player.id !== conn.peer);
    }
  });
}

function getPlayerId() {
  return id;
}

function chooseNewMasterPeer(player, otherPlayers) {
  //ok so we remove inactive player from connectedPeers list... but how can that player reconnect? do we want / need to remove from otherplayers too? do we just set it to dead?
  otherPlayers.forEach((otherPlayer) => {
    if (otherPlayer.timeSinceSentMessageThatWasRecieved > 60) {
      //connectedPeers = connectedPeers.filter((peer) => peer !== otherPlayer.id);
    } else {
      if (!connectedPeers.includes(otherPlayer.id)) {
        connectedPeers.push(otherPlayer.id);
      }
    }
  });
  let foundActivePlayerWithId = false;
  if (connectedPeers.length > 0) {
    connectedPeers.sort();
    for (let connectedPeer of connectedPeers) {
      if (connectedPeer == player.id) {
        foundActivePlayerWithId = true;
      }
      otherPlayers.forEach((otherPlayer) => {
        if (otherPlayer.timeSinceSentMessageThatWasRecieved <= 60 && otherPlayer.id == connectedPeer) {
          foundActivePlayerWithId = true;
        }
      });
      if (foundActivePlayerWithId) {
        masterPeerId = connectedPeer;

        if (masterPeerId === player.id) {
          player.setPlayerIsMaster(true);
        } else {
          player.setPlayerIsMaster(false);
        }
        break;
      }
    }
  }
  if (!foundActivePlayerWithId) {
    masterPeerId = player.id;
    player.setPlayerIsMaster(true);
  }

  otherPlayers.forEach((otherPlayer) => {
    if (otherPlayer instanceof _player_js__WEBPACK_IMPORTED_MODULE_3__.Player) {
      if (masterPeerId === otherPlayer.id) {
        otherPlayer.setPlayerIsMaster(true);
      } else {
        otherPlayer.setPlayerIsMaster(false);
      }
    } else {
      // console.error("otherPlayer is not an instance of Player:", otherPlayer);
    }
  });

  return masterPeerId;
}

function createResolveConflictsWrapper() {
  let isScheduled = false;

  return function (player, otherPlayers, globalPowerUps) {
    if (!isScheduled) {
      // If not scheduled, call the function and set the flag
      resolveConflicts(player, otherPlayers, globalPowerUps);
      isScheduled = true;

      // Schedule to reset the flag after 5 seconds
      setTimeout(() => {
        isScheduled = false;
      }, 5000);
    }
  };
}

function resolveConflicts(player, otherPlayers, globalPowerUps) {
  // If there is a conflict between the local game state and the received game state,
  // update the local game state to match the received game state
  if (player.id == null) {
    createPeer(player, otherPlayers, globalPowerUps);
  }
  resolveConnectionConflicts(player, otherPlayers, globalPowerUps, true);
}

function resolveConnectionConflicts(player, otherPlayers, globalPowerUps, tryToRedoConnections = false) {
  // If there is a conflict between the local game state and the received game state,

  //not sure about the below might need to keep it in mind but I think it was causing major issues.
  // setTicksSinceLastConnectionAttempt(0);
  // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
  // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
  // connectedPeers.splice(0, 1);
  //might not be able to attempt connections again without issues
  if (timeSinceAnyMessageRecieved > 1000 && tryToRedoConnections == true) {
    console.log("attempting resolveConnections");
    setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps, true, false), 50);
  }
  masterPeerId = chooseNewMasterPeer(player, otherPlayers);
}


/***/ }),

/***/ "./db.js":
/*!***************!*\
  !*** ./db.js ***!
  \***************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DbDocumentKey: () => (/* binding */ DbDocumentKey),
/* harmony export */   DbPropertyKey: () => (/* binding */ DbPropertyKey),
/* harmony export */   addScoreToDB: () => (/* binding */ addScoreToDB),
/* harmony export */   allTimeKills: () => (/* binding */ allTimeKills),
/* harmony export */   allTimeLogins: () => (/* binding */ allTimeLogins),
/* harmony export */   allTimePoints: () => (/* binding */ allTimePoints),
/* harmony export */   firebaseDb: () => (/* binding */ firebaseDb),
/* harmony export */   getFirebase: () => (/* binding */ getFirebase),
/* harmony export */   getFirebaseProperty: () => (/* binding */ getFirebaseProperty),
/* harmony export */   getTopScores: () => (/* binding */ getTopScores),
/* harmony export */   incrementFirebaseGivenPropertyValue: () => (/* binding */ incrementFirebaseGivenPropertyValue),
/* harmony export */   readUserDataFromFirestore: () => (/* binding */ readUserDataFromFirestore),
/* harmony export */   updateAchievements: () => (/* binding */ updateAchievements)
/* harmony export */ });
/* harmony import */ var _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../canvasDrawingFunctions.js */ "./canvasDrawingFunctions.js");


let firebaseConfig = {
  apiKey: "AIzaSyAKNQY57EwlQ6TAf13wSx4eba4NK-MAN88",
  authDomain: "p2p-game-test.firebaseapp.com",
  projectId: "p2p-game-test",
  storageBucket: "p2p-game-test.appspot.com",
  messagingSenderId: "849363353418",
  appId: "1:849363353418:web:13c04c4ac2ef99c88b4bb3",
};
firebase.initializeApp(firebaseConfig);

let allTimeKills = 0;
let allTimePoints = 0;
let allTimeLogins = 0;

const DbPropertyKey = {
  LOGINS: "logins",
  KILLS: "kills",
  SCORE: "score",
};

const DbDocumentKey = {
  USERS: "users",
};

// import {} from "firebase/auth";
function getFirebase() {
  return firebase;
}

let firebaseDb = firebase.firestore();

function addScoreToDB(category, name, score) {
  var collection = firebaseDb.collection(category);

  // Get the current top 10 scores
  collection
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      // Count the number of scores in the category
      const numScores = querySnapshot.size;

      // If there are fewer than 10 scores, add the new score
      if (numScores < 10) {
        collection
          .add({
            name: name,
            score: score,
            date: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(function (docRef) {
            console.log("Score written with ID: ", docRef.id);
          })
          .catch(function (error) {
            console.error("Error adding score: ", error);
          });
      } else {
        // Otherwise, check if the new score is in the top 10
        var lowestScore = null;

        querySnapshot.forEach((doc) => {
          if (lowestScore == null || doc.data().score < lowestScore) {
            lowestScore = doc.data().score;
          }
        });

        if (score > lowestScore) {
          collection
            .add({
              name: name,
              score: score,
              date: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(function (docRef) {
              console.log("Score written with ID: ", docRef.id);
            })
            .catch(function (error) {
              console.error("Error adding score: ", error);
            });
        }
      }
    });
}

function getTopScores(category, X) {
  return new Promise((resolve, reject) => {
    var scores = [];
    firebaseDb
      .collection(category)
      .orderBy("score", "desc")
      .limit(X)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          scores.push(`${data.score}, ${data.name}`);
        });
        resolve(scores);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function updateFirebaseProperty(firebase, collectionName, documentId, propertyName, newValue, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dataToUpdate = {};
          dataToUpdate[propertyName] = newValue;

          // Update the specified property in Firestore.
          userRef
            .update(dataToUpdate)
            .then(() => {
              console.log(`${propertyName} updated to ${newValue}`);
              // You can also update the user interface with the new property value here.
              callback(null);
            })
            .catch((error) => {
              console.error(`Error updating ${propertyName}: ${error}`);
              callback(error);
            });
        } else {
          callback(new Error("User document not found"), null);
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"));
  }
}

// Function to read data from Firestore (e.g., logins count) for the currently authenticated user.
function readUserDataFromFirestore(firebase, collectionName, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(user.uid);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          callback(null, userData);
        } else {
          callback(new Error("User data not found"), null);
        }
      })
      .catch((error) => {
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

// Increments a numeric property in Firestore for the currently authenticated user.
function incrementFirebaseProperty(firebase, collectionName, documentId, propertyName, incrementBy, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const currentValue = doc.data()[propertyName] || 0;
          const newValue = currentValue + incrementBy;

          // Update the specified property in Firestore.
          const dataToUpdate = {};
          dataToUpdate[propertyName] = newValue;

          userRef
            .update(dataToUpdate)
            .then(() => {
              console.log(`${propertyName} incremented by ${incrementBy} to ${newValue}`);
              // You can also update the user interface with the new property value here.
              callback(null, newValue);
            })
            .catch((error) => {
              console.error(`Error updating ${propertyName}: ${error}`);
              callback(error, null);
            });
        } else {
          // User document doesn't exist; create it and set the property to the increment value.
          const dataToCreate = {};
          dataToCreate[propertyName] = incrementBy;

          userRef
            .set(dataToCreate)
            .then(() => {
              console.log(`User document created with ${propertyName} set to ${incrementBy}`);
              // You can also update the user interface with the new property value here.
              callback(null, incrementBy);
            })
            .catch((error) => {
              console.error(`Error creating user document: ${error}`);
              callback(error, null);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

function getFirebaseProperty(firebase, collectionName, documentId, propertyName, callback) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(collectionName).doc(documentId);

    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const currentValue = doc.data()[propertyName] || 0;
          callback(null, currentValue);
        } else {
          // User document doesn't exist; create it and set the property to 0.
          const dataToCreate = {};
          dataToCreate[propertyName] = 0;

          userRef
            .set(dataToCreate)
            .then(() => {
              console.log(`User document created with ${propertyName} set to ${incrementBy}`);
              // You can also update the user interface with the new property value here.
              callback(null, incrementBy);
            })
            .catch((error) => {
              console.error(`Error creating user document: ${error}`);
              callback(error, null);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
        callback(error, null);
      });
  } else {
    // User is not logged in.
    callback(new Error("User not logged in"), null);
  }
}

function incrementFirebaseLoginsValue(firebase) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.LOGINS, 1, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing logins count: ${error}`);
    } else {
      console.log(`Logins count incremented to ${newValue}`);
      // You can also update the user interface with the new logins count here.
    }
  });
}

function incrementFirebaseScoreValue(firebase, incrementBy) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, "score", incrementBy, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing score count: ${error}`);
    } else {
      console.log(`Logins count incremented to ${newValue}`);
      // You can also update the user interface with the new score total here
    }
  });
}

function incrementFirebaseGivenPropertyValue(firebase, property, incrementBy) {
  const user = firebase.auth().currentUser;
  incrementFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, property, incrementBy, (error, newValue) => {
    if (error) {
      console.error(`Error incrementing ${property} count: ${error}`);
    } else {
      console.log(`${property} count incremented to ${newValue}`);
      //in future might want to be more specific about what to update
      updateAchievements();
    }
  });
}

function updateAchievements() {
  let firebase = getFirebase();
  if (firebase) {
    const user = firebase.auth().currentUser;
    if (user) {
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.KILLS, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimeKills = value;
        }
      });
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.SCORE, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimePoints = value * 100;
        }
      });
      getFirebaseProperty(firebase, DbDocumentKey.USERS, user.uid, DbPropertyKey.LOGINS, (error, value) => {
        if (error) {
          console.error(`Error getting ${property} count: ${error}`);
        } else {
          allTimeLogins = value;
        }
      });
    }
  }
}


/***/ }),

/***/ "./drawGameUI.js":
/*!***********************!*\
  !*** ./drawGameUI.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawFilledGauge: () => (/* binding */ drawFilledGauge),
/* harmony export */   drawInvincibilityGauge: () => (/* binding */ drawInvincibilityGauge),
/* harmony export */   drawPowerupLevels: () => (/* binding */ drawPowerupLevels),
/* harmony export */   drawSpecialGauge: () => (/* binding */ drawSpecialGauge),
/* harmony export */   renderDebugInfo: () => (/* binding */ renderDebugInfo)
/* harmony export */ });
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./player.js */ "./player.js");
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./main.js */ "./main.js");





function renderDebugInfo(ctx, player, bots) {
  ctx.textAlign = "start";
  const topGap = 100;
  const gap = 16; // Gap between lines
  const textHeight = 75; // Adjust this to the size of your text
  ctx.font = "14px Arial";
  const myIDText = `My ID: ${player.id}`;
  ctx.fillStyle = "white";
  ctx.fillText(myIDText, 558, topGap - textHeight);

  const myDistanceFactorText = `distanceFactor ${player.distanceFactor}`;
  ctx.fillText(myDistanceFactorText, 558, topGap + gap - textHeight);

  const isMasterText = `is Master =  ${(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player)}`;
  ctx.fillText(isMasterText, 558, topGap + gap * 2 - textHeight);
  ctx.fillText(`invicible state: ${player.invincibleTimer}`, 558, topGap + gap * 3 - textHeight);

  const executionTimeText = `executionTime =  ${_main_js__WEBPACK_IMPORTED_MODULE_3__.executionTime}`;
  ctx.fillText(executionTimeText, 558, topGap + gap * 4 - textHeight);

  const timeSinceAnyMessageRecievedText = `timeSinceAnyMessageRecieved =  ${_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.timeSinceAnyMessageRecieved}`;
  ctx.fillText(timeSinceAnyMessageRecievedText, 558, topGap + gap * 5 - textHeight);

  const timeSinceMessageFromMasterText = `timeSinceMessageFromMaster =  ${_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.timeSinceMessageFromMaster}`;
  ctx.fillText(timeSinceMessageFromMasterText, 558, topGap + gap * 6 - textHeight);

  const velocityText = `player velocity = ${player.vel.x.toFixed(1)}, ${player.vel.y.toFixed(1)}`;
  ctx.fillText(velocityText, 558, topGap + gap * 7 - textHeight);
  let lineCount = 0;
  bots.forEach((bot, index) => {
    let botInfo;
    if (bot.botState == _player_js__WEBPACK_IMPORTED_MODULE_2__.BotState.FOLLOW_PLAYER) {
      botInfo = `${bot.name} state: ${bot.botState} following: ${bot.followingPlayerID} `;
    } else {
      botInfo = `${bot.name} state: ${bot.botState} aiming: ${bot.target.x},${bot.target.y} `;
    }
    ctx.fillText(botInfo, 958, topGap + gap * index - textHeight);
    lineCount = index;
  });
  if (player.currentFrictionPercent) {
    const frictionPercentText = `friction percent:   ${player.currentFrictionPercent}`;
    ctx.fillText(frictionPercentText, 958, topGap + gap * (lineCount + 1) - textHeight);
    const speedText = `speed:   ${player.currentSpeed}`;
    ctx.fillText(speedText, 958, topGap + gap * (lineCount + 2) - textHeight);
  }
}

function drawFilledGauge(ctx, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7, filled, total, color = "#ff9900") {
  const fillPercent = filled / total;
  drawGauge(ctx, centerX, bottomY, fillPercent, color, gaugeWidth, gaugeHeight, borderWidth);
}

function drawInvincibilityGauge(ctx, player, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7) {
  let pilotMaxInvcibilityTime = _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.maxInvincibilityTime;
  for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots) {
    if (player.pilot == pilot.name) {
      pilotMaxInvcibilityTime = pilot.invincibilityTime;
      break;
    }
  }
  const fillPercent = player.invincibleTimer / pilotMaxInvcibilityTime;
  drawGauge(ctx, centerX, bottomY, fillPercent, "#ff9900", gaugeWidth, gaugeHeight, borderWidth);
}

function drawSpecialGauge(ctx, player, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7) {
  const fillPercent = player.specialMeter / _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.maxSpecialMeter;
  drawGauge(ctx, centerX, bottomY, fillPercent, "#00FF00", gaugeWidth, gaugeHeight, borderWidth);
}

function drawGauge(ctx, centerX, bottomY, fillPercent, color, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7) {
  const gaugeColor = color; // Fill color of the gauge
  const borderColor = "#333"; // Border color

  const fillWidth = gaugeWidth * fillPercent;

  // Create a linear gradient for the gauge background
  const gradient = ctx.createLinearGradient(centerX - gaugeWidth / 2, bottomY - gaugeHeight, centerX + gaugeWidth / 2, bottomY);

  // Define gradient colors
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)"); // Start with transparent black
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)"); // Middle with semi-transparent white
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)"); // End with transparent black

  // Draw the gradient background
  ctx.fillStyle = gradient;
  ctx.fillRect(centerX - gaugeWidth / 2, bottomY - gaugeHeight, gaugeWidth, gaugeHeight);

  // Draw the gauge fill based on fillPercent
  ctx.fillStyle = gaugeColor;
  ctx.fillRect(
    centerX - gaugeWidth / 2 + borderWidth,
    bottomY - gaugeHeight + borderWidth,
    Math.max(0, fillWidth - borderWidth * 2),
    gaugeHeight - borderWidth * 2
  );
}

function drawPowerupLevels(ctx, player, otherPlayers, bots) {
  const topGap = 20;
  const textHeight = 20; // Adjust this to the size of your text
  const gap = 16; // Gap between lines
  const boxPadding = 10; // Padding around the box
  let boxWidth = 200; // Width of the box
  let boxHeight = 2 * boxPadding; // Start with padding at the top and bottom

  // Measure the maximum text width to align to the right of the box
  let maxTextWidth = 0;

  ctx.font = "14px Arial";

  if (player != null) {
    const score = player.powerUps * 100;
    const myPowerupText = `${player.name}: ${score}`;
    ctx.fillStyle = player.color;
    const textWidth = ctx.measureText(myPowerupText).width;
    maxTextWidth = Math.max(maxTextWidth, textWidth);
    boxHeight += textHeight + gap;
  }

  otherPlayers.forEach((otherPlayer) => {
    if (!otherPlayer.isDead && otherPlayer.isPlaying) {
      if (!otherPlayer.name) {
        // console.log("unnamed other player");
      }
      let playerName = otherPlayer.name || "Unknown";
      const score = otherPlayer.powerUps * 100;
      const playerPowerupText = playerName + `: ${score}`;
      const textWidth = ctx.measureText(playerPowerupText).width;
      maxTextWidth = Math.max(maxTextWidth, textWidth);
      boxHeight += textHeight + gap;
    }
  });

  bots.forEach((bot) => {
    if (!bot.name) {
      // console.log("unnamed other player");
    }
    if (bot.isDead) {
      return;
    }
    let playerName = bot.name || "Unknown";
    const score = bot.powerUps * 100;
    const playerPowerupText = playerName + `: ${score}`;
    const textWidth = ctx.measureText(playerPowerupText).width;
    maxTextWidth = Math.max(maxTextWidth, textWidth);
    boxHeight += textHeight + gap;
  });

  //size box to fit the largest name/score combno, with a min size
  boxWidth = Math.max(150, maxTextWidth + 20);

  // Calculate the position of the box
  const boxX = 100; // Adjust this as needed
  const boxY = topGap - boxPadding;

  // Create a gradient for the box background
  const gradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.2)"); // Transparent black
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)"); // Semi-transparent black

  // Draw the box background with gradient
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#555"; // Border color
  // ctx.strokeStyle = gradient; // Border color
  ctx.lineWidth = 2; // Border width
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.textAlign = "center";

  // Draw the text inside the box
  let currentY = boxY + boxPadding + textHeight + 10;
  ctx.fillStyle = "white";
  ctx.fillText("Leaderboard", boxX + boxWidth / 2, boxY + boxPadding + 5);

  ctx.textAlign = "right";

  // Combine all players (including player) and bots into a single array
  let allPlayers;
  if (player == null || player.name == "") {
    allPlayers = [...otherPlayers, ...bots];
  } else {
    allPlayers = [player, ...otherPlayers, ...bots];
  }
  ctx.font = "14px Arial";

  // Sort allPlayers by score in descending order
  allPlayers.sort((a, b) => {
    return b.powerUps - a.powerUps;
  });

  allPlayers.forEach((currentPlayer) => {
    if (!currentPlayer.isDead && currentPlayer.isPlaying) {
      let playerName = currentPlayer.name || "Unknown";
      const score = currentPlayer.powerUps * 100;
      const playerPowerupText = playerName + `: ${score}`;

      ctx.fillStyle = currentPlayer.color;
      ctx.fillText(playerPowerupText, boxX + boxWidth - boxPadding, currentY);
      currentY += textHeight + gap;
    }
  });
}


/***/ }),

/***/ "./drawShip.js":
/*!*********************!*\
  !*** ./drawShip.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawShip: () => (/* binding */ drawShip)
/* harmony export */ });
/* harmony import */ var _drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawGameUI.js */ "./drawGameUI.js");
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _collisionLogic_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./collisionLogic.js */ "./collisionLogic.js");






// Main function for drawing the ship
function drawShip(ctx, camX, camY, player, points) {
  if (
    !player.isPlaying ||
    player.isDead ||
    (!player.isLocal && !player.isBot && player.timeSinceSentMessageThatWasRecieved > 120) ||
    (player.name == "" && player.pilot == "")
  ) {
    return;
  }

  const playerCenterXWorldCoords = player.x;
  const playerCenterYWorldCoords = player.y;
  const playerCenterXScreenCoords = playerCenterXWorldCoords - camX;
  const playerCenterYScreenCoords = playerCenterYWorldCoords - camY;
  const angle = player.getAngle();
  const color = player.color;
  const name = player.name;
  const lightSourceX = 0;
  const lightSourceY = 0;
  const currentTime = Date.now();
  let elapsedTime = currentTime - player.flameTransitionStartTime;
  if (isNaN(elapsedTime)) {
    elapsedTime = 0;
  }
  let flameAnimatationFrame = elapsedTime % 50;

  if (!player.flameTransitionStartTime || elapsedTime >= 50) {
    player.flameTransitionStartTime = currentTime;
  }

  if (player.space) {
    const flameOffsetAngle = angle - Math.PI / 2 - 0.46;
    const frequency = 0.5;
    const amplitude = 1;
    // Normalize time between 0 and 1
    const time = (_gameLogic_js__WEBPACK_IMPORTED_MODULE_3__.basicAnimationTimer % 40) / 40;
    const pulse = amplitude * Math.sin(2 * Math.PI * frequency * time);

    // Calculate flame size based on pulse
    const baseFlameSize = 56;
    const maxFlameSize = baseFlameSize + player.distanceFactor * 60;
    const minFlameSize = baseFlameSize + player.distanceFactor * 0;
    const flameSize = baseFlameSize + ((maxFlameSize - minFlameSize) * (pulse + 1)) / 2;

    drawFlame(ctx, playerCenterXScreenCoords, playerCenterYScreenCoords, flameOffsetAngle, flameSize);
  }

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  if (player.invincibleTimer > 10 || (player.invincibleTimer > 0 && !player.isUserControlledCharacter)) {
    const starTransitionDuration = 500;
    let starElapsedTime = currentTime - player.flameTransitionStartTime;
    let animatationFrame = starElapsedTime % starTransitionDuration;
    if (!player.starTransitionStartTime || starElapsedTime >= starTransitionDuration) {
      player.starTransitionStartTime = currentTime;
    }
    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.applyGlowingEffect)(ctx, "gold", "gold", "white", starTransitionDuration, animatationFrame);
  }

  // if (currentTime % 2000 < 1900) {
  //   drawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color);
  // } else {
  OGdrawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color);
  // }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  //draw mouse pos for debug
  // ctx.beginPath();
  // ctx.arc(player.mousePosX - camX, player.mousePosY - camY, 55, 0, Math.PI * 2);
  // ctx.closePath();
  // ctx.fill();
  // Draw name and invincibility gauge
  drawNameAndInvincibility(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, name, color);

  if (player.recentScoreTicks > 0) {
    let scoreInfoYAdjust = 0;
    if (player.invincibleTimer > 0) {
      scoreInfoYAdjust = 20;
    }
    drawScoreInfo(ctx, player, player.recentScoreText, camX, camY + scoreInfoYAdjust);
    drawKillInfo(ctx, player, player.recentKillScoreText, camX, camY + scoreInfoYAdjust);
  }
}

// Helper function to calculate shadow position for a point
function calculateShadowPosition(silhouetteX, silhouetteY, lightSourceX, lightSourceY) {
  return {
    x: silhouetteX + (lightSourceX - silhouetteX),
    y: silhouetteY + (lightSourceY - silhouetteY),
  };
}

// Helper function to draw the ship's silhouette
function drawSilhouette(ctx, silhouettePoints) {
  ctx.beginPath();
  ctx.moveTo(silhouettePoints[0].x, silhouettePoints[0].y);

  for (let i = 1; i < silhouettePoints.length; i++) {
    ctx.lineTo(silhouettePoints[i].x, silhouettePoints[i].y);
  }

  ctx.closePath();
  ctx.fillStyle = "gray"; // Fill color for the silhouette
  ctx.fill();
}

// Helper function to draw the flame effect
function drawFlame(ctx, centerX, centerY, flameOffsetAngle, flameSize) {
  // Calculate the position for the flame relative to the ship's center
  const flameOffsetX = -Math.sin(flameOffsetAngle) * 0; // Adjust the offset as needed
  const flameOffsetY = Math.cos(flameOffsetAngle) * 0; // Adjust the offset as needed
  const flameX = centerX + flameOffsetX;
  const flameY = centerY + flameOffsetY;

  ctx.beginPath();
  ctx.moveTo(flameX, flameY);

  // Calculate the flame points relative to the flame position
  for (let i = 0; i < 3; i++) {
    // const adjustedAngle = flameOffsetAngle + i * 0.38; // Adjust the angle of the flame
    const adjustedAngle = flameOffsetAngle + i * 0.45; // Adjust the angle of the flame
    const flameEndX = flameX - Math.cos(adjustedAngle) * flameSize;
    const flameEndY = flameY - Math.sin(adjustedAngle) * flameSize;
    ctx.lineTo(flameEndX, flameEndY);
  }

  ctx.closePath();
  // Create a radial gradient for the flame effect
  const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
  gradient.addColorStop(0, "rgba(255, 165, 0, 1)"); // Adjust color and transparency
  gradient.addColorStop(1, "rgba(255, 0, 0, 0.1)"); // Adjust color and transparency

  // Use the gradient as the fill style for the flame
  ctx.fillStyle = gradient;
  ctx.fill();
}

function OGdrawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color) {
  ctx.beginPath();

  let rotatedPoint = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.rotateAndScalePoint)(points[0].x, points[0].y, angle, _collisionLogic_js__WEBPACK_IMPORTED_MODULE_4__.shipScale);
  ctx.moveTo(playerCenterXScreenCoords + rotatedPoint.x, playerCenterYScreenCoords + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.rotateAndScalePoint)(points[i].x, points[i].y, angle, _collisionLogic_js__WEBPACK_IMPORTED_MODULE_4__.shipScale);
    ctx.lineTo(playerCenterXScreenCoords + rotatedPoint.x, playerCenterYScreenCoords + rotatedPoint.y);
  }

  try {
    if (typeof player.isInSpawnProtectionTime === "function") {
      if (player.isInSpawnProtectionTime() && !(player.invincibleTimer > 10 || (player.invincibleTimer > 0 && !player.isUserControlledCharacter))) {
        const transitionDuration = 20;
        const elapsedTime = currentTime - player.starTransitionStartTime;
        if (!player.starTransitionStartTime || elapsedTime >= transitionDuration) {
          player.starTransitionStartTime = currentTime;
          player.starTransitionStartColor = color;
        }
        (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.applyGlowingEffect)(ctx, "white", "white", player.starTransitionStartColor, transitionDuration, elapsedTime);
      } else {
        // ctx.strokeStyle = color;
      }
    } else {
      // console.log("isInSpawnProtectionTime method does not exist");
    }
  } catch (error) {
    console.log("An error occurred:", error);
  }

  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.stroke();
}

function newDrawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  // Define carrot shape points relative to the carrot's center
  const carrotPoints = [
    { x: 0, y: -25 }, // Tip of the carrot
    { x: -12, y: 0 }, // Left side of the carrot body
    { x: -8, y: 25 }, // Left bottom edge of the carrot body
    { x: 8, y: 25 }, // Right bottom edge of the carrot body
    { x: 15, y: 0 }, // Right side of the carrot body
    { x: 12, y: -25 }, // Back to the tip of the carrot
  ];

  // Rotate and scale carrot points
  for (let i = 0; i < carrotPoints.length; i++) {
    const rotatedPoint = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.rotateAndScalePoint)(carrotPoints[i].x, carrotPoints[i].y, angle, _collisionLogic_js__WEBPACK_IMPORTED_MODULE_4__.shipScale);
    carrotPoints[i] = {
      x: playerCenterXScreenCoords + rotatedPoint.x,
      y: playerCenterYScreenCoords + rotatedPoint.y,
    };
  }

  // Create a smooth carrot shape using Bezier curves
  ctx.moveTo(carrotPoints[0].x, carrotPoints[0].y);
  ctx.bezierCurveTo(carrotPoints[1].x, carrotPoints[1].y, carrotPoints[2].x, carrotPoints[2].y, carrotPoints[3].x, carrotPoints[3].y);
  ctx.bezierCurveTo(carrotPoints[4].x, carrotPoints[4].y, carrotPoints[5].x, carrotPoints[5].y, carrotPoints[0].x, carrotPoints[0].y);

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
}
// ctx.bezierCurveTo(10, 20, 10, 0, 0, -25);
// ctx.bezierCurveTo(10, 0, 5, -20, -5, -20);
function drawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color) {
  ctx.save();
  ctx.translate(playerCenterXScreenCoords, playerCenterYScreenCoords);
  ctx.rotate(angle);
  ctx.strokeStyle = "orange";
  // Draw carrot body

  ctx.beginPath();
  // ctx.moveTo(0, -25);
  // ctx.bezierCurveTo(-15, 0, -5, 20, 0, 40); // Adjusted control points for the left side
  // ctx.bezierCurveTo(5, 20, 15, 0, 0, -25); // Adjusted control points for the right side
  // ctx.moveTo(0, -25);
  // ctx.bezierCurveTo(5, 20, 15, 0, 0, -25); // Adjusted control points for the right side
  // ctx.bezierCurveTo(-15, 0, -5, 20, 0, 40); // Adjusted control points for the left side
  ctx.moveTo(0, 40);
  ctx.bezierCurveTo(30, 20, 25, 40, 0, -25); // Adjusted control points for the right side
  ctx.bezierCurveTo(-25, 40, -30, 20, 0, 40); // Adjusted control points for the left side

  ctx.closePath();
  // Add details like windows, lights, etc.
  // Example: ctx.arc(x, y, radius, 0, Math.PI * 2);

  // Apply gradients or textures for a more dynamic look
  const gradient = ctx.createLinearGradient(-10, -25, 10, 20);
  gradient.addColorStop(0, "orange");
  gradient.addColorStop(0.8, "orange");
  gradient.addColorStop(1, "green");
  ctx.fillStyle = gradient;

  // Apply shadows and highlights for depth
  ctx.shadowBlur = 10;
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";

  // Draw the spaceship
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

// Helper function to draw the name and invincibility gauge
function drawNameAndInvincibility(ctx, player, centerX, centerY, name, color) {
  const namePositionY = centerY - 15;
  const invincibleGaugePositionY = centerY - 25;

  ctx.fillStyle = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.getComplementaryColor)(color);
  ctx.strokeStyle = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.getComplementaryColor)(color);
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, centerX, namePositionY);

  if (player.invincibleTimer > 0) {
    (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__.drawInvincibilityGauge)(ctx, player, centerX, invincibleGaugePositionY, 70, 15, 2);
  }
}

function drawScoreInfo(ctx, player, score, camX, camY) {
  let centerX = player.x;
  let centerY = player.y;
  // Calculate position for the score (above the unrotated center of the ship)
  const scorePositionX = centerX - camX;
  const scorePositionY = centerY - camY - 35;

  // Draw the score
  ctx.fillStyle = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.getComplementaryColor)(player.color);
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText(score, scorePositionX, scorePositionY);
}
function drawKillInfo(ctx, player, killText, camX, camY) {
  let centerX = player.x;
  let centerY = player.y;
  // Calculate position for the score (above the unrotated center of the ship)
  const scorePositionX = centerX - camX;
  const scorePositionY = centerY - camY - 55;

  // Draw the score
  ctx.fillStyle = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.getComplementaryColor)(player.color);
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText(killText, scorePositionX, scorePositionY);
}


/***/ }),

/***/ "./drawingUtils.js":
/*!*************************!*\
  !*** ./drawingUtils.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyGlowingEffect: () => (/* binding */ applyGlowingEffect),
/* harmony export */   applyGravityWarpEffect: () => (/* binding */ applyGravityWarpEffect),
/* harmony export */   centerPilots: () => (/* binding */ centerPilots),
/* harmony export */   drawArrow: () => (/* binding */ drawArrow),
/* harmony export */   drawExplosion: () => (/* binding */ drawExplosion),
/* harmony export */   drawRoundedRectangle: () => (/* binding */ drawRoundedRectangle),
/* harmony export */   getComplementaryColor: () => (/* binding */ getComplementaryColor),
/* harmony export */   interpolate: () => (/* binding */ interpolate),
/* harmony export */   loreTablet: () => (/* binding */ loreTablet),
/* harmony export */   nameToRGB: () => (/* binding */ nameToRGB),
/* harmony export */   nameToRGBFullFormat: () => (/* binding */ nameToRGBFullFormat),
/* harmony export */   rotateAndScalePoint: () => (/* binding */ rotateAndScalePoint),
/* harmony export */   rotatePoint: () => (/* binding */ rotatePoint),
/* harmony export */   setupCanvas: () => (/* binding */ setupCanvas),
/* harmony export */   setupPilotsImages: () => (/* binding */ setupPilotsImages),
/* harmony export */   setupSpikeyBallPoints: () => (/* binding */ setupSpikeyBallPoints),
/* harmony export */   shouldSkipPlayer: () => (/* binding */ shouldSkipPlayer),
/* harmony export */   spikeyBallPoints: () => (/* binding */ spikeyBallPoints)
/* harmony export */ });
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
const spikeyBallPoints = [];

// import { ctx } from "./astroids.js";
const loreTablet = {
  x: 0,
  y: -300,
  width: 450,
  height: 450,
  image: new Image(),
};

function centerPilots(canvas) {
  // Calculate the horizontal gap between pilots (excluding the central gap)
  const gapBetweenPilots = 20; // Gap between all pilots except the central gap
  const centralGap = 330; // Width of the central gap

  // Calculate the total width occupied by all pilots (excluding the central gap)
  let totalWidth = 0;

  for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots.length; i++) {
    totalWidth += _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots[i].width;
  }

  // Calculate the total width including the central gap
  totalWidth += centralGap;

  // Calculate the starting x-position to center the pilots
  const startX = (canvas.width - totalWidth) / 2 + (gapBetweenPilots * 3) / 2;

  // Calculate the y-position for all pilots
  const yPosition = canvas.height / 6;

  // Calculate the index at which to start adding the central gap
  const startIndexForCentralGap = Math.floor(_gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots.length / 2) - 1;

  // Set the positions for each pilot, taking the central gap into account
  let currentX = startX;
  for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots.length; i++) {
    const pilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots[i];
    pilot.x = currentX;

    if (i === startIndexForCentralGap) {
      // Leave the central gap after half of the pilots
      currentX += centralGap;
    } else if (i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_0__.pilots.length - 1) {
      // Add the regular gap between pilots
      currentX += pilot.width + gapBetweenPilots;
    }

    pilot.y = yPosition;
  }

  // Position the lore tablet
  loreTablet.x = canvas.width / 2 - loreTablet.width / 2;
  loreTablet.y = 359;
}

function setupPilotsImages(canvas) {
  centerPilots(canvas);
}

// initializes the canvas and sets up basic event listeners
function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  setClip(ctx);

  canvas.style.position = "absolute"; // positioning the canvas to start from the top left corner.
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Disable the default context menu on the canvas
  canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Adding event listener to handle window resizing
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setClip(ctx);
    //since we can now scale the canvas need to adjust the positions
    centerPilots(canvas);
  });

  return { canvas, ctx };
}

function setClip(ctx) {
  //try this clip to prevent drawing outside of canvas to see if it improves efficiency
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clip();
}
// Rotate a point (x, y) by a certain angle
function rotatePoint(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

function rotateAndScalePoint(x, y, angle, scale) {
  return {
    x: (x * Math.cos(angle) - y * Math.sin(angle)) * scale,
    y: (x * Math.sin(angle) + y * Math.cos(angle)) * scale,
  };
}
// Interpolate between two color components (e.g., red, green, blue)
function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

function drawRoundedRectangle(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius) {
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
}

function setupSpikeyBallPoints() {
  const numSpikes = 20; // Adjust the number of spikes as needed
  const spikeLength = 15; // Adjust the length of spikes as needed
  const ballRadius = 40; // Adjust the radius of the ball as needed

  for (let i = 0; i < numSpikes; i++) {
    const angle = (Math.PI * 2 * i) / numSpikes;
    const x = Math.cos(angle) * ballRadius;
    const y = Math.sin(angle) * ballRadius;
    spikeyBallPoints.push({ x, y });

    // Calculate the spike endpoint
    const spikeX = x + Math.cos(angle) * spikeLength;
    const spikeY = y + Math.sin(angle) * spikeLength;
    spikeyBallPoints.push({ x: spikeX, y: spikeY });
  }

  // Close the shape by adding the first point again
  spikeyBallPoints.push({ x: spikeyBallPoints[0].x, y: spikeyBallPoints[0].y });
}

// Function to apply a gravity warp effect only inside a specified circle
function applyGravityWarpEffect(ctx, centerX, centerY, radius, coneAngle, direction, resolution = 5) {
  const xMin = centerX - radius;
  const yMin = centerY - radius;
  const xMax = centerX + radius;
  const yMax = centerY + radius;

  const imageData = ctx.getImageData(xMin, yMin, xMax - xMin, yMax - yMin);
  const data = imageData.data;

  function isInsideCircle(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function isInsideCone(x, y, coneAngle, direction) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angleToPoint = Math.atan2(dy, dx);
    const halfCone = coneAngle / 2;
    const minAngle = normalizeAngle(direction - halfCone);
    const maxAngle = normalizeAngle(direction + halfCone);

    const normalizedAngleToPoint = normalizeAngle(angleToPoint);

    if (minAngle <= maxAngle) {
      return normalizedAngleToPoint >= minAngle && normalizedAngleToPoint <= maxAngle;
    } else {
      return normalizedAngleToPoint >= minAngle || normalizedAngleToPoint <= maxAngle;
    }
  }

  // Helper function to normalize angles to the range [0, 2*PI]
  function normalizeAngle(angle) {
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    return angle;
  }

  for (let y = 0; y < imageData.height; y += resolution) {
    for (let x = 0; x < imageData.width; x += resolution) {
      const index = (y * imageData.width + x) * 4;

      if (
        (isInsideCircle(x + xMin, y + yMin) && coneAngle == Math.PI * 2) ||
        (isInsideCircle(x + xMin, y + yMin) && isInsideCone(x + xMin, y + yMin, coneAngle, direction))
      ) {
        // Apply the gravity warp effect inside the cone
        data[index] = 255 - data[index]; // R
        data[index + 1] = 255 - data[index + 1]; // G
        data[index + 2] = 255 - data[index + 2]; // B
      }
    }
  }

  ctx.putImageData(imageData, xMin, yMin);
}

function drawArrow(ctx, tail, angle, length, arrowheadLength, arrowheadAngle = Math.PI / 8) {
  let head = {};

  head.x = tail.x + length * Math.cos(angle);
  head.y = tail.y + length * Math.sin(angle);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(tail.x, tail.y);

  //const angle = Math.atan2(head.y - tail.y, head.x - tail.x);
  const arrowhead1X = head.x - arrowheadLength * Math.cos(angle + arrowheadAngle);
  const arrowhead1Y = head.y - arrowheadLength * Math.sin(angle + arrowheadAngle);
  const arrowhead2X = head.x - arrowheadLength * Math.cos(angle - arrowheadAngle);
  const arrowhead2Y = head.y - arrowheadLength * Math.sin(angle - arrowheadAngle);

  ctx.moveTo(head.x, head.y);
  ctx.lineTo(arrowhead1X, arrowhead1Y);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(arrowhead2X, arrowhead2Y);
}

function normalizeAngle(angle) {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function isAngleInCone(angle, startAngle, endAngle) {
  if (startAngle > endAngle) {
    // If startAngle is greater than endAngle, it means the cone crosses the 0/2π line.
    // In this case, we need to check if the angle is less than endAngle or greater than startAngle.
    return angle <= endAngle || angle >= startAngle;
  } else {
    // If startAngle is less than endAngle, we can simply check if the angle is within this range.
    return angle >= startAngle && angle <= endAngle;
  }
}

function nameToRGBFullFormat(colorName) {
  let rgbColor = nameToRGB(colorName);
  // Match the RGB values using a regular expression
  const match = rgbColor.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return {
      r: r,
      g: g,
      b: b,
    };
  }

  return null; // Return null if the input is not a valid RGB color string
}

function nameToRGB(colorName) {
  const colorMap = {
    red: "rgb(255, 0, 0)",
    green: "rgb(0, 255, 0)",
    blue: "rgb(0, 0, 255)",
    orange: "rgb(255, 165, 0)",
    springgreen: "rgb(0, 255, 127)",
    lime: "rgb(0, 255, 0)",
    cyan: "rgb(0, 255, 255)",
    indigo: "rgb(75, 0, 130)",
    purple: "rgb(128, 0, 128)",
    pink: "rgb(255, 192, 203)",
    mediumvioletred: "rgb(199, 21, 133)",
    violet: "rgb(238, 130, 238)",
    maroon: "rgb(128, 0, 0)",
    crimson: "rgb(220, 20, 60)",
    white: "rgb(255, 255, 255)",
    gold: "rgb(255,215,0)",
    orangered: "rgb(255, 69, 0)",
  };
  if (colorName == null) {
    colorName = "blue";
  }
  // Look up the color name in the map and return the corresponding RGB value
  return colorMap[colorName.toLowerCase()] || null;
}

function getComplementaryColor(color) {
  // Assuming color is in the format "rgb(r, g, b)"
  let match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);

  if (!match) {
    color = nameToRGB(color);
    match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);
    if (!match) {
      // Invalid color format
      return null;
    }
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  // Calculate the complementary color by subtracting each RGB component from 255
  const complementaryR = 255 - r;
  const complementaryG = 255 - g;
  const complementaryB = 255 - b;

  // Return the complementary color in "rgb(r, g, b)" format
  return `rgb(${complementaryR},${complementaryG},${complementaryB})`;
}

// Function to determine if a player should be skipped
function shouldSkipPlayer(player) {
  return (
    !player ||
    !player.isPlaying ||
    player.isDead ||
    (!player.isLocal && !player.isBot && player.timeSinceSentMessageThatWasReceived > 120) ||
    (player.name === "" && player.pilot === "")
  );
}

function applyGlowingEffect(ctx, glowColor, transitionColor, starTransitionStartColor, transitionDuration, elapsedTime, opacity = 1) {
  ctx.shadowBlur = 10;
  ctx.shadowColor = glowColor;

  const colorProgress = Math.min(1, elapsedTime / transitionDuration);
  transitionColor = nameToRGBFullFormat(transitionColor);
  starTransitionStartColor = nameToRGBFullFormat(starTransitionStartColor);
  const r = Math.floor(interpolate(starTransitionStartColor.r, transitionColor.r, colorProgress));
  const g = Math.floor(interpolate(starTransitionStartColor.g, transitionColor.g, colorProgress));
  const b = Math.floor(interpolate(starTransitionStartColor.b, transitionColor.b, colorProgress));

  // Apply opacity to the glowing effect
  const interpolatedColor = `rgba(${r},${g},${b},${opacity})`;
  ctx.strokeStyle = interpolatedColor;
  ctx.fillStyle = interpolatedColor;
}

function drawExplosion(ctx, camX, camY, explosionEffect) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - explosionEffect.startTime;
  const animationDuration = explosionEffect.duration;
  const numFrames = 10;
  const frameDuration = animationDuration / numFrames;
  const frameIndex = Math.floor(elapsedTime / frameDuration);
  const maxRadius = explosionEffect.maxRadius;

  if (frameIndex < numFrames) {
    const currentRadius = (frameIndex / numFrames) * maxRadius;

    ctx.beginPath();
    ctx.arc(explosionEffect.x - camX, explosionEffect.y - camY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = explosionEffect.color;
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}


/***/ }),

/***/ "./entities.js":
/*!*********************!*\
  !*** ./entities.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Effect: () => (/* binding */ Effect),
/* harmony export */   EffectType: () => (/* binding */ EffectType),
/* harmony export */   Enemy: () => (/* binding */ Enemy),
/* harmony export */   Entity: () => (/* binding */ Entity),
/* harmony export */   ForceArea: () => (/* binding */ ForceArea),
/* harmony export */   ForceType: () => (/* binding */ ForceType),
/* harmony export */   FreeMine: () => (/* binding */ FreeMine),
/* harmony export */   Mine: () => (/* binding */ Mine),
/* harmony export */   MineType: () => (/* binding */ MineType),
/* harmony export */   PowerUp: () => (/* binding */ PowerUp),
/* harmony export */   Trail: () => (/* binding */ Trail),
/* harmony export */   createEffectFromObject: () => (/* binding */ createEffectFromObject),
/* harmony export */   createForceFromObject: () => (/* binding */ createForceFromObject),
/* harmony export */   createFreeMineFromObject: () => (/* binding */ createFreeMineFromObject),
/* harmony export */   createMineFromObject: () => (/* binding */ createMineFromObject),
/* harmony export */   createPowerUpFromObject: () => (/* binding */ createPowerUpFromObject),
/* harmony export */   createTrailFromObject: () => (/* binding */ createTrailFromObject),
/* harmony export */   effects: () => (/* binding */ effects),
/* harmony export */   forces: () => (/* binding */ forces),
/* harmony export */   setEffects: () => (/* binding */ setEffects),
/* harmony export */   setForces: () => (/* binding */ setForces)
/* harmony export */ });
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player.js */ "./player.js");
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");





let forces = [];
let effects = [];

function setForces(newForces) {
  if (newForces !== forces) {
    //update original array
    forces.length = 0;
    forces.push(...newForces);
  }
}

const EffectType = {
  EXPLOSION: "explosion",
};

const MineType = {
  REGULAR: "regular",
  TRAIL: "trail",
  FREE_MINE: "freemine",
};

class Entity {
  constructor(id = null, x = null, y = null) {
    this.id = id;
    if (this.id == null) {
      this.id = Math.floor(Math.random() * 10000);
    }
    this.x = x;
    this.y = y;
  }
}

const ForceType = {
  POINT: "point",
  DIRECTIONAL: "directional",
};

class ForceArea extends Entity {
  constructor(
    id = null,
    x = null,
    y = null,
    force = 1,
    duration = 200,
    radius = 100,
    isAttractive,
    color = "red",
    tracks,
    coneAngle = Math.PI * 2,
    direction = 0,
    type = ForceType.POINT,
    width = 100,
    length = 100,
    effect = false
  ) {
    super(id, x, y);
    this.force = force;
    this.duration = duration;
    this.radius = radius;
    this.isAttractive = isAttractive;
    this.color = color;
    this.tracks = tracks;
    this.coneAngle = coneAngle;
    this.direction = direction;
    this.type = type;
    this.width = width;
    this.length = length;
    this.effect = effect;
  }
  setDuration(newDuration) {
    this.duration = newDuration;
    if (this.duration < 1) {
      // forces = forces.filter(function (element) {
      setForces(
        forces.filter(function (element) {
          return element !== this;
        }, this)
      );
      if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_2__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
        (0,_sendData_js__WEBPACK_IMPORTED_MODULE_3__.sendRemoveEntityUpdate)("removeForces", [this]);
      }
    }
  }
}

class Enemy extends Entity {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red") {
    super(id, x, y);
  }
}

class Effect extends Enemy {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red", type = "") {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.type = type;
  }
}

class Mine extends Enemy {
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.REGULAR,
    hitFrame = -105,
    playerId = ""
  ) {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.hitFrames = hitFrame;
    this.force = force;
    if (force != 0) {
      this.createForce();
    }
    this.mineType = mineType;
    this.playerId = playerId;
  }
  createForce() {
    // Check if there is already a force with the same id
    const existingForce = forces.find((force) => force.id === "mine-" + this.id);

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      if (this.force !== 0) {
        let minesForce = new ForceArea("mine-" + this.id, this.x, this.y, 0.3, 10, 200, this.force == 1, "pink", this);
        //currently mine doesn't keep a reference to it's force, is that fine?
        forces.push(minesForce);
      }
    } else {
      existingForce.duration = 10;
      existingForce.x = this.x;
      existingForce.y = this.y;
      //may need to update other properties in future if mine/ mine force behaviour change
    }
  }
}

class Trail extends Mine {
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.TRAIL,
    hitFrame = -105,
    playerId = "",
    angle,
    length,
    width
  ) {
    super(id, x, y, duration, radius, color, force, mineType, hitFrame, playerId);
    this.angle = angle;
    this.length = length;
    this.width = width;
  }
  createForce() {
    super.createForce();
  }
}

class FreeMine extends Mine {
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.FREE_MINE,
    hitFrame = -105,
    playerId = "",
    angle,
    points
  ) {
    super(id, x, y, duration, radius, color, force, mineType, hitFrame, playerId);
    this.angle = angle;
    this.points = points;
  }
  createForce() {
    super.createForce();
  }
}

class PowerUp extends Entity {
  constructor(id = null, x = null, y = null, color = null, isStar = false, radius = 5, value = 1, force = 0) {
    super(id, x, y);
    this.color = color;
    this.isStar = isStar;
    this.radius = radius;
    this.value = value;
    this.hitFrames = -56;
    this.force = force;
    if (force != 0) {
      this.createForce();
    }
  }

  createForce() {
    // Check if there is already a force with the same id
    const existingForce = forces.find((force) => force.id === "powerUp-" + this.id);

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      if (this.force !== 0) {
        let powerUpForce = new ForceArea("powerUp-" + this.id, this.x, this.y, 0.3, 10, 200, this.force == 1, "yellow", this);
        forces.push(powerUpForce);
      }
    } else {
      existingForce.duration = 10;
      existingForce.x = this.x;
      existingForce.y = this.y;
      //may need to update other properties in future behaviour changes
    }
  }
}

function createForceFromObject(obj) {
  //why is tracks a new player not a found one?
  let tracks = null;
  if (obj.tracks != null) {
    tracks = new _player_js__WEBPACK_IMPORTED_MODULE_0__.Player(
      obj.tracks.id,
      obj.tracks.x,
      obj.tracks.y,
      obj.tracks.powerUps,
      obj.tracks.color,
      obj.tracks.angle,
      obj.tracks.pilot,
      obj.tracks.name,
      obj.tracks.isPlaying,
      obj.tracks.isUserControlledCharacter
    );
  }
  let force = new ForceArea(
    obj.id,
    obj.x,
    obj.y,
    obj.force,
    obj.duration,
    obj.radius,
    obj.isAttractive,
    obj.color,
    tracks,
    obj.coneAngle,
    obj.direction,
    obj.type,
    obj.width,
    obj.length
  );
  force.numberArrowsEachSide = obj.numberArrowsEachSide;
  force.numberArrowsDeep = obj.numberArrowsDeep;
  return force;
}
function createMineFromObject(obj) {
  let mine = new Mine(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color, obj.force, obj.mineType, obj.hitFrame, obj.playerId);
  return mine;
}
function createTrailFromObject(obj) {
  let trail = new Trail(
    obj.id,
    obj.x,
    obj.y,
    obj.duration,
    obj.radius,
    obj.color,
    obj.force,
    obj.mineType,
    obj.hitFrame,
    obj.playerId,
    obj.angle,
    obj.length,
    obj.width
  );
  return trail;
}
function createFreeMineFromObject(obj) {
  let freeMine = new FreeMine(
    obj.id,
    obj.x,
    obj.y,
    obj.duration,
    obj.radius,
    obj.color,
    obj.force,
    obj.mineType,
    obj.hitFrame,
    obj.playerId,
    obj.points,
    obj.angle
  );
  return freeMine;
}
function createPowerUpFromObject(obj) {
  let powerUp = new PowerUp(obj.id, obj.x, obj.y, obj.color, obj.isStar, obj.radius, obj.value);
  return powerUp;
}
function createEffectFromObject(obj) {
  let effect = new Effect(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color, obj.type);
  return effect;
}

function setEffects(newEffects) {
  if (newEffects !== effects) {
    //update original array while keeping the reference
    effects.length = 0;
    effects.push(...newEffects);
  }
}


/***/ }),

/***/ "./entitySerialisation.js":
/*!********************************!*\
  !*** ./entitySerialisation.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   serializeEffects: () => (/* binding */ serializeEffects),
/* harmony export */   serializeForces: () => (/* binding */ serializeForces),
/* harmony export */   serializeGlobalPowerUps: () => (/* binding */ serializeGlobalPowerUps),
/* harmony export */   serializeMines: () => (/* binding */ serializeMines)
/* harmony export */ });
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
let lastSentMasterMineData = [];
let lastSentGlobalPowerUps = [];
let lastSentForces = [];
let lastSentEffects = [];


function serializeForces(forces, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed forces
    const changedForceData = forces
      .map((currentForce) => {
        const lastSentForceData = lastSentForces.find((lastForceData) => lastForceData.id === currentForce.id);
        const serializedForce = serializeForce(currentForce);

        // Compare the serialized data of the current force with the last sent data
        if (!lastSentForceData || !isEqualForce(serializedForce, lastSentForceData)) {
          // Update lastSentForces with the new serialized data if changed
          lastSentForces = lastSentForces.map((force) => (force.id === currentForce.id ? serializedForce : force));
          return serializedForce;
        }

        // Return null for forces that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedForceData;
  } else {
    // If onlyChangedData is false, update lastSentForces with the current serialized data
    lastSentForces = forces.map(serializeForce);

    // Serialize and return all forces
    return lastSentForces;
  }
}

// Define a function to serialize a force's data
function serializeForce(force) {
  return {
    id: force.id,
    x: force.x,
    y: force.y,
    force: force.force,
    duration: force.duration,
    radius: force.radius,
    isAttractive: force.isAttractive,
    color: force.color,
    tracks: force.tracks,
    coneAngle: force.coneAngle,
    direction: force.direction,
    type: force.type,
    numberArrowsEachSide: force.numberArrowsEachSide,
    numberArrowsDeep: force.numberArrowsDeep,
    width: force.width,
    length: force.length,
  };
}

// compare force objects for equality
function isEqualForce(force1, force2) {
  const tolerance = 1e-4;
  return (
    Math.abs(force1.x - force2.x) < tolerance &&
    Math.abs(force1.y - force2.y) < tolerance &&
    force1.force === force2.force &&
    //we won't sent if only the duration is different
    // force1.duration === force2.duration &&
    force1.radius === force2.radius &&
    force1.isAttractive === force2.isAttractive &&
    force1.color === force2.color &&
    force1.tracks === force2.tracks &&
    force1.coneAngle === force2.coneAngle &&
    force1.direction === force2.direction &&
    force1.type === force2.type &&
    force1.numberArrowsEachSide === force2.numberArrowsEachSide &&
    force1.numberArrowsDeep === force2.numberArrowsDeep &&
    force1.width === force2.width &&
    force1.length === force2.length
  );
}

function serializeMines(mines, onlyChangedData = false, omitTrailMines = true) {
  let minesToSerialize = null;
  if (omitTrailMines) {
    minesToSerialize = mines.filter((mine) => mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_0__.MineType.REGULAR || mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_0__.MineType.FREE_MINE);
  } else {
    minesToSerialize = mines;
  }
  if (onlyChangedData) {
    // Serialize and return only the changed mines
    const changedMineData = minesToSerialize
      .map((currentMine) => {
        const lastSentMineData = lastSentMasterMineData.find((lastMineData) => lastMineData.id === currentMine.id);
        let serializedMine;
        if (currentMine instanceof _entities_js__WEBPACK_IMPORTED_MODULE_0__.Trail) {
          serializedMine = serializeTrail(currentMine);
          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualTrail(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        } else if (currentMine instanceof _entities_js__WEBPACK_IMPORTED_MODULE_0__.FreeMine) {
          serializedMine = serializeFreeMine(currentMine);

          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualFreeMine(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        } else {
          serializedMine = serializeMine(currentMine);

          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualMine(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        }
        // Return null for mines that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedMineData;
  } else {
    // If onlyChangedData is false, update lastSentMasterMineData with the current serialized data
    lastSentMasterMineData = minesToSerialize.map(serializeMine);

    // Serialize and return all mines
    return lastSentMasterMineData;
  }
}

function serializeMine(mine) {
  return {
    id: mine.id,
    x: mine.x,
    y: mine.y,
    force: mine.force,
    duration: mine.duration,
    radius: mine.radius,
    hitFrames: mine.hitFrames,
    color: mine.color,
    mineType: mine.mineType,
    playerId: mine.playerId,
  };
}

// Define a function to compare mine objects for equality
function isEqualMine(mine1, mine2) {
  const tolerance = 1e-4;
  return (
    Math.abs(mine1.x - mine2.x) < tolerance &&
    Math.abs(mine1.y - mine2.y) < tolerance &&
    mine1.force === mine2.force &&
    mine1.duration === mine2.duration &&
    mine1.radius === mine2.radius &&
    mine1.hitFrames === mine2.hitFrames &&
    mine1.color === mine2.color &&
    mine1.mineType === mine2.mineType &&
    mine1.playerId === mine2.playerId
  );
}

function serializeFreeMine(mine) {
  return {
    id: mine.id,
    x: mine.x,
    y: mine.y,
    force: mine.force,
    duration: mine.duration,
    radius: mine.radius,
    hitFrames: mine.hitFrames,
    color: mine.color,
    mineType: mine.mineType,
    playerId: mine.playerId,
    points: mine.points,
    angle: mine.angle,
  };
}

// Define a function to compare mine objects for equality
function isEqualFreeMine(mine1, mine2) {
  const tolerance = 1e-4;
  return (
    Math.abs(mine1.x - mine2.x) < tolerance &&
    Math.abs(mine1.y - mine2.y) < tolerance &&
    mine1.force === mine2.force &&
    mine1.duration === mine2.duration &&
    mine1.radius === mine2.radius &&
    mine1.hitFrames === mine2.hitFrames &&
    mine1.color === mine2.color &&
    mine1.mineType === mine2.mineType &&
    mine1.playerId === mine2.playerId &&
    mine1.points === mine2.points &&
    mine1.angle === mine2.angle
  );
}

function serializeTrail(trail) {
  return {
    id: trail.id,
    x: trail.x,
    y: trail.y,
    force: trail.force,
    duration: trail.duration,
    radius: trail.radius,
    hitFrames: trail.hitFrames,
    color: trail.color,
    trail: trail.mineType,
    playerId: trail.playerId,
    angle: trail.angle,
    length: trail.length,
    width: trail.width,
  };
}

// Define a function to compare mine objects for equality
function isEqualTrail(trail1, trail2) {
  const tolerance = 1e-4;
  return (
    Math.abs(trail1.x - trail2.x) < tolerance &&
    Math.abs(trail1.y - trail2.y) < tolerance &&
    trail1.force === trail2.force &&
    trail1.duration === trail2.duration &&
    trail1.radius === trail2.radius &&
    trail1.hitFrames === trail2.hitFrames &&
    trail1.color === trail2.color &&
    trail1.mineType === trail2.mineType &&
    trail1.playerId === trail2.playerId
  );
}

function serializeGlobalPowerUps(globalPowerUps, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed globalPowerUps
    let changedGlobalPowerUpData = globalPowerUps
      .map((currentPowerUp) => {
        const lastSentPowerUpData = lastSentGlobalPowerUps.find((lastPowerUpData) => lastPowerUpData.id === currentPowerUp.id);
        const serializedPowerUp = serializeGlobalPowerUp(currentPowerUp);

        // Compare the serialized data of the current globalPowerUp with the last sent data
        if (!lastSentPowerUpData || !isEqualGlobalPowerUp(serializedPowerUp, lastSentPowerUpData)) {
          // Update lastSentGlobalPowerUps with the new serialized data if changed
          lastSentGlobalPowerUps = lastSentGlobalPowerUps.map((powerUp) => (powerUp.id === currentPowerUp.id ? serializedPowerUp : powerUp));
          return serializedPowerUp;
        }

        // Return null for globalPowerUps that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);
    return changedGlobalPowerUpData;
  } else {
    // If onlyChangedData is false, update lastSentGlobalPowerUps with the current serialized data
    lastSentGlobalPowerUps = globalPowerUps.map(serializeGlobalPowerUp);

    // Serialize and return all globalPowerUps
    return lastSentGlobalPowerUps;
  }
}

// Define a function to serialize a globalPowerUp's data
function serializeGlobalPowerUp(powerUp) {
  return {
    id: powerUp.id,
    x: powerUp.x,
    y: powerUp.y,
    color: powerUp.color,
    isStar: powerUp.isStar,
    radius: powerUp.radius,
    value: powerUp.value,
    hitFrames: powerUp.hitFrames,
  };
}

// Define a function to compare globalPowerUp objects for equality
function isEqualGlobalPowerUp(powerUp1, powerUp2) {
  const tolerance = 1e-4;
  return (
    Math.abs(powerUp1.x - powerUp2.x) < tolerance &&
    Math.abs(powerUp1.y - powerUp2.y) < tolerance &&
    powerUp1.color === powerUp2.color &&
    powerUp1.isStar === powerUp2.isStar &&
    powerUp1.radius === powerUp2.radius &&
    powerUp1.value === powerUp2.value &&
    powerUp1.hitFrames === powerUp2.hitFrames
  );
}

function serializeEffects(effects, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed globalPowerUps
    let changedEffectsData = effects
      .map((currentEffect) => {
        const lastSentEffectData = lastSentEffects.find((lastPowerUpData) => lastPowerUpData.id === currentEffect.id);
        const serializedEffect = serializeEffect(currentEffect);

        // Compare the serialized data of the current globalPowerUp with the last sent data
        if (!lastSentEffectData || !isEqualEffect(serializedEffect, lastSentEffectData)) {
          // Update lastSentEffects with the new serialized data if changed
          lastSentEffects = lastSentEffects.map((effect) => (effect.id === currentEffect.id ? serializedEffect : effect));
          return serializedEffect;
        }

        // Return null for effects that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);
    return changedEffectsData;
  } else {
    // If onlyChangedData is false, update lastSentEffects with the current serialized data
    lastSentEffects = effects.map(serializeEffect);

    // Serialize and return all effects
    return lastSentEffects;
  }
}

// Define a function to serialize a globalPowerUp's data
function serializeEffect(effect) {
  return {
    id: effect.id,
    x: effect.x,
    y: effect.y,
    color: effect.color,
    duration: effect.isStar,
    radius: effect.radius,
    type: effect.type,
  };
}

// Define a function to compare globalPowerUp objects for equality
function isEqualEffect(effect1, effect2) {
  const tolerance = 1e-4;
  return (
    Math.abs(effect1.x - effect2.x) < tolerance &&
    Math.abs(effect1.y - effect2.y) < tolerance &&
    effect1.color === effect2.color &&
    effect1.duration === effect2.duration &&
    effect1.type === effect2.type &&
    effect1.radius === effect2.radius
  );
}


/***/ }),

/***/ "./forceDrawing.js":
/*!*************************!*\
  !*** ./forceDrawing.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawForce: () => (/* binding */ drawForce)
/* harmony export */ });
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");




function drawForce(ctx, camX, camY, force) {
  if (force.duration <= 0) {
    return;
  }
  let centerX = force.x - camX;
  let centerY = force.y - camY;
  let color = force.color;
  let radius = force.radius;
  let width = force.width;
  let length = force.length;
  let attractive = force.isAttractive;
  let coneAngle = force.coneAngle;
  let direction = force.direction;
  ctx.strokeStyle = color;

  // Adjust the position based on the viewport
  let screenX = centerX;
  let screenY = centerY;
  ctx.beginPath();
  if (force.type == _entities_js__WEBPACK_IMPORTED_MODULE_1__.ForceType.POINT) {
    // Calculate the angle range for the cone
    let startAngle = direction - coneAngle / 2;
    let endAngle = direction + coneAngle / 2;

    // Normalize startAngle and endAngle to be within the range 0 to 2π
    startAngle = ((startAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    endAngle = ((endAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    let speed = 1;

    //this will be 0.2-1
    let animationPosition = 0;
    let animationPosition2 = 0;
    if (attractive) {
      animationPosition = 1 - ((_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.basicAnimationTimer * speed) % 85) / 100;
      animationPosition2 = 1 - ((_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.basicAnimationTimer * speed + 42.5) % 85) / 100;
    } else {
      animationPosition = ((_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.basicAnimationTimer * speed) % 85) / 100 + 0.15;
      animationPosition2 = ((_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.basicAnimationTimer * speed + 42.5) % 85) / 100 + 0.15;
    }

    if (coneAngle == 2 * Math.PI) {
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
      // Animated Circles
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * animationPosition, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * animationPosition2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.moveTo(screenX, screenY); // Move to the center of the cone
      ctx.lineTo(screenX + Math.cos(direction - coneAngle / 2) * radius, screenY + Math.sin(direction - coneAngle / 2) * radius); // Draw one edge of the cone
      ctx.arc(screenX, screenY, radius, direction - coneAngle / 2, direction + coneAngle / 2); // Draw the arc representing the cone
      ctx.lineTo(screenX, screenY); // Connect back to the center to close the shape
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(screenX, screenY); // Move to the center of the cone
      ctx.lineTo(
        screenX + Math.cos(direction - coneAngle / 2) * radius * animationPosition,
        screenY + Math.sin(direction - coneAngle / 2) * radius * animationPosition
      ); // Draw one edge of the cone
      ctx.arc(screenX, screenY, radius * animationPosition, direction - coneAngle / 2, direction + coneAngle / 2); // Draw the arc representing the cone
      ctx.lineTo(screenX, screenY);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(screenX, screenY); // Move to the center of the cone
      ctx.lineTo(
        screenX + Math.cos(direction - coneAngle / 2) * radius * animationPosition2,
        screenY + Math.sin(direction - coneAngle / 2) * radius * animationPosition2
      ); // Draw one edge of the cone
      ctx.arc(screenX, screenY, radius * animationPosition2, direction - coneAngle / 2, direction + coneAngle / 2); // Draw the arc representing the cone
      ctx.lineTo(screenX, screenY);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.moveTo(screenX, screenY);

    let increment = 10;
    if (coneAngle > 5) {
      increment = 40;
    }
    if (startAngle > endAngle) {
      // If startAngle is greater than endAngle, it means the cone crosses the 0/2π line.
      // In this case, we need to check if the angle is less than endAngle or greater than startAngle.
      for (let i = 0; i < 360; i += increment) {
        let angle = (i * Math.PI) / 180;
        angle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        if (angle <= endAngle || angle >= startAngle) {
          drawForceLines(ctx, attractive, radius, angle, screenX, screenY);
        }
      }
    } else {
      // If startAngle is less than endAngle, we can simply check if the angle is within this range.
      for (let i = 0; i < 360; i += increment) {
        let angle = (i * Math.PI) / 180;
        angle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        if ((angle >= startAngle && angle <= endAngle) || coneAngle == 2 * Math.PI) {
          drawForceLines(ctx, attractive, radius, angle, screenX, screenY);
        }
      }
    }
    ctx.stroke();
    ctx.closePath();
    if (force.effect == true && force.tracks != null && force.tracks.isLocal) {
      // applyGravityWarpEffect(ctx, screenX, screenY, radius,coneAngle,direction);
    }
  }
  if (force.type == _entities_js__WEBPACK_IMPORTED_MODULE_1__.ForceType.DIRECTIONAL) {
    // Calculate the coordinates of the four corners of the rectangle
    const halfWidth = width / 2;
    const halfLength = length / 2;
    let angle = direction;

    const x1 = screenX + halfWidth * Math.cos(angle) - halfLength * Math.sin(angle);
    const y1 = screenY + halfWidth * Math.sin(angle) + halfLength * Math.cos(angle);

    const x2 = screenX - halfWidth * Math.cos(angle) - halfLength * Math.sin(angle);
    const y2 = screenY - halfWidth * Math.sin(angle) + halfLength * Math.cos(angle);

    const x3 = screenX - halfWidth * Math.cos(angle) + halfLength * Math.sin(angle);
    const y3 = screenY - halfWidth * Math.sin(angle) - halfLength * Math.cos(angle);

    const x4 = screenX + halfWidth * Math.cos(angle) + halfLength * Math.sin(angle);
    const y4 = screenY + halfWidth * Math.sin(angle) - halfLength * Math.cos(angle);

    const rectCenterX = (x1 + x3) / 2;
    const rectCenterY = (y1 + y3) / 2;

    // Draw the rectangle by connecting the four corners
    ctx.moveTo(x1, y1);
    ctx.lineWidth = 1;
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();

    // Start the second path with a thick line for the segment from (x2, y2) to (x3, y3)
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineWidth = 8;
    ctx.lineTo(x3, y3);
    ctx.stroke();
    ctx.closePath();

    // Continue with the first path with a thin line
    // ctx.beginPath();
    ctx.moveTo(x3, y3);
    ctx.lineWidth = 1;
    ctx.lineTo(x4, y4);
    ctx.stroke();
    ctx.lineTo(x1, y1);

    //ctx.closePath();

    if (!force.attractive) {
      angle = angle + Math.PI;
    }

    const centerX = (x1 + x2 + x3 + x4) / 4;
    const centerY = (y1 + y2 + y3 + y4) / 4;

    const distX21 = x2 - x1;
    const distY21 = y2 - y1;
    const halfRectHeight = Math.sqrt(distX21 ** 2 + distY21 ** 2) / 2;

    const distX32 = x3 - x2;
    const distY32 = y3 - y2;
    const halfRectWidth = Math.sqrt(distX32 ** 2 + distY32 ** 2) / 2;

    let numPointsWide = force.numberArrowsEachSide;
    if (numPointsWide == null || numPointsWide == 0) {
      numPointsWide = Math.floor(halfRectWidth / 20);
      force.numberArrowsEachSide = numPointsWide;
    }
    let numPointsDeep = force.numberArrowsDeep;
    if (numPointsDeep == null || numPointsDeep == 0) {
      numPointsDeep = Math.floor(halfRectHeight / 40);
      force.numberArrowsDeep = numPointsDeep;
    }
    let speed = 1 + width / 150;
    let animationPosition = ((_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.basicAnimationTimer * speed) % 100) / 100 / numPointsDeep;

    let offsetWidthLeft = 0.05; // adjust the offset to create more or less space around the arrows
    let offsetWidthRight = 0.05; // adjust the offset to create more or less space around the arrows
    let startWidth = offsetWidthLeft;
    let endWidth = 1 - offsetWidthRight;

    let offsetHeightBottom = -0.5 + animationPosition; // adjust the offset to create more or less space around the arrows
    let offsetHeightTop = -0.2 - animationPosition; // adjust the offset to create more or less space around the arrows

    let startHeight = offsetHeightBottom;
    let endHeight = 1 - offsetHeightTop;

    const clipRect1 = {
      clipx1: x1,
      clipy1: y1,
      clipx2: x2,
      clipy2: y2,
      clipx3: x3,
      clipy3: y3,
      clipx4: x4,
      clipy4: y4,
    };

    ctx.save();
    //   Create clipping paths for the custom rectangles
    ctx.beginPath();
    ctx.moveTo(clipRect1.clipx1, clipRect1.clipy1);
    ctx.lineTo(clipRect1.clipx2, clipRect1.clipy2);
    ctx.lineTo(clipRect1.clipx3, clipRect1.clipy3);
    ctx.lineTo(clipRect1.clipx4, clipRect1.clipy4);
    ctx.closePath();
    ctx.clip();

    // ctx.strokeStyle = color;
    for (let i = startHeight * numPointsDeep; i <= endHeight * numPointsDeep; i++) {
      // for (let i = startHeight * (numPointsDeep - 1); i <= endHeight * (numPointsDeep - 1); i++) {
      for (let j = startWidth * numPointsWide; j <= endWidth * numPointsWide; j++) {
        let t = j / numPointsWide; // Parameter value along the direction of the arrows.
        let s = i / numPointsDeep; // Parameter value along the direction perpendicular to arrows.

        // Calculate a point in the rectangle using (1 - t)(1 - s)P1 + (1 - t)sP2 + t(1 - s)P3 + tsP4.
        let x = (1 - t) * ((1 - s) * x1 + s * x2) + t * ((1 - s) * x4 + s * x3);
        let y = (1 - t) * ((1 - s) * y1 + s * y2) + t * ((1 - s) * y4 + s * y3);
        (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.drawArrow)(ctx, { x, y }, angle, 50, 20);
      }
    }

    ctx.stroke();
    ctx.restore();
  }
}

function drawForceLines(ctx, attractive, radius, angle, screenX, screenY) {
  const arrowheadLength = 15;
  const arrowheadAngle = Math.PI / 8;

  if (attractive) {
    // Draw inwards arrows
    const arrowX = screenX + 0.8 * radius * Math.cos(angle);
    const arrowY = screenY + 0.8 * radius * Math.sin(angle);

    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.drawArrow)(ctx, { x: arrowX, y: arrowY }, angle + Math.PI, 100, arrowheadLength, arrowheadAngle);
  } else {
    // Draw outwards arrows
    const arrowX = screenX + 0.3 * radius * Math.cos(angle);
    const arrowY = screenY + 0.3 * radius * Math.sin(angle);

    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.drawArrow)(ctx, { x: arrowX, y: arrowY }, angle, 100, arrowheadLength, arrowheadAngle);
  }
}


/***/ }),

/***/ "./gameDrawing.js":
/*!************************!*\
  !*** ./gameDrawing.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawEffect: () => (/* binding */ drawEffect),
/* harmony export */   drawPowerups: () => (/* binding */ drawPowerups),
/* harmony export */   drawScene: () => (/* binding */ drawScene)
/* harmony export */ });
/* harmony import */ var _drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawGameUI.js */ "./drawGameUI.js");
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _backgroundDrawing_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./backgroundDrawing.js */ "./backgroundDrawing.js");
/* harmony import */ var _miniMapDrawing_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./miniMapDrawing.js */ "./miniMapDrawing.js");
/* harmony import */ var _drawShip_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./drawShip.js */ "./drawShip.js");
/* harmony import */ var _forceDrawing_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./forceDrawing.js */ "./forceDrawing.js");
/* harmony import */ var _mineDrawing_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./mineDrawing.js */ "./mineDrawing.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");










let backLayer = new Image();
let midBackLayer = new Image();
let middleLayer = new Image();
let midFrontLayer = new Image();
let frontLayer = new Image();
backLayer.src = "images/parallax-space-background.png";
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

function drawScene(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  (0,_backgroundDrawing_js__WEBPACK_IMPORTED_MODULE_3__.drawBackground)(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer);
  (0,_backgroundDrawing_js__WEBPACK_IMPORTED_MODULE_3__.drawWorldBounds)(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  drawPowerups(globalPowerUps, ctx, camX, camY);
  mines.forEach((mine) => (0,_mineDrawing_js__WEBPACK_IMPORTED_MODULE_7__.drawMine)(ctx, camX, camY, mine, _drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.spikeyBallPoints));
  _entities_js__WEBPACK_IMPORTED_MODULE_2__.forces.forEach((force) => (0,_forceDrawing_js__WEBPACK_IMPORTED_MODULE_6__.drawForce)(ctx, camX, camY, force));
  _entities_js__WEBPACK_IMPORTED_MODULE_2__.effects.forEach((effect) => drawEffect(ctx, camX, camY, effect));
  bots.forEach((bot) => (0,_drawShip_js__WEBPACK_IMPORTED_MODULE_5__.drawShip)(ctx, camX, camY, bot, shipPoints));
  otherPlayers.forEach((player) => (0,_drawShip_js__WEBPACK_IMPORTED_MODULE_5__.drawShip)(ctx, camX, camY, player, shipPoints));

  (0,_miniMapDrawing_js__WEBPACK_IMPORTED_MODULE_4__.drawMinimap)(player, otherPlayers, bots, worldDimensions.width, worldDimensions.height);
  (0,_miniMapDrawing_js__WEBPACK_IMPORTED_MODULE_4__.drawMinimapPowerups)(globalPowerUps, worldDimensions.width, worldDimensions.height);
  if (player != null) {
    (0,_drawShip_js__WEBPACK_IMPORTED_MODULE_5__.drawShip)(ctx, camX, camY, player, shipPoints);
    (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__.renderDebugInfo)(ctx, player, bots);
    // drawInvincibilityGauge(ctx, player, canvas.width / 2, canvas.height - 70);
    (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__.drawSpecialGauge)(ctx, player, canvas.width / 2, canvas.height - 20);
  }
  (0,_drawGameUI_js__WEBPACK_IMPORTED_MODULE_0__.drawPowerupLevels)(ctx, player, otherPlayers, bots);
}

function drawPowerups(globalPowerUps, ctx, camX, camY) {
  globalPowerUps.forEach((powerUp) => {
    const currentTime = Date.now();
    let elapsedTime = currentTime - powerUp.starTransitionStartTime;
    const transitionDuration = 200;
    if (isNaN(elapsedTime)) {
      elapsedTime = Math.floor(Math.random() * transitionDuration);
    }
    if (!powerUp.starTransitionStartTime || elapsedTime >= transitionDuration) {
      powerUp.starTransitionStartTime = currentTime - elapsedTime;
    }
    const animationFrame = elapsedTime % transitionDuration;

    // Save the current canvas state
    ctx.save();

    if (powerUp.hitFrames < -1) {
      (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.applyGlowingEffect)(ctx, "white", powerUp.color, "white", transitionDuration, animationFrame, 0.2);
    } else if (powerUp.isStar) {
      // Apply a glowing effect for star ships
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "gold"; // Adjust the stroke color to match the glow

      // Gradually change the star's color
      const transitionEndColor = "gold"; // Final color
      (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.applyGlowingEffect)(ctx, "gold", powerUp.color, transitionEndColor, transitionDuration, animationFrame);
    } else {
      ctx.strokeStyle = powerUp.color;
      ctx.fillStyle = powerUp.color;
    }
    // Rotate the star
    const rotationSpeed = 2 / (powerUp.radius * powerUp.radius); // Adjust the rotation speed
    const rotationAngle = (elapsedTime * rotationSpeed) % (2 * Math.PI);

    // Translate the canvas origin to the power-up position
    ctx.translate(powerUp.x - camX, powerUp.y - camY);
    ctx.rotate(rotationAngle);
    drawStar(ctx, powerUp.radius);

    // Restore the canvas state to prevent transformations from affecting other objects
    ctx.restore();
  });
}

// Function to draw a simple star shape (you can replace this with your custom image/icon drawing logic)
function drawStar(ctx, radius) {
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  for (let i = 0; i < 5; i++) {
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -0.6 * radius);
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawEffect(ctx, camX, camY, effect) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - effect.starTransitionStartTime;
  const transitionDuration = 80;
  const animatationFrame = elapsedTime % transitionDuration;
  if (effect.duration >= 0) {
    if (!effect.starTransitionStartTime || elapsedTime >= transitionDuration) {
      effect.starTransitionStartTime = currentTime;
    }
    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_1__.applyGlowingEffect)(ctx, "white", effect.color, "white", transitionDuration, animatationFrame, 0.2);
  } else {
    ctx.strokeStyle = effect.color;
    ctx.fillStyle = effect.color;
  }

  if (!effect.type || effect.type == "") {
    ctx.beginPath();
    ctx.arc(effect.x - camX, effect.y - camY, effect.radius, 0, Math.PI * 2);

    ctx.fill();
  } else if (effect.type == "temp") {
    const animationDuration = 120;
    const animatationFrame = elapsedTime % animationDuration;
  } else if (effect.type === _entities_js__WEBPACK_IMPORTED_MODULE_2__.EffectType.EXPLOSION) {
    const animationDuration = 120;
    const numFrames = 10; // Number of frames for the explosion
    const frameDuration = animationDuration / numFrames;
    const frameIndex = Math.floor(elapsedTime / frameDuration);
    const maxRadius = effect.radius * 3; // Maximum explosion radius

    if (frameIndex < numFrames) {
      // Calculate the current radius for the explosion
      let currentRadius = (frameIndex / numFrames) * maxRadius;
      currentRadius = Math.max(currentRadius, 0);
      // Draw the expanding circle
      ctx.beginPath();
      ctx.arc(effect.x - camX, effect.y - camY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Optionally, add a stroke for an outline effect
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
}


/***/ }),

/***/ "./gameLogic.js":
/*!**********************!*\
  !*** ./gameLogic.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pilot: () => (/* binding */ Pilot),
/* harmony export */   PilotName: () => (/* binding */ PilotName),
/* harmony export */   achievementsTitle: () => (/* binding */ achievementsTitle),
/* harmony export */   basicAnimationTimer: () => (/* binding */ basicAnimationTimer),
/* harmony export */   botRespawnDelay: () => (/* binding */ botRespawnDelay),
/* harmony export */   calculateLevelXP: () => (/* binding */ calculateLevelXP),
/* harmony export */   endGameMessage: () => (/* binding */ endGameMessage),
/* harmony export */   gameWon: () => (/* binding */ gameWon),
/* harmony export */   getLevel: () => (/* binding */ getLevel),
/* harmony export */   getLevelXP: () => (/* binding */ getLevelXP),
/* harmony export */   getNextLevelXP: () => (/* binding */ getNextLevelXP),
/* harmony export */   getXp: () => (/* binding */ getXp),
/* harmony export */   getXpToNextLevel: () => (/* binding */ getXpToNextLevel),
/* harmony export */   incrementLevelAnimationFrame: () => (/* binding */ incrementLevelAnimationFrame),
/* harmony export */   initialInvincibleTime: () => (/* binding */ initialInvincibleTime),
/* harmony export */   levelAnimationFrame: () => (/* binding */ levelAnimationFrame),
/* harmony export */   masterUpdateGame: () => (/* binding */ masterUpdateGame),
/* harmony export */   maxInvincibilityTime: () => (/* binding */ maxInvincibilityTime),
/* harmony export */   maxSpecialMeter: () => (/* binding */ maxSpecialMeter),
/* harmony export */   max_player_name: () => (/* binding */ max_player_name),
/* harmony export */   pilot1: () => (/* binding */ pilot1),
/* harmony export */   pilot2: () => (/* binding */ pilot2),
/* harmony export */   pilot3: () => (/* binding */ pilot3),
/* harmony export */   pilot4: () => (/* binding */ pilot4),
/* harmony export */   pilots: () => (/* binding */ pilots),
/* harmony export */   setAchievementsTitle: () => (/* binding */ setAchievementsTitle),
/* harmony export */   setEndGameMessage: () => (/* binding */ setEndGameMessage),
/* harmony export */   setGameWon: () => (/* binding */ setGameWon),
/* harmony export */   setUpdateRequested: () => (/* binding */ setUpdateRequested),
/* harmony export */   spawnProtectionTime: () => (/* binding */ spawnProtectionTime),
/* harmony export */   updateBots: () => (/* binding */ updateBots),
/* harmony export */   updateEnemies: () => (/* binding */ updateEnemies),
/* harmony export */   updateOtherPlayers: () => (/* binding */ updateOtherPlayers),
/* harmony export */   updatePowerups: () => (/* binding */ updatePowerups),
/* harmony export */   updateRequested: () => (/* binding */ updateRequested)
/* harmony export */ });
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _collisionLogic_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collisionLogic.js */ "./collisionLogic.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _login_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./login.js */ "./login.js");
/* harmony import */ var _generateEntities_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./generateEntities.js */ "./generateEntities.js");
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./player.js */ "./player.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _trailShapes_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./trailShapes.js */ "./trailShapes.js");











let initialInvincibleTime = 60 * 10;
let maxInvincibilityTime = initialInvincibleTime;
let maxSpecialMeter = 200;

// let directionalForces = [];
let spawnProtectionTime = 200;
let endGameMessage = "";
let gameWon = false;
let basicAnimationTimer = 0;
let updateRequested = false;
function setUpdateRequested(newValue) {
  updateRequested = newValue;
}
const botRespawnDelay = 240;
const PilotName = {
  PILOT_1: "pilot1",
  PILOT_2: "pilot2",
  PILOT_3: "pilot3",
  PILOT_4: "pilot4",
};
let levelAnimationFrame = 0;

function incrementLevelAnimationFrame() {
  levelAnimationFrame++;
}
let achievementsTitle = _login_js__WEBPACK_IMPORTED_MODULE_4__.achievementsTitleText.LOGIN_TO_TRACK;

function setAchievementsTitle(newTitle) {
  achievementsTitle = newTitle;
}

class Pilot extends _entities_js__WEBPACK_IMPORTED_MODULE_3__.Entity {
  constructor(
    id = null,
    x = null,
    y = null,
    width = 100,
    height = 130,
    lore = "",
    name = "",
    src = "",
    pilotInvincibilityTime = 600,
    trailTime = 100,
    selected = false
  ) {
    super(id, x, y);
    this.image = new Image();
    this.width = width;
    this.height = height;
    this.lore = lore;
    this.name = name;
    this.src = src;
    //deafult 600 is 10 seconds
    this.invincibilityTime = pilotInvincibilityTime;
    this.trailTime = trailTime;
    this.selected = selected;
    this.pilotAnimationFrame = 0;
  }
  setSelected(newSelectedValue) {
    if (newSelectedValue && !this.selected) {
      this.pilotAnimationFrame = 0;
    }
    this.selected = newSelectedValue;
  }
}
const pilot1 = new Pilot(
  PilotName.PILOT_1,
  0,
  0,
  100,
  130,
  "Sunny Sam; Speed: 4; Invicible Time: 10;Special: Gravity Attract; Ugh, here's Sunny Side-Up Sam, the carrot who's always shining bright. How original, right? He's the 'hero' of this carrot caper, or so he thinks. Just an average carrot trying way too hard to be cool. Yawn. Is he in this tournament to prove he's the 'coolest' carrot around?;Agressive: likes to get powered up and use Gravity Attract to get kills",
  PilotName.PILOT_1,
  "carrot1Canvas",
  600,
  100
);
const pilot2 = new Pilot(
  PilotName.PILOT_2,
  0,
  0,
  100,
  130,
  "Girthy Gordon; Speed: 2; Invicible Time: 15;Special: Gravity Repel; A Grumpy, portly carrot with a penchant for defense. You've seen it all before, right? He might be slow, but that doesn't stop him from being the predictable 'tank' of the group. Originality, anyone? Is he here for vengeance, or is there something even darker lurking beneath his carrot exterior?;Defensive: not so fast but can use Gravity Repel to keep attackers away ",
  PilotName.PILOT_2,
  "carrot2Canvas",
  900,
  120
);
const pilot3 = new Pilot(
  PilotName.PILOT_3,
  0,
  0,
  100,
  130,
  "Zippy; Speed: 5; Invicible Time: 10; Special: Speed Boost; Fast but weak, unathletic, and clumsier than a bull in a china shop. He's also surprisingly tight with his money, counting every last carrot coin. Zipping around like he's in a hurry to save a few bucks. A tiny carrot with a big cliché and an even smaller wallet. Maybe he stumbled into the tournament by accident, and now he's just trying to survive the chaos!;Speedy: tricky to control. Not for scrubs! ",
  PilotName.PILOT_3,
  "carrot3Canvas",
  600,
  100
);
const pilot4 = new Pilot(
  PilotName.PILOT_4,
  0,
  0,
  100,
  130,
  "Stan; Speed: 3; Invicible Time: 12; Special: Tractor Beam; Forever in shock, like he just found out he's a carrot. With his bleeding eyes and a backstory that involves suffering radiation poisoning from being half-cooked in the microwave. In endless pain some say he want's to win the tournament only as part of his plan to make sure the entire universe suffers as he does.;Sneaky!: Powerful long range narrow tractor beam can cause havok from afar!",
  PilotName.PILOT_4,
  "carrot4Canvas",
  700,
  150
);

let pilots = [pilot1, pilot2, pilot3, pilot4];

const max_player_name = 15;

function setEndGameMessage(newMessage) {
  endGameMessage = newMessage;
}

function resetPowerLevels(player, otherPlayers, globalPowerUps) {
  // Reset my powerUps
  player.powerUps = 0;

  // Reset powerUps of other players
  otherPlayers.forEach((player) => {
    player.powerUps = 0;
  });

  // Send updated powerUps to other players
  (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendPlayerStates)(player, (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player));
}

function shipHitsBorder(x, y) {
  return x < 0 || y < 0 || x > worldWidth || y > worldHeight;
}

function setGameWon(won) {
  gameWon = won;
}

function updateEnemies(deltaTime) {
  // Update the positions, velocities, etc. of the enemies, create and track forces
  //todo sync forces to deltaTime... could the level of force be linked?
  //or could we get away with only creating new force if old one doesn't exist?
  // Remove mines with hit frames that have expired.
  for (let i = _main_js__WEBPACK_IMPORTED_MODULE_6__.mines.length - 1; i >= 0; i--) {
    let mine = _main_js__WEBPACK_IMPORTED_MODULE_6__.mines[i];
    mine.createForce();
    if (mine.hitFrames < -1) {
      // in "initialising" state - do this first before potential splicing
      mine.hitFrames++;
    }
    if (mine.hitFrames >= 0) {
      mine.hitFrames--;
      // If hit frames have expired, remove the mine.
      if (mine.hitFrames < 0) {
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_6__.player)) {
          (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendRemoveEntityUpdate)("removeMines", [mine]);
        }
        _main_js__WEBPACK_IMPORTED_MODULE_6__.mines.splice(i, 1);
      }
    }

    if (mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.TRAIL || mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.FREE_MINE) {
      if (mine.duration > 0) {
        mine.duration--;
      }
      if (mine.duration <= 0) {
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_6__.player)) {
          //trying letting trails ride without syncing
          //sendRemoveEntityUpdate("removeMines", [mine]);
        }
        _main_js__WEBPACK_IMPORTED_MODULE_6__.mines.splice(i, 1);
      }
    }
  }

  for (let powerUp of _main_js__WEBPACK_IMPORTED_MODULE_6__.globalPowerUps) {
    powerUp.createForce();
  }

  for (let force of _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces) {
    if (force.duration > 0) {
      // for (let effectedPlayer of allPlayers){
      if (force.tracks != null && force.tracks.isPlaying && !force.tracks.isDead) {
        force.x = force.tracks.x;
        force.y = force.tracks.y;
      }
      // }
      try {
        force.setDuration(force.duration - 1);
      } catch (Exception) {
        console.log("force issue");
      }
    }
  }
}

function updateOtherPlayers(deltaTime, mines, camX, camY) {
  _main_js__WEBPACK_IMPORTED_MODULE_6__.otherPlayers.forEach((otherPlayer, index) => {
    // Check if player is an instance of the Player class
    if (otherPlayer != null && otherPlayer instanceof _player_js__WEBPACK_IMPORTED_MODULE_7__.Player) {
      if (otherPlayer.name != "") {
        otherPlayer.updateTick(deltaTime, mines, camX, camY);
      }
    } else {
      console.log("otherPlayer is not an instance of the Player class. Reinitializing...");

      // Create a new Player object using the properties of the otherplayer
      const newPlayer = new _player_js__WEBPACK_IMPORTED_MODULE_7__.Player(
        otherPlayer.id,
        otherPlayer.x,
        otherPlayer.y,
        otherPlayer.powerUps,
        otherPlayer.color,
        otherPlayer.getAngle(),
        otherPlayer.pilot,
        otherPlayer.name,
        otherPlayer.isPlaying
      );

      // Replace the old player with the new Player instance in the array
      otherPlayer[index] = newPlayer;
    }
  });
}

function updateBots(deltaTime, mines, camX, camY) {
  _main_js__WEBPACK_IMPORTED_MODULE_6__.bots.forEach((bot, index) => {
    // Check if bot is an instance of the Bot class
    if (bot == null || !(bot instanceof _player_js__WEBPACK_IMPORTED_MODULE_7__.Bot)) {
      // console.log("Bot is not an instance of the Bot class. Reinitializing...");

      // Create a new Bot object using the properties of the bot
      const newPlayer = new _player_js__WEBPACK_IMPORTED_MODULE_7__.Bot(
        bot.id,
        bot.x,
        bot.y,
        bot.powerUps,
        bot.color,
        bot.getAngle(),
        bot.pilot,
        bot.name
        // Add other properties as needed
      );
      console.log("had to reinitialise bot");
      // Replace the old bot with the new Bot instance in the array
      _main_js__WEBPACK_IMPORTED_MODULE_6__.bots[index] = newPlayer;
    }
    if (bot != null && bot instanceof _player_js__WEBPACK_IMPORTED_MODULE_7__.Bot && bot.isDead) {
      bot.delayReset(botRespawnDelay, true, true);
    }
    if (bot != null && bot instanceof _player_js__WEBPACK_IMPORTED_MODULE_7__.Bot && !bot.isDead) {
      //todo not sure about this conditional
      if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_6__.player)) {
        bot.updateBotInputs();
      }
      bot.updateTick(deltaTime, mines, camX, camY);
    }
  });
}

function updatePowerups(deltaTime) {
  // Update the positions, velocities, etc. of the powerups once they move... they need their own update tick
  //setGlobalPowerUps(getGlobalPowerUps());
}

function masterUpdateGame(player, globalPowerUps, otherPlayers, bots, mines, deltaTime, camX, camY) {
  //this isn't synced between peers
  (0,_main_js__WEBPACK_IMPORTED_MODULE_6__.setGameTimer)(_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer + 1);
  if (!(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player)) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.setTimeSinceMessageFromMaster)(_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.timeSinceMessageFromMaster + 1);
  }
  player.updateTick(deltaTime, mines, camX, camY);
  // generateBots(worldWidth,worldHeight,colors);
  updateBots(deltaTime, mines, camX, camY);
  updateOtherPlayers(deltaTime, mines, camX, camY);
  updateEnemies(deltaTime);
  updatePowerups(deltaTime);

  // Detect collisions with powerups or other ships
  (0,_collisionLogic_js__WEBPACK_IMPORTED_MODULE_1__.detectCollisions)(player, globalPowerUps, bots, otherPlayers, _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces);

  // The master peer also detects collisions between all ships and powerups
  otherPlayers.forEach((otherPlayer) => {
    (0,_collisionLogic_js__WEBPACK_IMPORTED_MODULE_1__.detectCollisions)(otherPlayer, globalPowerUps, bots, otherPlayers, _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces);
  });

  bots.forEach((bot) => {
    (0,_collisionLogic_js__WEBPACK_IMPORTED_MODULE_1__.detectCollisions)(bot, globalPowerUps, bots, otherPlayers, _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces);
  });

  if (_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 2 == 0) {
    (0,_trailShapes_js__WEBPACK_IMPORTED_MODULE_9__.ProcessTrailShapesAllPlayers)(player, otherPlayers, mines, _entities_js__WEBPACK_IMPORTED_MODULE_3__.effects, globalPowerUps);
  }
  removeExpiredPowerUps(globalPowerUps, player);
  removeExpiredEffects(_entities_js__WEBPACK_IMPORTED_MODULE_3__.effects, player);
  basicAnimationTimer++;
  incrementLevelAnimationFrame();
  if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player)) {
    if (_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 89 == 1) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendEntitiesState)();
    } else if (_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 21 == 1) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendEntitiesUpdate)();
    } else if (_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 2 == 1) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendBotEntitiesUpdate)();
    }
  }
  if (!player.isDead && _main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 1 == 0) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendPlayerStates)(player, (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player));
  }

  if (_main_js__WEBPACK_IMPORTED_MODULE_6__.gameTimer % 100 == 2 && (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player)) {
    (0,_generateEntities_js__WEBPACK_IMPORTED_MODULE_5__.generateBots)(_main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.width, _main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.height, _main_js__WEBPACK_IMPORTED_MODULE_6__.colors);
    (0,_generateEntities_js__WEBPACK_IMPORTED_MODULE_5__.generatePowerups)(globalPowerUps, _main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.width, _main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.height, _main_js__WEBPACK_IMPORTED_MODULE_6__.powerUpColors);
    (0,_generateEntities_js__WEBPACK_IMPORTED_MODULE_5__.generateMines)(_main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.width, _main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.height, _main_js__WEBPACK_IMPORTED_MODULE_6__.colors);
    (0,_generateEntities_js__WEBPACK_IMPORTED_MODULE_5__.generateDirectionalForces)(_main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.width, _main_js__WEBPACK_IMPORTED_MODULE_6__.worldDimensions.height, _main_js__WEBPACK_IMPORTED_MODULE_6__.colors);
  }
}

// Function to remove expired power-ups
function removeExpiredPowerUps(globalPowerUps, player) {
  for (let i = globalPowerUps.length - 1; i >= 0; i--) {
    if (globalPowerUps[i].hitFrames < -1) {
      globalPowerUps[i].hitFrames++;
    }
    if (globalPowerUps[i].hitFrames >= 0) {
      globalPowerUps[i].hitFrames--;
      if (globalPowerUps[i].hitFrames < 0) {
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player)) {
          (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendRemoveEntityUpdate)("removePowerUps", [globalPowerUps[i]]);
        }
        globalPowerUps.splice(i, 1);
      }
    }
  }
}

// Function to remove expired effects
function removeExpiredEffects(effects, player) {
  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i].duration >= 0) {
      effects[i].duration--;
      if (effects[i].duration < 0) {
        if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(player)) {
          (0,_sendData_js__WEBPACK_IMPORTED_MODULE_8__.sendRemoveEntityUpdate)("removeEffect", [effects[i]]);
        }
        effects.splice(i, 1);
      }
    }
  }
}
// Initial XP required for first level up
let initialXPRequired = 100;
let xpRequiredGrowthFactor = 1.6;

function getXp() {
  let totalXp = 0;
  totalXp += _db_js__WEBPACK_IMPORTED_MODULE_2__.allTimePoints;
  totalXp += _db_js__WEBPACK_IMPORTED_MODULE_2__.allTimeKills * 500;
  totalXp += _db_js__WEBPACK_IMPORTED_MODULE_2__.allTimeLogins * 1;
  return totalXp;
}

function calculateLevelXP(xp, initialXPRequired, growthFactor) {
  let level = 1;
  let xpRequired = initialXPRequired;

  // Find the level at which the given XP belongs
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * growthFactor); // Increase XP required for the next level
  }
  let xpToNextLevel = xpRequired - xp;

  return { level, remainingXP: xp, nextLevelXP: xpRequired, xpToNextLevel };
}

function getLevel(xp) {
  const { level } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return level;
}

function getLevelXP(xp) {
  const { remainingXP } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return remainingXP;
}

function getNextLevelXP(xp) {
  const { nextLevelXP } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return nextLevelXP;
}

function getXpToNextLevel(xp) {
  const { xpToNextLevel } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return xpToNextLevel;
}


/***/ }),

/***/ "./gameUtils.js":
/*!**********************!*\
  !*** ./gameUtils.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calculateAngle: () => (/* binding */ calculateAngle),
/* harmony export */   checkFirstLetterSpace: () => (/* binding */ checkFirstLetterSpace),
/* harmony export */   differsFrom: () => (/* binding */ differsFrom),
/* harmony export */   findBotById: () => (/* binding */ findBotById),
/* harmony export */   findCompleteShape: () => (/* binding */ findCompleteShape),
/* harmony export */   findEffectById: () => (/* binding */ findEffectById),
/* harmony export */   findForceById: () => (/* binding */ findForceById),
/* harmony export */   findMineById: () => (/* binding */ findMineById),
/* harmony export */   findPowerUpById: () => (/* binding */ findPowerUpById),
/* harmony export */   getRandomUniqueColor: () => (/* binding */ getRandomUniqueColor),
/* harmony export */   isPointInsideShape: () => (/* binding */ isPointInsideShape),
/* harmony export */   screenShake: () => (/* binding */ screenShake),
/* harmony export */   shuffleArray: () => (/* binding */ shuffleArray)
/* harmony export */ });
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./main.js */ "./main.js");


// Function to find a bot by ID in the bots array
function findBotById(id) {
  return _main_js__WEBPACK_IMPORTED_MODULE_1__.bots.find((bot) => bot.id === id);
}

function findForceById(id) {
  return _entities_js__WEBPACK_IMPORTED_MODULE_0__.forces.find((force) => force.id === id);
}

function findMineById(id) {
  return _main_js__WEBPACK_IMPORTED_MODULE_1__.mines.find((mine) => mine.id === id);
}

function findEffectById(id) {
  return _entities_js__WEBPACK_IMPORTED_MODULE_0__.effects.find((effect) => effect.id === id);
}

function findPowerUpById(id) {
  return _main_js__WEBPACK_IMPORTED_MODULE_1__.globalPowerUps.find((powerUp) => powerUp.id === id);
}

function differsFrom(firstArray, secondArray) {
  // Convert the second array to a Set for efficient lookup
  const secondArraySet = new Set(secondArray);

  // Check if any element in the first array is not in the second array
  for (const element of firstArray) {
    if (!secondArraySet.has(element)) {
      return true; // Found a value in the first array that's not in the second array
    }
  }
  return false; // All values in the first array are also in the second array
}

//check if the first letter of the string is a space
function checkFirstLetterSpace(string) {
  return /^\s/.test(string);
}

function screenShake(canvas, intensity, duration) {
  const originalX = canvas.style.left || "0px";
  const originalY = canvas.style.top || "0px";

  const startTime = Date.now();

  function shake() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime < duration) {
      // Generate random displacement within the intensity range
      const deltaX = (Math.random() - 0.5) * intensity * 2;
      const deltaY = (Math.random() - 0.5) * intensity * 2;

      canvas.style.left = `${parseFloat(originalX) + deltaX}px`;
      canvas.style.top = `${parseFloat(originalY) + deltaY}px`;

      // Request the next frame
      requestAnimationFrame(shake);
    } else {
      // Reset the canvas position after the duration
      // canvas.style.left = originalX;
      // canvas.style.top = originalY;
      canvas.style.left = "0px";
      canvas.style.top = "0px";
    }
  }

  // Start the shake effect
  shake();
}

function getRandomUniqueColor(colors, selectedColors) {
  let remainingColors;
  if (selectedColors) {
    remainingColors = colors.filter((color) => !selectedColors.includes(color));
  } else {
    remainingColors = colors;
  }
  if (remainingColors.length === 0 && selectedColors) {
    // Reset the selected colors array if all colors have been used
    selectedColors.length = 0;
    remainingColors = colors;
  }

  const randomIndex = Math.floor(Math.random() * remainingColors.length);
  const selectedColor = remainingColors[randomIndex];
  if (selectedColors) {
    selectedColors.push(selectedColor);
  }
  if (!selectedColor) {
    console.log("issue getting random unique color");
  }
  return selectedColor;
}

// Generate circles to approximate the shape
function generateCircles(shapePath, radius) {
  const circles = [];

  for (let i = 0; i < shapePath.length; i++) {
    const currentPoint = shapePath[i];
    const nextPoint = shapePath[(i + 1) % shapePath.length];

    const distance = Math.sqrt((nextPoint.x - currentPoint.x) ** 2 + (nextPoint.y - currentPoint.y) ** 2);
    const numCircles = Math.max(2, Math.ceil(distance / (2 * radius))); // Ensure a minimum of 2 circles

    for (let j = 0; j < numCircles; j++) {
      const fraction = j / (numCircles - 1); // Adjusted for inclusiveness
      const x = currentPoint.x + fraction * (nextPoint.x - currentPoint.x);
      const y = currentPoint.y + fraction * (nextPoint.y - currentPoint.y);
      circles.push({ x, y, radius });
    }
  }

  return circles;
}

function findCompleteShape(playerID, mines, minShapeArea) {
  // Filter mines belonging to the specified player
  const playerMines = mines.filter((mine) => mine.playerId === playerID && mine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_0__.MineType.TRAIL);
  // Sort the player mines by mine.duration (in descending order)
  playerMines.sort((a, b) => b.duration - a.duration);

  if (playerMines.length < 15) {
    // Not enough mines to form a shape
    return null;
  }

  // Check if there is a closed shape
  const shapePath = [];

  for (let i = 0; i < playerMines.length; i++) {
    const currentMine = playerMines[i];
    shapePath.push({ x: currentMine.x, y: currentMine.y });
  }

  // Check if the shapePath forms a closed shape
  if (shapePath.length >= 3) {
    const firstPoint = shapePath[0];
    const lastPoint = shapePath[shapePath.length - 1];
    const distanceBetweenStartAndEnd = Math.sqrt((firstPoint.x - lastPoint.x) ** 2 + (firstPoint.y - lastPoint.y) ** 2);

    // if (distanceBetweenStartAndEnd <= minShapeArea) {
    if (distanceBetweenStartAndEnd <= 100) {
      // Calculate the center of the shape
      const centerX = shapePath.reduce((sum, point) => sum + point.x, 0) / shapePath.length;
      const centerY = shapePath.reduce((sum, point) => sum + point.y, 0) / shapePath.length;

      // Calculate the area of the shape
      let shapeArea = 0;
      for (let i = 0; i < shapePath.length; i++) {
        const currentPoint = shapePath[i];
        const nextPoint = shapePath[(i + 1) % shapePath.length];
        shapeArea += (currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y) / 2;
      }
      shapeArea = Math.abs(shapeArea);
      //let triangulationShapeArea = calculateArea(shapePath);
      if (shapeArea < minShapeArea) {
        return null;
      }
      // Describe the shape
      if (playerMines.length === 2) {
        return { type: "Ring", center: { x: centerX, y: centerY }, area: shapeArea };
      } else {
        // const circles = generateCircles(shapePath, playerMines[0].width / 2);
        // const spokeLength = 3 * calculateAverageDistance(centerX, centerY, shapePath);
        const spokeLength = 3.5 * calculateAverageDistance(centerX, centerY, shapePath);
        const spokeWidth = 70;
        // const spokeWidth = 250;
        return {
          type: "Bounded Shape",
          center: { x: centerX, y: centerY },
          area: shapeArea,
          mines: playerMines,
          shapePath: shapePath,
          spokeLength: spokeLength,
          spokeWidth: spokeWidth,
          // circles: circles,
        };
      }
    } else {
      //remove the first matching mine
      // playerMines.pop();
      // return findCompleteShape(playerID, playerMines, minShapeArea)
    }
  }

  // No closed shape found or it's too small or not closed enough
  return null;
}

function calculateAverageDistance(centerX, centerY, points) {
  const numSamplePoints = 10;
  let totalDistance = 0;

  for (let i = 0; i < numSamplePoints; i++) {
    const randomIndex = Math.floor(Math.random() * points.length);
    const samplePoint = points[randomIndex];

    const dx = samplePoint.x - centerX;
    const dy = samplePoint.y - centerY;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDistance / numSamplePoints;
}

function calculateArea(shapePath) {
  if (shapePath.length < 3) {
    // Cannot calculate area for shapes with less than 3 vertices.
    return 0;
  }

  let totalArea = 0;
  const n = shapePath.length;

  // Triangulate the shape and sum up the areas of individual triangles.
  for (let i = 1; i < n - 1; i++) {
    const x1 = shapePath[0].x;
    const y1 = shapePath[0].y;
    const x2 = shapePath[i].x;
    const y2 = shapePath[i].y;
    const x3 = shapePath[i + 1].x;
    const y3 = shapePath[i + 1].y;

    const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    totalArea += area;
  }

  return totalArea;
}

function isPointInsideShape(shapePath, point) {
  const x = point.x;
  const y = point.y;

  let isInside = false;
  const n = shapePath.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = shapePath[i].x;
    const yi = shapePath[i].y;
    const xj = shapePath[j].x;
    const yj = shapePath[j].y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
  }
}

function calculateAngle(player) {
  return Math.atan2(player.mousePosY - player.y, player.mousePosX - player.x);
}


/***/ }),

/***/ "./generateEntities.js":
/*!*****************************!*\
  !*** ./generateEntities.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BoundaryForce: () => (/* binding */ BoundaryForce),
/* harmony export */   generateBots: () => (/* binding */ generateBots),
/* harmony export */   generateDirectionalForces: () => (/* binding */ generateDirectionalForces),
/* harmony export */   generateMines: () => (/* binding */ generateMines),
/* harmony export */   generatePowerups: () => (/* binding */ generatePowerups),
/* harmony export */   getRandomName: () => (/* binding */ getRandomName)
/* harmony export */ });
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./player.js */ "./player.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");







let maxPowerups = 10;
let maxMines = 14;
let maxBots = 4;
let maxDirectionalForces = 7;
let chancePowerUpIsStar = 0.2;

const BoundaryForce = {
  LEFT: "leftBoundaryForce-",
  RIGHT: "rightBoundaryForce-",
  TOP: "topBoundaryForce-",
  BOTTOM: "bottomBoundaryForce-",
};

function generatePowerups(globalPowerUps, worldWidth, worldHeight, colors) {
  if (!(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
    return;
  }
  let addedPowerUps = false;
  // Check if there are less than max powerups powerups
  while (globalPowerUps.length < maxPowerups) {
    let isStar = false;
    let radius = 50;
    let value = 2;

    if (Math.random() > 1 - chancePowerUpIsStar) {
      isStar = true;
      radius = 15;
      value = 1;
    }
    let hasGravity = 0;
    if (Math.random() > 0.9) {
      if (Math.random() > 0.2) {
        //push force
        hasGravity = -1;
        if (isStar) {
          value = 2;
          radius = 15;
        } else {
          value = 5;
          radius = 30;
        }
      } else {
        hasGravity = 1;
      }
    }

    let powerUp = new _entities_js__WEBPACK_IMPORTED_MODULE_3__.PowerUp(
      "regularPU-" + Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(colors, null),
      isStar,
      radius,
      value,
      hasGravity
    );
    addedPowerUps = true;
    globalPowerUps.push(powerUp);
    // setGlobalPowerUps(globalPowerUps);
    // Send the powerups every time you generate one
    // sendPowerups(globalPowerUps);

    //cf test do we need this sendGameState(globalPowerUps);
  }
  if (addedPowerUps) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendPowerUpsUpdate)(true);
  }
  let regularPowerUps = globalPowerUps.filter((powerup) => powerup.id.startsWith("mineConvert-"));
  // Remove excess powerUps if there are more than maxPowerups
  while (regularPowerUps.length > maxPowerups) {
    let removedPowerUp = globalPowerUps.pop();
    removedPowerUp = regularPowerUps.pop();
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendRemoveEntityUpdate)("removePowerUps", [removedPowerUp]);
    }
    //- in futre can add effect for this
  }
}

function generateBots(worldWidth, worldHeight, colors) {
  if (!(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
    return;
  }
  let addedBots = false;

  // Check if there are fewer than maxBots bots
  while (_main_js__WEBPACK_IMPORTED_MODULE_1__.bots.length < maxBots) {
    let botID = Math.floor(Math.random() * 10000);
    let bot = new _player_js__WEBPACK_IMPORTED_MODULE_4__.Bot(
      botID,
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      0, // Set other properties for the bot as needed
      (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(colors, _main_js__WEBPACK_IMPORTED_MODULE_1__.selectedColors)
    );

    bot.isBot = true;
    bot.name = getRandomName();
    _main_js__WEBPACK_IMPORTED_MODULE_1__.bots.push(bot);
    addedBots = true;
  }

  if (addedBots) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendBotsUpdate)(true);
  }

  // Remove excess bots if there are more than maxBots
  while (_main_js__WEBPACK_IMPORTED_MODULE_1__.bots.length > maxBots) {
    const removedBot = _main_js__WEBPACK_IMPORTED_MODULE_1__.bots.pop();
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendRemoveEntityUpdate)("removeBots", [removedBot]);
    }
    //  add effects in the future
  }
}

function generateMines(worldWidth, worldHeight, colors) {
  if (!(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
    return;
  }
  let addedMines = false;
  const regularMines = _main_js__WEBPACK_IMPORTED_MODULE_1__.mines.filter((mine) => mine.mineType === _entities_js__WEBPACK_IMPORTED_MODULE_3__.MineType.REGULAR);
  // Check if there are less than max powerups powerups
  while (regularMines.length < maxMines) {
    let hasGravity = 0;
    if (Math.random() > 0.8) {
      if (Math.random() > 0.9) {
        //test out push force even though it doesn't really make sense for a mine
        hasGravity = -1;
      } else {
        hasGravity = 1;
      }
    }
    let mine = new _entities_js__WEBPACK_IMPORTED_MODULE_3__.Mine(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      100,
      10,
      (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(colors, null),
      hasGravity
    );
    _main_js__WEBPACK_IMPORTED_MODULE_1__.mines.push(mine);
    regularMines.push(mine);
    addedMines = true;
  }
  if (addedMines) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendMinesUpdate)(true);
  }
  // Remove excess regularMines if there are more than maxMines
  while (regularMines.length > maxMines) {
    const removedMine = regularMines.pop();
    (0,_main_js__WEBPACK_IMPORTED_MODULE_1__.setMines)(_main_js__WEBPACK_IMPORTED_MODULE_1__.mines.filter((mine) => mine.id != removedMine.id));
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendRemoveEntityUpdate)("removeMines", [removedMine]);
    }
    //- in futre can add effect for this
  }
}

function generateDirectionalForces(worldWidth, worldHeight, colors) {
  if (!(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
    return;
  }
  let addedDirectionalForces = false;
  const directionalForces = _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces.filter((force) => force.type === _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.DIRECTIONAL);
  const boundaryForceSize = 500;
  // Check if there are less than max powerups powerups
  while (directionalForces.length < maxDirectionalForces) {
    if (!hasGivenBoundaryForce(BoundaryForce.LEFT, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(boundaryForceSize / 2, worldHeight / 2, boundaryForceSize, worldHeight, Math.PI, BoundaryForce.LEFT, directionalForces);
    }
    if (!hasGivenBoundaryForce(BoundaryForce.RIGHT, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(
        worldWidth - boundaryForceSize / 2,
        worldHeight / 2,
        boundaryForceSize,
        worldHeight,
        0,
        BoundaryForce.RIGHT,
        directionalForces
      );
    }
    if (!hasGivenBoundaryForce(BoundaryForce.TOP, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(worldWidth / 2, boundaryForceSize / 2, boundaryForceSize, worldWidth, (3 * Math.PI) / 2, BoundaryForce.TOP, directionalForces);
    }
    if (!hasGivenBoundaryForce(BoundaryForce.BOTTOM, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(
        worldWidth / 2,
        worldHeight - boundaryForceSize / 2,
        boundaryForceSize,
        worldWidth,
        Math.PI / 2,
        BoundaryForce.BOTTOM,
        directionalForces
      );
    }
    let force = new _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceArea(
      "force-" + Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      0.7,
      10,
      200,
      true,
      "green",
      null,
      0,
      Math.random() * 2 * Math.PI,
      _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.DIRECTIONAL,
      420 + Math.floor((Math.random() - 1) * 300),
      600 + Math.floor((Math.random() - 1) * 300)
    );

    _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces.push(force);
    directionalForces.push(force);
    addedDirectionalForces = true;
  }
  if (addedDirectionalForces) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendForcesUpdate)(true);
  }
  // Remove excess directional forces if there are more than maxDirectionalForces
  while (directionalForces.length > maxDirectionalForces) {
    const removedForce = directionalForces.pop();
    const index = _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces.indexOf(removedForce);
    if (index !== -1) {
      if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_0__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_1__.player)) {
        (0,_sendData_js__WEBPACK_IMPORTED_MODULE_2__.sendRemoveEntityUpdate)("removeForces", [_entities_js__WEBPACK_IMPORTED_MODULE_3__.forces[index]]);
      }
      _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces.splice(index, 1);
    }
  }
}

function addBoundaryForce(x, y, width, height, angle, id, directionalForces) {
  let force = new _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceArea(id, x, y, 1.2, 10, 200, true, "blue", null, 0, angle, _entities_js__WEBPACK_IMPORTED_MODULE_3__.ForceType.DIRECTIONAL, width, height);
  _entities_js__WEBPACK_IMPORTED_MODULE_3__.forces.push(force);
  directionalForces.push(force);
}

function hasGivenBoundaryForce(id, boundaryForces) {
  // Use the some() method to check if any force meets the condition
  return boundaryForces.some((force) => force.id.startsWith(id));
}

function getRandomName() {
  const prefixes = [
    "Astro",
    "Galaxy",
    "Star",
    "Cosmo",
    "Rocket",
    "Lunar",
    "Solar",
    "Free",
    "Quasar",
    "Pulsar",
    "Meteor",
    "Poopy",
    "Sneaky",
    "Stinky",
    "Drunk",
    "Mean",
    "Tree",
    "Dave",
    "Chuck",
    "Fire",
    "Ice",
    "Mystic",
    "Electric",
    "Nebula",
    "Aqua",
    "Cyber",
    "Shadow",
    "Crystal",
    "Golden",
    "Silver",
    "Ein",
    "Kevin",
    "Wesely",
    "Jiggly",
    "Pork",
    "Battle",
    "Flexy",
  ];
  const suffixes = [
    "Rider",
    "Pilot",
    "Crusher",
    "Dasher",
    "Blaster",
    "Racoon",
    "Buster",
    "Zoomer",
    "Flyer",
    "Racer",
    "Striker",
    "Tosser",
    "Wanderer",
    "Maverick",
    "Slinger",
    "Jester",
    "Lover",
    "Ranger",
    "Champion",
    "Seeker",
    "Phantom",
    "Hunter",
    "Shifter",
    "Whisper",
    "Dreamer",
    "Log",
    "stein",
    "Freedom",
    "Pup",
    "Beast",
  ];

  // Generate random indexes for prefix and suffix
  const prefixIndex = Math.floor(Math.random() * prefixes.length);
  const suffixIndex = Math.floor(Math.random() * suffixes.length);

  // Generate a random number between 10 and 99
  const randomNumber = Math.floor(Math.random() * 90) + 10;

  // Decide whether to place the number at the beginning or end
  const placeAtEnd = Math.random() < 0.3;

  const skipSuffix = Math.random() < 0.3;

  // Build the name based on the placement of the number
  let randomName;
  if (!placeAtEnd) {
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex];
  } else if (skipSuffix) {
    randomName = prefixes[prefixIndex] + randomNumber;
  } else {
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;
  }

  // If the name is longer than 15 characters, truncate it
  if (randomName.length > 15) {
    randomName = randomName.slice(0, 15);
  }

  return randomName;
}


/***/ }),

/***/ "./handleData.js":
/*!***********************!*\
  !*** ./handleData.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleData: () => (/* binding */ handleData)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./player.js */ "./player.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");








const interpFactor = 0.05;
const threshold = 50;
const velocityInterpFactor = 0.4;
const velocityThreshold = 2;

function handleData(player, otherPlayers, globalPowerUps, data) {
  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceAnyMessageRecieved)(0);
  const currentTimestamp = Date.now();
  const messageTimestamp = data.timestamp;
  // let timeThreshold = 2 * fixedDeltaTime;
  let timeThreshold = 20;
  if (data.priority < 3) {
    timeThreshold = 30;
  }
  if (data.priority < 2) {
    timeThreshold = 60;
  }
  let timeDifference = currentTimestamp - messageTimestamp;
  if (timeDifference > timeThreshold) {
    //lets try not ignoring old messages
    //return;
  }

  let otherPlayer = otherPlayers.find((player) => player.id === data.id);
  if (otherPlayer) {
    otherPlayer.timeSinceSentMessageThatWasRecieved = 0;
  }
  if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player) && data.isMaster) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.wrappedResolveConflicts)(player, otherPlayers, globalPowerUps, true);
    console.log("master conflict");
    return;
  }
  if (data.requestForFullStates) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendPlayerStates)(player, (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player), true);
    return;
  }
  if (data.requestFullUpdate && (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player) && ticksSinceLastConnectionAttempt > 200) {
    setTicksSinceLastConnectionAttempt(0);
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendEntitiesState)(player, (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player), true);
    return;
  }

  if (!otherPlayer) {
    otherPlayer = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findBotById)(data.id);
  }
  if (otherPlayer) {
    updateOtherPlayerData(otherPlayer, data, otherPlayers, globalPowerUps, player);
  } // If the player is not found, add them to the array
  else if (data.id && data.id != player.id && !data.isBot) {
    let newPlayer = new _player_js__WEBPACK_IMPORTED_MODULE_5__.Player(data.id, data.x, data.y, data.powerUps, data.color, data.angle, data.pilot, data.name, data.isPlaying, true);
    otherPlayers.push(newPlayer);
    if (!_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers.includes(data.id)) {
      _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers.push(data.id);
    }
    _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers.sort();

    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setMasterPeerId)((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.chooseNewMasterPeer)(player, otherPlayers));
  } else if (data.id && data.id == player.id) {
    // // If this is our own data, update key properties from the master, not position, velocity, etc.
    updateOwnPlayerData(player, data);
  }

  updateGlobalPowerUps(data, globalPowerUps);
  removeGlobalPowerUps(data, globalPowerUps);

  updateBots(data, _main_js__WEBPACK_IMPORTED_MODULE_0__.bots);
  removeBots(data, _main_js__WEBPACK_IMPORTED_MODULE_0__.bots);

  updateMines(data, _main_js__WEBPACK_IMPORTED_MODULE_0__.mines);
  removeMines(data, _main_js__WEBPACK_IMPORTED_MODULE_0__.mines);

  updateEffects(data, _entities_js__WEBPACK_IMPORTED_MODULE_4__.effects);
  removeEffects(data, _entities_js__WEBPACK_IMPORTED_MODULE_4__.effects);

  updateForces(data, player, _entities_js__WEBPACK_IMPORTED_MODULE_4__.forces, player.id);
  removeForces(data, _entities_js__WEBPACK_IMPORTED_MODULE_4__.forces);
  //don't curently send this data could be used for master to send out key properties of otherplayers (score,kills etc.. not pos,vel etc)
  if (data.otherPlayers && data.otherPlayers.length > 0) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);
    const dataPlayer = data.otherPlayers.find((otherPlayer) => otherPlayer.id === player.id);

    if (dataPlayer != null) {
      player.kills = dataPlayer.kills;
      player.setIsDead(dataPlayer.isDead);
      player.lives = dataPlayer.lives;
      player.powerUps = dataPlayer.powerUps;
      player.ticksSincePowerUpCollection = dataPlayer.ticksSincePowerUpCollection;
      player.setInvincibleTimer(dataPlayer.invincibleTimer);
      if (dataPlayer.hitBy != null && dataPlayer.hitBy != "" && player.isDead) {
        player.hitBy = dataPlayer.hitBy;
        (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_3__.setEndGameMessage)("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
      } else if (player.isDead) {
        (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_3__.setEndGameMessage)("Score: " + player.powerUps * 100);
      }
      player.killed = dataPlayer.killed;
      player.killedBy = dataPlayer.killedBy;
    }
    //we will just replace select properties of otherplayers from the master
    for (let otherPlayer of otherPlayers) {
      const foundDataOtherPlayer = data.otherPlayers.find((dataOtherPlayer) => dataOtherPlayer.id === otherPlayer.id);
      if (foundDataOtherPlayer != null) {
        otherPlayer.kills = foundDataOtherPlayer.kills;
        otherPlayer.setIsDead(foundDataOtherPlayer.isDead);
        otherPlayer.lives = foundDataOtherPlayer.lives;
        otherPlayer.powerUps = foundDataOtherPlayer.powerUps;
        otherPlayer.ticksSincePowerUpCollection = foundDataOtherPlayer.ticksSincePowerUpCollection;
        otherPlayer.setInvincibleTimer(foundDataOtherPlayer.invincibleTimer);
      }
    }
  }

  if (data.connectedPeers && data.connectedPeers.length > 0) {
    //we don't currently send peer data, need to review this if we add peer sharing back, particually attemptConnections
    //check if connectedPeers has any id's (strings) not in data.connectedPeers
    let combine = false;
    if ((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.differsFrom)(_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers, data.connectedPeers)) {
      combine = true;
    }

    //then check if data.connectedPeers has any id's (strings) not in connectedPeers
    if ((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.differsFrom)(data.connectedPeers, _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers)) {
      combine = true;
    }

    if (combine) {
      // Combine the arrays and set connectedPeers = the combined array
      (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setConnectedPeers)([...new Set([...data.connectedPeers, ..._connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connectedPeers])]);
      // connectedPeers.forEach((connectedID) => {
      //   connection.
      // });
      setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
      sendConnectedPeers();
    }
  }
}

function updateOtherPlayerData(otherPlayer, data, otherPlayers, globalPowerUps, player) {
  if (!otherPlayer) return;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "name") {
        if (data.name != null && data.name != "") {
          otherPlayer.name = data.name;
        }
      } else if (key === "pilot") {
        if (data.pilot != null && data.pilot != "") {
          otherPlayer.pilot = data.pilot;
        }
      } else if (key === "x" || key === "y") {
        //check if the gap is closer than the threshold
        if (Math.abs(otherPlayer[key] - data[key]) <= threshold) {
          // Interpolate x and y values
          otherPlayer[key] += (data[key] - otherPlayer[key]) * interpFactor;
        } else {
          // Update x and y values directly
          otherPlayer[key] = data[key];
        }
      } else if (key === "powerUps") {
        if (otherPlayer.ticksSincePowerUpCollection > -1 && otherPlayer.powerUps < data.powerUps) {
          console.log("possible double powerup collection attempt?");
        } else {
          otherPlayer[key] = data[key];
        }
      } else if (key === "isDead") {
        otherPlayer.setIsDead(data.isDead);
      } else if (key === "invincibleTimer") {
        otherPlayer.setInvincibleTimer(data.invincibleTimer);
      } else if (key === "comboScaler") {
        otherPlayer.setComboScaler(data.comboScaler);
      } else if (key === "velX" || key === "velY") {
        // Check if velocities are further apart than the threshold
        if (Math.abs(otherPlayer[key] - data[key]) > velocityThreshold) {
          // Interpolate velocities
          otherPlayer[key] += (data[key] - otherPlayer[key]) * velocityInterpFactor;
        } else {
          // Update velocities directly
          otherPlayer[key] = data[key];
        }
      } else if (key === "angle") {
        // Log the name, angle before, and angle after
        //console.log(`Updating angle for ${otherPlayer.name}: Before: ${otherPlayer.getAngle()}, After: ${data[key]}`);
        otherPlayer.setAngle(data[key]);
      } else {
        otherPlayer[key] = data[key];
      }
    }
  }

  if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player) && (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(otherPlayer) && !otherPlayer.isBot) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.wrappedResolveConflicts)(player, otherPlayers, globalPowerUps, true);
  }
}

function updateOwnPlayerData(player, data) {
  if (!player || !data.id || data.id !== player.id) return;

  if (data.hasOwnProperty("powerUps")) {
    if (player.ticksSincePowerUpCollection > -1 && player.powerUps < data.powerUps) {
      console.log("possible double powerup collection attempt? (own data)");
    } else {
      player.powerUps = data.powerUps;
    }
    // setGameOverText(player);
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("comboScaler")) {
    player.setComboScaler(data.comboScaler);
  }
  if (data.hasOwnProperty("isDead")) {
    if (data.isDead && !player.isDead) {
      //just found out we're dead
      let firebase = (0,_db_js__WEBPACK_IMPORTED_MODULE_2__.getFirebase)();
      if (firebase) {
        const user = firebase.auth().currentUser;
        if (user) {
          if (player.powerUps) {
            (0,_db_js__WEBPACK_IMPORTED_MODULE_2__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_2__.DbPropertyKey.SCORE, player.powerUps);
          }
          if (player.kills) {
            (0,_db_js__WEBPACK_IMPORTED_MODULE_2__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_2__.DbPropertyKey.KILLS, player.kills);
          }
        }
      }
    }
    player.setIsDead(data.isDead);
    if (data.isDead) {
      player.vel.x = 0;
      player.vel.y = 0;
    }
  }
  if (data.hasOwnProperty("lives")) {
    player.lives = data.lives;
  }
  if (data.hasOwnProperty("hitBy")) {
    player.hitBy = data.hitBy;
    player.updateKilledAndKilledByLists(player.hitBy);
    // setGameOverText(player);
  }
  if (data.hasOwnProperty("kills")) {
    player.kills = data.kills;
  }
  if (data.hasOwnProperty("killed")) {
    player.killed = data.killed;
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("killedBy")) {
    player.killedBy = data.killedBy;
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("invincibleTimer")) {
    player.setInvincibleTimer(data.invincibleTimer);
  }
  if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
    player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  }
  if (data.hasOwnProperty("recentScoreTicks")) {
    player.recentScoreTicks = data.recentScoreTicks;
  }
  if (data.hasOwnProperty("recentScoreText")) {
    player.recentScoreText = data.recentScoreText;
  }
  if (data.hasOwnProperty("recentKillScoreText")) {
    player.recentKillScoreText = data.recentKillScoreText;
  }
}

function setGameOverText(player) {
  if (player.hitBy != null && player.hitBy != "") {
    (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_3__.setEndGameMessage)("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
  } else {
    (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_3__.setEndGameMessage)("Score: " + player.powerUps * 100);
  }
}
function updateGlobalPowerUps(data, globalPowerUps) {
  if (data.globalPowerUps && data.globalPowerUps.length > 0) {
    for (const receivedPowerUp of data.globalPowerUps) {
      // Find the corresponding local powerup by ID
      const localPowerUp = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findPowerUpById)(receivedPowerUp.id);

      if (localPowerUp) {
        const xDiff = Math.abs(receivedPowerUp.x - localPowerUp.x);
        const yDiff = Math.abs(receivedPowerUp.y - localPowerUp.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localPowerUp.x = localPowerUp.x + (receivedPowerUp.x - localPowerUp.x) * interpFactor;
          localPowerUp.y = localPowerUp.y + (receivedPowerUp.y - localPowerUp.y) * interpFactor;
        } else {
          // Update x and y values directly
          localPowerUp.x = receivedPowerUp.x;
          localPowerUp.y = receivedPowerUp.y;
        }
        localPowerUp.color = receivedPowerUp.color;
        localPowerUp.isStar = receivedPowerUp.isStar;
        localPowerUp.value = receivedPowerUp.value;
        localPowerUp.radius = receivedPowerUp.radius;
        localPowerUp.hitFrames = receivedPowerUp.hitFrames;
      } else {
        // If the local powerup doesn't exist, add it to the globalPowerUps array
        globalPowerUps.push((0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.createPowerUpFromObject)(receivedPowerUp));
      }
    }
  }
  if (data.fullSend && data.globalPowerUps) {
    // Create a new globalPowerUps array by filtering only the powerUps that exist in data.globalPowerUps
    const updatedGlobalPowerUps = globalPowerUps.filter(
      (powerUpToCheck) => powerUpToCheck.id == null || data.globalPowerUps.some((dataPowerUp) => dataPowerUp.id === powerUpToCheck.id)
    );

    // Update the globalPowerUps array once
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGlobalPowerUps)(updatedGlobalPowerUps);
  }
}

function removeGlobalPowerUps(data, globalPowerUps) {
  if (data.removePowerUps && data.removePowerUps.length > 0) {
    let filteredPowerUps = [...globalPowerUps]; // Create a copy of the original globalPowerUps array

    for (let dataPowerUp of data.removePowerUps) {
      if (dataPowerUp.id != null) {
        const matchingPowerUpIndex = filteredPowerUps.findIndex((currentPowerUp) => currentPowerUp.id === dataPowerUp.id);
        if (matchingPowerUpIndex !== -1) {
          filteredPowerUps.splice(matchingPowerUpIndex, 1);
        }
      }
    }

    // Update the globalPowerUps array once after the loop
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGlobalPowerUps)(filteredPowerUps);
  }
}

function updateMines(data, mines) {
  if (data.mines && data.mines.length > 0) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);

    for (const receivedMine of data.mines) {
      // Find the corresponding local bot by ID
      const localMine = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findMineById)(receivedMine.id);

      if (localMine) {
        const xDiff = Math.abs(receivedMine.x - localMine.x);
        const yDiff = Math.abs(receivedMine.y - localMine.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localMine.x = localMine.x + (receivedMine.x - localMine.x) * interpFactor;
          localMine.y = localMine.y + (receivedMine.y - localMine.y) * interpFactor;
        } else {
          // Update x and y values directly
          localMine.x = receivedMine.x;
          localMine.y = receivedMine.y;
        }
        localMine.force = receivedMine.force;
        localMine.duration = receivedMine.duration;
        localMine.radius = receivedMine.radius;
        localMine.hitFrames = receivedMine.hitFrames;
        localMine.color = receivedMine.color;
        localMine.mineType = receivedMine.mineType;
        localMine.playerId = receivedMine.playerId;
        if (localMine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.FREE_MINE || localMine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.TRAIL) {
          if (receivedMine.angle) {
            localMine.angle = receivedMine.angle;
          }
          if (localMine.mineType == _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.FREE_MINE) {
            if (receivedMine.points && receivedMine.points.length > 0) localMine.points = receivedMine.points;
          }
        }
      } else {
        // If the local mine doesn't exist, add it to the mines array
        mines.push((0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.createMineFromObject)(receivedMine));
      }
    }
  }
  if (data.fullSend && data.mines) {
    // Create a new mines array by filtering only the mines that exist in data.mines
    const updatedMines = mines.filter(
      (mineToCheck) => /^trail-/.test(mineToCheck.id) || mineToCheck.id == null || data.mines.some((dataMine) => dataMine.id === mineToCheck.id)
    );

    // Update the mines array once
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setMines)(updatedMines);
  }
}

function removeMines(data, mines) {
  if (data.removeMines && data.removeMines.length > 0) {
    let filteredMines = [...mines]; // Create a copy of the original mines array

    for (let dataMine of data.removeMines) {
      if (dataMine.id != null) {
        filteredMines = filteredMines.filter((mine) => mine.id !== dataMine.id);
      }
    }

    // Update the mines array once after the loop
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setMines)(filteredMines);
  }
}

function updateEffects(data, effects) {
  if (data.effects && data.effects.length > 0) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);

    for (const receivedEffect of data.effects) {
      // Find the corresponding local bot by ID
      const localEffect = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findEffectById)(receivedEffect.id);

      if (localEffect) {
        const xDiff = Math.abs(receivedEffect.x - localEffect.x);
        const yDiff = Math.abs(receivedEffect.y - localEffect.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localEffect.x = localEffect.x + (receivedEffect.x - localEffect.x) * interpFactor;
          localEffect.y = localEffect.y + (receivedEffect.y - localEffect.y) * interpFactor;
        } else {
          // Update x and y values directly
          localEffect.x = receivedEffect.x;
          localEffect.y = receivedEffect.y;
        }
        localEffect.radius = receivedEffect.radius;
        localEffect.duration = receivedEffect.duration;
        localEffect.color = receivedEffect.color;
        localEffect.type = receivedEffect.type;
      } else {
        // If the local effects doesn't exist, add it to the effects array
        effects.push((0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.createEffectFromObject)(receivedEffect));
      }
    }
  }
  if (data.fullSend && data.effects) {
    // Create a new effects array by filtering only the effects that exist in data.effects
    const updatedEffects = effects.filter(
      (effectToCheck) => effectToCheck.id == null || data.effects.some((dataEffect) => dataEffect.id === effectToCheck.id)
    );

    // Update the effects array once
    (0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.setEffects)(updatedEffects);
  }
}

function removeEffects(data, effects) {
  if (data.removeEffects && data.removeEffects.length > 0) {
    let filteredEffects = [...effects]; // Create a copy of the original effects array

    for (let dataEffect of data.removeEffects) {
      if (dataEffect.id != null) {
        filteredEffects = filteredEffects.filter((effect) => effect.id !== dataEffect.id);
      }
    }

    // Update the effects array once after the loop
    (0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.setEffects)(filteredEffects);
  }
}

function updateBots(data, bots) {
  if (data.bots && data.bots.length > 0) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);

    for (const receivedBot of data.bots) {
      // Find the corresponding local bot by ID
      const localBot = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findBotById)(receivedBot.id);

      if (localBot) {
        if (localBot.isDead && !receivedBot.isDead) {
          //if we are getting respawn info just set the new coordinates
          localBot.x = receivedBot.x;
          localBot.y = receivedBot.y;
          localBot.vel.x = receivedBot.vel.x;
          localBot.vel.y = receivedBot.vel.y;
        } else {
          // else interpolate to smooth the update
          const xDiff = Math.abs(receivedBot.x - localBot.x);
          const yDiff = Math.abs(receivedBot.y - localBot.y);

          if (xDiff <= threshold && yDiff <= threshold) {
            // Interpolate x and y values
            localBot.x = localBot.x + (receivedBot.x - localBot.x) * interpFactor;
            localBot.y = localBot.y + (receivedBot.y - localBot.y) * interpFactor;
          } else {
            // Update x and y values directly
            localBot.x = receivedBot.x;
            localBot.y = receivedBot.y;
          }

          // Check if velocities are further apart than the threshold
          const velXDiff = Math.abs(receivedBot.vel.x - localBot.vel.x);
          const velYDiff = Math.abs(receivedBot.vel.y - localBot.vel.y);

          if (velXDiff > velocityThreshold || velYDiff > velocityThreshold) {
            // Interpolate velocities
            localBot.vel.x = localBot.vel.x + (receivedBot.vel.x - localBot.vel.x) * velocityInterpFactor;
            localBot.vel.y = localBot.vel.y + (receivedBot.vel.y - localBot.vel.y) * velocityInterpFactor;
          } else {
            // Update velocities directly
            localBot.vel.x = receivedBot.vel.x;
            localBot.vel.y = receivedBot.vel.y;
          }
        }
        localBot.setIsDead(receivedBot.isDead);

        // Don't interpolate the angle because that can naturally change very sharply
        localBot.setAnlge(receivedBot.getAngle());
        localBot.currentSpeed = receivedBot.currentSpeed;
        localBot.timeOfLastActive = receivedBot.timeOfLastActive;
        localBot.playerAngleData = receivedBot.playerAngleData;
        localBot.mousePosX = receivedBot.mousePosX;
        localBot.mousePosY = receivedBot.mousePosY;
        localBot.isPlaying = receivedBot.isPlaying;
        localBot.special = receivedBot.special;
        localBot.distanceFactor = receivedBot.distanceFactor;
        localBot.lives = receivedBot.lives;
        localBot.space = receivedBot.space;
        localBot.shift = receivedBot.shift;
        if (receivedBot.resetting != null) {
          localBot.resetting = receivedBot.resetting;
        }
        localBot.u = receivedBot.u;
        localBot.forceCoolDown = receivedBot.forceCoolDown;
        localBot.setComboScaler(receivedBot.comboScaler);
        localBot.kills = receivedBot.kills;
        localBot.ticksSincePowerUpCollection = receivedBot.ticksSincePowerUpCollection;
        localBot.timeSinceSpawned = receivedBot.timeSinceSpawned;
        localBot.botState = receivedBot.botState;
        localBot.target = receivedBot.target;
        localBot.followingPlayerID = receivedBot.followingPlayerID;
        localBot.previousAngleDifference = receivedBot.previousAngleDifference;
        localBot.previousTurnDirection = receivedBot.previousTurnDirection;
        localBot.setInvincibleTimer(receivedBot.invincibleTimer);
        localBot.forceCoolDown = receivedBot.forceCoolDown;
        localBot.playerAngleData = receivedBot.playerAngleData;
        localBot.mousePosX = receivedBot.mousePosX;
        localBot.mousePosY = receivedBot.mousePosY;
        if (receivedBot.name != null && receivedBot.name != "") {
          localBot.name = receivedBot.name;
        }
        if (receivedBot.inForce != null) {
          localBot.inForce = receivedBot.inForce;
        }
      } else {
        // If the local bot doesn't exist, add it to the bots array
        bots.push((0,_player_js__WEBPACK_IMPORTED_MODULE_5__.createBotFromObject)(receivedBot));
      }
    }

    updateBotsFromFullSend(data, bots);
    // This ensures that local bots that have been removed on the master peer are also removed locally
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setBots)(bots.filter((localBot) => data.bots.some((receivedBot) => receivedBot.id === localBot.id)));
  }
}

function updateBotsFromFullSend(data, bots) {
  if (data.fullSend && data.bots) {
    // Create a new bots array by filtering only the bots that exist in data.bots
    const updatedBots = bots.filter((botToCheck) => botToCheck.id == null || data.bots.some((dataBot) => dataBot.id === botToCheck.id));

    // Update the bots array once
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setBots)(updatedBots);
  }
}

function removeBots(data, bots) {
  if (data.removeBots && data.removeBots.length > 0) {
    for (let dataBot of data.removeBots) {
      if (dataBot.id != null) {
        let matchingBot = bots.find((currentBot) => currentBot.id === dataBot.id);
        if (matchingBot == null) {
          (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setBots)(bots.filter((bot) => bot.id !== dataBot.id));
        }
      }
    }
  }
}

function updateLocalForce(localForce, receivedForce, playerId) {
  if (localForce.tracks == null || localForce.tracks.id != playerId) {
    const xDiff = Math.abs(receivedForce.x - localForce.x);
    const yDiff = Math.abs(receivedForce.y - localForce.y);

    if (xDiff <= threshold && yDiff <= threshold) {
      // Interpolate x and y values
      localForce.x = localForce.x + (receivedForce.x - localForce.x) * interpFactor;
      localForce.y = localForce.y + (receivedForce.y - localForce.y) * interpFactor;
    } else {
      // Update x and y values directly
      localForce.x = receivedForce.x;
      localForce.y = receivedForce.y;
    }

    localForce.force = receivedForce.force;
    localForce.duration = receivedForce.duration;
    localForce.radius = receivedForce.radius;
    localForce.isAttractive = receivedForce.isAttractive;
    localForce.color = receivedForce.color;
    localForce.tracks = receivedForce.tracks;
    localForce.coneAngle = receivedForce.coneAngle;
    localForce.direction = receivedForce.direction;
    localForce.type = receivedForce.type;
    localForce.width = receivedForce.width;
    localForce.length = receivedForce.length;
    localForce.numberArrowsEachSide = receivedForce.numberArrowsEachSide;
    localForce.numberArrowsDeep = receivedForce.numberArrowsDeep;
  }
}

function updateForces(data, player, forces, playerId) {
  if (data.forces && data.forces.length > 0) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);

    for (const receivedForce of data.forces) {
      // Find the corresponding local bot by ID
      const localForce = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.findForceById)(receivedForce.id);
      if (localForce) {
        updateLocalForce(localForce, receivedForce, playerId);
      } else if (receivedForce.tracks == null || receivedForce.tracks.id != player.id) {
        // If the local force doesn't exist, add it to the forces array
        forces.push((0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.createForceFromObject)(receivedForce));
      }
    }

    if (data.fullSend && data.forces) {
      // Create a new forces array by filtering only the forces that exist in data.forces
      const updatedForces = forces.filter(
        (forceToCheck) => forceToCheck.id == null || data.forces.some((dataForce) => dataForce.id === forceToCheck.id)
      );

      // Update the forces array once
      (0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.setForces)(updatedForces);
    }
  }
}

function removeForces(data, forces) {
  if (data.removeForces && data.removeForces.length > 0) {
    let filteredForces = [...forces];
    for (let dataForce of data.removeForces) {
      if (dataForce.id != null) {
        filteredForces = filteredForces.filter((force) => force.id !== dataForce.id);
      }
    }
    // Update the forces array once after the loop
    (0,_entities_js__WEBPACK_IMPORTED_MODULE_4__.setForces)(filteredForces);
  }
}


/***/ }),

/***/ "./inputHandlers.js":
/*!**************************!*\
  !*** ./inputHandlers.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addLoginHandler: () => (/* binding */ addLoginHandler),
/* harmony export */   addPilotEventListners: () => (/* binding */ addPilotEventListners),
/* harmony export */   handleGameKeyDown: () => (/* binding */ handleGameKeyDown),
/* harmony export */   handleGameKeyUp: () => (/* binding */ handleGameKeyUp),
/* harmony export */   handleInputEvents: () => (/* binding */ handleInputEvents),
/* harmony export */   handleMouseMove: () => (/* binding */ handleMouseMove),
/* harmony export */   handleMouseMoveDirect: () => (/* binding */ handleMouseMoveDirect),
/* harmony export */   handleNameKeyUp: () => (/* binding */ handleNameKeyUp),
/* harmony export */   handleWinStateKeyDown: () => (/* binding */ handleWinStateKeyDown),
/* harmony export */   mousePos: () => (/* binding */ mousePos),
/* harmony export */   removeGameStateEventListeners: () => (/* binding */ removeGameStateEventListeners),
/* harmony export */   removeLoginHandler: () => (/* binding */ removeLoginHandler),
/* harmony export */   removeNameEventListeners: () => (/* binding */ removeNameEventListeners),
/* harmony export */   removePilotsEventListeners: () => (/* binding */ removePilotsEventListeners),
/* harmony export */   removeWinStateEventListeners: () => (/* binding */ removeWinStateEventListeners),
/* harmony export */   setupGameEventListeners: () => (/* binding */ setupGameEventListeners),
/* harmony export */   setupNameEventListeners: () => (/* binding */ setupNameEventListeners),
/* harmony export */   setupWinStateEventListeners: () => (/* binding */ setupWinStateEventListeners)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./canvasDrawingFunctions.js */ "./canvasDrawingFunctions.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _generateEntities_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./generateEntities.js */ "./generateEntities.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");
/* harmony import */ var _login_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./login.js */ "./login.js");








let pilotMouseMoveListener;
let pilotClickListener;
let keysDown = {};

let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
  shift: false,
  u: false,
};

let mousePos = { x: 0, y: 0 };


function handleMouseMove(canvas, evt, player) {
  let coords = getMousePos(canvas, evt);
  handleMouseMoveDirect(coords.x, coords.y, player);
}

function handleMouseMoveDirect(x, y, player) {
  mousePos.x = x + _main_js__WEBPACK_IMPORTED_MODULE_0__.camX;
  mousePos.y = y + _main_js__WEBPACK_IMPORTED_MODULE_0__.camY;
  player.absoluteMousePosX = x;
  player.absoluteMousePosY = y;
  player.mousePosX = mousePos.x;
  player.mousePosY = mousePos.y;
}

function handleInputEvents(canvas, player) {
  window.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      player.space = true;
      keys.space = true;
    }
    if (e.code === "Shift") {
      player.shift = true;
      keys.shift = true;
    }
    if (e.ctrlKey && e.key === "b") {
      player.setDevMode(true);
    }
  });

  window.addEventListener("keyup", function (e) {
    if (e.code === "Space") {
      player.space = false;
      keys.space = false;
    }
    if (e.code === "Shift") {
      player.shift = false;
      keys.shift = false;
    }
  });

  canvas.addEventListener(
    "mousemove",
    function (evt) {
      handleMouseMove(canvas, evt, player);
    },
    false
  );

  function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  canvas.addEventListener("mousedown", function (e) {
    if (e.button === 2) {
      player.shift = true;
      keys.shift = true;
    } else if (e.button === 1) {
      player.u = true;
      keys.u = true;
      if (keys.shift && keys.space) {
        player.setDevMode(true);
      }
    } else {
      player.space = true;
      keys.space = true;
    }
  });

  canvas.addEventListener("mouseup", function (e) {
    if (e.button === 2) {
      player.shift = false;
      keys.shift = false;
    } else if (e.button === 1) {
      player.u = false;
      keys.u = false;
    } else {
      player.space = false;
      keys.space = false;
    }
  });

  canvas.addEventListener("touchstart", function (e) {
    player.space = true;
    keys.space = true;

    // Update mouse position on touch start
    if (e.touches) {
      mousePos.x = e.touches[0].clientX + _main_js__WEBPACK_IMPORTED_MODULE_0__.camX;
      mousePos.y = e.touches[0].clientY + _main_js__WEBPACK_IMPORTED_MODULE_0__.camY;
      player.mousePosX = mousePos.x;
      player.mousePosY = mousePos.y;
      player.setAngle((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.calculateAngle)(player));
    }
  });

  canvas.addEventListener("touchend", function (e) {
    player.space = false;
    keys.space = false;
  });

  canvas.addEventListener(
    "touchmove",
    function (e) {
      // Prevent scrolling when touching the canvas
      e.preventDefault();

      if (e.touches) {
        let coords = getMousePos(canvas, e.touches[0]);
        mousePos.x = coords.x + _main_js__WEBPACK_IMPORTED_MODULE_0__.camX;
        mousePos.y = coords.y + _main_js__WEBPACK_IMPORTED_MODULE_0__.camY;
        player.mousePosX = mousePos.x;
        player.mousePosY = mousePos.y;
        player.setAnlge((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.calculateAngle)(player));
      }
    },
    { passive: false }
  ); // Set passive to false to prevent scrolling
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function addPilotEventListners(canvas, ctx) {
  pilotMouseMoveListener = function (event) {
    if ((0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getGameState)() === _main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.PILOT_SELECT || (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getGameState)() === _main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.INTRO) {
    }
  };

  //selectPilot();
  pilotClickListener = function (event) {
    //just in case set canvas back
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    //x and y that are passed to drawNameEntry, need to remove the need for this duplication
    let x = canvas.width / 2 - 100;
    let y = 80;
    // Play button dimensions and location
    let buttonX = x + 50;
    let buttonY = y + 70;
    let buttonWidth = 100;
    let buttonHeight = 20;

    // Check if the mouse click is within the bounds of the play button
    if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
      // Play button has been clicked
      // selectPilot();
      // setGameState(GameState.GAME);
      startGame();
    }
    // Iterate over pilots
    for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.length; i++) {
      let pilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots[i];

      if (event.clientX > pilot.x && event.clientX < pilot.x + pilot.width && event.clientY > pilot.y && event.clientY < pilot.y + pilot.height) {
        pilot.setSelected(true);
        for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.length; i++) {
          let otherPilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots[i];
          if (pilot != otherPilot) {
            otherPilot.setSelected(false);
          }
        }
      }
    }
  };

  canvas.addEventListener("click", pilotClickListener);
  canvas.addEventListener("mousemove", pilotMouseMoveListener);
}

function selectPilot() {
  if ((0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getGameState)() === _main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.PILOT_SELECT || (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getGameState)() === _main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.INTRO) {
    // Check if a pilot was clicked
    let pilotSelected = null; // Initialize pilotSelected to null

    for (let i = 0; i < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots.length; i++) {
      let pilot = _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.pilots[i];

      if (pilot.selected) {
        pilotSelected = pilot.name;
        break; // Exit the loop once a pilot is selected
      }
    }

    if (pilotSelected) {
      // If a pilot was selected, update the player object and change the game state to 'game'
      _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPilot(pilotSelected);
    }
  }
}

function removePilotsEventListeners(canvas) {
  canvas.removeEventListener("mousemove", pilotMouseMoveListener);
  canvas.removeEventListener("click", pilotClickListener);
}

function handleNameKeyDown(event) {
  // Check if the key is already down
  if (keysDown[event.key]) {
    return;
  }
  keysDown[event.key] = true;

  // Check if the key pressed is a printable character
  if (/^[\x20-\x7E]$/.test(event.key) && _main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName().length < _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.max_player_name) {
    // player.name += event.key;
    _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName(_main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName() + event.key);
  } else if (event.key === "Backspace") {
    //player.name = player.name.slice(0, -1);
    _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName(_main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName().slice(0, -1));
  }
  // Check if the key pressed is enter
  else if (event.key === "Enter") {
    // setGameState(GameState.PILOT_SELECT);
    //setGameState(GameState.GAME);
    startGame();
  }

  if (_main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName().length >= _gameLogic_js__WEBPACK_IMPORTED_MODULE_4__.max_player_name) {
    //inform the user somehow
  }

  // Redraw name entry
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.drawNameEntry)((0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getCanvas)(), (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getCanvas)().getContext("2d"), _main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName(), (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.getCanvas)().width / 2 - 100, 80);
}

function startGame() {
  if (_main_js__WEBPACK_IMPORTED_MODULE_0__.player.getPlayerName() == "") {
    _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName((0,_generateEntities_js__WEBPACK_IMPORTED_MODULE_3__.getRandomName)());
  }
  selectPilot();
  (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.GAME);
}

function handleNameKeyUp(event) {
  // Remove the key from the keysDown object
  delete keysDown[event.key];
}

function handleWinStateKeyDown(event) {
  // Check if the key pressed is enter
  if (event.key === "Enter") {
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.GAME);
  }
  if (event.key === "r") {
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.INTRO);
  }
}

function handleGameKeyDown(event) {
  // Handle game-specific keydown events here
}

function handleGameKeyUp(event) {
  // Handle game-specific keyup events here
}

function setupNameEventListeners(window) {
  window.addEventListener("keydown", handleNameKeyDown);
  window.addEventListener("keyup", handleNameKeyUp);
}
function removeNameEventListeners(window) {
  window.removeEventListener("keydown", handleNameKeyDown);
  window.removeEventListener("keyup", handleNameKeyUp);
}

function setupGameEventListeners() {}
function removeGameStateEventListeners() {}
function setupWinStateEventListeners(window, canvas) {
  // window.addEventListener("keydown", handleWinStateKeyDown);
  canvas.addEventListener("click", handleWinStateClick);
}

function removeWinStateEventListeners(window, canvas) {
  // window.removeEventListener("keydown", handleWinStateKeyDown);
  canvas.removeEventListener("click", handleWinStateClick);
}

function handleWinStateClick(event) {
  //just in case set canvas back
  this.style.left = "0px";
  this.style.top = "0px";
  // Play button dimensions and location
  let buttonX = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.playButtonX;
  let buttonY = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.playButtonY;
  let buttonWidth = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.playButtonWidth;
  let buttonHeight = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.playButtonHeight;

  // Check if the mouse click is within the bounds of the play button
  if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
    // Play button has been clicked
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.GAME);
  }
  buttonX = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.menuButtonX;
  buttonY = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.menuButtonY;
  buttonWidth = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.menuButtonWidth;
  buttonHeight = _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_1__.menuButtonHeight;
  // Check if the mouse click is within the bounds of the menu button
  if (event.clientX > buttonX && event.clientX < buttonX + buttonWidth && event.clientY > buttonY && event.clientY < buttonY + buttonHeight) {
    // Menu button has been clicked
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.INTRO);
  }
}

function removeLoginHandler(ctx) {
  ctx.canvas.removeEventListener("click", handleLoginButtonClick);
}

function addLoginHandler(ctx) {
  ctx.canvas.removeEventListener("click", handleLoginButtonClick);
  ctx.canvas.addEventListener("click", (event) => handleLoginButtonClick(event, ctx));
}
// Add a click event listener to handle login button click.
function handleLoginButtonClick(event, ctx) {
  let firebase = (0,_db_js__WEBPACK_IMPORTED_MODULE_2__.getFirebase)();
  let user = firebase.auth().currentUser;
  if (user) {
    console.log("Already logged in");
    return;
  }
  const mouseX = event.clientX - ctx.canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - ctx.canvas.getBoundingClientRect().top;

  // Calculate the new position of the login button based on the updated drawing code.
  const loginButtonX = ctx.canvas.width - _login_js__WEBPACK_IMPORTED_MODULE_6__.loginButton.width - _login_js__WEBPACK_IMPORTED_MODULE_6__.loginButton.x;
  const loginButtonY = _login_js__WEBPACK_IMPORTED_MODULE_6__.loginButton.y;

  if (mouseX >= loginButtonX && mouseX <= loginButtonX + _login_js__WEBPACK_IMPORTED_MODULE_6__.loginButton.width && mouseY >= loginButtonY && mouseY <= loginButtonY + _login_js__WEBPACK_IMPORTED_MODULE_6__.loginButton.height) {
    // Handle login button click event.
    if (user) {
      // User is signed in, handle sign out or other actions.
      // For example:
      // signOut();
    } else {
      // User is not signed in, handle sign in.
      (0,_login_js__WEBPACK_IMPORTED_MODULE_6__.firebaseGoogleLogin)(firebase);
    }
  }
}


/***/ }),

/***/ "./login.js":
/*!******************!*\
  !*** ./login.js ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   achievementsTitleText: () => (/* binding */ achievementsTitleText),
/* harmony export */   autoSignInWithGoogle: () => (/* binding */ autoSignInWithGoogle),
/* harmony export */   drawLoginForm: () => (/* binding */ drawLoginForm),
/* harmony export */   firebaseGoogleLogin: () => (/* binding */ firebaseGoogleLogin),
/* harmony export */   loginButton: () => (/* binding */ loginButton)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../gameLogic.js */ "./gameLogic.js");




const emailInput = {
  x: 50,
  y: 50,
  width: 200,
  height: 30,
  text: "",
};

const passwordInput = {
  x: 50,
  y: 100,
  width: 200,
  height: 30,
  text: "",
};

const loginButton = {
  x: 50,
  y: 50,
  width: 200,
  height: 40,
  text: "Login with Google",
};

const achievementsTitleText = {
  YOUR_ACHIEVEMENTS: "Your achievements",
  LOGIN_TO_TRACK: "login to track your achievements",
};

let googleSignInPopupOpen = false;

// Function to draw a rounded rectangle.
function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawLoginForm(ctx) {
  // Function to calculate the width of the text.
  function getTextWidth(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  // Could update loginButton text here... but then I'm doing that every tick...

  // Calculate the width of the updated text.
  const textWidth = getTextWidth(loginButton.text, "bold 12px Arial");

  // Adjust the button width to fit the text.
  loginButton.width = textWidth + 50; // You can adjust the padding as needed.

  // Draw login button.
  ctx.fillStyle = "blue";
  drawRoundRect(ctx, ctx.canvas.width - loginButton.width - loginButton.x, loginButton.y, loginButton.width, loginButton.height, 5);

  ctx.fillStyle = "white";
  ctx.fillText(loginButton.text, ctx.canvas.width - loginButton.width - loginButton.x + 25, loginButton.y + 20);
}

function firebaseLogin(firebase, email, password) {
  // Initialize Firebase app if it's not already initialized.
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User signed in with email and password.
      const user = userCredential.user;
      console.log(`Signed in as ${user.email}`);
      loginButton.text = `${user.email}`;
      _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName(user.displayName);
      (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.setAchievementsTitle)(achievementsTitleText.YOUR_ACHIEVEMENTS);
    })
    .catch((error) => {
      // Handle login errors.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Login failed with error code: ${errorCode}, message: ${errorMessage}`);
      // You can display an error message to the user on the canvas or in another way.
    });
}

function firebaseGoogleLogin() {
  // If a popup is already open, don't open another one.
  if (googleSignInPopupOpen) {
    return;
  }

  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

  // Set the boolean variable to true to indicate that a popup is open.
  googleSignInPopupOpen = true;

  firebase
    .auth()
    .signInWithPopup(googleAuthProvider)
    .then((userCredential) => {
      // User signed in with Google.
      const user = userCredential.user;
      console.log(`Signed in with Google as ${user.displayName}`);
      loginButton.text = `${user.email}`;
      _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName(user.displayName);
      setSignInCookie();
      //   updateLoginsCount(firebase);
      //   incrementFirebaseLoginsValue(firebase);
      (0,_db_js__WEBPACK_IMPORTED_MODULE_1__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_1__.DbPropertyKey.LOGINS, 1);
      (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.setAchievementsTitle)(achievementsTitleText.YOUR_ACHIEVEMENTS);
    })
    .catch((error) => {
      // Handle Google Sign-In errors.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Google Sign-In failed with error code: ${errorCode}, message: ${errorMessage}`);
      // You can display an error message to the user on the canvas or in another way.
    })
    .finally(() => {
      // Set the boolean variable to false when the popup is closed.
      googleSignInPopupOpen = false;
    });
}

function setSignInCookie() {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // Cookie expires in 7 days
  document.cookie = `user_signed_in=true; expires=${expirationDate.toUTCString()}; path=/`;
}

// Function to check if the user is signed in (cookie exists).
function isUserSignedIn() {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === "user_signed_in" && value === "true") {
      return true;
    }
  }
  return false;
}

function autoSignInWithGoogle(firebase) {
  if (!isUserSignedIn()) {
    // Don't want to auto make them login
    // firebaseGoogleLogin();
  } else if (!firebase.auth().currentUser) {
    // If the user is signed in via the cookie but not authenticated in the current session we log them in again.
    firebaseGoogleLogin();
  } else {
    //handle user logged in
    // updateLoginsCount(firebase);
    //   incrementFirebaseLoginsValue(firebase);
    (0,_db_js__WEBPACK_IMPORTED_MODULE_1__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_1__.DbPropertyKey.LOGINS, 1);
    (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_2__.setAchievementsTitle)(achievementsTitleText.YOUR_ACHIEVEMENTS);
    let loginButtonText = `${firebase.auth().currentUser.email}`;
    _main_js__WEBPACK_IMPORTED_MODULE_0__.player.setPlayerName(firebase.auth().currentUser.displayName);
    (0,_db_js__WEBPACK_IMPORTED_MODULE_1__.readUserDataFromFirestore)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_1__.DbDocumentKey.USERS, (error, userData) => {
      if (error) {
        if (error.message === "User not logged in") {
          console.log("User is not logged in.");
          // Handle not logged in state in your UI.
        } else {
          console.error(`Error reading user data: ${error.message}`);
          // Handle other errors, such as data not found, in your UI.
        }
      } else {
        const loginsCount = userData.logins || 0;
        console.log(`Logins count: ${loginsCount}`);
        // Use the logins count in your UI.
      }
    });
    loginButton.text = loginButtonText;
  }
}

function firebaseLogout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      console.log("User signed out");
      // You can add any post-logout logic here, such as redirecting to a login screen.
      // For example, you could call a function to show the login form:
      // showLoginForm();
    })
    .catch((error) => {
      // Handle errors, if any.
      console.error("Logout failed:", error);
    });
}

// Function to update the logins count for the current user.
function updateLoginsCount(firebase) {
  const user = firebase.auth().currentUser;

  if (user) {
    const userRef = firebase.firestore().collection(_db_js__WEBPACK_IMPORTED_MODULE_1__.DbDocumentKey.USERS).doc(user.uid);

    // Get the current logins count and increment it by 1.
    userRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const loginsCount = doc.data().logins || 0;
          const newLoginsCount = loginsCount + 1;

          // Update the logins count in Firestore.
          userRef
            .update({ logins: newLoginsCount })
            .then(() => {
              console.log(`Logins count updated to ${newLoginsCount}`);
              // You can also update the user interface with the new logins count here.
            })
            .catch((error) => {
              console.error(`Error updating logins count: ${error}`);
            });
        } else {
          // User document doesn't exist; create it and set logins count to 1.
          userRef
            .set({ logins: 1 })
            .then(() => {
              console.log("Logins count created and set to 1");
              // You can also update the user interface with the logins count here.
            })
            .catch((error) => {
              console.error(`Error creating logins count: ${error}`);
            });
        }
      })
      .catch((error) => {
        console.error(`Error getting user document: ${error}`);
      });
  }
}


/***/ }),

/***/ "./main.js":
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameState: () => (/* binding */ GameState),
/* harmony export */   acceleration: () => (/* binding */ acceleration),
/* harmony export */   bots: () => (/* binding */ bots),
/* harmony export */   camX: () => (/* binding */ camX),
/* harmony export */   camY: () => (/* binding */ camY),
/* harmony export */   canvas: () => (/* binding */ canvas),
/* harmony export */   colors: () => (/* binding */ colors),
/* harmony export */   ctx: () => (/* binding */ ctx),
/* harmony export */   executionTime: () => (/* binding */ executionTime),
/* harmony export */   fixedDeltaTime: () => (/* binding */ fixedDeltaTime),
/* harmony export */   gameTimer: () => (/* binding */ gameTimer),
/* harmony export */   getCanvas: () => (/* binding */ getCanvas),
/* harmony export */   getGameState: () => (/* binding */ getGameState),
/* harmony export */   getGlobalPowerUps: () => (/* binding */ getGlobalPowerUps),
/* harmony export */   globalPowerUps: () => (/* binding */ globalPowerUps),
/* harmony export */   mines: () => (/* binding */ mines),
/* harmony export */   otherPlayers: () => (/* binding */ otherPlayers),
/* harmony export */   player: () => (/* binding */ player),
/* harmony export */   powerUpColors: () => (/* binding */ powerUpColors),
/* harmony export */   selectedColors: () => (/* binding */ selectedColors),
/* harmony export */   setBots: () => (/* binding */ setBots),
/* harmony export */   setCam: () => (/* binding */ setCam),
/* harmony export */   setGameState: () => (/* binding */ setGameState),
/* harmony export */   setGameTimer: () => (/* binding */ setGameTimer),
/* harmony export */   setGlobalPowerUps: () => (/* binding */ setGlobalPowerUps),
/* harmony export */   setMines: () => (/* binding */ setMines),
/* harmony export */   worldDimensions: () => (/* binding */ worldDimensions)
/* harmony export */ });
/* harmony import */ var _canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./canvasDrawingFunctions.js */ "./canvasDrawingFunctions.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _gameDrawing_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./gameDrawing.js */ "./gameDrawing.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");
/* harmony import */ var _inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./inputHandlers.js */ "./inputHandlers.js");
/* harmony import */ var _login_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./login.js */ "./login.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./player.js */ "./player.js");












let gameTimer = 0;
function setGameTimer(newTime) {
  gameTimer = newTime;
}
const { canvas, ctx } = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_3__.setupCanvas)();
const worldDimensions = { width: 7200, height: 5400 };
const colors = [
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

const powerUpColors = [
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
const selectedColors = [];

const acceleration = 0.25;

// let lastTime = Date.now();
let lastTime = performance.now();
let executionTime = 0;
const GameState = {
  PILOT_SELECT: "pilotSelect",
  INTRO: "intro",
  FINISHED: "finished",
  GAME: "game",
  UNSET: "",
};

let gameState = GameState.UNSET;
let accumulator = 0;
let fixedDeltaTime = 1 / 60; // 60 updates per second
let playerToSpectate = null;
//if below is true if there are any connected humans they will first be used to spectate if possible
let prioritizeHumanSpectate = false;

const player = new _player_js__WEBPACK_IMPORTED_MODULE_10__.Player(null, null, null, 0, null, 0, "", "", false, true);
player.isMaster = true;
player.isLocal = true;
let otherPlayers = [];
let bots = [];
let mines = [];
let globalPowerUps = [];

let camX = player.x - canvas.width / 2;
let camY = player.y - canvas.height / 2;

function setCam(newCamX, newCamY) {
  if (newCamX != null) {
    camX = newCamX;
  }
  if (newCamX != null) {
    camY = newCamY;
  }
}

const camSpeedX = 0.065;
const camSpeedY = 0.11;

function getCanvas() {
  return canvas;
}

function setBots(newBots) {
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

function updateGame(deltaTime, playerActive, camX, camY) {
  //scale deltaTime
  deltaTime *= 100;

  //todo work out what to do here, do we do this for every local or not?
  if (true) {
    //dealing with error state, not sure best approach yet
    if (player.name == "" && player.pilot == "") {
      setGameState(GameState.INTRO);
      // return;
    }
    //todo might have to uncomment the condition
    // if (isPlayerMasterPeer(player)) {
    // This peer is the master, so it runs the game logic for shared objects
    (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.masterUpdateGame)(player, globalPowerUps, otherPlayers, bots, mines, deltaTime, camX, camY);
    // }
  }

  if (playerActive) {
    updateCamera(player, deltaTime);
    (0,_gameDrawing_js__WEBPACK_IMPORTED_MODULE_4__.drawScene)(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  } else {
    camFollowPlayer(deltaTime);
    (0,_gameDrawing_js__WEBPACK_IMPORTED_MODULE_4__.drawScene)(null, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  }
  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.removeClosedConnections)(otherPlayers);
  if (player.isDead) {
    setGameState(GameState.FINISHED);
    player.resetState(true, true);
    //set player.isPlayer = false here?
  }

  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTicksSinceLastFullSendRequestResponse)(_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.ticksSinceLastFullSendRequestResponse + 1);
  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTicksSinceLastConnectionAttempt)(_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.ticksSinceLastConnectionAttempt + 1);
  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceAnyMessageRecieved)(_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.timeSinceAnyMessageRecieved + 1);
  if (_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.timeSinceAnyMessageRecieved > 100 && _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.ticksSinceLastConnectionAttempt > 3000) {
    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
    //todo do we need to attemptConnections here?
  }
  if (_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.timeSinceMessageFromMaster > 60 * 15 && !(0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player)) {
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setTimeSinceMessageFromMaster)(0);
    //try removing the current master
    //issue could be that peer doesn't think it is the master because it is connected to others.. need to sync connected lists I think.
    // Remove player from otherPlayers array, connections array and connectedPeers (array of id's of the connected peers)
    // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
    // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
    // connectedPeers.splice(0, 1);
    // setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
    // //what about "connections" how is connections and connectedPeers synced?
    (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.setMasterPeerId)((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.chooseNewMasterPeer)(player, otherPlayers));

    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  }
}

function camFollowPlayer(deltaTime) {
  let allPlayers = null;
  if (prioritizeHumanSpectate) {
    allPlayers = [...bots, player];
    (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.shuffleArray)(allPlayers);
    //let shuffledOtherPlayers = shuffleArray([...otherPlayers]);
    allPlayers = [...otherPlayers, ...bots, player];
  } else {
    allPlayers = [...bots, ...otherPlayers, player];
    (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_6__.shuffleArray)(allPlayers);
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
  (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.addPilotEventListners)(canvas, ctx);
  //todo will need to update this if multiple pilots
  let anySelected = false;
  for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.pilots) {
    if (pilot.selected) {
      anySelected = true;
    }
  }
  if (!anySelected) {
    _gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.pilots[0].setSelected(true);
  }
}

function updatePilot() {
  for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.pilots) {
    if (pilot.selected) {
      pilot.pilotAnimationFrame++;
    }
  }
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawPreGameOverlay)(canvas, ctx);
}

function updateName() {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawNameEntry)(canvas, ctx, player.name, canvas.width / 2 - 100, 80);
}

function updateWinState() {
  //drawScene(player, otherPlayers, bots, mines,ctx, camX, camY, worldDimensions, canvas, globalPowerUps);
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawGameOverMessage)(ctx, canvas, _gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.endGameMessage);
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawDailyScores)(ctx);
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawAchievements)(ctx);
}

function setGlobalPowerUps(newPowerUps) {
  if (newPowerUps !== globalPowerUps) {
    //update original array while keeping the reference
    globalPowerUps.length = 0;
    globalPowerUps.push(...newPowerUps);
  }
}

function setMines(newMines) {
  if (newMines !== mines) {
    //update original array while keeping the reference
    mines.length = 0;
    mines.push(...newMines);
  }
}

function getGlobalPowerUps() {
  return globalPowerUps;
}
function getGameState() {
  return gameState;
}

function setGameState(newState) {
  if (gameState === newState) {
    return;
  }
  let prevGameState = gameState;
  gameState = newState;
  if (newState === GameState.PILOT_SELECT && prevGameState !== GameState.PILOT_SELECT) {
    setupPilots(canvas, ctx);
  }

  if (newState !== GameState.PILOT_SELECT && prevGameState === GameState.PILOT_SELECT) {
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removePilotsEventListeners)(canvas);
  }

  if (newState === GameState.INTRO && prevGameState !== GameState.INTRO) {
    player.isPlaying = false;
    player.isDead = false;
    (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.updateTopScoresInfo)();
    setupPilots(canvas, ctx);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.setupNameEventListeners)(window);
    updateName();
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.addLoginHandler)(ctx);
  }

  if (newState !== GameState.INTRO && prevGameState === GameState.INTRO) {
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removeNameEventListeners)(window);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removeLoginHandler)(ctx);
  }

  if (newState === GameState.FINISHED && prevGameState !== GameState.FINISHED) {
    var date = new Date();
    var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    var score = Math.floor(Math.random() * 100) + 1;
    (0,_db_js__WEBPACK_IMPORTED_MODULE_2__.addScoreToDB)("daily-" + dateString, player.name, player.powerUps * 100);

    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.setupWinStateEventListeners)(window, canvas);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removeLoginHandler)(ctx);
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player)) {
      //do we need this special send?
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_9__.sendPlayerStates)(player, true, true, true);
    }
  }

  if (newState !== GameState.FINISHED && prevGameState === GameState.FINISHED) {
    //do we need resetPowerLevels anymore?
    // resetPowerLevels(player, otherPlayers, globalPowerUps);
    (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_5__.setGameWon)(false);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removeWinStateEventListeners)(window, canvas);
  }

  if (newState === GameState.GAME && prevGameState !== GameState.GAME) {
    // fixedDeltaTime = 1 / 60;
    // setupGameEventListeners(window);

    //todo add back in if not to blame
    player.resetState(true, true);
    player.isPlaying = true;
    player.setIsDead(false);
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_9__.sendPlayerStates)(player, (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(player), true, true);

    // setTimeout(() => connectToPeers(player, otherPlayers, globalPowerUps), 1000);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removePilotsEventListeners)(canvas);
    (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.removeLoginHandler)(ctx);
  }

  if (newState !== GameState.GAME && prevGameState === GameState.GAME) {
    //for now moving to showing game underneath all the time
    player.resetState(true, true);

    player.isPlaying = false;
    player.x = -600;
    player.y = -600;
    player.centerCameraOnPlayer(canvas.width, canvas.height);
    setTimeout(() => (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.updateTopScoresInfo)(), 300);

    //todo addback in if there was a good reason for this
    // globalPowerUps = [];
  }
}

function update() {
  const startTime = performance.now();
  let now = performance.now();
  let deltaTime = (now - lastTime) / 1000; // Time since last frame in seconds
  lastTime = now;
  deltaTime = Math.min(deltaTime, 0.1);
  //if master and we see here have been paused a long time perhaps we need to at least get game state from another before sending out updates?
  accumulator += deltaTime;

  while (accumulator >= fixedDeltaTime) {
    if (gameState != GameState.GAME) {
      //since we show the ongoing game at all times alway do this
      updateGame(fixedDeltaTime, false, camX, camY);
    }
    if (gameState === GameState.INTRO) {
      updateName();
      (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.drawTextCursorFromText)(ctx, player.name);
      updatePilot();
      (0,_login_js__WEBPACK_IMPORTED_MODULE_8__.drawLoginForm)(ctx);
    } else if (gameState === GameState.PILOT_SELECT) {
      updatePilot();
    } else if (gameState === GameState.GAME) {
      updateGame(fixedDeltaTime, true, camX, camY);
    } else if (gameState === GameState.FINISHED) {
      updateWinState();
    }
    accumulator -= fixedDeltaTime;
  }

  const endTime = performance.now();
  executionTime = endTime - startTime;

  requestAnimationFrame(update);
}

window.addEventListener("load", function () {
  /* START CONNECTION HANDLERS  */
  (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.createPeer)(player, otherPlayers, globalPowerUps);

  (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_3__.setupSpikeyBallPoints)();

  //for now just do this at game start and transition, in future do this periodically?
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.updateTopScoresInfo)();
  (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.handleInputEvents)(canvas, player);
  (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_3__.centerPilots)(canvas);
  (0,_canvasDrawingFunctions_js__WEBPACK_IMPORTED_MODULE_0__.setupCarrots)();
  update();
  (0,_inputHandlers_js__WEBPACK_IMPORTED_MODULE_7__.setupGameEventListeners)(window);
  setGameState(GameState.INTRO);

  setTimeout(() => (0,_login_js__WEBPACK_IMPORTED_MODULE_8__.autoSignInWithGoogle)((0,_db_js__WEBPACK_IMPORTED_MODULE_2__.getFirebase)()), 500);
});

window.addEventListener("resize", function (event) {
  (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_3__.setupCanvas)();
});


/***/ }),

/***/ "./mineDrawing.js":
/*!************************!*\
  !*** ./mineDrawing.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawMine: () => (/* binding */ drawMine)
/* harmony export */ });
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collisionLogic.js */ "./collisionLogic.js");




function drawRegularMine(ctx, centerX, centerY, camX, camY, angle, mineScale, points, outerColor, coreColor, basicAnimationTimer) {
  const glowWidth = 5;
  const shadowBlur = 10;
  let coreRadius = 15;
  const pulseSpeed = 0.0095;
  const blinkSpeed = 0.005;

  //   coreRadius = basicAnimationTimer % maxCoreRadius;
  coreRadius = coreRadius + Math.sin(basicAnimationTimer * pulseSpeed) * 15;
  // Draw the outer spikey ball with glow and shadow
  ctx.beginPath();
  ctx.shadowBlur = shadowBlur;
  ctx.shadowColor = outerColor;
  ctx.strokeStyle = outerColor;

  let rotatedPoint = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.rotateAndScalePoint)(points[0].x, points[0].y, angle, mineScale);
  ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.rotateAndScalePoint)(points[i].x, points[i].y, angle, mineScale);
    ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  }

  ctx.stroke();

  // Add a glowing effect
  ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Adjust the color and opacity for the glow
  ctx.lineWidth = glowWidth;
  ctx.stroke();

  // Reset shadow and line width
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;

  // Draw the pulsating core
  const coreOpacity = 0.8 + Math.sin(Date.now() * blinkSpeed) * 0.2; // Pulsating opacity
  ctx.fillStyle = coreColor;
  ctx.globalAlpha = coreOpacity;
  ctx.beginPath();
  ctx.arc(centerX - camX, centerY - camY, coreRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1; // Reset global alpha
}

function drawMineShape(ctx, camX, camY, points, color) {
  if (points == null) {
    console.log("no points passed to mine shape draw");
    return;
  }
  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    const moveToX = x - camX;
    const moveToY = y - camY;
    ctx.lineTo(moveToX, moveToY);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSpoke(ctx, centerXScreenCoord, centerYScreenCoord, angleRadians, spokeLength, spokeWidth) {
  ctx.lineWidth = spokeWidth;

  ctx.beginPath();
  ctx.moveTo(centerXScreenCoord, centerYScreenCoord);

  const spokeEndX = centerXScreenCoord + spokeLength * Math.cos(angleRadians);
  const spokeEndY = centerYScreenCoord + spokeLength * Math.sin(angleRadians);

  ctx.lineTo(spokeEndX, spokeEndY);

  let circleRadius = ctx.lineWidth / 8;
  const spokeEndArcDrawPointX = centerXScreenCoord + (spokeLength - circleRadius) * Math.cos(angleRadians);
  const spokeEndArcDrawPointY = centerYScreenCoord + (spokeLength - circleRadius) * Math.sin(angleRadians);

  // Calculate the coordinates of the point for the arc
  const spokeEndArcDrawPointOnEdgeX = centerXScreenCoord + (circleRadius + spokeLength + spokeWidth) * Math.cos(angleRadians);
  const spokeEndArcDrawPointOnEdgeY = centerYScreenCoord + (circleRadius + spokeLength + spokeWidth) * Math.sin(angleRadians);
  ctx.lineCap = "round";

  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawFreeMine(ctx, camX, camY, angle, mineScale, mine, color, centerX, centerY, animationFrame = 0, explosionEffect = false) {
  let points = mine.points;
  let spokeWidth = mine.spokeWidth;
  let spokeLength = mine.spokeLength;
  if (!explosionEffect) {
    const centerXScreenCoord = centerX - camX;
    const centerYScreenCoord = centerY - camY;
    drawMineShape(ctx, camX, camY, points, color);

    for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += 45) {
      const angleRadians = (angleDegrees + angle) * (Math.PI / 180);
      drawSpoke(ctx, centerXScreenCoord, centerYScreenCoord, angleRadians, spokeLength, spokeWidth);
    }
  } else {
    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.drawExplosion)(ctx, camX, camY, explosionEffect);
  }
}

function drawMine(ctx, camX, camY, mine, points) {
  let centerX = mine.x;
  let centerY = mine.y;
  let color = mine.color;
  let angle = 0;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 1;
  const currentTime = Date.now();
  let elapsedTime = currentTime - mine.starTransitionStartTime;
  const transitionDuration = 50;
  if (isNaN(elapsedTime)) {
    elapsedTime = Math.floor(Math.random() * transitionDuration);
  }
  if (!mine.starTransitionStartTime || elapsedTime >= transitionDuration) {
    mine.starTransitionStartTime = currentTime - elapsedTime;
    mine.starTransitionStartColor = color;
  }
  const animationFrame = elapsedTime % transitionDuration;

  ctx.beginPath();
  if (mine.mineType === _entities_js__WEBPACK_IMPORTED_MODULE_1__.MineType.REGULAR) {
    if (mine.hitFrames < -1) {
      (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.applyGlowingEffect)(ctx, "white", mine.color, "white", transitionDuration, animationFrame, 0.2);
    }
    drawRegularMine(ctx, centerX, centerY, camX, camY, angle, _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__.mineScale, points, color, "red", elapsedTime);
  } else if (mine.mineType === _entities_js__WEBPACK_IMPORTED_MODULE_1__.MineType.FREE_MINE) {
    if (!mine.starTransitionStartTime || elapsedTime >= transitionDuration) {
      mine.starTransitionStartTime = currentTime;
      mine.starTransitionStartColor = color;
    }
    (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.applyGlowingEffect)(ctx, "orange", mine.color, "white", transitionDuration, animationFrame, 0.4);
    drawFreeMine(ctx, camX, camY, angle, 1, mine, color, centerX, centerY, animationFrame);
  } else if (mine.mineType === _entities_js__WEBPACK_IMPORTED_MODULE_1__.MineType.TRAIL) {
    ctx.fillStyle = color;
    if (mine.duration < 10) {
      ctx.fillStyle = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.getComplementaryColor)(mine.color);
    }
    // Handle trail mines here
    const trailLength = mine.length;
    const trailWidth = mine.width;

    const trailX = centerX - camX;
    const trailY = centerY - camY;
    angle = mine.angle;

    // Apply the rotation transformation
    ctx.translate(trailX, trailY);
    ctx.rotate(angle);

    // Calculate half of the trailLength
    const halfTrailLength = trailLength / 2;
    const halfTrailWidth = trailWidth / 2;

    // Draw the left circle (start of the sausage)
    ctx.arc(0, -halfTrailLength, halfTrailWidth, 0, Math.PI * 2);

    // Draw the rectangle (sausage body)
    ctx.rect(-halfTrailWidth, -trailLength / 2, trailWidth, trailLength);

    // Draw the right circle (end of the sausage)
    ctx.arc(0, -halfTrailLength + trailLength, halfTrailWidth, 0, Math.PI * 2);

    // // Reset the rotation and translation
    // ctx.rotate(-angle);
    // ctx.translate(-trailX, -trailY);
    ctx.fill();

    // Save the current global composite operation
    const prevGlobalCompositeOperation = ctx.globalCompositeOperation;
    // Set the global composite operation to 'source-over' to blend the new content
    ctx.globalCompositeOperation = "source-over";
    // Create a radial gradient to simulate the vapor trail with your color
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfTrailWidth);
    let rgbColor = (0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.nameToRGBFullFormat)(color);
    gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`); // Inner part of the trail
    gradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5)`); // Outer part of the trail

    // ctx.fillStyle = gradient;
    ctx.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.1)`;
    // Draw the rectangle (sausage body)
    ctx.rect(-halfTrailWidth - 20, -trailLength / 2 - 20, trailWidth + 40, trailLength + 40);
    ctx.fill();
    // Reset the rotation and translation
    ctx.rotate(-angle);
    ctx.translate(-trailX, -trailY);
    // Restore the previous global composite operation
    ctx.globalCompositeOperation = prevGlobalCompositeOperation;
  }

  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 1;
}


/***/ }),

/***/ "./miniMapDrawing.js":
/*!***************************!*\
  !*** ./miniMapDrawing.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   drawMiniMapEntity: () => (/* binding */ drawMiniMapEntity),
/* harmony export */   drawMinimap: () => (/* binding */ drawMinimap),
/* harmony export */   drawMinimapPowerups: () => (/* binding */ drawMinimapPowerups)
/* harmony export */ });
/* harmony import */ var _drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./drawingUtils.js */ "./drawingUtils.js");


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

  // Draw the player's ship on the minimap
  if (!(0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.shouldSkipPlayer)(player)) {
    drawMiniMapEntity(player, minimapCtx, scaleX, scaleY, dotSize);
  }

  // Draw other players on the minimap
  otherPlayers.forEach((otherPlayer) => {
    if (!(0,_drawingUtils_js__WEBPACK_IMPORTED_MODULE_0__.shouldSkipPlayer)(otherPlayer)) {
      drawMiniMapEntity(otherPlayer, minimapCtx, scaleX, scaleY, dotSize);
    }
  });

  // Draw bots on the minimap
  bots.forEach((bot) => {
    drawMiniMapEntity(bot, minimapCtx, scaleX, scaleY, dotSize);
  });
}

function drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight) {
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

// Function to draw a player or bot on the minimap
function drawMiniMapEntity(entity, ctx, scaleX, scaleY, dotSize) {
  if (entity != null && entity.isPlaying) {
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x * scaleX, entity.y * scaleY, dotSize, dotSize);
  }
}


/***/ }),

/***/ "./player.js":
/*!*******************!*\
  !*** ./player.js ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Bot: () => (/* binding */ Bot),
/* harmony export */   BotState: () => (/* binding */ BotState),
/* harmony export */   Player: () => (/* binding */ Player),
/* harmony export */   Special: () => (/* binding */ Special),
/* harmony export */   createBotFromObject: () => (/* binding */ createBotFromObject),
/* harmony export */   createPlayerFromObject: () => (/* binding */ createPlayerFromObject),
/* harmony export */   serializeBots: () => (/* binding */ serializeBots)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collisionLogic.js */ "./collisionLogic.js");
/* harmony import */ var _db_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./db.js */ "./db.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");
/* harmony import */ var _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./gameLogic.js */ "./gameLogic.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");










const bounceFactor = 1.5;
const offset = 1;
const minBounceSpeed = 5;
const maxBotsThatCanTargetAtOnce = 1;
const maxVel = 50;
const minVel = -50;
const resettingBackupTimeout = 200;
let lastSentBots = [];

const BotState = {
  FOLLOW_PLAYER: "followPlayer",
  RANDOM: "random",
  COLLECT: "collect",
};

const Special = {
  BOOST: "boost",
  FORCE_PULL: "pull",
  FORCE_PULL_FOCUS: "pullfocus",
  FORCE_PUSH: "push",
};

class Player {
  #angle;
  constructor(
    id = null,
    x = null,
    y = null,
    powerUps = 0,
    color = null,
    angle = 0,
    pilot = "",
    name = "",
    isPlaying = true,
    isUserControlledCharacter = false
  ) {
    this.id = id;
    this.x = x !== null ? x : 1200 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width - 2400);
    this.y = y !== null ? y : 600 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height - 1200);
    this.powerUps = powerUps;
    this.color = color !== null ? color : (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(_main_js__WEBPACK_IMPORTED_MODULE_0__.colors, _main_js__WEBPACK_IMPORTED_MODULE_0__.selectedColors);
    this.#angle = angle;
    this.pilot = pilot;
    this.name = name;
    this.isPlaying = isPlaying;
    this.isUserControlledCharacter = isUserControlledCharacter;
    this.lives = 1;
    this.isMaster = false;
    this.setIsDead(false);
    this.invincibleTimer = 0;
    this.forceCoolDown = 0;
    this.setComboScaler(1);
    this.kills = 0;
    this.isBot = false;
    this.playerAngleData = {};
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.absoluteMousePosX = 0;
    this.absoluteMousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.distanceFactor = 0;
    this.space = false;
    this.shift = false;
    this.u = false;
    this.ticksSincePowerUpCollection = -1;
    this.targetedBy = [];
    this.timeSinceSpawned = 0;
    this.timeSinceSentMessageThatWasRecieved = 0;
    this.special = Special.FORCE_PULL;
    this.specialMeter = 100;
    this.usingSpecial = 0;
    this.hitBy = "";
    this.recentScoreTicks = 0;
    this.isLocal = false;
    this.timeOfLastActive = "";
    this.recentScoreText = "";
    this.recentKillScoreText = "";
    this.devMode = false;
    this.killed = [];
    this.killedBy = [];
    this.resetting = false;
  }
  setAngle(angle) {
    let previousAngleDifference = angle - this.#angle;
    if (this.isBot == false && Math.abs(previousAngleDifference > 0.2)) {
      // console.log(`Before: ${this.#angle}, After: ${angle}`);
    }
    this.#angle = angle;
  }
  getAngle() {
    return this.#angle;
  }
  resetState(keepName, keepColor) {
    this.x = 1200 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width - 2400);
    this.y = 600 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height - 1200);
    this.powerUps = 0;
    if (!keepColor) {
      this.color = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(_main_js__WEBPACK_IMPORTED_MODULE_0__.colors, _main_js__WEBPACK_IMPORTED_MODULE_0__.selectedColors);
    }
    this.setAngle(0);
    if (!keepName) {
      this.name = "";
    }
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.target = { x: 0, y: 0, id: "" };
    this.targetedBy = [];
    this.space = false;
    this.shift = false;
    //don't reset isDead, that can be done explicity when game is (re)started
    // this.setIsDead(false);
    this.invincibleTimer = 0;
    this.setComboScaler(1);
    this.kills = 0;
    this.inRangeTicks = 0;
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.absoluteMousePosX = 0;
    this.absoluteMousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.timeSinceSpawned = 0;
    this.hitBy = "";
    this.recentScoreTicks = 0;
    this.recentScoreText = "";
    this.recentKillScoreText = "";
    this.resetting = false;
    this.inForce = 0;
  }
  isDead() {
    return this.isDead;
  }
  setIsDead(newIsDead) {
    this.isDead = newIsDead;
  }

  delayReset(framesToDelay, keepName, keepColor, inProgress = false) {
    if (!inProgress && this.resetting == true) {
      // If already have a scheduled reset, ignore future requests.//could do this timeout only if master?
      if (!this.resettingTimeout) {
        this.resettingTimeout = setTimeout(() => {
          this.resetting = false;
          this.resettingTimeout = null;
          console.log("Resetting flag was forcefully reset.");
        }, resettingBackupTimeout);
      }
      return;
    }

    // Resetting is in progress, clear the timeout if it exists.
    if (this.resettingTimeout) {
      clearTimeout(this.resettingTimeout);
      this.resettingTimeout = null;
    }

    this.resetting = true;
    if (framesToDelay > 0) {
      requestAnimationFrame(() => {
        this.delayReset(framesToDelay - 1, keepName, keepColor, true);
      });
    } else {
      // Execute the reset after the specified number of frames.
      this.resetState(keepName, keepColor);
    }
  }

  //gotHit and addScore are both doing an additional key function of sending the playerstates as master.
  //Need to unpick this, maybe there should be events for gotHit and addscore and masterpeer responds to such events with sending player state for the given player
  gotHit(hitBy, otherPlayerGotHitToo = false) {
    this.setIsDead(true);
    this.recentScoreTicks = 0;
    this.setComboScaler(1);
    this.hitBy = hitBy;

    this.updateKilledAndKilledByLists(hitBy, this == _main_js__WEBPACK_IMPORTED_MODULE_0__.player, otherPlayerGotHitToo);

    if (!this.killedBy.includes(hitBy) && hitBy != _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__.HitByType.MINE) {
      this.killedBy.push(hitBy);
    }
    let effectID = Math.floor(Math.random() * 10000);

    let effect = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.Effect(effectID, this.x, this.y, 100, 50, "orange", _entities_js__WEBPACK_IMPORTED_MODULE_4__.EffectType.EXPLOSION);
    _entities_js__WEBPACK_IMPORTED_MODULE_4__.effects.push(effect);
    // sendEffectsUpdate(true)
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendPlayerStates)(this, true, true);
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendEffectsUpdate)(true);
    }
    if (this.isLocal) {
      (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.screenShake)(_main_js__WEBPACK_IMPORTED_MODULE_0__.canvas, 30, 1000);
      let firebase = (0,_db_js__WEBPACK_IMPORTED_MODULE_3__.getFirebase)();
      if (firebase) {
        const user = firebase.auth().currentUser;
        if (user) {
          (0,_db_js__WEBPACK_IMPORTED_MODULE_3__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_3__.DbPropertyKey.SCORE, this.powerUps);
          (0,_db_js__WEBPACK_IMPORTED_MODULE_3__.incrementFirebaseGivenPropertyValue)(firebase, _db_js__WEBPACK_IMPORTED_MODULE_3__.DbPropertyKey.KILLS, this.kills);
        }
      }
    }
    if (this.isBot) {
      this.delayReset(_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.botRespawnDelay, true, true);
    }
  }

  updateKilledAndKilledByLists(hitBy, isPlayer, otherPlayerGotHitToo) {
    if (hitBy != null && hitBy != "") {
      this.updateKilledAndKilledByListsValidHitBy(hitBy, isPlayer, otherPlayerGotHitToo);
    } else if (isPlayer) {
      (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)("Score: " + this.powerUps * 100);
    }
  }

  updateKilledAndKilledByListsValidHitBy(hitBy, isPlayer, otherPlayerGotHitToo) {
    if (!this.killed.includes(hitBy)) {
      if (!this.killedBy.includes(hitBy)) {
        if (isPlayer) {
          if (hitBy == _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__.HitByType.MINE) {
            (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)("Watch out for mines! \nScore: " + this.powerUps * 100);
          } else if (otherPlayerGotHitToo) {
            (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)("Crashed into: " + hitBy + "\nScore: " + this.powerUps * 100);
          } else {
            (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)("Killed by: " + hitBy + "\nScore: " + this.powerUps * 100);
          }
        }
      } else {
        if (isPlayer) {
          (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)(hitBy + " is dominating you" + "\nScore: " + this.powerUps * 100);
        }
      }
    } else {
      this.killed = this.killed.filter((item) => item !== hitBy);
      if (isPlayer) {
        (0,_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.setEndGameMessage)(hitBy + " took their revenge!" + "\nScore: " + this.powerUps * 100);
      }
    }
  }

  addScore(scoreToAdd) {
    this.powerUps += scoreToAdd;
    if (this.powerUps != Math.floor(this.powerUps)) {
      //I'm trying out not whole number combo scaling so not unexpected now
      // console.log("somehow not whole score added");
      this.powerUps = Math.floor(this.powerUps);
    }
    // if (isPlayerMasterPeer(player) && !isPlayerMasterPeer(this)) {
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendPlayerStates)(this, true, true);
    }
  }

  gotPowerUp(isStar, scoreToAdd, powerUpIndex) {
    this.ticksSincePowerUpCollection = 0;
    if (isStar) {
      let invcibilityTime = _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.initialInvincibleTime;
      for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.pilots) {
        if (this.pilot == pilot.name) {
          invcibilityTime = pilot.invincibilityTime;
          break;
        }
      }
      this.setInvincibleTimer(invcibilityTime);
    }

    scoreToAdd *= this.comboScaler;

    this.recentScoreTicks = 150;
    let textScore = scoreToAdd * 100;
    this.setRecentScoreText(textScore);
    if (this.comboScaler < 10) {
      this.setComboScaler(this.comboScaler + 0.5);
    }
    _main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps[powerUpIndex].hitFrames = 2;
    // // globalPowerUps.splice(powerUpIndex, 1);

    // if (isPlayerMasterPeer(player)) {
    //   setGlobalPowerUps(globalPowerUps);
    // }
    this.addScore(scoreToAdd);
    this.recentKillScoreText = "";
    if (this.isLocal) {
      // screenShake(canvas, 2, 200);
    }
  }

  setComboScaler(newValue) {
    if (newValue < 1) {
      this.comboScaler = 1;
    } else {
      this.comboScaler = newValue;
    }
  }

  setRecentScoreText(textScore) {
    if (this.comboScaler >= 5.5) {
      this.recentScoreText = this.getComboText("Monster!", textScore);
    } else if (this.comboScaler >= 5) {
      this.recentScoreText = this.getComboText("Epic!", textScore);
    } else if (this.comboScaler >= 4.5) {
      this.recentScoreText = this.getComboText("Awesome!", textScore);
    } else if (this.comboScaler >= 4) {
      this.recentScoreText = this.getComboText("Insane!", textScore);
    } else if (this.comboScaler >= 3.5) {
      this.recentScoreText = this.getComboText("Unreal!", textScore);
    } else if (this.comboScaler >= 3) {
      this.recentScoreText = this.getComboText("Fierce!", textScore);
    } else if (this.comboScaler >= 2.5) {
      this.recentScoreText = this.getComboText("Sick!", textScore);
    } else if (this.comboScaler >= 2.1) {
      this.recentScoreText = this.getComboText("Wild!", textScore);
    } else if (this.comboScaler >= 1.8) {
      this.recentScoreText = this.getComboText("Cool!", textScore);
    } else if (this.comboScaler >= 1.5) {
      this.recentScoreText = this.getComboText("Combo!", textScore);
    } else {
      this.recentScoreText = this.getComboText("", textScore);
    }
  }

  getComboText(comboName, textScore) {
    return comboName + " " + textScore;
  }

  setRecentKillText(playerThatGotHitName, revenge = true) {
    const killFlavorText = ["KILL!", "GOTTEM!", "SMASH!", "OOOF!"];

    const revengeFlavorText = ["Got Revenge on ", " gets served with payback", " won't mess with you again", " found out"];

    const dominatingFlavorText = ["Dominating poor ", " dies again", " bites the dust again", " found out again"];

    // Generate random index, can split this out if want to have different number of options for each text
    const textIndex = Math.floor(Math.random() * killFlavorText.length);
    if (playerThatGotHitName != null && playerThatGotHitName != "") {
      if (revenge) {
        if ((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.checkFirstLetterSpace)(revengeFlavorText[textIndex])) {
          this.recentKillScoreText = playerThatGotHitName + revengeFlavorText[textIndex];
        } else {
          this.recentKillScoreText = revengeFlavorText[textIndex] + playerThatGotHitName;
        }
      } else {
        //if not revenge then dominating
        if ((0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.checkFirstLetterSpace)(dominatingFlavorText[textIndex])) {
          this.recentKillScoreText = playerThatGotHitName + dominatingFlavorText[textIndex];
        } else {
          this.recentKillScoreText = dominatingFlavorText[textIndex] + playerThatGotHitName;
        }
      }
    } else {
      //if no name passed then set regular flavour text
      this.recentKillScoreText = killFlavorText[textIndex];
    }
  }

  hitOtherPlayer(playerThatGotHit) {
    this.kills += 1;
    if (this.killedBy.includes(playerThatGotHit.name)) {
      this.killedBy = this.killedBy.filter((item) => item !== playerThatGotHit.name);
      this.setRecentKillText(playerThatGotHit.name, true);
    } else if (this.killed.includes(playerThatGotHit.name)) {
      this.setRecentKillText(playerThatGotHit.name, false);
    } else {
      this.setRecentKillText("");
    }
    if (!this.killed.includes(playerThatGotHit.name)) {
      this.killed.push(playerThatGotHit.name);
    }

    let score = 2 * this.comboScaler;
    score += Math.round(playerThatGotHit.powerUps / 3);
    this.recentScoreTicks = 250;
    let textScore = score * 100;

    this.setRecentScoreText(textScore);
    if (this.invincibleTimer > 165) {
      this.setInvincibleTimer(this.invincibleTimer - 150);
    } else {
      this.setInvincibleTimer(15);
    }
    this.addScore(score);
    if (this.comboScaler < 10) {
      this.setComboScaler(this.comboScaler + 0.5);
    }
    if (this.isLocal) {
      (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.screenShake)(_main_js__WEBPACK_IMPORTED_MODULE_0__.canvas, 30, 500);
      // let firebase = getFirebase();
      // if (firebase) {
      //   const user = firebase.auth().currentUser;
      //   if (user) {
      //     incrementFirebaseGivenPropertyValue(firebase, DbPropertyKey.KILLS, 1);
      //   }
      // }
    }
  }

  isActive() {
    return (this.isPlaying || this.isBot) && !this.isDead;
  }

  isInvincible() {
    return this.invincibleTimer > 0;
  }
  isVulnerable() {
    return !this.isInvincible() && !this.isInSpawnProtectionTime() && this.isActive();
  }
  isTangible() {
    return !this.isInSpawnProtectionTime() || this.isInvincible();
  }

  isInSpawnProtectionTime() {
    return this.timeSinceSpawned <= _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.spawnProtectionTime;
  }

  setInvincibleTimer(newTime) {
    let invcibilityTime = _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.maxInvincibilityTime;
    for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.pilots) {
      if (this.pilot == pilot.name) {
        invcibilityTime = pilot.invincibilityTime;
        break;
      }
    }

    this.invincibleTimer = Math.min(newTime, invcibilityTime);
    this.invincibleTimer = Math.max(this.invincibleTimer, 0);
  }

  setSpecialMeter(newTime) {
    this.specialMeter = Math.min(newTime, _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.maxSpecialMeter);
    this.specialMeter = Math.max(this.specialMeter, 0);
  }
  setPilot(newPilot) {
    this.pilot = newPilot;
    if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_1) {
      this.special = Special.FORCE_PULL;
    }
    if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_2) {
      this.special = Special.FORCE_PUSH;
    }
    if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_3) {
      this.special = Special.BOOST;
    }
    if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_4) {
      this.special = Special.FORCE_PULL_FOCUS;
    }
  }

  getPlayerName() {
    return this.name;
  }

  setPlayerName(newName) {
    this.name = newName;
  }

  setPlayerIsMaster(isMaster) {
    if (this.isLocal && !isMaster && this.isMaster) {
      //if switching away from being master send basic ship data
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendPlayerStates)(this, false, true);
    }
    if (isMaster && !this.isMaster) {
      //if switching any player to being master request basic ship data
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendRequestForStates)();
    }
    if (isMaster && !this == _main_js__WEBPACK_IMPORTED_MODULE_0__.player) {
      //if switching another player to master ask master for a full update. Not sure if master will be ready as master immediately so schedule a few requests
      setTimeout(() => (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.requestFullUpdate)(), 20);
      setTimeout(() => (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.requestFullUpdate)(), 500);
      setTimeout(() => (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.requestFullUpdate)(), 2000);
    }
    this.isMaster = isMaster;
  }
  bouncePlayer() {
    if (this.x < 0 || this.x > _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width) {
      this.vel.x = -this.vel.x * bounceFactor;
      this.x = this.x < 0 ? offset : _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width - offset;
      this.vel.x = (this.vel.x < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.x), minBounceSpeed);
    }

    if (this.y < 0 || this.y > _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height) {
      this.vel.y = -this.vel.y * bounceFactor;
      this.y = this.y < 0 ? offset : _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height - offset;
      this.vel.y = (this.vel.y < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.y), minBounceSpeed);
    }
    this.boundVelocity();
  }

  updatePlayerAngle(camX, camY) {
    if (!this.isBot) {
      if (!this.isLocal) {
        //if this is another player, don't update the angle since we get that directly
        return;
      }
      this.mousePosX = this.absoluteMousePosX + camX;
      this.mousePosY = this.absoluteMousePosY + camY;
    }
    let dx = this.x - this.mousePosX;
    let dy = this.y - this.mousePosY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.setAngle(Math.atan2(dy, dx) + Math.PI / 2);
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
    let squareFactor = this.currentSpeed * this.currentSpeed * 0.0001;
    let minFrictionExponent = 0.8;
    let frictionPowerScaler = 2;
    let newFriction = Math.pow(Math.max(0.999 - squareFactor, minFrictionExponent), deltaTime / frictionPowerScaler);
    newFriction = Math.min(newFriction, 0.99);
    this.currentFrictionPercent = (1 - newFriction) * 100;

    let pilotBoostFactor = 1;
    if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_1) {
      pilotBoostFactor = 1.1;
    } else if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_2) {
      pilotBoostFactor = 0.7;
    } else if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_3) {
      pilotBoostFactor = 1.3;
    } else if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_4) {
      pilotBoostFactor = 1.0;
    }
    if (this.currentSpeed < 2) {
      pilotBoostFactor * 6;
    } else if (this.currentSpeed < 4) {
      pilotBoostFactor * 3;
    } else if (this.currentSpeed < 7) {
      pilotBoostFactor * 2;
    }
    let boosting = false;
    if (this.shift && (this.specialMeter > 50 || (this.usingSpecial && this.specialMeter > 1))) {
      if (this.usingSpecial < 1 && !this.devMode) {
        //initial cost more than keeping it going
        this.setSpecialMeter(this.specialMeter - 10);
      }
      this.usingSpecial = 3;
      //todo specials other than boost shouldn't be triggered here
      if (
        this.special == Special.FORCE_PULL ||
        this.special == Special.FORCE_PULL_FOCUS ||
        this.special == Special.FORCE_PUSH ||
        this.special == Special.BOOST
      ) {
        // if (this.forceCoolDown < 1) {
        //try a gradual effect
        //this.forceCoolDown = 200;
        if (!this.devMode) {
          this.setSpecialMeter(this.specialMeter - 3);
        }
        if (this.specialMeter == 0) {
          this.usingSpecial = 0;
        }

        if (this.special == Special.FORCE_PULL || this.special == Special.FORCE_PULL_FOCUS || this.special == Special.FORCE_PUSH) {
          let attractive = true;
          if (this.special == Special.FORCE_PUSH) {
            attractive = false;
          }
          // Calculate the cone's direction based on the ship's angle is needed since everything is offset by this
          const coneDirection = this.getAngle() - Math.PI / 2;
          // Specify the desired cone angle (in radians) for the force
          let coneAngle = Math.PI * 2;
          let forcePower = 1.5;
          let radius = 200;

          if (this.special == Special.FORCE_PULL_FOCUS) {
            coneAngle = Math.PI / 4; // 45-degree cone
            forcePower = 3.0;
            radius = 500;
          }
          let forceType = _entities_js__WEBPACK_IMPORTED_MODULE_4__.ForceType.POINT;
          // Create the ForceArea with the cone properties
          this.createForce(this.x, this.y, forcePower, 5, radius, attractive, this.color, this, coneAngle, coneDirection, forceType);
        } else if (this.special == Special.BOOST) {
          //give a bit of meter back for the boost so it works out cheaper than force.
          this.setSpecialMeter(this.specialMeter + 1);
          boosting = true;
          if (this.specialMeter > 0 && !this.devMode) {
            this.setSpecialMeter(this.specialMeter - 5);
          }
          if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_1) {
            pilotBoostFactor = 3;
          }
          if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_2) {
            pilotBoostFactor = 5;
          }
          if (this.pilot == _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.PilotName.PILOT_3) {
            pilotBoostFactor = 7;
          }
        }
      }
    }
    this.vel.x *= newFriction;
    this.vel.y *= newFriction;

    if (this.space || boosting) {
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
      this.vel.x += _main_js__WEBPACK_IMPORTED_MODULE_0__.acceleration * this.distanceFactor * mouseToCenter.x * pilotBoostFactor * deltaTime;
      this.vel.y += _main_js__WEBPACK_IMPORTED_MODULE_0__.acceleration * this.distanceFactor * mouseToCenter.y * pilotBoostFactor * deltaTime;
      if (this.vel.x == null || isNaN(this.vel.x) || this.vel.y == null || isNaN(this.vel.y)) {
        console.log("Invalid velocity values: x =", this.vel.x, "y =", this.vel.y);
      }
    }
    this.boundVelocity();
    this.currentSpeed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
  }
  createForce(
    x,
    y,
    force = 1,
    duration = 10,
    radius = 200,
    isAttractive = true,
    color = "red",
    tracks = null,
    coneAngle = 0,
    direction = 0,
    type = _entities_js__WEBPACK_IMPORTED_MODULE_4__.ForceType.POINT,
    width = 100,
    length = 200
  ) {
    //note this assumes a given player will always use the same force. If that ever changes we just need to remove the old force from forces. If the play can have multiple forces then we'll have to revist this.
    // Check if there is already a force with the same id
    const existingForce = _entities_js__WEBPACK_IMPORTED_MODULE_4__.forces.find((force) => force.id === "player-" + this.id);
    // const existingForce = null;

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      let playerForce = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.ForceArea(
        "player-" + this.id,
        x,
        y,
        force,
        duration,
        radius,
        isAttractive,
        color,
        tracks,
        coneAngle,
        direction,
        type,
        width,
        length,
        true
      );

      //currently  doesn't keep a reference to it's force, is that fine?
      _entities_js__WEBPACK_IMPORTED_MODULE_4__.forces.push(playerForce);
    } else {
      existingForce.duration = 10;
      existingForce.x = x;
      existingForce.y = y;
      existingForce.force = force;
      existingForce.radius = radius;
      existingForce.isAttractive = isAttractive;
      existingForce.color = color;
      existingForce.tracks = tracks;
      existingForce.coneAngle = coneAngle;
      existingForce.direction = direction;
      existingForce.type = type;
      existingForce.width = width;
      existingForce.length = length;
    }
  }

  setDevMode(newMode) {
    this.devMode = newMode;
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_7__.sendPlayerStates)(this, true, true);
  }
  boundVelocity() {
    if (this.vel.x > maxVel) {
      this.vel.x = maxVel;
    } else if (this.vel.x < minVel) {
      this.vel.x = minVel;
    }
    if (this.vel.y > maxVel) {
      this.vel.y = maxVel;
    } else if (this.vel.y < minVel) {
      this.vel.y = minVel;
    }
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
      if (isNaN(this.vel.x)) {
        this.vel.x = 0;
      }
      if (isNaN(this.vel.y)) {
        this.vel.y = 0;
      }
      this.boundVelocity();
    }
  }

  emitTrail(mines) {
    let trailTime = 100;
    for (let pilot of _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.pilots) {
      if (this.pilot == pilot.name) {
        trailTime = pilot.trailTime;
        break;
      }
    }
    const velocityAngle = Math.atan2(this.vel.y, this.vel.x);
    const velocitySize = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);

    let length = 15;
    if (velocitySize > 2) {
      length *= Math.min(4, velocitySize / 2.5);
    }
    let width = 50;

    // Calculate the offset based on velocityAngle and velocity
    const offsetDistance = velocitySize * 3.5;
    const xOffset = offsetDistance * Math.cos(velocityAngle);
    const yOffset = offsetDistance * Math.sin(velocityAngle);

    // Calculate the new x and y coordinates for the trail
    const trailX = this.x - xOffset;
    const trailY = this.y - yOffset;
    // const trailX = this.x + xOffset;
    // const trailY = this.y + yOffset;

    let trail = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.Trail(
      "trail-" + Math.floor(Math.random() * 10000),
      trailX,
      trailY,
      trailTime,
      // 30,
      70,
      this.color,
      0,
      _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.TRAIL,
      -5,
      this.id,
      velocityAngle + Math.PI / 2,
      length,
      width
    );
    mines.push(trail);
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(this)) {
      // trying without the send, trusting on sync a bit here... maybe every 10 frames send?
      // sendMinesUpdate(true);
    }
  }

  centerCameraOnPlayer(viewportWidth, viewportHeight) {
    const targetCamX = this.x - viewportWidth / 2;
    let targetCamY;
    if (this.ySpeed < 0) {
      // Moving up
      targetCamY = this.y - (viewportHeight * 2) / 4;
    } else {
      // Moving down or not moving vertically
      targetCamY = this.y - (viewportHeight * 2) / 4;
    }
    let newCamX = targetCamX;
    let newCamY = targetCamY;

    let camX = Math.max(Math.min(newCamX, _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width - viewportWidth), 0);
    let camY = Math.max(Math.min(newCamY, _main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height - viewportHeight), 0);
    (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setCam)(camX, camY);
  }

  updateTick(deltaTime, mines, camX, camY) {
    if (this.id == _main_js__WEBPACK_IMPORTED_MODULE_0__.player.id && _main_js__WEBPACK_IMPORTED_MODULE_0__.player.isDead) {
      (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setGameState)(_main_js__WEBPACK_IMPORTED_MODULE_0__.GameState.FINISHED);
      return;
    }
    if (!this.isDead) {
      this.timeSinceSpawned++;
      this.updatePlayerAngle(camX, camY);
      this.updatePlayerVelocity(deltaTime);
      this.bouncePlayer();
      this.updatePlayerPosition(deltaTime);
      if (this.u && this.devMode) {
        //this is a debug cheat
        this.setInvincibleTimer(this.invincibleTimer + 100);
        this.setSpecialMeter(this.specialMeter + 100);
      }
      if (this.invincibleTimer > 0 && !this.devMode) {
        this.setInvincibleTimer(this.invincibleTimer - 1);
        if (this.invincibleTimer == 0) {
          //can react to ending this state here, maybe animation/effect
        }
      }
      if (this.specialMeter < _gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.maxSpecialMeter) {
        this.specialMeter++;
      }
      this.usingSpecial = Math.max(this.usingSpecial - 1, 0);

      if (this.ticksSincePowerUpCollection > -1) {
        this.ticksSincePowerUpCollection++;
      }
      if (this.ticksSincePowerUpCollection > 5) {
        this.ticksSincePowerUpCollection = -1;
      }
      this.forceCoolDown = Math.max(this.forceCoolDown - 1, 0);
      if (this.recentScoreTicks > 0) {
        this.recentScoreTicks = Math.max(this.recentScoreTicks - 1, 0);
        if (this.recentScoreTicks == 0) {
          this.setComboScaler(1);
          this.recentKillScoreText = "";
        }
      }
      if (_gameLogic_js__WEBPACK_IMPORTED_MODULE_6__.basicAnimationTimer % 2 == 0 && !this.isInSpawnProtectionTime() && this.currentSpeed > 0.2) {
        this.emitTrail(mines);
      }
    }
    _main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers.forEach((otherPlayer) => {
      otherPlayer.timeSinceSentMessageThatWasRecieved += 1;
    });
    this.inForce = Math.max(this.inForce - 1, 0);
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

function createPlayerFromObject(obj, excludeCurrentPlayer = true) {
  let newPlayer = new Player(
    obj.id,
    obj.x,
    obj.y,
    obj.powerUps,
    obj.color,
    obj.angle,
    obj.pilot,
    obj.name,
    obj.isPlaying,
    obj.isUserControlledCharacter
  );
  newPlayer.timeOfLastActive = obj.timeOfLastActive;
  newPlayer.playerAngleData = obj.playerAngleData;
  newPlayer.mousePosX = obj.mousePosX;
  newPlayer.mousePosY = obj.mousePosY;
  newPlayer.currentSpeed = obj.currentSpeed;
  newPlayer.vel = obj.vel;
  newPlayer.distanceFactor = obj.distanceFactor;
  newPlayer.space = obj.space;
  newPlayer.shift = obj.shift;
  newPlayer.u = obj.u;
  newPlayer.timeSinceSpawned = obj.timeSinceSpawned;
  newPlayer.setIsDead(obj.isDead);
  return newPlayer;
}

function createBotFromObject(obj) {
  let bot = new Bot(obj.id, obj.x, obj.y, obj.powerUps, obj.color, obj.angle, obj.pilot, obj.name, obj.isPlaying, obj.isUserControlledCharacter);
  bot.timeOfLastActive = obj.timeOfLastActive;
  bot.playerAngleData = obj.playerAngleData;
  bot.mousePosX = obj.mousePosX;
  bot.mousePosY = obj.mousePosY;
  bot.currentSpeed = obj.currentSpeed;
  bot.vel = obj.vel;
  bot.isPlaying = obj.isPlaying;
  bot.special = obj.special;
  bot.distanceFactor = obj.distanceFactor;
  bot.lives = obj.lives;
  bot.space = obj.space;
  bot.shift = obj.shift;
  bot.u = obj.u;
  bot.forceCoolDown = obj.forceCoolDown;
  bot.setComboScaler(obj.comboScaler);
  bot.kills = obj.kills;
  bot.ticksSincePowerUpCollection = obj.ticksSincePowerUpCollection;
  bot.timeSinceSpawned = obj.timeSinceSpawned;
  bot.setInvincibleTimer(obj.invincibleTimer);
  bot.setIsDead(obj.isDead);
  return bot;
}

class Bot extends Player {
  constructor(
    id = null,
    x = null,
    y = null,
    powerUps = 0,
    color = null,
    angle = 0,
    pilot = "",
    name = "",
    isPlaying = true,
    isUserControlledCharacter = false
  ) {
    super(id, x, y, powerUps, color, angle, pilot, name, isPlaying, (isUserControlledCharacter = false));
    this.previousAngleDifference = 0;
    this.previousTurnDirection = 0;
    this.botState = BotState.FOLLOW_PLAYER;
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.target = { x: 0, y: 0, id: "" };
    this.inRangeTicks = 0;
    this.isBot = true;
  }

  setAngle(angle) {
    super.setAngle(angle);
  }

  getAngle() {
    return super.getAngle();
  }
  resetState(keepName, keepColor) {
    super.resetState(keepName, keepColor);
    this.setIsDead(false);
  }

  updateTick(deltaTime, mines, camX, camY) {
    if (this.isDead) {
      //todo delay this?
      //this.resetState(true, true);
      // this.delayReset(botRespawnDelay, true, true);
      return;
    }

    super.updateTick(deltaTime, mines, camX, camY);
  }

  updateBotInputs() {
    //this.randomlyConsiderChangingState();
    if (this.invincibleTimer > 30 && this.botState != BotState.FOLLOW_PLAYER) {
      this.#setFollowingTarget();
      if (this.followingPlayerID != "") {
        this.setRandomTarget(0, 0, "random point");
        this.setBotState(BotState.FOLLOW_PLAYER);
      }
    }
    if (isNaN(this.inForce)) {
      this.inForce = 0;
    }
    if (this.inForce > 50) {
      //try to get bots out of a force they may be stuck in by aiming somewhere new
      this.setRandomTargetInMainArea();
      this.inForce = 0;
    }

    if (this.botState == BotState.FOLLOW_PLAYER) {
      this.handleFollowPlayerState();
    } else if (this.botState == BotState.RANDOM) {
      this.handleRandomState();
    } else if (this.botState == BotState.COLLECT) {
      this.handleCollectState();
    }
  }

  handleFollowPlayerState() {
    this.#setFollowingTarget();
    if (this.followingPlayerID == "") {
      this.setBotState(BotState.RANDOM);
      // return;
      this.handleRandomState();
    }

    const allPlayers = [..._main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers, ..._main_js__WEBPACK_IMPORTED_MODULE_0__.bots, _main_js__WEBPACK_IMPORTED_MODULE_0__.player];
    let followingPlayer = allPlayers.find((candidate) => this.followingPlayerID === candidate.id);
    if (followingPlayer == null || followingPlayer.isDead || !followingPlayer.isPlaying) {
      this.followingPlayerID = "";
      return;
    }
    if (followingPlayer.isBot) {
      this.randomlyConsiderChangingState(0.1);
    }
    if (followingPlayer.invincibleTimer > 10) {
      this.randomlyConsiderChangingState(0.03);
    }
    if (followingPlayer.isDead) {
      this.followingPlayerID = "";
    }
    this.handleTargeting(followingPlayer.x, followingPlayer.y, followingPlayer.vel.x, followingPlayer.vel.y, 0.4);
  }

  handleRandomState() {
    if (this.target.x == 0 && this.target.y == 0) {
      this.setRandomTargetInMainArea();
    }
    this.handleTargeting(this.target.x, this.target.y, 0, 0, 0.4);
  }

  handleCollectState() {
    if (this.target.x == 0 && this.target.y == 0) {
      // Calculate the soonPosition
      const soonPosition = {
        x: this.x + 3 * this.vel.x,
        y: this.y + 3 * this.vel.y,
      };

      let closestPowerUp;
      let closestDistance = Infinity;

      // Iterate over globalPowerUps to find the closest one to soonPosition
      for (const powerUp of _main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps) {
        const distance = Math.sqrt(Math.pow(soonPosition.x - powerUp.x, 2) + Math.pow(soonPosition.y - powerUp.y, 2));

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPowerUp = powerUp;
        }
      }

      if (closestPowerUp) {
        // Use the closest power-up as the target
        this.setRandomTarget(closestPowerUp.x, closestPowerUp.y, closestPowerUp.id);
      } else {
        // If no power-ups are available, switch to RANDOM state
        this.setBotState(BotState.RANDOM);
      }
    } else {
      let powerUpStillExists = _main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps.some((globalPowerUp) => globalPowerUp.x == this.target.x && globalPowerUp.y == this.target.y);
      if (!powerUpStillExists) {
        this.setBotState(BotState.RANDOM);
      }
    }
    this.handleTargeting(this.target.x, this.target.y, 0, 0, 0.4);
  }

  setRandomTargetInMainArea() {
    this.setRandomTarget(300 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.width - 600), 300 + Math.random() * (_main_js__WEBPACK_IMPORTED_MODULE_0__.worldDimensions.height - 600), "random");
  }
  setRandomTarget(x, y, id) {
    this.target.x = x;
    this.target.y = y;
    this.target.id = id;
  }

  setBotState(state) {
    if (state == this.botState) {
      return;
    }
    if (state == BotState.RANDOM) {
      this.setRandomTargetInMainArea();
    }
    this.botState = state;
  }

  handleTargeting(targetX, targetY, velX, velY, factor) {
    this.#checkIfGotToTarget(targetX, targetY);
    this.#aimAtTarget(targetX, targetY, velX, velY, factor);
  }

  #setFollowingTarget() {
    if (this.followingPlayerID == "") {
      //lets try including other bots in the follow candidates
      let allPlayers = [_main_js__WEBPACK_IMPORTED_MODULE_0__.player, ..._main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers, ..._main_js__WEBPACK_IMPORTED_MODULE_0__.bots];
      //for debuging bot following I won't shuffle this and let it target player if possible
      //shuffleArray(allPlayers);
      let playerToFollow = null;

      for (const candidate of allPlayers) {
        candidate.targetedBy = candidate.targetedBy.filter((id) => id !== this.id);

        if (this.id === candidate.id) {
          // Don't follow yourself
          continue; // Skip to the next iteration
        }

        let candidateHowLongSinceActive = candidate.howLongSinceActive();
        let distance = Math.sqrt((this.x - candidate.x) ** 2 + (this.y - candidate.y) ** 2);
        if (
          distance < 1000 &&
          candidateHowLongSinceActive < 300 &&
          candidate.targetedBy.length < maxBotsThatCanTargetAtOnce &&
          candidate.isPlaying &&
          candidate.timeSinceSpawned > 600 &&
          candidate.invincibleTimer < 10 &&
          !candidate.isDead
        ) {
          playerToFollow = candidate;
          playerToFollow.targetedBy.push(this.id);
          this.followingPlayerID = playerToFollow.id;
          break;
        } else {
          //console.log(candidate.name + " is inactive not targeting");
        }
      }
    }
  }
  //this is doing more than checking if got there refactor this
  #checkIfGotToTarget(targetX, targetY) {
    let currentX = this.x;
    let currentY = this.y;
    let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

    if (this.botState == BotState.FOLLOW_PLAYER) {
      if (distance < 100) {
        //once we get there move on to a new target
        this.inRangeTicks += 1;
        if (this.inRangeTicks > 200) {
          let followingPlayer = null;
          let allPlayers = [_main_js__WEBPACK_IMPORTED_MODULE_0__.player, ..._main_js__WEBPACK_IMPORTED_MODULE_0__.otherPlayers, ..._main_js__WEBPACK_IMPORTED_MODULE_0__.bots];

          for (const candidate of allPlayers) {
            if (this.followingPlayerID === candidate.id) {
              followingPlayer = candidate;
              break; // Exit the loop once the followingPlayer is found
            }
          }
          if (followingPlayer && followingPlayer.targetedBy.length > 0) {
            // this.followingPlayer.targetedBy -= 1;
            followingPlayer.targetedBy = followingPlayer.targetedBy.filter((id) => id !== this.id);
          } else {
            this.followingPlayerID = "";
            console.log("followingPlayer null ");
          }
          this.followingPlayerID = "";
          this.chooseNewBotState();
        } else if (distance < 50 && this.inRangeTicks > 80) {
          this.chooseNewBotState();
        }
      } else {
        if (this.inRangeTicks > 0) {
          this.inRangeTicks -= 1;
        }
      }
    } else if (distance < 300 && this.botState == BotState.RANDOM) {
      this.target.x = 0;
      this.target.y = 0;
      this.chooseNewBotState();
    } else if (distance < 20 && this.botState == BotState.COLLECT) {
      this.target.x = 0;
      this.target.y = 0;
      this.chooseNewBotState();
    }
  }

  #aimAtTarget(targetX, targetY, targetVelocityX, targetVelocityY, adjustmentFactor) {
    let currentX = this.x;
    let currentY = this.y;
    let currentVelocityX = this.vel.x;
    let currentVelocityY = this.vel.y;

    // Calculate the relative velocity between the bot and the target
    let relativeVelocityX = targetVelocityX - currentVelocityX;
    let relativeVelocityY = targetVelocityY - currentVelocityY;

    // Calculate the distance between the target and current points
    let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

    // Calculate the time it would take to reach the original target without considering target's velocity
    let currentSpeed = Math.sqrt(currentVelocityX ** 2 + currentVelocityY ** 2);
    let adjustedTargetX = targetX;
    let adjustedTargetY = targetY;

    if (currentSpeed != 0) {
      let timeToReachTarget = distance / currentSpeed;

      // Calculate the adjusted target by considering a weighted combination of position and velocity
      adjustedTargetX = targetX + relativeVelocityX * adjustmentFactor * timeToReachTarget;
      adjustedTargetY = targetY + relativeVelocityY * adjustmentFactor * timeToReachTarget;
    }

    // Calculate the adjusted mouse position
    let mousePos = this.mousePosToPositionAwayFromTarget(adjustedTargetX, adjustedTargetY, 200, this.mousePosX, this.mousePosY);

    if (!isNaN(mousePos.X) && !isNaN(mousePos.Y)) {
      this.mousePosX = mousePos.X;
      this.mousePosY = mousePos.Y;
    } else {
      console.log("mousePos NaN in aimAtTarget");
    }
    this.space = true;
  }

  mousePosToPositionAwayFromTarget(targetX, targetY, distanceFromCurrent, currentMousePosX, currentMousePosY) {
    let deltaX = targetX - this.x;
    let deltaY = targetY - this.y;

    // Calculate the distance between the target and current position
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance == 0) {
      return { X: 0, Y: 0 };
    }
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
    let interpolationFactor = 0.8; // Adjust this value to change the speed of the turn
    let interpolatedAngle = currentAngle + angleDifference * interpolationFactor;

    // Calculate the new mouse position based on the interpolated angle and the desired distance from the current position
    mousePosX = this.x + Math.cos(interpolatedAngle) * distanceFromCurrent;
    mousePosY = this.y + Math.sin(interpolatedAngle) * distanceFromCurrent;
    if (!isNaN(mousePosX) && !isNaN(mousePosY)) {
    } else {
      console.log("mousePos NaN");
    }
    return { X: mousePosX, Y: mousePosY };
  }
  randomlyConsiderChangingState(chance = 1) {
    if (Math.random() > chance) {
      this.followingPlayerID = "";
      this.target.x = 0;
      this.target.y = 0;
      this.chooseNewBotState();
    }
  }
  chooseNewBotState() {
    //for now randomly choose new state
    if (Math.random() > 0.8) {
      this.botState = BotState.FOLLOW_PLAYER;
    } else if (Math.random() > 0.4) {
      this.botState = BotState.RANDOM;
    } else {
      this.botState = BotState.COLLECT;
    }
  }
}

function serializeBots(bots, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed bots
    const changedBotData = bots
      .map((currentBot) => {
        const lastSentBotData = lastSentBots.find((lastBotData) => lastBotData.id === currentBot.id);
        const serializedBot = serializeBot(currentBot);

        // Compare the serialized data of the current bot with the last sent data
        if (!lastSentBotData || !areUpdateCriticalValuesSameBot(serializedBot, lastSentBotData)) {
          // Update lastSentBots with the new serialized data if changed
          lastSentBots = lastSentBots.map((bot) => (bot.id === currentBot.id ? serializedBot : bot));
          return serializedBot;
        }

        // Return null for bots that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedBotData;
  } else {
    // If onlyChangedData is false, update lastSentBots with the current serialized data
    lastSentBots = bots.map(serializeBot);

    // Serialize and return all bots
    return lastSentBots;
  }
}

// Define a function to serialize a bot's data
function serializeBot(bot) {
  return {
    id: bot.id,
    x: bot.x,
    y: bot.y,
    vel: bot.vel,
    isDead: bot.isDead,
    angle: bot.getAngle(),
    currentSpeed: bot.currentSpeed,
    timeOfLastActive: bot.timeOfLastActive,
    playerAngleData: bot.playerAngleData,
    mousePosX: bot.mousePosX,
    mousePosY: bot.mousePosY,
    isPlaying: bot.isPlaying,
    special: bot.special,
    distanceFactor: bot.distanceFactor,
    lives: bot.lives,
    space: bot.space,
    shift: bot.shift,
    u: bot.u,
    forceCoolDown: bot.forceCoolDown,
    comboScaler: bot.comboScaler,
    kills: bot.kills,
    ticksSincePowerUpCollection: bot.ticksSincePowerUpCollection,
    timeSinceSpawned: bot.timeSinceSpawned,
    botState: bot.botState,
    target: bot.target,
    followingPlayerID: bot.followingPlayerID,
    previousAngleDifference: bot.previousAngleDifference,
    previousTurnDirection: bot.previousTurnDirection,
    invincibleTimer: bot.invincibleTimer,
    name: bot.name,
    inForce: bot.inForce,
  };
}

// Define a function to compare bot objects for equality
function areUpdateCriticalValuesSameBot(bot1, bot2) {
  let isSame =
    bot1.isDead === bot2.isDead &&
    bot1.angle === bot2.angle &&
    bot1.isPlaying === bot2.isPlaying &&
    bot1.distanceFactor === bot2.distanceFactor &&
    bot1.lives === bot2.lives &&
    bot1.space === bot2.space &&
    bot1.shift === bot2.shift &&
    bot1.u === bot2.u &&
    bot1.comboScaler === bot2.comboScaler &&
    bot1.kills === bot2.kills &&
    bot1.botState === bot2.botState &&
    bot1.target === bot2.target &&
    bot1.followingPlayerID === bot2.followingPlayerID &&
    bot1.name === bot2.name &&
    bot1.inForce === bot2.inForce;
  return isSame;
}

function isEqualBot(bot1, bot2) {
  const tolerance = 1e-4;

  let isSame =
    Math.abs(bot1.x - bot2.x) < tolerance &&
    Math.abs(bot1.y - bot2.y) < tolerance &&
    bot1.x === bot2.x &&
    bot1.y === bot2.y &&
    bot1.vel === bot2.vel &&
    bot1.isDead === bot2.isDead &&
    bot1.getAngle() === bot2.getAngle() &&
    bot1.currentSpeed === bot2.currentSpeed &&
    bot1.timeOfLastActive === bot2.timeOfLastActive &&
    bot1.playerAngleData === bot2.playerAngleData &&
    bot1.mousePosX === bot2.mousePosX &&
    bot1.mousePosY === bot2.mousePosY &&
    bot1.isPlaying === bot2.isPlaying &&
    bot1.special === bot2.special &&
    bot1.distanceFactor === bot2.distanceFactor &&
    bot1.lives === bot2.lives &&
    bot1.space === bot2.space &&
    bot1.shift === bot2.shift &&
    bot1.u === bot2.u &&
    bot1.forceCoolDown === bot2.forceCoolDown &&
    bot1.comboScaler === bot2.comboScaler &&
    bot1.kills === bot2.kills &&
    bot1.ticksSincePowerUpCollection === bot2.ticksSincePowerUpCollection &&
    bot1.timeSinceSpawned === bot2.timeSinceSpawned &&
    bot1.botState === bot2.botState &&
    bot1.target === bot2.target &&
    bot1.followingPlayerID === bot2.followingPlayerID &&
    bot1.previousAngleDifference === bot2.previousAngleDifference &&
    bot1.previousTurnDirection === bot2.previousTurnDirection &&
    bot1.invincibleTimer === bot2.invincibleTimer &&
    bot1.name === bot2.name &&
    bot1.inForce === bot2.inForce;
  return isSame;
}


/***/ }),

/***/ "./sendData.js":
/*!*********************!*\
  !*** ./sendData.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   requestFullUpdate: () => (/* binding */ requestFullUpdate),
/* harmony export */   sendBotEntitiesUpdate: () => (/* binding */ sendBotEntitiesUpdate),
/* harmony export */   sendBotsUpdate: () => (/* binding */ sendBotsUpdate),
/* harmony export */   sendConnectedPeers: () => (/* binding */ sendConnectedPeers),
/* harmony export */   sendEffectsUpdate: () => (/* binding */ sendEffectsUpdate),
/* harmony export */   sendEntitiesState: () => (/* binding */ sendEntitiesState),
/* harmony export */   sendEntitiesUpdate: () => (/* binding */ sendEntitiesUpdate),
/* harmony export */   sendForcesUpdate: () => (/* binding */ sendForcesUpdate),
/* harmony export */   sendMinesUpdate: () => (/* binding */ sendMinesUpdate),
/* harmony export */   sendPlayerStates: () => (/* binding */ sendPlayerStates),
/* harmony export */   sendPowerUpsUpdate: () => (/* binding */ sendPowerUpsUpdate),
/* harmony export */   sendRemoveEntityUpdate: () => (/* binding */ sendRemoveEntityUpdate),
/* harmony export */   sendRequestForStates: () => (/* binding */ sendRequestForStates)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entitySerialisation.js */ "./entitySerialisation.js");
/* harmony import */ var _player_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./player.js */ "./player.js");






let sendCounter = 0;
let lastSentPlayerData = [];

function sendRequestForStates() {
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    requestForFullStates: true,
  };
  sendData(data);
}
// Send player state to other connected players
function sendPlayerStates(playerToSend, masterSending, sendFullerData = false, playerReseting = false) {
  if (Math.random() > 0.99) {
    //every so often we will send the full data just to be sure master is in sync with important properties which don't often change
    sendFullerData = true;
  }
  let priority = 3;
  if (sendFullerData) {
    priority = 2;
  }
  let data = {
    timestamp: Date.now(),
    priority: priority,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    id: playerToSend.id,
    // invincibleTimer: playerToSend.invincibleTimer,
  };

  let newDataToSend = false;
  newDataToSend = addProperty(playerToSend, data, "x", "x") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "y", "y") || newDataToSend;
  // newDataToSend = addProperty(playerToSend, data, "powerUps", "powerUps") || newDataToSend;
  //   newDataToSend = addProperty(playerToSend, data, "invincibleTimer", "invincibleTimer") || newDataToSend;

  newDataToSend = addProperty(playerToSend, data, "color", "color", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "pilot", "pilot", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "name", "name", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "isMaster", "isMaster", sendFullerData) || newDataToSend;
  // newDataToSend = addProperty(playerToSend, data, "ticksSincePowerUpCollection", "ticksSincePowerUpCollection", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "targetedBy", "targetedBy", sendFullerData) || newDataToSend;

  //todo check this is ok to remove
  // newDataToSend = addProperty(playerToSend, data, "timeOfLastActive", "timeOfLastActive", sendFullerData) || newDataToSend;

  // newDataToSend = addProperty(playerToSend, data, "recentScoreTicks", "recentScoreTicks", sendFullerData) || newDataToSend;
  // newDataToSend = addProperty(playerToSend, data, "recentScoreText", "recentScoreText", sendFullerData) || newDataToSend;
  // newDataToSend = addProperty(playerToSend, data, "kills", "kills", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "angle", "angle", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "isBot", "isBot", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "special", "special", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "devMode", "devMode", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "space", "space", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "shift", "shift", sendFullerData) || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "resetting", "resetting", sendFullerData) || newDataToSend;

  // newDataToSend = addProperty(playerToSend, data, "invincibleTimer", "invincibleTimer") || newDataToSend;

  newDataToSend = addProperty(playerToSend, data, "forceCoolDown", "forceCoolDown") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "playerAngleData", "playerAngleData") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "mousePosX", "mousePosX") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "mousePosY", "mousePosY") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "currentSpeed", "currentSpeed") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "vel", "vel") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "distanceFactor", "distanceFactor") || newDataToSend;

  if (masterSending || sendFullerData) {
    //only master sends is dead message since it is the abibter of collisions, apart from sendFullerData
    if (lastSentPlayerData.isDead != playerToSend.isDead || sendFullerData) {
      newDataToSend = true;
      data.isDead = playerToSend.isDead;
      lastSentPlayerData.isDead = playerToSend.isDead;
    }
    if (!playerToSend.isPlaying) {
      newDataToSend = addProperty(playerToSend, data, "isPlaying", "isPlaying", sendFullerData) || newDataToSend;
    }
    if (masterSending || playerReseting) {
      newDataToSend = addProperty(playerToSend, data, "invincibleTimer", "invincibleTimer", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "powerUps", "powerUps", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "ticksSincePowerUpCollection", "ticksSincePowerUpCollection", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "recentScoreTicks", "recentScoreTicks", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "recentScoreText", "recentScoreText", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "recentKillScoreText", "recentKillScoreText", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "kills", "kills", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "comboScaler", "comboScaler", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "killed", "killed", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "killedBy", "killedBy", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "hitBy", "hitBy", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "lives", "lives", sendFullerData) || newDataToSend;
      newDataToSend = addProperty(playerToSend, data, "isPlaying", "isPlaying", sendFullerData) || newDataToSend;
    }
  }
  if (!masterSending) {
    //only player sends timeSinceSpawned because it knows when it has reset
    if (newDataToSend) {
      data.timeSinceSpawned = playerToSend.timeSinceSpawned;
    }
  }
  if (newDataToSend) {
    sendData(data);
  }
}

// Define a function to add properties to the data object if they have changed
function addProperty(playerToSend, data, propertyKey, playerKey, sendAnyway = false) {
  if (lastSentPlayerData[propertyKey] !== playerToSend[playerKey] || sendAnyway) {
    if ((playerToSend[playerKey] == null && playerKey != "angle") || (playerToSend.getAngle() == null && playerKey == "angle")) {
      console.log("null property in send player state: " + playerKey);
      return false;
    }
    if (playerKey != "angle") {
      data[propertyKey] = playerToSend[playerKey];
      lastSentPlayerData[propertyKey] = playerToSend[playerKey];
    } else {
      data[propertyKey] = playerToSend.getAngle();
      lastSentPlayerData[propertyKey] = playerToSend.getAngle();
    }
    return true; // property was changed
  }
  return false; // property was not changed
}

//this is the full send that will only be sent on request / occasionally
function sendEntitiesState(specificPeerId = "") {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    fullSend: true,
    globalPowerUps: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeGlobalPowerUps)(_main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps),
    effects: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeEffects)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.effects),
    bots: (0,_player_js__WEBPACK_IMPORTED_MODULE_4__.serializeBots)(_main_js__WEBPACK_IMPORTED_MODULE_0__.bots),
    mines: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeMines)(_main_js__WEBPACK_IMPORTED_MODULE_0__.mines),
    effects: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeEffects)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.effects),
    // otherPlayers: otherPlayers,
    forces: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeForces)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.forces),
    // connectedPeers: connectedPeers,
    //enemies and stuff here
  };
  if (specificPeerId && specificPeerId != "") {
    sendData(data, specificPeerId);
  } else {
    sendData(data);
  }
}

//this is the partial send that will be sent regually
function sendEntitiesUpdate() {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    globalPowerUps: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeGlobalPowerUps)(_main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps, true),
    effects: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeEffects)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.effects, true),
    bots: (0,_player_js__WEBPACK_IMPORTED_MODULE_4__.serializeBots)(_main_js__WEBPACK_IMPORTED_MODULE_0__.bots, true),
    mines: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeMines)(_main_js__WEBPACK_IMPORTED_MODULE_0__.mines, true),
    forces: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeForces)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.forces, true),
    // connectedPeers: connectedPeers,
  };
  sendData(data);
}

//this is the bot send that will be sent most frequently
function sendBotEntitiesUpdate() {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    bots: (0,_player_js__WEBPACK_IMPORTED_MODULE_4__.serializeBots)(_main_js__WEBPACK_IMPORTED_MODULE_0__.bots, true),
  };
  sendData(data);
}

//this is the powerup update that will only be sent on request / occasionally
function sendPowerUpsUpdate(onlyChangedData = true) {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    globalPowerUps: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeGlobalPowerUps)(_main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps, onlyChangedData),
  };
  sendData(data);
}

//this is the mines only update  will only be sent on request / occasionally
function sendMinesUpdate(onlyChangedData = true, onlyRegularMines = true) {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    mines: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeMines)(_main_js__WEBPACK_IMPORTED_MODULE_0__.mines, onlyChangedData, onlyRegularMines),
  };

  sendData(data);
}

//this is the effects only update that will only be sent on request / occasionally
function sendEffectsUpdate(onlyChangedData = true) {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    effects: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeEffects)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.effects, onlyChangedData),
  };

  sendData(data);
}

function sendForcesUpdate(onlyChangedData = true) {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    forces: (0,_entitySerialisation_js__WEBPACK_IMPORTED_MODULE_3__.serializeForces)(_entities_js__WEBPACK_IMPORTED_MODULE_2__.forces, onlyChangedData),
  };

  sendData(data);
}

function sendBotsUpdate(onlyChangedData = true) {
  if (!anyConnections()) {
    return;
  }
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
    bots: (0,_player_js__WEBPACK_IMPORTED_MODULE_4__.serializeBots)(_main_js__WEBPACK_IMPORTED_MODULE_0__.bots, onlyChangedData),
  };

  sendData(data);
}

function sendRemoveEntityUpdate(propertyName, entitiesToRemove) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    gameState: true,
  };

  // Add the specified property name and its value to the data object
  data[propertyName] = entitiesToRemove;

  sendData(data);
}

function sendConnectedPeers() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    gameState: true,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    //todo this could be the issue
    //connectedPeers: connectedPeers,
    //enemies and stuff here
  };

  //console.log("Sending data:", data); // Log any data sent
  _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        //console.log("sending bots state data:", data);
        sendCounter = 0; // reset the counter
      }
    }
  });
}

//this is the full send that will only be sent on request / occasionally
function requestFullUpdate() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: (0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player),
    requestFullUpdate: true,
  };

  sendData(data);
}

function sendData(data, specificPeerId) {
  if (data) {
    if (_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.compression) {
      const jsonString = JSON.stringify(data);

      // Encode the JSON string as Uint8Array
      const encoder = new TextEncoder();
      const dataArray = encoder.encode(jsonString);

      // Compress the data using Pako
      data = pako.deflate(dataArray);
    }
    _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connections.forEach((conn) => {
      if (conn && conn.open) {
        if (specificPeerId && specificPeerId != "" && specificPeerId != conn.peer) {
          return;
        }
        try {
          conn.send(data);
        } catch (error) {
          console.error("Error sending data:", error);
        }
      }
    });
  } else {
    console.log("nothing to send in sendData");
  }
}

function anyConnections() {
  if (_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connections && _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.connections.length > 0) {
    return true;
  }
  return false;
}


/***/ }),

/***/ "./trailShapes.js":
/*!************************!*\
  !*** ./trailShapes.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProcessTrailShapesAllPlayers: () => (/* binding */ ProcessTrailShapesAllPlayers)
/* harmony export */ });
/* harmony import */ var _main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.js */ "./main.js");
/* harmony import */ var _connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./connectionHandlers.js */ "./connectionHandlers.js");
/* harmony import */ var _collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collisionLogic.js */ "./collisionLogic.js");
/* harmony import */ var _sendData_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sendData.js */ "./sendData.js");
/* harmony import */ var _entities_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./entities.js */ "./entities.js");
/* harmony import */ var _gameUtils_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./gameUtils.js */ "./gameUtils.js");







function ProcessTrailShapesAllPlayers(player, otherPlayers) {
  let allPlayers = [..._main_js__WEBPACK_IMPORTED_MODULE_0__.bots, ...otherPlayers, player];
  for (let candidatePlayer of allPlayers) {
    ProcessTrailShapes(candidatePlayer, allPlayers);
  }
}

function ProcessTrailShapes(candidatePlayer, allPlayers) {
  const shape = (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.findCompleteShape)(candidatePlayer.id, _main_js__WEBPACK_IMPORTED_MODULE_0__.mines, 30000);

  if (shape && shape.shapePath) {
    let freeMine = createFreeMine(candidatePlayer, shape);
    handleFreeMineSpawn(candidatePlayer.id, _main_js__WEBPACK_IMPORTED_MODULE_0__.mines, freeMine, shape, allPlayers);
    // createEffects(shape.shapePath, effects);
    if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
      (0,_sendData_js__WEBPACK_IMPORTED_MODULE_3__.sendMinesUpdate)();
    }
  }
}

// Function to create a FreeMine
function createFreeMine(player, shape) {
  let freeMine = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.FreeMine(
    "trail-" + Math.floor(Math.random() * 10000),
    shape.center.x,
    shape.center.y,
    40,
    70,
    player.color,
    0,
    _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.FREE_MINE,
    -1,
    player.id,
    0,
    shape.shapePath
  );
  freeMine.spokeWidth = shape.spokeWidth;
  freeMine.spokeLength = shape.spokeLength;
  return freeMine;
}

function createEffects(shapePath, effects) {
  for (let point of shapePath) {
    let effect = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", _entities_js__WEBPACK_IMPORTED_MODULE_4__.EffectType.EXPLOSION);
    effects.push(effect);
  }
}

function handleFreeMineSpawn(playerId, mines, freeMine, shape, allPlayers) {
  removePlayerTrailMines(playerId, mines);
  mines.push(freeMine);
  //   createExplosionEffects(shape.shapePath);

  destroyOverlappingMines(mines, shape, freeMine, playerId);
  hitPlayersCaught(allPlayers, playerId, shape, freeMine);
}

function removePlayerTrailMines(playerId, mines) {
  mines = mines.filter((mine) => mine.playerId != playerId);
  (0,_main_js__WEBPACK_IMPORTED_MODULE_0__.setMines)(mines);
}

function createExplosionEffects(shapePath) {
  for (let point of shapePath) {
    let effect = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", _entities_js__WEBPACK_IMPORTED_MODULE_4__.EffectType.EXPLOSION);
    _entities_js__WEBPACK_IMPORTED_MODULE_4__.effects.push(effect);
  }
}

function destroyOverlappingMines(mines, shape, freeMine, playerId) {
  for (let mine of mines) {
    if (mine.mineType !== _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.FREE_MINE && mine.playerId != playerId) {
      if (isMineOverlapping(shape, mine, freeMine)) {
        destroyMine(mine);
        addPowerUpOnMineDestroy(mine);
      }
    }
  }
}

function isMineOverlapping(shape, mine, freeMine) {
  return (
    (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.isPointInsideShape)(shape.shapePath, { x: mine.x, y: mine.y }) ||
    (0,_collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__.isSpokeCollision)(mine, mine.radius + 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
  );
}

function destroyMine(mine) {
  mine.hitFrames = 5;
}

function addPowerUpOnMineDestroy(mine) {
  let addPowerup = shouldAddPowerupOnMineDestroy(mine);
  if (addPowerup) {
    createPowerUpFromMine(mine);
  }
}

function shouldAddPowerupOnMineDestroy(mine) {
  if (mine.mineType === _entities_js__WEBPACK_IMPORTED_MODULE_4__.MineType.TRAIL && Math.random() > 0.5) {
    return false;
  }

  return true;
}

function createPowerUpFromMine(mine) {
  let isStar = false;
  let radius = 35;
  let value = 3;
  let hasGravity = 0;

  if (Math.random() > 0.7) {
    if (Math.random() > 0.2) {
      hasGravity = -1;
      value = 5;
      radius = 30;
    } else {
      hasGravity = 1;
    }
  }

  let powerUp = new _entities_js__WEBPACK_IMPORTED_MODULE_4__.PowerUp(
    "mineConvert-" + Math.floor(Math.random() * 10000),
    mine.x,
    mine.y,
    (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.getRandomUniqueColor)(_main_js__WEBPACK_IMPORTED_MODULE_0__.colors, null),
    isStar,
    radius,
    value,
    hasGravity
  );

  _main_js__WEBPACK_IMPORTED_MODULE_0__.globalPowerUps.push(powerUp);
  if ((0,_connectionHandlers_js__WEBPACK_IMPORTED_MODULE_1__.isPlayerMasterPeer)(_main_js__WEBPACK_IMPORTED_MODULE_0__.player)) {
    (0,_sendData_js__WEBPACK_IMPORTED_MODULE_3__.sendPowerUpsUpdate)(true);
  }
}

function hitPlayersCaught(allPlayers, playerId, shape, freeMine) {
  for (let candidatePlayer of allPlayers) {
    if (candidatePlayer.id === playerId) {
      continue; // Don't hit the player who created this
    }

    if (isPlayerCaughtInExplosion(shape, candidatePlayer, freeMine)) {
      handlePlayerHitByExplosion(playerId, candidatePlayer, allPlayers);
    }
  }
}

function isPlayerCaughtInExplosion(shape, candidatePlayer, freeMine) {
  return (
    (0,_gameUtils_js__WEBPACK_IMPORTED_MODULE_5__.isPointInsideShape)(shape.shapePath, { x: candidatePlayer.x, y: candidatePlayer.y }) ||
    (0,_collisionLogic_js__WEBPACK_IMPORTED_MODULE_2__.isSpokeCollision)(candidatePlayer, 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
  );
}

function handlePlayerHitByExplosion(playerId, candidatePlayer, allPlayers) {
  let owner = allPlayers.find((player) => player.id === playerId);
  let name = owner && owner.name ? owner.name : "";

  if (candidatePlayer.isVulnerable()) {
    candidatePlayer.gotHit(name);
    if (owner) {
      owner.hitOtherPlayer(candidatePlayer);
    }
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./main.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=bundle.js.map