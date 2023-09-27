import { renderDebugInfo, drawPowerupLevels, drawInvincibilityGauge, drawSpecialGauge } from "./drawGameUI.js";
import {
  rotateAndScalePoint,
  interpolate,
  spikeyBallPoints,
  drawArrow,
  getComplementaryColor,
  nameToRGBFullFormat,
  applyGlowingEffect,
} from "./drawingUtils.js";
import { ForceType, forces, effects, EffectType, MineType } from "./entities.js";
import { basicAnimationTimer } from "./gameLogic.js";
import { shipScale, mineScale } from "./collisionLogic.js";

// Main function for drawing the ship
export function drawShip(ctx, camX, camY, player, points) {
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
  const angle = player.angle;
  const color = player.color;
  const name = player.name;
  const lightSourceX = 0;
  const lightSourceY = 0;
  const currentTime = Date.now();
  let elapsedTime = currentTime - player.starTransitionStartTime;
  if (isNaN(elapsedTime)) {
    elapsedTime = 0;
  }
  let flameAnimatationFrame = elapsedTime % 50;

  if (!player.flameTransitionStartTime || elapsedTime >= 50) {
    player.flameTransitionStartTime = currentTime;
  }

  //   const silhouettePoints = [];

  //   // Calculate silhouette points
  //   for (let i = 0; i < points.length; i++) {
  //     const rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, shipScale);
  //     const silhouetteX = playerCenterXWorldCoords + rotatedPoint.x;
  //     const silhouetteY = playerCenterYWorldCoords + rotatedPoint.y;
  //     const shadowPoint = calculateShadowPosition(silhouetteX, silhouetteY, lightSourceX, lightSourceY);
  //     silhouettePoints.push(shadowPoint);
  //   }

  //   ctx.strokeStyle = color;
  //   ctx.fillStyle = color;

  //   // Draw silhouette
  //   drawSilhouette(ctx, silhouettePoints);

  if (player.space) {
    const flameOffsetAngle = angle - Math.PI / 2 - 0.46;
    const frequency = 0.5;
    const amplitude = 1;
    // Normalize time between 0 and 1
    const time = (basicAnimationTimer % 40) / 40;
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
    const transitionDuration = 500;
    let animatationFrame = elapsedTime % transitionDuration;
    if (!player.starTransitionStartTime || elapsedTime >= transitionDuration) {
      player.starTransitionStartTime = currentTime;
    }
    applyGlowingEffect(ctx, "gold", "gold", "white", transitionDuration, animatationFrame);
  }

  // Draw ship outline
  drawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color);

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

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

// Helper function to draw the ship's outline
function drawShipOutline(ctx, player, playerCenterXScreenCoords, playerCenterYScreenCoords, points, angle, currentTime, color) {
  ctx.beginPath();

  let rotatedPoint = rotateAndScalePoint(points[0].x, points[0].y, angle, shipScale);
  ctx.moveTo(playerCenterXScreenCoords + rotatedPoint.x, playerCenterYScreenCoords + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, shipScale);
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
        applyGlowingEffect(ctx, "white", "white", player.starTransitionStartColor, transitionDuration, elapsedTime);
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

// Helper function to draw the name and invincibility gauge
function drawNameAndInvincibility(ctx, player, centerX, centerY, name, color) {
  const namePositionY = centerY - 15;
  const invincibleGaugePositionY = centerY - 25;

  ctx.fillStyle = getComplementaryColor(color);
  ctx.strokeStyle = getComplementaryColor(color);
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, centerX, namePositionY);

  if (player.invincibleTimer > 0) {
    drawInvincibilityGauge(ctx, player, centerX, invincibleGaugePositionY, 70, 15, 2);
  }
}

function drawScoreInfo(ctx, player, score, camX, camY) {
  let centerX = player.x;
  let centerY = player.y;
  // Calculate position for the score (above the unrotated center of the ship)
  const scorePositionX = centerX - camX;
  const scorePositionY = centerY - camY - 35;

  // Draw the score
  ctx.fillStyle = getComplementaryColor(player.color);
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
  ctx.fillStyle = getComplementaryColor(player.color);
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText(killText, scorePositionX, scorePositionY);
}
