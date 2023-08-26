
// Export a setupCanvas function that initializes the canvas and returns it
export function setupCanvas() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1200;
    canvas.height = 600;
    return { canvas, ctx };
  }
  
  // Export a drawBackground function that takes the canvas context as an argument
  export function drawBackground(ctx, camX, camY, canvas) {
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
  
  // Export a drawWorldBounds function that takes the canvas context as an argument
  export function drawWorldBounds(ctx, camX, camY, worldWidth, worldHeight) {
    ctx.lineWidth = 10; // Line width increased
    ctx.strokeStyle = "blue";
    ctx.strokeRect(-camX, -camY, worldWidth, worldHeight);
  }
  
  // Export a drawMinimap function 
  export function drawMinimap(player,otherPlayers, worldWidth, worldHeight) {
    const minimapCanvas = document.getElementById("minimapCanvas");
    const minimapCtx = minimapCanvas.getContext("2d");
  
    const dotSize = 5; // Size of the dot
    const scaleX = (minimapCanvas.width - dotSize) / worldWidth; // Adjust scale
    const scaleY = (minimapCanvas.height - dotSize) / worldHeight; // Adjust scale
  
    // Clear the minimap
    minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  
    // Draw the player's ship on the minimap
    minimapCtx.fillStyle = player.color;
    minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);
  
    // Draw other players on the minimap
    otherPlayers.forEach((player) => {
      minimapCtx.fillStyle = player.color;
      minimapCtx.fillRect(player.x * scaleX, player.y * scaleY, dotSize, dotSize);
    });
  }

  export function drawRotatedShip(ctx, camX,camY, centerX, centerY, angle, points, color) {
    ctx.beginPath();
  
    // Move to the first point after rotating
    let rotatedPoint = rotatePoint(points[0].x, points[0].y, angle);
    ctx.moveTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
  
    // Create a line for each point
    for (let i = 1; i < points.length; i++) {
      rotatedPoint = rotatePoint(points[i].x, points[i].y, angle);
      ctx.lineTo(centerX - camX + rotatedPoint.x, centerY - camY + rotatedPoint.y);
    }
  
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  // Rotate a point (x, y) by a certain angle
  export function rotatePoint(x, y, angle) {
    return {
      x: x * Math.cos(angle) - y * Math.sin(angle),
      y: x * Math.sin(angle) + y * Math.cos(angle),
    };
  }
  
  export function drawPowerups(globalPowerUps,ctx,camX,camY) {
    // Draw each dot
    globalPowerUps.forEach((powerup) => {
      ctx.beginPath();
      ctx.arc(powerup.x - camX, powerup.y - camY, 10, 0, Math.PI * 2);
      ctx.fillStyle = powerup.color;
      ctx.fill();
    });
  }
  
  export function drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight) {
    const minimapCanvas = document.getElementById("minimapCanvas");
    const minimapCtx = minimapCanvas.getContext("2d");
  
    const powerupSize = 2; // Smaller size for powerups on the minimap
    const scaleX = (minimapCanvas.width - powerupSize) / worldWidth; // Adjust scale
    const scaleY = (minimapCanvas.height - powerupSize) / worldHeight; // Adjust scale
  
    // Draw each powerup on the minimap
    globalPowerUps.forEach((powerup) => {
      minimapCtx.fillStyle = powerup.color;
      minimapCtx.fillRect(powerup.x * scaleX, powerup.y * scaleY, powerupSize, powerupSize);
    });
  }
  
  export function renderPowerupLevels(ctx,player,otherPlayers) {
    const minimapTopY = 100; // Replace with the Y position of your minimap
    const textHeight = 75; // Adjust this to the size of your text
    const gap = 10; // Gap between lines
    ctx.font = "12px Arial";
    const myPowerupText = `              My Powerups: ${player.powerUps}`;
    ctx.fillStyle = player.color; // your ship color
    ctx.fillText(myPowerupText, 58, minimapTopY - textHeight);
  
    // Draw other players' powerups
    otherPlayers.forEach((player, index) => {
      const playerPowerupText = `Player ${player.id.slice(0, 7)} Powerups: ${player.powerUps}`; // Showing only the first 7 digits of id for readability
      const y = minimapTopY - textHeight + (1.5 + index) * gap; // calculate y position for each player's text
      ctx.fillStyle = player.color; // individual ship color for each player
      ctx.fillText(playerPowerupText, 40, y);
    });
  }
  