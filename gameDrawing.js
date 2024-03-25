import { renderDebugInfo, drawPowerupLevels, drawSpecialGauge } from "./drawGameUI.js";
import { spikeyBallPoints, applyGlowingEffect } from "./drawingUtils.js";
import { forces, effects, EffectType } from "./entities.js";
import { drawBackground, drawWorldBounds } from "./backgroundDrawing.js";
import { drawMinimap, drawMinimapPowerups } from "./miniMapDrawing.js";
import { drawShip } from "./drawShip.js";
import { drawForce } from "./forceDrawing.js";
import { drawMine } from "./mineDrawing.js";
import { basicAnimationTimer } from "./gameLogic.js";

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

export function drawScene(player, otherPlayers, bots, mines, ctx, camX, camY, worldDimensions, canvas, globalPowerUps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer);
  drawWorldBounds(ctx, camX, camY, worldDimensions.width, worldDimensions.height);
  ctx.lineWidth = 2;
  drawPowerups(globalPowerUps, ctx, camX, camY);
  mines.forEach((mine) => drawMine(ctx, camX, camY, mine, spikeyBallPoints));
  forces.forEach((force) => drawForce(ctx, camX, camY, force));
  effects.forEach((effect) => drawEffect(ctx, camX, camY, effect));
  bots.forEach((bot) => drawShip(ctx, camX, camY, bot, shipPoints));
  otherPlayers.forEach((player) => drawShip(ctx, camX, camY, player, shipPoints));

  drawMinimap(player, otherPlayers, bots, worldDimensions.width, worldDimensions.height);
  drawMinimapPowerups(globalPowerUps, worldDimensions.width, worldDimensions.height);
  if (player != null) {
    drawShip(ctx, camX, camY, player, shipPoints);
    renderDebugInfo(ctx, player, bots);
    // drawInvincibilityGauge(ctx, player, canvas.width / 2, canvas.height - 70);
    drawSpecialGauge(ctx, player, canvas.width / 2, canvas.height - 20);
  }
  drawPowerupLevels(ctx, player, otherPlayers, bots);
}

export function drawPowerups(globalPowerUps, ctx, camX, camY) {
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
      applyGlowingEffect(ctx, "white", powerUp.color, "white", transitionDuration, animationFrame, 0.2);
    } else if (powerUp.isStar) {
      // Apply a glowing effect for star ships
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "gold"; // Adjust the stroke color to match the glow

      // Gradually change the star's color
      const transitionEndColor = "gold"; // Final color
      applyGlowingEffect(ctx, "gold", powerUp.color, transitionEndColor, transitionDuration, animationFrame);
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

export function drawEffect(ctx, camX, camY, effect) {
  const currentTime = Date.now();
  const elapsedTime = currentTime - effect.starTransitionStartTime;
  const transitionDuration = 80;
  const animatationFrame = elapsedTime % transitionDuration;
  if (effect.duration >= 0) {
    if (!effect.starTransitionStartTime || elapsedTime >= transitionDuration) {
      effect.starTransitionStartTime = currentTime;
    }
    applyGlowingEffect(ctx, "white", effect.color, "white", transitionDuration, animatationFrame, 0.2);
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
  } else if (effect.type === EffectType.EXPLOSION) {
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
