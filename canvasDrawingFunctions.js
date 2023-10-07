import {
  getTopScores,
  incrementFirebaseGivenPropertyValue,
  readUserDataFromFirestore,
  getFirebaseProperty,
  DbPropertyKey,
  DbDocumentKey,
  getFirebase,
  allTimeKills,
  allTimePoints,
} from "./db.js";
import { drawRoundedRectangle, loreTablet } from "./drawingUtils.js";
import { drawFilledGauge } from "./drawGameUI.js";
import { achievementsTitleText } from "./login.js";

import {
  pilots,
  getLevel,
  getLevelXP,
  getXp,
  getNextLevelXP,
  getXpToNextLevel,
  levelAnimationFrame,
  achievementsTitle,
  PilotName,
} from "./gameLogic.js";

let cursorBlink = true;
let cursorBlinkInterval = setInterval(() => (cursorBlink = !cursorBlink), 450);
var topDailyScoresString = "";
export let playButtonX = 0;
export let playButtonY = 0;
export let playButtonWidth = 0;
export let playButtonHeight = 0;

export let menuButtonX = 0;
export let menuButtonY = 0;
export let menuButtonWidth = 0;
export let menuButtonHeight = 0;

//should probably refactor this so logic lives elsewhere
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

export function drawGameOverMessage(ctx, canvas, message) {
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

export function drawDailyScores(ctx) {
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

export function drawAchievements(ctx) {
  const boxWidth = 360;
  const boxHeight = 320;
  const achievementsAreaXPos = ctx.canvas.width - boxWidth - 70;
  const achievementsAreaYPos = 359;
  const achievementsAreaCenter = achievementsAreaXPos + boxWidth / 2;
  let currentYPos = achievementsAreaYPos + 30;

  drawBorder(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  drawBoxBackground(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  ctx.textAlign = "center";
  if (achievementsTitle != achievementsTitleText.YOUR_ACHIEVEMENTS) {
    drawText(ctx, achievementsTitle, achievementsAreaCenter, currentYPos + 100, "20px Arial", "white", ctx.textAlign);
    return;
  }
  drawText(ctx, achievementsTitle, achievementsAreaCenter, currentYPos, "20px Arial", "white", ctx.textAlign);
  currentYPos += 30;
  let xp = getXp();
  let level = getLevel(xp);
  let remainingNeededNextLevelXP = getXpToNextLevel(xp);
  let totalNeededNextLevelXP = getNextLevelXP(xp);

  ctx.textAlign = "left";
  drawText(ctx, "Level: " + level, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);

  const gaugeWidth = 150;
  const gaugeHeight = 30;
  const max = totalNeededNextLevelXP;
  const percentOfFilledAnimatedTo = Math.min(levelAnimationFrame / 60, 1);
  const filled = (totalNeededNextLevelXP - remainingNeededNextLevelXP) * percentOfFilledAnimatedTo;

  currentYPos += 30;
  drawText(ctx, "Kills: " + allTimeKills, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
  currentYPos += 30;
  drawText(ctx, "Points: " + allTimePoints, achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
  currentYPos += 40;

  drawFilledGauge(ctx, achievementsAreaCenter, currentYPos + gaugeHeight / 2, gaugeWidth, gaugeHeight, 3, filled, max, "blue");

  currentYPos += 35;
  drawText(ctx, remainingNeededNextLevelXP + " XP to next level", achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
}

export function drawPreGameOverlay(canvas, ctx) {
  drawDailyScores(ctx);
  drawAchievements(ctx);

  // Draw title for pilot selection
  drawText(ctx, "Select Your Pilot", canvas.width / 2, 50, "30px Arial", "white", "center");

  drawBoxBackground(ctx, loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  ctx.strokeStyle = "white";
  ctx.strokeRect(loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  for (let i = 0; i < pilots.length; i++) {
    let pilot = pilots[i];
    const carrotCanvas = document.getElementById(pilot.src);
    drawCarrot(ctx, carrotCanvas, pilot.x, pilot.y);

    if (pilot.selected) {
      ctx.lineWidth = 7;
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(pilot.x, pilot.y, pilot.width, pilot.height);
    }
  }

  if (pilots.every((pilot) => !pilot.selected)) {
    loreIndex = 0;
    lineCount = 0;
  }

  let x = loreTablet.x + 60;
  let y = loreTablet.y + 55;

  for (let i = 0; i < pilots.length; i++) {
    let pilot = pilots[i];
    if (pilot.selected) {
      renderInfoText(ctx, pilot.lore, x, y, 350, pilot.pilotAnimationFrame);
      break;
    }
  }
}

export function setupCarrots() {
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

  drawFilledGauge(ctx, centerX, currentY + 15, gaugeWidth, gaugeHeight, 3, filled, max, color);
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
    ctx.fillText(lore[loreIndex], loreTablet.x + 50 + loreIndex * 10, loreTablet.y + 130 + lineCount * 20);

    loreIndex++;
  }
}
export function drawInputField(canvas, ctx, inputText, x, y, width, height, inputTitle) {
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

export function drawNameEntry(canvas, ctx, name, x, y) {
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

  drawRoundedRectangle(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius);

  // Write "Play" on the button
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
}

export function drawTextCursor(ctx, x, y) {
  if (cursorBlink) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "transparent";
  }

  if (x && y) {
    ctx.fillRect(x, y, 2, 20);
  }
}

export function drawTextCursorFromText(ctx, text) {
  let x = 0;
  let y = 0;

  drawTextCursor(ctx, x, y);
}
