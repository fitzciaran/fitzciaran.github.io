import { setGlobalPowerUps, bots, mines, setBots, setMines } from "./main.js";
import {
  connectedPeers,
  setConnectedPeers,
  setTimeSinceMessageFromMaster,
  setTimeSinceAnyMessageRecieved,
  isPlayerMasterPeer,
  wrappedResolveConflicts,
  chooseNewMasterPeer,
  setMasterPeerId,
} from "./connectionHandlers.js";
import { setEndGameMessage } from "./gameLogic.js";
import {
  forces,
  setForces,
  createMineFromObject,
  createForceFromObject,
  createPowerUpFromObject,
  createEffectFromObject,
  effects,
  setEffects,
  MineType,
} from "./entities.js";
import { createBotFromObject, Player } from "./player.js";
import { differsFrom, findForceById, findBotById, findMineById, findPowerUpById, findEffectById } from "./gameUtils.js";
import { sendPlayerStates, sendEntitiesState } from "./sendData.js";
const interpFactor = 0.05;
const threshold = 50;
const velocityInterpFactor = 0.4;
const velocityThreshold = 2;

export function handleData(player, otherPlayers, globalPowerUps, data) {
  setTimeSinceAnyMessageRecieved(0);
  const currentTimestamp = Date.now();
  const messageTimestamp = data.timestamp;
  // let timeThreshold = 2 * fixedDeltaTime;
  let timeThreshold = 20;
  if (data.priority < 3) {
    timeThreshold = 30;
  }
  if (data.priority < 2) {
    timeThreshold = 60;
  }
  let timeDifference = currentTimestamp - messageTimestamp;
  if (timeDifference > timeThreshold) {
    //lets try not ignoring old messages
    //return;
  }

  let otherPlayer = otherPlayers.find((player) => player.id === data.id);
  if (otherPlayer) {
    otherPlayer.timeSinceSentMessageThatWasRecieved = 0;
  }
  if (isPlayerMasterPeer(player) && data.isMaster) {
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps, true);
    console.log("master conflict");
    return;
  }
  if (data.requestForFullStates) {
    sendPlayerStates(player, isPlayerMasterPeer(player), true);
    return;
  }
  if (data.requestFullUpdate && isPlayerMasterPeer(player) && ticksSinceLastConnectionAttempt > 200) {
    setTicksSinceLastConnectionAttempt(0);
    sendEntitiesState(player, isPlayerMasterPeer(player), true);
    return;
  }

  if (!otherPlayer) {
    otherPlayer = findBotById(data.id);
  }
  if (otherPlayer) {
    updateOtherPlayerData(otherPlayer, data, otherPlayers, globalPowerUps, player);
  } // If the player is not found, add them to the array
  else if (data.id && data.id != player.id && !data.isBot) {
    let newPlayer = new Player(data.id, data.x, data.y, data.powerUps, data.color, data.angle, data.pilot, data.name, data.isPlaying, true);
    otherPlayers.push(newPlayer);
    if (!connectedPeers.includes(data.id)) {
      connectedPeers.push(data.id);
    }
    connectedPeers.sort();

    setMasterPeerId(chooseNewMasterPeer(player, otherPlayers));
  } else if (data.id && data.id == player.id) {
    // // If this is our own data, update key properties from the master, not position, velocity, etc.
    updateOwnPlayerData(player, data);
  }

  updateGlobalPowerUps(data, globalPowerUps);
  removeGlobalPowerUps(data, globalPowerUps);

  updateBots(data, bots);
  removeBots(data, bots);

  updateMines(data, mines);
  removeMines(data, mines);

  updateEffects(data, effects);
  removeEffects(data, effects);

  updateForces(data, player, forces, player.id);
  removeForces(data, forces);
  //don't curently send this data could be used for master to send out key properties of otherplayers (score,kills etc.. not pos,vel etc)
  if (data.otherPlayers && data.otherPlayers.length > 0) {
    setTimeSinceMessageFromMaster(0);
    const dataPlayer = data.otherPlayers.find((otherPlayer) => otherPlayer.id === player.id);

    if (dataPlayer != null) {
      player.kills = dataPlayer.kills;
      player.setIsDead(dataPlayer.isDead);
      player.lives = dataPlayer.lives;
      player.powerUps = dataPlayer.powerUps;
      player.ticksSincePowerUpCollection = dataPlayer.ticksSincePowerUpCollection;
      player.setInvincibleTimer(dataPlayer.invincibleTimer);
      if (dataPlayer.hitBy != null && dataPlayer.hitBy != "" && player.isDead) {
        player.hitBy = dataPlayer.hitBy;
        setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
      } else if (player.isDead) {
        setEndGameMessage("Score: " + player.powerUps * 100);
      }
      player.killed = dataPlayer.killed;
      player.killedBy = dataPlayer.killedBy;
    }
    //we will just replace select properties of otherplayers from the master
    for (let otherPlayer of otherPlayers) {
      const foundDataOtherPlayer = data.otherPlayers.find((dataOtherPlayer) => dataOtherPlayer.id === otherPlayer.id);
      if (foundDataOtherPlayer != null) {
        otherPlayer.kills = foundDataOtherPlayer.kills;
        otherPlayer.setIsDead(foundDataOtherPlayer.isDead);
        otherPlayer.lives = foundDataOtherPlayer.lives;
        otherPlayer.powerUps = foundDataOtherPlayer.powerUps;
        otherPlayer.ticksSincePowerUpCollection = foundDataOtherPlayer.ticksSincePowerUpCollection;
        otherPlayer.setInvincibleTimer(foundDataOtherPlayer.invincibleTimer);
      }
    }
  }

  if (data.connectedPeers && data.connectedPeers.length > 0) {
    //we don't currently send peer data, need to review this if we add peer sharing back, particually attemptConnections
    //check if connectedPeers has any id's (strings) not in data.connectedPeers
    let combine = false;
    if (differsFrom(connectedPeers, data.connectedPeers)) {
      combine = true;
    }

    //then check if data.connectedPeers has any id's (strings) not in connectedPeers
    if (differsFrom(data.connectedPeers, connectedPeers)) {
      combine = true;
    }

    if (combine) {
      // Combine the arrays and set connectedPeers = the combined array
      setConnectedPeers([...new Set([...data.connectedPeers, ...connectedPeers])]);
      // connectedPeers.forEach((connectedID) => {
      //   connection.
      // });
      setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
      sendConnectedPeers();
    }
  }
}

function updateOtherPlayerData(otherPlayer, data, otherPlayers, globalPowerUps, player) {
  if (!otherPlayer) return;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "name") {
        if (data.name != null && data.name != "") {
          otherPlayer.name = data.name;
        }
      } else if (key === "pilot") {
        if (data.pilot != null && data.pilot != "") {
          otherPlayer.pilot = data.pilot;
        }
      } else if (key === "x" || key === "y") {
        //check if the gap is closer than the threshold
        if (Math.abs(otherPlayer[key] - data[key]) <= threshold) {
          // Interpolate x and y values
          otherPlayer[key] += (data[key] - otherPlayer[key]) * interpFactor;
        } else {
          // Update x and y values directly
          otherPlayer[key] = data[key];
        }
      } else if (key === "powerUps") {
        if (otherPlayer.ticksSincePowerUpCollection > -1 && otherPlayer.powerUps < data.powerUps) {
          console.log("possible double powerup collection attempt?");
        } else {
          otherPlayer[key] = data[key];
        }
      } else if (key === "isDead") {
        otherPlayer.setIsDead(data.isDead);
      } else if (key === "invincibleTimer") {
        otherPlayer.setInvincibleTimer(data.invincibleTimer);
      } else if (key === "comboScaler") {
        otherPlayer.setComboScaler(data.comboScaler);
      } else if (key === "velX" || key === "velY") {
        // Check if velocities are further apart than the threshold
        if (Math.abs(otherPlayer[key] - data[key]) > velocityThreshold) {
          // Interpolate velocities
          otherPlayer[key] += (data[key] - otherPlayer[key]) * velocityInterpFactor;
        } else {
          // Update velocities directly
          otherPlayer[key] = data[key];
        }
      } else {
        otherPlayer[key] = data[key];
      }
    }
  }

  if (isPlayerMasterPeer(player) && isPlayerMasterPeer(otherPlayer) && !otherPlayer.isBot) {
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps, true);
  }
}

function updateOwnPlayerData(player, data) {
  if (!player || !data.id || data.id !== player.id) return;

  if (data.hasOwnProperty("powerUps")) {
    if (player.ticksSincePowerUpCollection > -1 && player.powerUps < data.powerUps) {
      console.log("possible double powerup collection attempt? (own data)");
    } else {
      player.powerUps = data.powerUps;
    }
    // setGameOverText(player);
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("comboScaler")) {
    player.setComboScaler(data.comboScaler);
  }
  if (data.hasOwnProperty("isDead")) {
    player.setIsDead(data.isDead);
    if (data.isDead) {
      player.vel.x = 0;
      player.vel.y = 0;
    }
  }
  if (data.hasOwnProperty("lives")) {
    player.lives = data.lives;
  }
  if (data.hasOwnProperty("hitBy")) {
    player.hitBy = data.hitBy;
    player.updateKilledAndKilledByLists(player.hitBy);
    // setGameOverText(player);
  }
  if (data.hasOwnProperty("kills")) {
    player.kills = data.kills;
  }
  if (data.hasOwnProperty("killed")) {
    player.killed = data.killed;
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("killedBy")) {
    player.killedBy = data.killedBy;
    player.updateKilledAndKilledByLists(player.hitBy);
  }
  if (data.hasOwnProperty("invincibleTimer")) {
    player.setInvincibleTimer(data.invincibleTimer);
  }
  if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
    player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  }
  if (data.hasOwnProperty("recentScoreTicks")) {
    player.recentScoreTicks = data.recentScoreTicks;
  }
  if (data.hasOwnProperty("recentScoreText")) {
    player.recentScoreText = data.recentScoreText;
  }
  if (data.hasOwnProperty("recentKillScoreText")) {
    player.recentKillScoreText = data.recentKillScoreText;
  }
}

function setGameOverText(player) {
  if (player.hitBy != null && player.hitBy != "") {
    setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
  } else {
    setEndGameMessage("Score: " + player.powerUps * 100);
  }
}
function updateGlobalPowerUps(data, globalPowerUps) {
  if (data.globalPowerUps && data.globalPowerUps.length > 0) {
    for (const receivedPowerUp of data.globalPowerUps) {
      // Find the corresponding local powerup by ID
      const localPowerUp = findPowerUpById(receivedPowerUp.id);

      if (localPowerUp) {
        const xDiff = Math.abs(receivedPowerUp.x - localPowerUp.x);
        const yDiff = Math.abs(receivedPowerUp.y - localPowerUp.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localPowerUp.x = localPowerUp.x + (receivedPowerUp.x - localPowerUp.x) * interpFactor;
          localPowerUp.y = localPowerUp.y + (receivedPowerUp.y - localPowerUp.y) * interpFactor;
        } else {
          // Update x and y values directly
          localPowerUp.x = receivedPowerUp.x;
          localPowerUp.y = receivedPowerUp.y;
        }
        localPowerUp.color = receivedPowerUp.color;
        localPowerUp.isStar = receivedPowerUp.isStar;
        localPowerUp.value = receivedPowerUp.value;
        localPowerUp.radius = receivedPowerUp.radius;
        localPowerUp.hitFrames = receivedPowerUp.hitFrames;
      } else {
        // If the local powerup doesn't exist, add it to the globalPowerUps array
        globalPowerUps.push(createPowerUpFromObject(receivedPowerUp));
      }
    }
  }
  if (data.fullSend && data.globalPowerUps) {
    // Create a new globalPowerUps array by filtering only the powerUps that exist in data.globalPowerUps
    const updatedGlobalPowerUps = globalPowerUps.filter(
      (powerUpToCheck) => powerUpToCheck.id == null || data.globalPowerUps.some((dataPowerUp) => dataPowerUp.id === powerUpToCheck.id)
    );

    // Update the globalPowerUps array once
    setGlobalPowerUps(updatedGlobalPowerUps);
  }
}

function removeGlobalPowerUps(data, globalPowerUps) {
  if (data.removePowerUps && data.removePowerUps.length > 0) {
    let filteredPowerUps = [...globalPowerUps]; // Create a copy of the original globalPowerUps array

    for (let dataPowerUp of data.removePowerUps) {
      if (dataPowerUp.id != null) {
        const matchingPowerUpIndex = filteredPowerUps.findIndex((currentPowerUp) => currentPowerUp.id === dataPowerUp.id);
        if (matchingPowerUpIndex !== -1) {
          filteredPowerUps.splice(matchingPowerUpIndex, 1);
        }
      }
    }

    // Update the globalPowerUps array once after the loop
    setGlobalPowerUps(filteredPowerUps);
  }
}

function updateMines(data, mines) {
  if (data.mines && data.mines.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedMine of data.mines) {
      // Find the corresponding local bot by ID
      const localMine = findMineById(receivedMine.id);

      if (localMine) {
        const xDiff = Math.abs(receivedMine.x - localMine.x);
        const yDiff = Math.abs(receivedMine.y - localMine.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localMine.x = localMine.x + (receivedMine.x - localMine.x) * interpFactor;
          localMine.y = localMine.y + (receivedMine.y - localMine.y) * interpFactor;
        } else {
          // Update x and y values directly
          localMine.x = receivedMine.x;
          localMine.y = receivedMine.y;
        }
        localMine.force = receivedMine.force;
        localMine.duration = receivedMine.duration;
        localMine.radius = receivedMine.radius;
        localMine.hitFrames = receivedMine.hitFrames;
        localMine.color = receivedMine.color;
        localMine.mineType = receivedMine.mineType;
        localMine.playerId = receivedMine.playerId;
        if (localMine.mineType == MineType.FREE_MINE || localMine.mineType == MineType.TRAIL) {
          if (receivedMine.angle) {
            localMine.angle = receivedMine.angle;
          }
          if (localMine.mineType == MineType.FREE_MINE) {
            if (receivedMine.points && receivedMine.points.length > 0) localMine.points = receivedMine.points;
          }
        }
      } else {
        // If the local mine doesn't exist, add it to the mines array
        mines.push(createMineFromObject(receivedMine));
      }
    }
  }
  if (data.fullSend && data.mines) {
    // Create a new mines array by filtering only the mines that exist in data.mines
    const updatedMines = mines.filter(
      (mineToCheck) => /^trail-/.test(mineToCheck.id) || mineToCheck.id == null || data.mines.some((dataMine) => dataMine.id === mineToCheck.id)
    );

    // Update the mines array once
    setMines(updatedMines);
  }
}

function removeMines(data, mines) {
  if (data.removeMines && data.removeMines.length > 0) {
    let filteredMines = [...mines]; // Create a copy of the original mines array

    for (let dataMine of data.removeMines) {
      if (dataMine.id != null) {
        filteredMines = filteredMines.filter((mine) => mine.id !== dataMine.id);
      }
    }

    // Update the mines array once after the loop
    setMines(filteredMines);
  }
}

function updateEffects(data, effects) {
  if (data.effects && data.effects.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedEffect of data.effects) {
      // Find the corresponding local bot by ID
      const localEffect = findEffectById(receivedEffect.id);

      if (localEffect) {
        const xDiff = Math.abs(receivedEffect.x - localEffect.x);
        const yDiff = Math.abs(receivedEffect.y - localEffect.y);

        if (xDiff <= threshold && yDiff <= threshold) {
          // Interpolate x and y values
          localEffect.x = localEffect.x + (receivedEffect.x - localEffect.x) * interpFactor;
          localEffect.y = localEffect.y + (receivedEffect.y - localEffect.y) * interpFactor;
        } else {
          // Update x and y values directly
          localEffect.x = receivedEffect.x;
          localEffect.y = receivedEffect.y;
        }
        localEffect.radius = receivedEffect.radius;
        localEffect.duration = receivedEffect.duration;
        localEffect.color = receivedEffect.color;
        localEffect.type = receivedEffect.type;
      } else {
        // If the local effects doesn't exist, add it to the effects array
        effects.push(createEffectFromObject(receivedEffect));
      }
    }
  }
  if (data.fullSend && data.effects) {
    // Create a new effects array by filtering only the effects that exist in data.effects
    const updatedEffects = effects.filter(
      (effectToCheck) => effectToCheck.id == null || data.effects.some((dataEffect) => dataEffect.id === effectToCheck.id)
    );

    // Update the effects array once
    setEffects(updatedEffects);
  }
}

function removeEffects(data, effects) {
  if (data.removeEffects && data.removeEffects.length > 0) {
    let filteredEffects = [...effects]; // Create a copy of the original effects array

    for (let dataEffect of data.removeEffects) {
      if (dataEffect.id != null) {
        filteredEffects = filteredEffects.filter((effect) => effect.id !== dataEffect.id);
      }
    }

    // Update the effects array once after the loop
    setEffects(filteredEffects);
  }
}

function updateBots(data, bots) {
  if (data.bots && data.bots.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedBot of data.bots) {
      // Find the corresponding local bot by ID
      const localBot = findBotById(receivedBot.id);

      if (localBot) {
        if (localBot.isDead && !receivedBot.isDead) {
          //if we are getting respawn info just set the new coordinates
          localBot.x = receivedBot.x;
          localBot.y = receivedBot.y;
          localBot.vel.x = receivedBot.vel.x;
          localBot.vel.y = receivedBot.vel.y;
        } else {
          // else interpolate to smooth the update
          const xDiff = Math.abs(receivedBot.x - localBot.x);
          const yDiff = Math.abs(receivedBot.y - localBot.y);

          if (xDiff <= threshold && yDiff <= threshold) {
            // Interpolate x and y values
            localBot.x = localBot.x + (receivedBot.x - localBot.x) * interpFactor;
            localBot.y = localBot.y + (receivedBot.y - localBot.y) * interpFactor;
          } else {
            // Update x and y values directly
            localBot.x = receivedBot.x;
            localBot.y = receivedBot.y;
          }

          // Check if velocities are further apart than the threshold
          const velXDiff = Math.abs(receivedBot.vel.x - localBot.vel.x);
          const velYDiff = Math.abs(receivedBot.vel.y - localBot.vel.y);

          if (velXDiff > velocityThreshold || velYDiff > velocityThreshold) {
            // Interpolate velocities
            localBot.vel.x = localBot.vel.x + (receivedBot.vel.x - localBot.vel.x) * velocityInterpFactor;
            localBot.vel.y = localBot.vel.y + (receivedBot.vel.y - localBot.vel.y) * velocityInterpFactor;
          } else {
            // Update velocities directly
            localBot.vel.x = receivedBot.vel.x;
            localBot.vel.y = receivedBot.vel.y;
          }
        }
        localBot.setIsDead(receivedBot.isDead);

        // Don't interpolate the angle because that can naturally change very sharply
        localBot.angle = receivedBot.angle;
        localBot.currentSpeed = receivedBot.currentSpeed;
        localBot.timeOfLastActive = receivedBot.timeOfLastActive;
        localBot.playerAngleData = receivedBot.playerAngleData;
        localBot.mousePosX = receivedBot.mousePosX;
        localBot.mousePosY = receivedBot.mousePosY;
        localBot.isPlaying = receivedBot.isPlaying;
        localBot.special = receivedBot.special;
        localBot.distanceFactor = receivedBot.distanceFactor;
        localBot.lives = receivedBot.lives;
        localBot.space = receivedBot.space;
        localBot.shift = receivedBot.shift;
        if (receivedBot.resetting != null) {
          localBot.resetting = receivedBot.resetting;
        }
        localBot.u = receivedBot.u;
        localBot.forceCoolDown = receivedBot.forceCoolDown;
        localBot.setComboScaler(receivedBot.comboScaler);
        localBot.kills = receivedBot.kills;
        localBot.ticksSincePowerUpCollection = receivedBot.ticksSincePowerUpCollection;
        localBot.timeSinceSpawned = receivedBot.timeSinceSpawned;
        localBot.botState = receivedBot.botState;
        localBot.target = receivedBot.target;
        localBot.followingPlayerID = receivedBot.followingPlayerID;
        localBot.previousAngleDifference = receivedBot.previousAngleDifference;
        localBot.previousTurnDirection = receivedBot.previousTurnDirection;
        localBot.setInvincibleTimer(receivedBot.invincibleTimer);
        localBot.forceCoolDown = receivedBot.forceCoolDown;
        localBot.playerAngleData = receivedBot.playerAngleData;
        localBot.mousePosX = receivedBot.mousePosX;
        localBot.mousePosY = receivedBot.mousePosY;
        if (receivedBot.name != null && receivedBot.name != "") {
          localBot.name = receivedBot.name;
        }
        if (receivedBot.inForce != null) {
          localBot.inForce = receivedBot.inForce;
        }
      } else {
        // If the local bot doesn't exist, add it to the bots array
        bots.push(createBotFromObject(receivedBot));
      }
    }

    updateBotsFromFullSend(data, bots);
    // This ensures that local bots that have been removed on the master peer are also removed locally
    setBots(bots.filter((localBot) => data.bots.some((receivedBot) => receivedBot.id === localBot.id)));
  }
}

function updateBotsFromFullSend(data, bots) {
  if (data.fullSend && data.bots) {
    // Create a new bots array by filtering only the bots that exist in data.bots
    const updatedBots = bots.filter((botToCheck) => botToCheck.id == null || data.bots.some((dataBot) => dataBot.id === botToCheck.id));

    // Update the bots array once
    setBots(updatedBots);
  }
}

function removeBots(data, bots) {
  if (data.removeBots && data.removeBots.length > 0) {
    for (let dataBot of data.removeBots) {
      if (dataBot.id != null) {
        let matchingBot = bots.find((currentBot) => currentBot.id === dataBot.id);
        if (matchingBot == null) {
          setBots(bots.filter((bot) => bot.id !== dataBot.id));
        }
      }
    }
  }
}

function updateLocalForce(localForce, receivedForce, playerId) {
  if (localForce.tracks == null || localForce.tracks.id != playerId) {
    const xDiff = Math.abs(receivedForce.x - localForce.x);
    const yDiff = Math.abs(receivedForce.y - localForce.y);

    if (xDiff <= threshold && yDiff <= threshold) {
      // Interpolate x and y values
      localForce.x = localForce.x + (receivedForce.x - localForce.x) * interpFactor;
      localForce.y = localForce.y + (receivedForce.y - localForce.y) * interpFactor;
    } else {
      // Update x and y values directly
      localForce.x = receivedForce.x;
      localForce.y = receivedForce.y;
    }

    localForce.force = receivedForce.force;
    localForce.duration = receivedForce.duration;
    localForce.radius = receivedForce.radius;
    localForce.isAttractive = receivedForce.isAttractive;
    localForce.color = receivedForce.color;
    localForce.tracks = receivedForce.tracks;
    localForce.coneAngle = receivedForce.coneAngle;
    localForce.direction = receivedForce.direction;
    localForce.type = receivedForce.type;
    localForce.width = receivedForce.width;
    localForce.length = receivedForce.length;
    localForce.numberArrowsEachSide = receivedForce.numberArrowsEachSide;
    localForce.numberArrowsDeep = receivedForce.numberArrowsDeep;
  }
}

function updateForces(data, player, forces, playerId) {
  if (data.forces && data.forces.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedForce of data.forces) {
      // Find the corresponding local bot by ID
      const localForce = findForceById(receivedForce.id);
      if (localForce) {
        updateLocalForce(localForce, receivedForce, playerId);
      } else if (receivedForce.tracks == null || receivedForce.tracks.id != player.id) {
        // If the local force doesn't exist, add it to the forces array
        forces.push(createForceFromObject(receivedForce));
      }
    }

    if (data.fullSend && data.forces) {
      // Create a new forces array by filtering only the forces that exist in data.forces
      const updatedForces = forces.filter(
        (forceToCheck) => forceToCheck.id == null || data.forces.some((dataForce) => dataForce.id === forceToCheck.id)
      );

      // Update the forces array once
      setForces(updatedForces);
    }
  }
}

function removeForces(data, forces) {
  if (data.removeForces && data.removeForces.length > 0) {
    let filteredForces = [...forces];
    for (let dataForce of data.removeForces) {
      if (dataForce.id != null) {
        filteredForces = filteredForces.filter((force) => force.id !== dataForce.id);
      }
    }
    // Update the forces array once after the loop
    setForces(filteredForces);
  }
}
