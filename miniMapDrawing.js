import { shouldSkipPlayer } from "./drawingUtils.js";

// Export a drawMinimap function
export function drawMinimap(player, otherPlayers, bots, worldWidth, worldHeight) {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");

  const dotSize = 5; // Size of the dot
  const scaleX = (minimapCanvas.width - dotSize) / worldWidth; // Adjust scale
  const scaleY = (minimapCanvas.height - dotSize) / worldHeight; // Adjust scale

  // Clear the minimap
  minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  // Draw a semi-transparent background with a border
  minimapCtx.fillStyle = "rgba(0, 128, 0, 0.2)"; // Semi-transparent green
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  minimapCtx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // White border
  minimapCtx.lineWidth = 3; // Border width
  minimapCtx.strokeRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  // Draw the player's ship on the minimap
  if (!shouldSkipPlayer(player)) {
    drawMiniMapEntity(player, minimapCtx, scaleX, scaleY, dotSize);
  }

  // Draw other players on the minimap
  otherPlayers.forEach((otherPlayer) => {
    if (!shouldSkipPlayer(otherPlayer)) {
      drawMiniMapEntity(otherPlayer, minimapCtx, scaleX, scaleY, dotSize);
    }
  });

  // Draw bots on the minimap
  bots.forEach((bot) => {
    drawMiniMapEntity(bot, minimapCtx, scaleX, scaleY, dotSize);
  });
}

export function drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight) {
  const minimapCanvas = document.getElementById("minimapCanvas");
  const minimapCtx = minimapCanvas.getContext("2d");

  const powerupSize = 3; // Smaller size for powerups on the minimap
  const scaleX = (minimapCanvas.width - powerupSize) / worldWidth; // Adjust scale
  const scaleY = (minimapCanvas.height - powerupSize) / worldHeight; // Adjust scale

  // Draw each powerup on the minimap
  globalPowerUps.forEach((powerup) => {
    minimapCtx.fillStyle = powerup.color;
    minimapCtx.fillRect(powerup.x * scaleX, powerup.y * scaleY, powerupSize, powerupSize);
  });
}

// Function to draw a player or bot on the minimap
export function drawMiniMapEntity(entity, ctx, scaleX, scaleY, dotSize) {
  if (entity != null && entity.isPlaying) {
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x * scaleX, entity.y * scaleY, dotSize, dotSize);
  }
}
