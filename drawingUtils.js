export const spikeyBallPoints = [];
import { pilots } from "./gameLogic.js";
// import { ctx } from "./astroids.js";
export const loreTablet = {
  x: 0,
  y: -300,
  width: 450,
  height: 450,
  image: new Image(),
};

function centerPilots(canvas) {
  // Calculate the horizontal gap between pilots (excluding the central gap)
  const gapBetweenPilots = 20; // Gap between all pilots except the central gap
  const centralGap = 300; // Width of the central gap

  // Calculate the total width occupied by all pilots (excluding the central gap)
  let totalWidth = 0;

  for (let i = 0; i < pilots.length; i++) {
    totalWidth += pilots[i].width;
  }

  // Calculate the total width including the central gap
  totalWidth += centralGap;

  // Calculate the starting x-position to center the pilots
  const startX = (canvas.width - totalWidth) / 2 + gapBetweenPilots;

  // Calculate the y-position for all pilots
  const yPosition = canvas.height / 6;

  // Calculate the index at which to start adding the central gap
  const startIndexForCentralGap = Math.floor(pilots.length / 2) - 1;

  // Set the positions for each pilot, taking the central gap into account
  let currentX = startX;
  for (let i = 0; i < pilots.length; i++) {
    const pilot = pilots[i];
    pilot.x = currentX;

    if (i === startIndexForCentralGap) {
      // Leave the central gap after half of the pilots
      currentX += centralGap;
    } else if (i < pilots.length - 1) {
      // Add the regular gap between pilots
      currentX += pilot.width + gapBetweenPilots;
    }

    pilot.y = yPosition;
  }

  // Position the lore tablet
  loreTablet.x = canvas.width / 2 - loreTablet.width / 2;
  loreTablet.y = canvas.height / 2 - 100;
}

export function setupPilotsImageSources() {
  // Set image sources for each pilot
  for (let i = 0; i < pilots.length; i++) {
    const pilot = pilots[i];
    pilot.image.src = pilot.src;
  }
}

export function setupPilotsImages(canvas) {
  setupPilotsImageSources();
  loreTablet.image.src = "images/tablet.png";
  centerPilots(canvas);
}

// Export a setupCanvas function that initializes the canvas and returns it
export function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  setClip(ctx);

  canvas.style.position = "absolute"; // positioning the canvas to start from the top left corner.
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Disable the default context menu on the canvas
  canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Adding event listener to handle window resizing
  window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setClip(ctx);
    //since we can now scale the canvas need to adjust the positions
    centerPilots(canvas);
  });

  return { canvas, ctx };
}

function setClip(ctx) {
  //try this clip to prevent drawing outside of canvas to see if it improves efficiency
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clip();
}
// Rotate a point (x, y) by a certain angle
export function rotatePoint(x, y, angle) {
  return {
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: x * Math.sin(angle) + y * Math.cos(angle),
  };
}

export function rotateAndScalePoint(x, y, angle, scale) {
  return {
    x: (x * Math.cos(angle) - y * Math.sin(angle)) * scale,
    y: (x * Math.sin(angle) + y * Math.cos(angle)) * scale,
  };
}
// Interpolate between two color components (e.g., red, green, blue)
export function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

export function drawRoundedRectangle(ctx, buttonX, buttonY, buttonWidth, buttonHeight, radius) {
  ctx.beginPath();
  ctx.moveTo(buttonX + radius, buttonY);
  ctx.lineTo(buttonX + buttonWidth - radius, buttonY);
  ctx.arcTo(buttonX + buttonWidth, buttonY, buttonX + buttonWidth, buttonY + radius, radius);
  ctx.lineTo(buttonX + buttonWidth, buttonY + buttonHeight - radius);
  ctx.arcTo(buttonX + buttonWidth, buttonY + buttonHeight, buttonX + buttonWidth - radius, buttonY + buttonHeight, radius);
  ctx.lineTo(buttonX + radius, buttonY + buttonHeight);
  ctx.arcTo(buttonX, buttonY + buttonHeight, buttonX, buttonY + buttonHeight - radius, radius);
  ctx.lineTo(buttonX, buttonY + radius);
  ctx.arcTo(buttonX, buttonY, buttonX + radius, buttonY, radius);
  ctx.closePath();
  ctx.fill();
}

export function setupSpikeyBallPoints() {
  const numSpikes = 20; // Adjust the number of spikes as needed
  const spikeLength = 15; // Adjust the length of spikes as needed
  const ballRadius = 40; // Adjust the radius of the ball as needed

  for (let i = 0; i < numSpikes; i++) {
    const angle = (Math.PI * 2 * i) / numSpikes;
    const x = Math.cos(angle) * ballRadius;
    const y = Math.sin(angle) * ballRadius;
    spikeyBallPoints.push({ x, y });

    // Calculate the spike endpoint
    const spikeX = x + Math.cos(angle) * spikeLength;
    const spikeY = y + Math.sin(angle) * spikeLength;
    spikeyBallPoints.push({ x: spikeX, y: spikeY });
  }

  // Close the shape by adding the first point again
  spikeyBallPoints.push({ x: spikeyBallPoints[0].x, y: spikeyBallPoints[0].y });
}

// Function to apply a gravity warp effect only inside a specified circle
export function applyGravityWarpEffect(ctx, centerX, centerY, radius, coneAngle, direction, resolution = 5) {
  const xMin = centerX - radius;
  const yMin = centerY - radius;
  const xMax = centerX + radius;
  const yMax = centerY + radius;

  const imageData = ctx.getImageData(xMin, yMin, xMax - xMin, yMax - yMin);
  const data = imageData.data;

  function isInsideCircle(x, y) {
    const dx = x - centerX;
    const dy = y - centerY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function isInsideCone(x, y, coneAngle, direction) {
    const dx = x - centerX;
    const dy = y - centerY;
    const angleToPoint = Math.atan2(dy, dx);
    const halfCone = coneAngle / 2;
    const minAngle = normalizeAngle(direction - halfCone);
    const maxAngle = normalizeAngle(direction + halfCone);

    const normalizedAngleToPoint = normalizeAngle(angleToPoint);

    if (minAngle <= maxAngle) {
      return normalizedAngleToPoint >= minAngle && normalizedAngleToPoint <= maxAngle;
    } else {
      return normalizedAngleToPoint >= minAngle || normalizedAngleToPoint <= maxAngle;
    }
  }

  // Helper function to normalize angles to the range [0, 2*PI]
  function normalizeAngle(angle) {
    while (angle < 0) {
      angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI) {
      angle -= 2 * Math.PI;
    }
    return angle;
  }

  for (let y = 0; y < imageData.height; y += resolution) {
    for (let x = 0; x < imageData.width; x += resolution) {
      const index = (y * imageData.width + x) * 4;

      if (
        (isInsideCircle(x + xMin, y + yMin) && coneAngle == Math.PI * 2) ||
        (isInsideCircle(x + xMin, y + yMin) && isInsideCone(x + xMin, y + yMin, coneAngle, direction))
      ) {
        // Apply the gravity warp effect inside the cone
        data[index] = 255 - data[index]; // R
        data[index + 1] = 255 - data[index + 1]; // G
        data[index + 2] = 255 - data[index + 2]; // B
      }
    }
  }

  ctx.putImageData(imageData, xMin, yMin);
}

export function drawArrow(ctx, tail, angle, length, arrowheadLength, arrowheadAngle = Math.PI / 8) {
  let head = {};

  head.x = tail.x + length * Math.cos(angle);
  head.y = tail.y + length * Math.sin(angle);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(tail.x, tail.y);

  //const angle = Math.atan2(head.y - tail.y, head.x - tail.x);
  const arrowhead1X = head.x - arrowheadLength * Math.cos(angle + arrowheadAngle);
  const arrowhead1Y = head.y - arrowheadLength * Math.sin(angle + arrowheadAngle);
  const arrowhead2X = head.x - arrowheadLength * Math.cos(angle - arrowheadAngle);
  const arrowhead2Y = head.y - arrowheadLength * Math.sin(angle - arrowheadAngle);

  ctx.moveTo(head.x, head.y);
  ctx.lineTo(arrowhead1X, arrowhead1Y);
  ctx.moveTo(head.x, head.y);
  ctx.lineTo(arrowhead2X, arrowhead2Y);
}

function normalizeAngle(angle) {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function isAngleInCone(angle, startAngle, endAngle) {
  if (startAngle > endAngle) {
    // If startAngle is greater than endAngle, it means the cone crosses the 0/2π line.
    // In this case, we need to check if the angle is less than endAngle or greater than startAngle.
    return angle <= endAngle || angle >= startAngle;
  } else {
    // If startAngle is less than endAngle, we can simply check if the angle is within this range.
    return angle >= startAngle && angle <= endAngle;
  }
}

export function nameToRGBFullFormat(colorName) {
  let rgbColor = nameToRGB(colorName);
  // Match the RGB values using a regular expression
  const match = rgbColor.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);

  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    return {
      r: r,
      g: g,
      b: b,
    };
  }

  return null; // Return null if the input is not a valid RGB color string
}

export function nameToRGB(colorName) {
  const colorMap = {
    red: "rgb(255, 0, 0)",
    green: "rgb(0, 255, 0)",
    blue: "rgb(0, 0, 255)",
    orange: "rgb(255, 165, 0)",
    springgreen: "rgb(0, 255, 127)",
    lime: "rgb(0, 255, 0)",
    cyan: "rgb(0, 255, 255)",
    indigo: "rgb(75, 0, 130)",
    purple: "rgb(128, 0, 128)",
    pink: "rgb(255, 192, 203)",
    mediumvioletred: "rgb(199, 21, 133)",
    violet: "rgb(238, 130, 238)",
    maroon: "rgb(128, 0, 0)",
    crimson: "rgb(220, 20, 60)",
    white: "rgb(255, 255, 255)",
    gold: "rgb(255,215,0)",
    orangered: "rgb(255, 69, 0)",
  };
  if (colorName == null) {
    colorName = "blue";
  }
  // Look up the color name in the map and return the corresponding RGB value
  return colorMap[colorName.toLowerCase()] || null;
}

export function getComplementaryColor(color) {
  // Assuming color is in the format "rgb(r, g, b)"
  let match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);

  if (!match) {
    color = nameToRGB(color);
    match = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(color);
    if (!match) {
      // Invalid color format
      return null;
    }
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);

  // Calculate the complementary color by subtracting each RGB component from 255
  const complementaryR = 255 - r;
  const complementaryG = 255 - g;
  const complementaryB = 255 - b;

  // Return the complementary color in "rgb(r, g, b)" format
  return `rgb(${complementaryR},${complementaryG},${complementaryB})`;
}

// Function to determine if a player should be skipped
export function shouldSkipPlayer(player) {
  return (
    !player ||
    !player.isPlaying ||
    player.isDead ||
    (!player.isLocal && !player.isBot && player.timeSinceSentMessageThatWasReceived > 120) ||
    (player.name === "" && player.pilot === "")
  );
}

// Function to draw a player or bot on the minimap
export function drawMiniMapEntity(entity, ctx, scaleX, scaleY, dotSize) {
  if (entity != null && entity.isPlaying) {
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x * scaleX, entity.y * scaleY, dotSize, dotSize);
  }
}