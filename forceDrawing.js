import { drawArrow } from "./drawingUtils.js";
import { ForceType } from "./entities.js";
import { basicAnimationTimer } from "./gameLogic.js";

export function drawForce(ctx, camX, camY, force) {
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
