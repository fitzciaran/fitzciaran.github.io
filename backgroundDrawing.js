// Export a Basic function that takes the canvas context as an argument as well as camera position
function drawBasicBackground(ctx, camX, camY, canvas) {
  ctx.fillStyle = "#999";
  ctx.fillRect(camX, camY, canvas.width, canvas.height);

  const gridSize = 100; // change as needed
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 0.5;

  // horizontal lines
  for (let i = camY - (camY % gridSize); i < camY + canvas.height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i - camY);
    ctx.lineTo(canvas.width, i - camY);
    ctx.stroke();
  }

  // vertical lines
  for (let i = camX - (camX % gridSize); i < camX + canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i - camX, 0);
    ctx.lineTo(i - camX, canvas.height);
    ctx.stroke();
  }
}

export function drawBackground(ctx, camX, camY, canvas, backLayer, midBackLayer, middleLayer, midFrontLayer, frontLayer) {
  // Define scroll speeds for each layer
  let backScrollSpeedX = -0.06; // Back layer scrolls slowest
  let midBackScrollSpeedX = -0.12; // Mid-back layer scrolls slower
  let middleScrollSpeedX = -0.18; // Middle layer scrolls at medium speed
  let midFrontScrollSpeedX = -0.34; // Mid-front layer scrolls faster
  let frontScrollSpeedX = -0.51; // Front layer scrolls fastest

  // Define vertical scroll speeds for each layer
  let backScrollSpeedY = -0.06; // Back layer scrolls slowest
  let midBackScrollSpeedY = -0.12; // Mid-back layer scrolls slower
  let middleScrollSpeedY = -0.18; // Middle layer scrolls at medium speed
  let midFrontScrollSpeedY = -0.34; // Mid-front layer scrolls faster
  let frontScrollSpeedY = -0.51; // Front layer scrolls fastest

  let scaleX = canvas.width / backLayer.width;
  let scaleY = canvas.height / backLayer.height;

  // Use the larger scale factor
  let scale = Math.max(scaleX, scaleY);

  // Calculate the new width and height
  let newWidth = backLayer.width * scale;
  let newHeight = backLayer.height * scale;

  // Calculate new positions for each layer
  let backX = (camX * backScrollSpeedX) % canvas.width;
  let midBackX = (camX * midBackScrollSpeedX) % canvas.width;
  let middleX = (camX * middleScrollSpeedX) % canvas.width;
  // let midFrontX = camX * midFrontScrollSpeedX % canvas.width;
  // let frontX = camX * frontScrollSpeedX % canvas.width;
  let midFrontX = camX * midFrontScrollSpeedX;
  let frontX = camX * frontScrollSpeedX;

  // Calculate new vertical positions for each layer
  let backY = (camY * backScrollSpeedY) % canvas.height;
  let midBackY = (camY * midBackScrollSpeedY) % canvas.height;
  let middleY = (camY * middleScrollSpeedY) % canvas.height;
  // let midFrontY = camY * midFrontScrollSpeedY % canvas.height;
  let midFrontY = camY * midFrontScrollSpeedY;
  // let frontY = camY * frontScrollSpeedY % canvas.height;
  let frontY = camY * frontScrollSpeedY;

  // Draw each layer at its new position
  ctx.drawImage(backLayer, backX, backY, newWidth, newHeight);

  //ctx.drawImage(backLayer, backX - newWidth, backY, newWidth, newHeight);

  //this is an image to the right of the main background to cover the righthand edge ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)
  ctx.drawImage(backLayer, newWidth + backX - 1, backY, newWidth, newHeight);

  //these are an images below the main background to cover the bottom edge offset because they don't match up top to bottom ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)
  // ctx.drawImage(backLayer, newWidth + backX - 1, backY + newHeight - 1, newWidth, newHeight);
  // Calculate the aspect ratio difference
  let backAspectRatio = 272 / 160;
  let canvasAspectRatio = canvas.width / canvas.height;
  const aspectRatioDiff = backAspectRatio - canvasAspectRatio;

  // Calculate offsets based on the aspect ratio difference and window dimensions
  //sometimes 890 seems to be good sometime 620 (regardless of window resize and refreshes)
  // let xOffset = 890;
  let xOffset = 620;
  let yOffset = 12.5;
  //xOffset += (Math.abs(aspectRatioDiff) * window.innerHeight) / 2;
  if (aspectRatioDiff > 0) {
    // If background is taller, adjust yOffset
    // yOffset += (aspectRatioDiff * window.innerWidth) / 2;
  } else if (aspectRatioDiff < 0) {
    // If background is wider, adjust xOffset
    //xOffset += (Math.abs(aspectRatioDiff) * window.innerHeight) / 2;
  }
  ctx.drawImage(backLayer, backX + xOffset - newWidth + 1, backY + newHeight - yOffset, newWidth, newHeight);
  ctx.drawImage(backLayer, backX + xOffset, backY + newHeight - yOffset, newWidth, newHeight);

  //this is an image below and to the right of the main background to cover the bottom edge  ( if aspect ratio of background doesn't match aspect ratio of the canvas causing this to be needed)

  //we don't need these because the aspect ratio of current background means it will be the width that will wrap
  // ctx.drawImage(backLayer, backX, backY - newHeight, newWidth, newHeight);
  // ctx.drawImage(backLayer, backX - newWidth, backY - newHeight, newWidth, newHeight);

  ctx.drawImage(midBackLayer, midBackX, midBackY, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX - newWidth, midBackY, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX, midBackY - newHeight, newWidth, newHeight);
  // ctx.drawImage(midBackLayer, midBackX - newWidth, midBackY - newHeight, newWidth, newHeight);

  ctx.drawImage(middleLayer, middleX, middleY, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX - newWidth, middleY, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX, middleY - newHeight, newWidth, newHeight);
  // ctx.drawImage(middleLayer, middleX - newWidth, middleY - newHeight, newWidth, newHeight);

  let frontMidOffsetX = 800; // Adjust as needed
  let frontMidOffsetY = 650; // Adjust as needed
  ctx.drawImage(midFrontLayer, midFrontX + frontMidOffsetX, midFrontY + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX - newWidth + frontMidOffsetX, midFrontY + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX + frontMidOffsetX, midFrontY - newHeight + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);
  // ctx.drawImage(midFrontLayer, midFrontX - newWidth + frontMidOffsetX, midFrontY - newHeight + frontMidOffsetY, midFrontLayer.width * scale, midFrontLayer.height * scale);

  let frontOffsetX = 700; // Adjust as needed
  let frontOffsetY = 250; // Adjust as needed
  ctx.drawImage(frontLayer, frontX + frontOffsetX, frontY + frontOffsetY, frontLayer.width * scale, frontLayer.height * scale);

  //draw a second smaller planet
  frontOffsetX = 1500; // Adjust as needed
  frontOffsetY = 1050; // Adjust as needed
  ctx.drawImage(frontLayer, frontX + frontOffsetX, frontY + frontOffsetY, frontLayer.width * scale * 0.6, frontLayer.height * scale * 0.6);
}

export function drawWorldBounds(ctx, camX, camY, worldWidth, worldHeight) {
  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, worldWidth, worldHeight);
  gradient.addColorStop("0", "magenta");
  gradient.addColorStop("0.5", "blue");
  gradient.addColorStop("1.0", "red");

  // Draw border
  ctx.lineWidth = 20;
  ctx.strokeStyle = gradient;
  ctx.strokeRect(-camX, -camY, worldWidth, worldHeight);
}
