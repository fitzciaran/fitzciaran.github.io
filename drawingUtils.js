export const spikeyBallPoints = [];

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
