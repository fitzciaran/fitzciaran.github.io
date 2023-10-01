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

import { pilots, getLevel, getLevelXP, getXp, getNextLevelXP, getXpToNextLevel, levelAnimationFrame, achievementsTitle } from "./gameLogic.js";

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
  const bestScoresYPos = 250;
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
  const achievementsAreaYPos = 250;
  const achievementsAreaCenter = achievementsAreaXPos + boxWidth / 2;
  let currentYPos = achievementsAreaYPos + 30;

  drawBorder(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  drawBoxBackground(ctx, achievementsAreaXPos, achievementsAreaYPos, boxWidth, boxHeight);
  ctx.textAlign = "center";

  drawText(ctx, achievementsTitle, achievementsAreaCenter, currentYPos, "20px Arial", "white", ctx.textAlign);
  currentYPos += 30;
  let xp = getXp();

  // let xp = 500;

  let level = getLevel(xp);
  let remainingNeededNextLevelXP = getXpToNextLevel(xp);
  let totalNeededNextLevelXP = getNextLevelXP(xp);

  // let level = 2;
  // let levelXP = 120;
  // let totalNeededNextLevelXP = 30;

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

  currentYPos += 30;
  drawText(ctx, remainingNeededNextLevelXP + " XP to next level", achievementsAreaXPos + 20, currentYPos, "26px Arial", "white", ctx.textAlign);
  // drawText(ctx, "Score", achievementsAreaCenter, currentYPos, "16px Arial", "white", ctx.textAlign);
  // drawText(ctx, "Player", achievementsAreaCenter + 100, currentYPos, "16px Arial", "white", ctx.textAlign);

  // let gap = 5;
  // const textHeight = 18;
  // if (topDailyScoresString != "") {
  //   var scores = topDailyScoresString.split("; ");
  //   for (var i = 0; i < scores.length; i++) {
  //     let scoreData = scores[i].split(", ");
  //     currentYPos += gap + textHeight;
  //     drawText(ctx, (i + 1).toString(), achievementsAreaCenter - 100, currentYPos, "14px Arial", "white");
  //     drawText(ctx, scoreData[0], achievementsAreaCenter, currentYPos, "14px Arial", "white");
  //     drawText(ctx, scoreData[1], achievementsAreaCenter + 100, currentYPos, "14px Arial", "white");
  //   }
  // }
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
    ctx.drawImage(pilot.image, pilot.x, pilot.y, pilot.width, pilot.height);

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
  let y = loreTablet.y + 65; // Initial y value

  for (let i = 0; i < pilots.length; i++) {
    let pilot = pilots[i];
    if (pilot.selected) {
      renderInfoText(ctx, pilot.lore, x, y, 330, pilot.pilotAnimationFrame);
      break;
    }
  }
}

function renderInfoText(ctx, lore, x, y, maxWidth, animationFrame) {
  // Set font and color
  ctx.textAlign = "start";
  let sections = lore.split(",");
  let currentY = y;

  for (let i = 0; i < sections.length; i++) {
    let section = sections[i].trim();

    // Determine font size and line height based on section index
    let fontSize;
    let lineHeight;
    if (i === 0) {
      // First section (title) should be the biggest
      fontSize = 50;
      lineHeight = fontSize * 1.5; // Adjust the multiple as needed
    } else if (i === sections.length - 1) {
      // Last section (description) should be the smallest
      fontSize = 20;
      lineHeight = fontSize * 1.2; // Adjust the multiple as needed
    } else {
      // Other sections can have a default size
      fontSize = 33;
      lineHeight = fontSize * 1.3; // Adjust the multiple as needed
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

  // // Draw input text
  // ctx.fillStyle = "black";
  // ctx.fillText(inputText, x + 5, y + 20); // Adjust the x and y offsets as needed

  // // Calculate the cursor position
  // const cursorX = x + width / 2 + ctx.measureText(inputText).width + 5; // Adjust the offset as needed

  // // Draw the cursor (a vertical line)
  // if (document.hasFocus()) {
  //   drawCursor(ctx, cursorX, y + 5, y + 25); // Adjust the cursor height as needed
  // }

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
