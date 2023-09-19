import { maxInvincibilityTime, maxSpecialMeter,pilots } from "./gameLogic.js";
import { isPlayerMasterPeer, timeSinceAnyMessageRecieved, timeSinceMessageFromMaster } from "./connectionHandlers.js";
import { BotState, Player } from "./player.js";
import { executionTime } from "./main.js";

export function renderDebugInfo(ctx, player, bots) {
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

  const isMasterText = `is Master =  ${isPlayerMasterPeer(player)}`;
  ctx.fillText(isMasterText, 558, topGap + gap * 2 - textHeight);
  ctx.fillText(`invicible state: ${player.invincibleTimer}`, 558, topGap + gap * 3 - textHeight);

  const executionTimeText = `executionTime =  ${executionTime}`;
  ctx.fillText(executionTimeText, 558, topGap + gap * 4 - textHeight);

  const timeSinceAnyMessageRecievedText = `timeSinceAnyMessageRecieved =  ${timeSinceAnyMessageRecieved}`;
  ctx.fillText(timeSinceAnyMessageRecievedText, 558, topGap + gap * 5 - textHeight);

  const timeSinceMessageFromMasterText = `timeSinceMessageFromMaster =  ${timeSinceMessageFromMaster}`;
  ctx.fillText(timeSinceMessageFromMasterText, 558, topGap + gap * 6 - textHeight);

  const velocityText = `player velocity = ${player.vel.x.toFixed(1)}, ${player.vel.y.toFixed(1)}`;
  ctx.fillText(velocityText, 558, topGap + gap * 7 - textHeight);

  bots.forEach((bot, index) => {
    let botInfo;
    if (bot.botState == BotState.FOLLOW_PLAYER) {
      botInfo = `${bot.name} state: ${bot.botState} following: ${bot.followingPlayerID} `;
    } else {
      botInfo = `${bot.name} state: ${bot.botState} aiming: ${bot.randomTarget.x},${bot.randomTarget.y} `;
    }
    ctx.fillText(botInfo, 958, topGap + gap * index - textHeight);
  });
}

export function drawFilledGauge(ctx, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7, filled, total,color="#ff9900") {
  const fillPercent = filled / total;
  drawGauge(ctx, centerX, bottomY, fillPercent,color, gaugeWidth, gaugeHeight, borderWidth);
}

export function drawInvincibilityGauge(ctx, player, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7) {
  let pilotMaxInvcibilityTime = maxInvincibilityTime;
  for (let pilot of pilots) {
    if (player.pilot == pilot.name) {
      pilotMaxInvcibilityTime = pilot.invincibilityTime;
      break;
    }
  }
  const fillPercent = player.invincibleTimer / pilotMaxInvcibilityTime;
  // const fillPercent = player.invincibleTimer / maxInvincibilityTime;
  drawGauge(ctx, centerX, bottomY, fillPercent, "#ff9900", gaugeWidth, gaugeHeight, borderWidth);
}

export function drawSpecialGauge(ctx, player, centerX, bottomY, gaugeWidth = 200, gaugeHeight = 50, borderWidth = 7) {
  const fillPercent = player.specialMeter / maxSpecialMeter;
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

export function drawPowerupLevels(ctx, player, otherPlayers, bots) {
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
    if(bot.isDead){
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
