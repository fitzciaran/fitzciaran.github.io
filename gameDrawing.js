import { renderDebugInfo, drawPowerupLevels, drawSpecialGauge } from "./drawGameUI.js";
import {
  rotateAndScalePoint,
  spikeyBallPoints,
  drawArrow,
  getComplementaryColor,
  nameToRGBFullFormat,
  applyGlowingEffect,
  drawExplosion,
} from "./drawingUtils.js";
import { ForceType, forces, effects, EffectType, MineType } from "./entities.js";
import { basicAnimationTimer } from "./gameLogic.js";
import { mineScale } from "./collisionLogic.js";
import { drawBackground, drawWorldBounds } from "./backgroundDrawing.js";
import { drawMinimap, drawMinimapPowerups } from "./miniMapDrawing.js";
import { drawShip } from "./drawShip.js";

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

function drawRegularMine(ctx, centerX, centerY, camX, camY, angle, mineScale, points, color) {
  ctx.beginPath();
  let rotatedPoint = rotateAndScalePoint(points[0].x, points[0].y, angle, mineScale);
  ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);

  for (let i = 1; i < points.length; i++) {
    rotatedPoint = rotateAndScalePoint(points[i].x, points[i].y, angle, mineScale);
    ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  }

  ctx.stroke();
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

  ctx.stroke();
  ctx.beginPath();
  ctx.arc(spokeEndX, spokeEndY, ctx.lineWidth / 2, 0, 2 * Math.PI, false);
  ctx.fill();
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
    drawExplosion(ctx, camX, camY, explosionEffect);
  }
}

export function drawMine(ctx, camX, camY, mine, points) {
  let centerX = mine.x;
  let centerY = mine.y;
  let color = mine.color;
  let angle = 0;
  ctx.strokeStyle = color;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 1;
  const currentTime = Date.now();
  const elapsedTime = currentTime - mine.starTransitionStartTime;
  const transitionDuration = 50;
  const animationFrame = elapsedTime % transitionDuration;

  ctx.beginPath();
  if (mine.mineType === MineType.REGULAR) {
    if (mine.hitFrames < -1) {
      if (!mine.starTransitionStartTime || elapsedTime >= transitionDuration) {
        mine.starTransitionStartTime = currentTime;
        mine.starTransitionStartColor = color;
      }
      applyGlowingEffect(ctx, "white", mine.color, "white", transitionDuration, animationFrame, 0.2);
    }
    drawRegularMine(ctx, centerX, centerY, camX, camY, angle, mineScale, points, color);
  } else if (mine.mineType === MineType.FREE_MINE) {
    if (!mine.starTransitionStartTime || elapsedTime >= transitionDuration) {
      mine.starTransitionStartTime = currentTime;
      mine.starTransitionStartColor = color;
    }
    applyGlowingEffect(ctx, "orange", mine.color, "white", transitionDuration, animationFrame, 0.2);
    drawFreeMine(ctx, camX, camY, angle, 1, mine, color, centerX, centerY, animationFrame);
  } else if (mine.mineType === MineType.TRAIL) {
    ctx.fillStyle = color;
    if (mine.duration < 10) {
      ctx.fillStyle = getComplementaryColor(mine.color);
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
    let rgbColor = nameToRGBFullFormat(color);
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
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 1;
}

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
  if (force.type == ForceType.POINT) {
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
      animationPosition = 1 - ((basicAnimationTimer * speed) % 85) / 100;
      animationPosition2 = 1 - ((basicAnimationTimer * speed + 42.5) % 85) / 100;
    } else {
      animationPosition = ((basicAnimationTimer * speed) % 85) / 100 + 0.15;
      animationPosition2 = ((basicAnimationTimer * speed + 42.5) % 85) / 100 + 0.15;
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
  if (force.type == ForceType.DIRECTIONAL) {
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
    let animationPosition = ((basicAnimationTimer * speed) % 100) / 100 / numPointsDeep;

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
        drawArrow(ctx, { x, y }, angle, 50, 20);
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

    drawArrow(ctx, { x: arrowX, y: arrowY }, angle + Math.PI, 100, arrowheadLength, arrowheadAngle);
  } else {
    // Draw outwards arrows
    const arrowX = screenX + 0.3 * radius * Math.cos(angle);
    const arrowY = screenY + 0.3 * radius * Math.sin(angle);

    drawArrow(ctx, { x: arrowX, y: arrowY }, angle, 100, arrowheadLength, arrowheadAngle);
  }
}

export function drawPowerups(globalPowerUps, ctx, camX, camY) {
  globalPowerUps.forEach((powerUp) => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - powerUp.starTransitionStartTime;
    const transitionDuration = 200;
    const animationFrame = elapsedTime % transitionDuration;

    // Save the current canvas state
    ctx.save();

    if (powerUp.hitFrames < -1) {
      if (!powerUp.starTransitionStartTime || elapsedTime >= transitionDuration) {
        powerUp.starTransitionStartTime = currentTime;
        // powerUp.starTransitionStartColor = powerUp.color;
      }
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

    // Translate the canvas origin to the power-up position
    ctx.translate(powerUp.x - camX, powerUp.y - camY);

    // Replace this with your custom texture/icon drawing logic
    // For example, you can draw an image or a more complex shape
    // Here, we draw a simple star shape as an example
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
      const currentRadius = (frameIndex / numFrames) * maxRadius;

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
