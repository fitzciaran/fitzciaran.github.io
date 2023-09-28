import { player, setMines, bots, mines, globalPowerUps, colors } from "./main.js";
import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { isSpokeCollision } from "./collisionLogic.js";
import { sendMinesUpdate, sendPowerUpsUpdate } from "./sendData.js";
import { PowerUp, effects, Effect, EffectType, MineType, FreeMine } from "./entities.js";
import { getRandomUniqueColor, findCompleteShape, isPointInsideShape } from "./gameUtils.js";

export function ProcessTrailShapesAllPlayers(player, otherPlayers) {
  let allPlayers = [...bots, ...otherPlayers, player];
  for (let candidatePlayer of allPlayers) {
    ProcessTrailShapes(candidatePlayer, allPlayers);
  }
}

function ProcessTrailShapes(candidatePlayer, allPlayers) {
  const shape = findCompleteShape(candidatePlayer.id, mines, 30000);

  if (shape && shape.shapePath) {
    let freeMine = createFreeMine(candidatePlayer, shape);
    handleFreeMineSpawn(candidatePlayer.id, mines, freeMine, shape, allPlayers);
    // createEffects(shape.shapePath, effects);
    if (isPlayerMasterPeer(player)) {
      sendMinesUpdate();
    }
  }
}

// Function to create a FreeMine
function createFreeMine(player, shape) {
  let freeMine = new FreeMine(
    "trail-" + Math.floor(Math.random() * 10000),
    shape.center.x,
    shape.center.y,
    40,
    70,
    player.color,
    0,
    MineType.FREE_MINE,
    -1,
    player.id,
    0,
    shape.shapePath
  );
  freeMine.spokeWidth = shape.spokeWidth;
  freeMine.spokeLength = shape.spokeLength;
  return freeMine;
}

function createEffects(shapePath, effects) {
  for (let point of shapePath) {
    let effect = new Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", EffectType.EXPLOSION);
    effects.push(effect);
  }
}

function handleFreeMineSpawn(playerId, mines, freeMine, shape, allPlayers) {
  removePlayerTrailMines(playerId, mines);
  mines.push(freeMine);
  //   createExplosionEffects(shape.shapePath);

  destroyOverlappingMines(mines, shape, freeMine, playerId);
  hitPlayersCaught(allPlayers, playerId, shape, freeMine);
}

function removePlayerTrailMines(playerId, mines) {
  mines = mines.filter((mine) => mine.playerId != playerId);
  setMines(mines);
}

function createExplosionEffects(shapePath) {
  for (let point of shapePath) {
    let effect = new Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", EffectType.EXPLOSION);
    effects.push(effect);
  }
}

function destroyOverlappingMines(mines, shape, freeMine, playerId) {
  for (let mine of mines) {
    if (mine.mineType !== MineType.FREE_MINE && mine.playerId != playerId) {
      if (isMineOverlapping(shape, mine, freeMine)) {
        destroyMine(mine);
        addPowerUpOnMineDestroy(mine);
      }
    }
  }
}

function isMineOverlapping(shape, mine, freeMine) {
  return (
    isPointInsideShape(shape.shapePath, { x: mine.x, y: mine.y }) ||
    isSpokeCollision(mine, mine.radius + 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
  );
}

function destroyMine(mine) {
  mine.hitFrames = 5;
}

function addPowerUpOnMineDestroy(mine) {
  let addPowerup = shouldAddPowerupOnMineDestroy(mine);
  if (addPowerup) {
    createPowerUpFromMine(mine);
  }
}

function shouldAddPowerupOnMineDestroy(mine) {
  if (mine.mineType === MineType.TRAIL && Math.random() > 0.5) {
    return false;
  }

  return true;
}

function createPowerUpFromMine(mine) {
  let isStar = false;
  let radius = 35;
  let value = 3;
  let hasGravity = 0;

  if (Math.random() > 0.7) {
    if (Math.random() > 0.2) {
      hasGravity = -1;
      value = 5;
      radius = 30;
    } else {
      hasGravity = 1;
    }
  }

  let powerUp = new PowerUp(
    "mineConvert-" + Math.floor(Math.random() * 10000),
    mine.x,
    mine.y,
    getRandomUniqueColor(colors, null),
    isStar,
    radius,
    value,
    hasGravity
  );

  globalPowerUps.push(powerUp);
  if (isPlayerMasterPeer(player)) {
    sendPowerUpsUpdate(true);
  }
}

function hitPlayersCaught(allPlayers, playerId, shape, freeMine) {
  for (let candidatePlayer of allPlayers) {
    if (candidatePlayer.id === playerId) {
      continue; // Don't hit the player who created this
    }

    if (isPlayerCaughtInExplosion(shape, candidatePlayer, freeMine)) {
      handlePlayerHitByExplosion(playerId, candidatePlayer, allPlayers);
    }
  }
}

function isPlayerCaughtInExplosion(shape, candidatePlayer, freeMine) {
  return (
    isPointInsideShape(shape.shapePath, { x: candidatePlayer.x, y: candidatePlayer.y }) ||
    isSpokeCollision(candidatePlayer, 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
  );
}

function handlePlayerHitByExplosion(playerId, candidatePlayer, allPlayers) {
  let owner = allPlayers.find((player) => player.id === playerId);
  let name = owner && owner.name ? owner.name : "";

  if (candidatePlayer.isVulnerable()) {
    candidatePlayer.gotHit(name);
    if (owner) {
      owner.hitOtherPlayer(candidatePlayer);
    }
  }
}
