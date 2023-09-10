export const spikeyBallPoints = [];
import { pilots } from "./gameLogic.js";
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

    //since we can now scale the canvas need to adjust the positions
    centerPilots(canvas);
  });

  return { canvas, ctx };
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
