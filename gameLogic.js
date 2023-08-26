import { sendPlayerStates, sendPowerups } from "./connectionHandlers.js";
import { drawWinnerMessage } from "./canvasDrawingFunctions.js";
//finish game after 2 for easier testing the finish
let pointsToWin = 2;

export function checkWinner(player, otherPlayers, connections, ctx, canvas) {
  if (player.powerUps >= pointsToWin) {
    sendPlayerStates(player, connections);
    drawWinnerMessage(ctx, canvas, "Winner! Rivals dreams crushed.");
    return true;
  }
  for (let otherPlayer of otherPlayers) {
    if (otherPlayer.powerUps >= pointsToWin) {
      drawWinnerMessage(ctx, canvas, "Get good scrub! You lose");
      return true;
    }
  }
  return false;
}

export function generatePowerups(globalPowerUps, connections, worldWidth, worldHeight, colors) {
  // Check if there are less than 2 powerups
  if (globalPowerUps.length < 2) {
    // Generate a new dot with random x and y within the world
    let powerup = {
      x: (Math.random() * 0.8 + 0.1) * worldWidth,
      y: (Math.random() * 0.8 + 0.1) * worldHeight,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    globalPowerUps.push(powerup);

    // Send the powerups every time you generate one
    sendPowerups(globalPowerUps, connections);
  }
}

export function checkPowerupCollision(playerToCheck, globalPowerUps, connections) {
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20) {
      // assuming the radius of both ship and powerup is 10
      playerToCheck.powerUps += 1;
      globalPowerUps.splice(i, 1);
      sendPowerups(globalPowerUps, connections);
      break; // exit the loop to avoid possible index errors
    }
  }
}

export function resetPowerLevels(player, otherPlayers, connections) {
  // Reset my powerUps
  player.powerUps = 0;

  // Reset powerUps of other players
  otherPlayers.forEach((player) => {
    player.powerUps = 0;
  });

  // Send updated powerUps to other players
  sendPlayerStates(player, connections);
}

function shipHitsBorder(x, y) {
  return x < 0 || y < 0 || x > worldWidth || y > worldHeight;
}
