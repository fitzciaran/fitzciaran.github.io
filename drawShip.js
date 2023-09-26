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

export function drawShip(ctx, camX, camY, player, points) {
  if (
    !player.isPlaying ||
    player.isDead ||
    (!player.isLocal && !player.isBot && player.timeSinceSentMessageThatWasRecieved > 120) ||
    (player.name == "" && player.pilot == "")
  ) {
    return;
  }

  let centerX = player.x;
  let centerY = player.y;
  let angle = player.angle;
  let color = player.color;
  let name = player.name;
  let lightSourceX = 0;
  let lightSourceY = 0;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  const flameTransitionDuration = 50;
  const currentTime = Date.now();
  let elapsedTime = currentTime - player.starTransitionStartTime;
  if (isNaN(elapsedTime)) {
    elapsedTime = 0;
  }
  let flameAnimatationFrame = elapsedTime % flameTransitionDuration;
  if (!player.flameTransitionStartTime || elapsedTime >= flameTransitionDuration) {
    player.flameTransitionStartTime = currentTime;
  }

  // Calculate the ship's silhouette points
  let silhouettePoints = [];

  for (let i = 0; i < points.length; i++) {
    let rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, shipScale);
    let silhouetteX = centerX - camX + rotatedPoint.x;
    let silhouetteY = centerY - camY + rotatedPoint.y;

    // Calculate the shadow position for each silhouette point
    let shadowX = silhouetteX + (lightSourceX - silhouetteX);
    let shadowY = silhouetteY + (lightSourceY - silhouetteY);

    silhouettePoints.push({ x: shadowX, y: shadowY });
  }

  // Draw the ship's silhouette
  ctx.beginPath();
  ctx.moveTo(silhouettePoints[0].x, silhouettePoints[0].y);

  for (let i = 1; i < silhouettePoints.length; i++) {
    ctx.lineTo(silhouettePoints[i].x, silhouettePoints[i].y);
  }

  ctx.closePath();
  ctx.fillStyle = "gray"; // Fill color for the silhouette
  ctx.fill();

  if (player.space) {
    const angleOffset = 0.38;

    // Adjust the orientation of the flame
    const flameOffsetAngle = angle - Math.PI / 2 - 0.38; // Adjust the orientation as needed

    const flameSize = 16 + player.distanceFactor * (30 + (flameAnimatationFrame % 10));

    let offsetAngle = angle - Math.PI / 2 - 0.55;
    let rotatedFlamePoint = rotateAndScalePoint((-2 * 2) / 2, (-9 * 2) / 2, offsetAngle, shipScale);

    // Calculate the position for the flame relative to the ship's center
    const flameOffsetX = -Math.sin(flameOffsetAngle) * 15; // Adjust the offset as needed
    const flameOffsetY = Math.cos(flameOffsetAngle) * 15; // Adjust the offset as needed
    const flameX = centerX - camX + rotatedFlamePoint.x + flameOffsetX;
    const flameY = centerY - camY + rotatedFlamePoint.y + flameOffsetY;

    ctx.beginPath();
    ctx.moveTo(flameX, flameY);

    // Calculate the flame points relative to the flame position
    for (let i = 0; i < 3; i++) {
      const adjustedAngle = flameOffsetAngle + i * angleOffset; // Adjust the angle of the flame
      const flameEndX = flameX - Math.cos(adjustedAngle) * flameSize;
      const flameEndY = flameY - Math.sin(adjustedAngle) * flameSize;
      ctx.lineTo(flameEndX, flameEndY);
    }

    ctx.closePath();
    // Create a radial gradient for the flame effect
    const gradient = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, flameSize);
    gradient.addColorStop(0, "rgba(255, 165, 0, 1)"); // Adjust color and transparency
    gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); // Adjust color and transparency

    // Use the gradient as the fill style for the flame
    ctx.fillStyle = gradient;
    // applyGlowingEffect(ctx, "orange", "orange", "red", flameTransitionDuration, flameAnimatationFrame);
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  if (player.invincibleTimer > 10 || (player.invincibleTimer > 0 && !player.isUserControlledCharacter)) {
    let transitionDuration = 500;
    let animatationFrame = elapsedTime % transitionDuration;
    if (!player.starTransitionStartTime || elapsedTime >= transitionDuration) {
      player.starTransitionStartTime = currentTime;
    }
    applyGlowingEffect(ctx, "gold", "gold", "white", transitionDuration, animatationFrame);
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
      if (player.isInSpawnProtectionTime() && !(player.invincibleTimer > 10 || (player.invincibleTimer > 0 && !player.isUserControlledCharacter))) {
        const transitionDuration = 20;
        const currentTime = Date.now();
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
  // ctx.fillStyle = ctx.strokeStyle;

  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.stroke();

  //for debug draw angle
  // Calculate the endpoint coordinates based on the angle
  //   const lineLength = 50; // Adjust the length of the line as needed
  //   let adjustedAngle = angle - Math.PI/2;
  //   const lineEndpointX = centerX - camX + lineLength * Math.cos(adjustedAngle);
  //   const lineEndpointY = centerY - camY + lineLength * Math.sin(adjustedAngle);

  //   // Draw the line
  //   ctx.moveTo(centerX - camX, centerY - camY);
  //   ctx.lineTo(lineEndpointX, lineEndpointY);
  //   ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";

  const namePositionX = centerX - camX;
  const namePositionY = centerY - camY - 15;

  ctx.fillStyle = getComplementaryColor(color);
  ctx.strokeStyle = getComplementaryColor(color);
  // ctx.font = "14px Arial";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, namePositionX, namePositionY);

  const invincibleGuagePositionX = centerX - camX;
  const invincibleGuagePositionY = centerY - camY - 25;
  if (player.invincibleTimer > 0) {
    drawInvincibilityGauge(ctx, player, invincibleGuagePositionX, invincibleGuagePositionY, 70, 15, 2);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.shadowColor = "transparent";

  if (player.recentScoreTicks > 0) {
    let scoreInfoYAdjust = 0;
    if (player.invincibleTimer > 0) {
      scoreInfoYAdjust = 20;
    }
    drawScoreInfo(ctx, player, player.recentScoreText, camX, camY + scoreInfoYAdjust);
    drawKillInfo(ctx, player, player.recentKillScoreText, camX, camY + scoreInfoYAdjust);
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
