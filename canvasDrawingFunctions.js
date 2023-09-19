import { getTopScores } from "./db.js";
import { drawRoundedRectangle, loreTablet } from "./drawingUtils.js";
import { drawFilledGauge } from "./drawGameUI.js";

import { pilots } from "./gameLogic.js";

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

export function drawPreGameOverlay(canvas, ctx) {
  const bestScoresXOffset = 250;
  const bestScoresYOffset = 300;
  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "blue");
  gradient.addColorStop("1.0", "red");

  let boxWidth = 360;
  let boxHeight = 320;
  // Draw border
  ctx.lineWidth = 10;
  ctx.strokeStyle = gradient;
  ctx.strokeRect(bestScoresXOffset - 170, bestScoresYOffset - 50, boxWidth, boxHeight);

  // Create a gradient for the box background
  const backGadient = ctx.createLinearGradient(
    bestScoresXOffset - 170,
    bestScoresYOffset - 50,
    bestScoresXOffset - 170 + boxWidth,
    bestScoresYOffset - 50 + boxHeight
  );
  backGadient.addColorStop(0, "rgba(0, 0, 0, 0.2)"); // Transparent black
  backGadient.addColorStop(1, "rgba(0, 0, 0, 0.3)"); // Semi-transparent black

  // Draw the box background with gradient
  ctx.fillStyle = backGadient;
  //  ctx.strokeStyle = "#555"; // Border color
  ctx.fillRect(bestScoresXOffset - 170, bestScoresYOffset - 50, boxWidth, boxHeight);

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
  //todo can use this when have a non-trash asset
  // ctx.drawImage(loreTablet.image, loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  // Draw the box background with gradient
  ctx.fillStyle = backGadient;
  //  ctx.strokeStyle = "#555"; // Border color
  ctx.fillRect(loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  ctx.strokeStyle = "white";
  ctx.strokeRect(loreTablet.x, loreTablet.y, loreTablet.width, loreTablet.height);

  // Draw pilot options and highlight selected pilot
  for (let i = 0; i < pilots.length; i++) {
    let pilot = pilots[i];
    ctx.drawImage(pilot.image, pilot.x, pilot.y, pilot.width, pilot.height);

    if (pilot.selected) {
      ctx.lineWidth = 7;
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(pilot.x, pilot.y, pilot.width, pilot.height);
    }
  }

  // Reset lore index and line count if no pilot is selected
  if (pilots.every((pilot) => !pilot.selected)) {
    loreIndex = 0;
    lineCount = 0;
  }

  let x = loreTablet.x + 60;
  let y = loreTablet.y + 65; // Initial y value

  // draw info text for the selected pilot
  for (let i = 0; i < pilots.length; i++) {
    let pilot = pilots[i];
    if (pilot.selected) {
      renderInfoText(ctx, pilot.lore, x, y, 330, pilot.pilotAnimationFrame);
      break; // Exit the loop once a selected pilot is found
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
