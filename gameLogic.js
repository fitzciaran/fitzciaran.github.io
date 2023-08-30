import { sendPlayerStates, sendGameState, isPlayerMasterPeer } from "./connectionHandlers.js";
import { setGameState, GameState,player,setGlobalPowerUps,getGlobalPowerUps } from "./astroids.js";
//finish game after 2 for easier testing the finish
export let pointsToWin = 2;
let maxPowerups = 10;
export let endGameMessage = "";
export let gameWon = false;
export const pilot1 = {
  image: new Image(),
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  selected: false,
  lore: "Orion is the muscle-bound moral compass of the cosmos. Born in a dying star, Orion's got strength that makes bodybuilders weep and a heart that's never heard of a grey area. He's saved more worlds than he's had hot dinners, and his name is basically a synonym for 'awesome' in every galaxy. But don't worry, he hasn't let it go to his head. He's always ready to lend a hand, or a bicep. Orion: not just a pilot, but a one-man, space-faring beacon of hope.",
};

export const pilot2 = {
  image: new Image(),
  x: 100,
  y: 0,
  width: 100,
  height: 100,
  selected: false,
  lore: "Bumble, the hero nobody asked for, and who just won't go away. He's got a unique talent for tripping over absolutely nothing and a flying skill that's... well, let's just call it 'creative'. He might not have Orion's strength, or any gazelle's grace, or even the reflexes of a half-asleep sloth, but boy, does he have determination. And a knack for surviving situations he really shouldn't. Bumble is proof that some people have no potential.",
};

export function checkWinner(player, otherPlayers, connections) {
  if (player.powerUps >= pointsToWin) {
    sendPlayerStates(player, connections);
    setGameState(GameState.FINISHED);
    endGameMessage = "Winner! Rivals dreams crushed.";
    gameWon = true;
    return true;
  }
  for (let otherPlayer of otherPlayers) {
    if (otherPlayer.powerUps >= pointsToWin) {
      gameWon = false;
      setGameState(GameState.FINISHED);
      endGameMessage = "Get good scrub! You lose";
      // drawWinnerMessage(ctx, canvas, "Get good scrub! You lose");
      return true;
    }
  }
  return false;
}

export function generatePowerups(globalPowerUps, connections, worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  // Check if there are less than max powerups powerups
  if (globalPowerUps.length < maxPowerups) {
    // Generate a new dot with random x and y within the world
    let powerup = {
      x: (Math.random() * 0.8 + 0.1) * worldWidth,
      y: (Math.random() * 0.8 + 0.1) * worldHeight,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    globalPowerUps.push(powerup);
    setGlobalPowerUps(globalPowerUps);
    // Send the powerups every time you generate one
    // sendPowerups(globalPowerUps, connections);
    sendGameState(globalPowerUps, connections);
  }
}

export function checkPowerupCollision(playerToCheck, globalPowerUps, connections) {
  // if (!isPlayerMasterPeer(player)) {
  //   return;
  // }
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20) {
      // assuming the radius of both ship and powerup is 10
      playerToCheck.powerUps += 1;
      globalPowerUps.splice(i, 1);
      // sendPowerups(globalPowerUps, connections);
      setGlobalPowerUps(globalPowerUps);
      sendGameState(globalPowerUps, connections);
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

export function setGameWon(won) {
  gameWon = won;
}

export function updateEnemies() {
  // Update the positions, velocities, etc. of the enemies
}

export function updatePowerups() {
  // Update the positions, velocities, etc. of the powerups

  //setGlobalPowerUps(getGlobalPowerUps());
}
