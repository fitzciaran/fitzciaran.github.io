import { rotateAndScalePoint, getComplementaryColor, nameToRGBFullFormat, applyGlowingEffect, drawExplosion } from "./drawingUtils.js";
import { MineType } from "./entities.js";
import { basicAnimationTimer } from "./gameLogic.js";
import { mineScale } from "./collisionLogic.js";

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
  //   ctx.lineWidth = 10;

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
    applyGlowingEffect(ctx, "orange", mine.color, "white", transitionDuration, animationFrame, 0.4);
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
