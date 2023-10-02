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
    const starTransitionDuration = 500;
    let starElapsedTime = currentTime - player.flameTransitionStartTime;
    let animatationFrame = starElapsedTime % starTransitionDuration;
    if (!player.starTransitionStartTime || starElapsedTime >= starTransitionDuration) {
      player.starTransitionStartTime = currentTime;
    }
    applyGlowingEffect(ctx, "gold", "gold", "white", starTransitionDuration, animatationFrame);
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
    const rotatedPoint = rotateAndScalePoint(carrotPoints[i].x, carrotPoints[i].y, angle, shipScale);
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
