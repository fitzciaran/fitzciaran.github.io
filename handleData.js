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
import { forces, setForces, createMineFromObject, createForceFromObject, createPowerUpFromObject } from "./entities.js";
import { createBotFromObject, Player } from "./player.js";
import { differsFrom, findForceById, findBotById, findMineById, findPowerUpById } from "./gameUtils.js";
import { sendPlayerStates } from "./sendData.js";

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
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
    console.log("master conflict");
    return;
  }
  if (data.requestForFullStates) {
    sendPlayerStates(player, isPlayerMasterPeer(player), true);
    return;
  }
  //console.log("handling data:");
  // Find the otherPlayer in the array

  if (!otherPlayer) {
    otherPlayer = findBotById(data.id);
  }
  if (otherPlayer) {
    updateOtherPlayerData(otherPlayer, data);
  }
  // // If the player is found, update their data
  // if (otherPlayer) {
  //   if (data.hasOwnProperty("x")) {
  //     otherPlayer.x = data.x;
  //   }
  //   if (data.hasOwnProperty("y")) {
  //     otherPlayer.y = data.y;
  //   }
  //   if (data.hasOwnProperty("powerUps")) {
  //     otherPlayer.powerUps = data.powerUps;
  //   }
  //   if (data.hasOwnProperty("color")) {
  //     otherPlayer.color = data.color;
  //   }
  //   if (data.hasOwnProperty("angle")) {
  //     otherPlayer.angle = data.angle;
  //   }
  //   if (data.hasOwnProperty("devMode")) {
  //     otherPlayer.devMode = data.devMode;
  //   }
  //   if (data.hasOwnProperty("pilot")) {
  //     otherPlayer.pilot = data.pilot;
  //   }
  //   if (data.hasOwnProperty("isBot")) {
  //     otherPlayer.isBot = data.isBot;
  //   }
  //   if (data.hasOwnProperty("special")) {
  //     otherPlayer.special = data.special;
  //   }
  //   if (data.hasOwnProperty("name")) {
  //     if (data.name != null && data.name != "") {
  //       otherPlayer.name = data.name;
  //     }
  //   }
  //   if (data.hasOwnProperty("lives")) {
  //     otherPlayer.lives = data.lives;
  //   }
  //   if (data.hasOwnProperty("isMaster")) {
  //     otherPlayer.isMaster = data.isMaster;
  //   }
  //   if (data.hasOwnProperty("isDead")) {
  //     otherPlayer.setIsDead(data.isDead);
  //   }
  //   if (data.hasOwnProperty("isPlaying")) {
  //     otherPlayer.isPlaying = data.isPlaying;
  //   }
  //   if (data.hasOwnProperty("invincibleTimer")) {
  //     otherPlayer.setInvincibleTimer(data.invincibleTimer);
  //   }
  //   if (data.hasOwnProperty("forceCoolDown")) {
  //     otherPlayer.forceCoolDown = data.forceCoolDown;
  //   }
  //   if (data.hasOwnProperty("comboScaler")) {
  //     otherPlayer.setComboScaler(data.comboScaler);
  //   }
  //   if (data.hasOwnProperty("kills")) {
  //     otherPlayer.kills = data.kills;
  //   }
  //   if (data.hasOwnProperty("playerAngleData")) {
  //     otherPlayer.playerAngleData = data.playerAngleData;
  //   }
  //   if (data.hasOwnProperty("mousePosX")) {
  //     otherPlayer.mousePosX = data.mousePosX;
  //   }
  //   if (data.hasOwnProperty("mousePosY")) {
  //     otherPlayer.mousePosY = data.mousePosY;
  //   }
  //   if (data.hasOwnProperty("currentSpeed")) {
  //     otherPlayer.currentSpeed = data.currentSpeed;
  //   }
  //   if (data.hasOwnProperty("vel")) {
  //     otherPlayer.vel = data.vel;
  //   }
  //   if (data.hasOwnProperty("distanceFactor")) {
  //     otherPlayer.distanceFactor = data.distanceFactor;
  //   }
  //   if (data.hasOwnProperty("space")) {
  //     otherPlayer.space = data.space;
  //   }
  //   if (data.hasOwnProperty("shift")) {
  //     otherPlayer.shift = data.shift;
  //   }
  //   if (data.hasOwnProperty("resetting") && data.resetting != null) {
  //     otherPlayer.resetting = data.resetting;
  //   }
  //   if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
  //     otherPlayer.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  //   }
  //   if (data.hasOwnProperty("targetedBy")) {
  //     otherPlayer.targetedBy = data.targetedBy;
  //   }
  //   if (data.hasOwnProperty("timeOfLastActive")) {
  //     otherPlayer.timeOfLastActive = data.timeOfLastActive;
  //   }
  //   if (data.hasOwnProperty("hitBy")) {
  //     otherPlayer.hitBy = data.hitBy;
  //   }
  //   if (data.hasOwnProperty("killedBy")) {
  //     otherPlayer.killedBy = data.killedBy;
  //   }
  //   if (data.hasOwnProperty("killed")) {
  //     otherPlayer.killed = data.killed;
  //   }
  //   if (data.hasOwnProperty("recentScoreTicks")) {
  //     otherPlayer.recentScoreTicks = data.recentScoreTicks;
  //   }
  //   if (data.hasOwnProperty("recentScoreText")) {
  //     otherPlayer.recentScoreText = data.recentScoreText;
  //   }

  //   if (isPlayerMasterPeer(player) && otherPlayer.isMaster && !otherPlayer.isBot) {
  //     wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  //   }
  // }
  // If the player is not found, add them to the array
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
  // if (data.hasOwnProperty("powerUps")) {
  //   player.powerUps = data.powerUps;
  // }
  // if (data.hasOwnProperty("comboScaler")) {
  //   player.setComboScaler(data.comboScaler);
  // }

  // if (data.hasOwnProperty("lives")) {
  //   player.lives = data.lives;
  // }
  // if (data.hasOwnProperty("hitBy")) {
  //   player.hitBy = data.hitBy;
  //   // if (player.hitBy != null && player.hitBy != "") {
  //   //   setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
  //   // } else {
  //   //   setEndGameMessage("Score: " + player.powerUps * 100);
  //   // }
  //   // player.updateKilledAndKilledByLists(player.hitBy, true);
  // }
  // if (data.hasOwnProperty("kills")) {
  //   player.kills = data.kills;
  // }
  // if (data.hasOwnProperty("killed")) {
  //   player.killed = data.killed;
  // }
  // if (data.hasOwnProperty("killedBy")) {
  //   player.killedBy = data.killedBy;
  // }
  // if (data.hasOwnProperty("isDead")) {
  //   if (data.isDead && !player.isDead) {
  //     player.updateKilledAndKilledByLists(player.hitBy, true);
  //   }
  //   player.setIsDead(data.isDead);
  //   if (data.isDead) {
  //     player.vel.x = 0;
  //     player.vel.y = 0;
  //   }
  // }
  // if (data.hasOwnProperty("invincibleTimer")) {
  //   player.setInvincibleTimer(data.invincibleTimer);
  // }
  // if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
  //   player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  // }
  // if (data.hasOwnProperty("recentScoreTicks")) {
  //   player.recentScoreTicks = data.recentScoreTicks;
  // }
  // if (data.hasOwnProperty("recentScoreText")) {
  //   player.recentScoreText = data.recentScoreText;
  // }
  // } else if (data.id && data.id == player.id) {
  //   // If this is our own data, update key properties from the master, not position, velocity, etc.

  //   if (data.hasOwnProperty("powerUps")) {
  //     player.powerUps = data.powerUps;
  //   }
  //   if (data.hasOwnProperty("comboScaler")) {
  //     player.setComboScaler(data.comboScaler);
  //   }
  //   if (data.hasOwnProperty("isDead")) {
  //     player.setIsDead(data.isDead);
  //     if (data.isDead) {
  //       player.vel.x = 0;
  //       player.vel.y = 0;
  //     }
  //   }
  //   if (data.hasOwnProperty("lives")) {
  //     player.lives = data.lives;
  //   }
  //   if (data.hasOwnProperty("hitBy")) {
  //     player.hitBy = data.hitBy;
  //     if (player.hitBy != null && player.hitBy != "") {
  //       setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
  //     } else {
  //       setEndGameMessage("Score: " + player.powerUps * 100);
  //     }
  //   }
  //   if (data.hasOwnProperty("kills")) {
  //     player.kills = data.kills;
  //   }
  //   if (data.hasOwnProperty("killed")) {
  //     player.killed = data.killed;
  //   }
  //   if (data.hasOwnProperty("killedBy")) {
  //     player.killedBy = data.killedBy;
  //   }
  //   if (data.hasOwnProperty("invincibleTimer")) {
  //     player.setInvincibleTimer(data.invincibleTimer);
  //   }
  //   if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
  //     player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  //   }
  //   if (data.hasOwnProperty("recentScoreTicks")) {
  //     player.recentScoreTicks = data.recentScoreTicks;
  //   }
  //   if (data.hasOwnProperty("recentScoreText")) {
  //     player.recentScoreText = data.recentScoreText;
  //   }
  // }
  // Only update the powerups if the received data contains different powerups
  // if (data.globalPowerUps && JSON.stringify(globalPowerUps) !== JSON.stringify(data.globalPowerUps)) {
  //   const powerUpInstances = data.globalPowerUps.map(createPowerUpFromObject);
  //   setGlobalPowerUps(powerUpInstances);
  // }
  if (data.globalPowerUps && data.globalPowerUps.length > 0) {
    for (const receivedPowerUp of data.globalPowerUps) {
      // Find the corresponding local powerup by ID
      const localPowerUp = findPowerUpById(receivedPowerUp.id);
      const interpFactor = 0.2;
      if (localPowerUp) {
        localPowerUp.x = localPowerUp.x + (receivedPowerUp.x - localPowerUp.x) * interpFactor;
        localPowerUp.y = localPowerUp.y + (receivedPowerUp.y - localPowerUp.y) * interpFactor;
        localPowerUp.color = receivedPowerUp.color;
        localPowerUp.isStar = receivedPowerUp.isStar;
        localPowerUp.value = receivedPowerUp.value;
        localPowerUp.radius = receivedPowerUp.radius;
        localPowerUp.hitFrames = receivedPowerUp.hitFrames;
      } else {
        // If the local powerup doesn't exist, add it to the mines array
        globalPowerUps.push(createPowerUpFromObject(receivedPowerUp));
      }
    }
  }
  modifyGlobalPowerUps(data, globalPowerUps);

  // if (data.removePowerUps && data.removePowerUps.length > 0) {
  //   for (let dataPowerUp of data.removePowerUps) {
  //     if (dataPowerUp.id != null) {
  //       let matchingPowerUp = globalPowerUps.find((currentPowerUp) => currentPowerUp.id === dataPowerUp.id);
  //       if (matchingPowerUp == null) {
  //         setGlobalPowerUps(globalPowerUps.filter((powerUp) => powerUp.id !== dataPowerUp.id));
  //       }
  //     }
  //   }
  // }
  if (data.bots && data.bots.length > 0) {
    setTimeSinceMessageFromMaster(0);

    // Iterate through botInstances received from the master peer
    for (const receivedBot of data.bots) {
      // Find the corresponding local bot by ID
      const localBot = findBotById(receivedBot.id);
      const interpFactor = 0.2;
      if (localBot) {
        // If the local bot exists, interpolate its position
        if (localBot.isDead && !receivedBot.isDead) {
          //if we are getting respawn info just set the new coordinates
          localBot.x = receivedBot.x;
          localBot.y = receivedBot.y;
          localBot.vel.x = receivedBot.vel.x;
          localBot.vel.y = receivedBot.vel.y;
        } else {
          // else inerpolate to smooth the update
          localBot.x = localBot.x + (receivedBot.x - localBot.x) * interpFactor;
          localBot.y = localBot.y + (receivedBot.y - localBot.y) * interpFactor;
          localBot.vel.x = localBot.vel.x + (receivedBot.vel.x - localBot.vel.x) * interpFactor;
          localBot.vel.y = localBot.vel.y + (receivedBot.vel.y - localBot.vel.y) * interpFactor;
        }
        localBot.setIsDead(receivedBot.isDead);

        //don't interpolate the angle because that can natually change very sharply
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
        localBot.randomTarget = receivedBot.randomTarget;
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
        // bots.push(receivedBot);
        bots.push(createBotFromObject(receivedBot));
      }
    }

    // This ensures that local bots that have been removed on the master peer are also removed locally
    setBots(bots.filter((localBot) => data.bots.some((receivedBot) => receivedBot.id === localBot.id)));
  }
  if (data.mines && data.mines.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedMine of data.mines) {
      // Find the corresponding local bot by ID
      const localMine = findMineById(receivedMine.id);
      const interpFactor = 0.2;
      if (localMine) {
        localMine.x = localMine.x + (receivedMine.x - localMine.x) * interpFactor;
        localMine.y = localMine.y + (receivedMine.y - localMine.y) * interpFactor;
        localMine.force = receivedMine.force;
        localMine.duration = receivedMine.duration;
        localMine.radius = receivedMine.radius;
        localMine.hitFrames = receivedMine.hitFrames;
        localMine.color = receivedMine.color;
      } else {
        // If the local mine doesn't exist, add it to the mines array
        mines.push(createMineFromObject(receivedMine));
      }
    }
  }
  if (data.removeMines && data.removeMines.length > 0) {
    for (let dataMine of data.removeMines) {
      if (dataMine.id != null) {
        let matchingMine = mines.find((currentMine) => currentMine.id === dataMine.id);
        if (matchingMine == null) {
          setMines(mines.filter((mine) => mine.id !== dataMine.id));
        }
      }
    }
  }
  updateForces(data, player, forces);
  // if (data.forces && data.forces.length > 0) {
  //   setTimeSinceMessageFromMaster(0);

  //   for (const receivedForce of data.forces) {
  //     // Find the corresponding local bot by ID
  //     const localForce = findForceById(receivedForce.id);
  //     const interpFactor = 0.2;
  //     if (localForce) {
  //       if (localForce.tracks == null || localForce.tracks.id != player.id) {
  //         //if the local force is the current local players force don't need to update it
  //         // If the local force exists, interpolate its position
  //         localForce.x = localForce.x + (receivedForce.x - localForce.x) * interpFactor;
  //         localForce.y = localForce.y + (receivedForce.y - localForce.y) * interpFactor;
  //         localForce.force = receivedForce.force;
  //         localForce.duration = receivedForce.duration;
  //         localForce.radius = receivedForce.radius;
  //         localForce.isAttractive = receivedForce.isAttractive;
  //         localForce.color = receivedForce.color;
  //         localForce.tracks = receivedForce.tracks;
  //         localForce.coneAngle = receivedForce.coneAngle;
  //         localForce.direction = receivedForce.direction;
  //         localForce.type = receivedForce.type;
  //         localForce.width = receivedForce.width;
  //         localForce.length = receivedForce.length;
  //         localForce.numberArrowsEachSide = receivedForce.numberArrowsEachSide;
  //         localForce.numberArrowsDeep = receivedForce.numberArrowsDeep;
  //       } else {
  //         // console.log("currentplayers force");
  //       }
  //     } else if (receivedForce.tracks == null || receivedForce.tracks.id != player.id) {
  //       // If the local force doesn't exist, add it to the forces array
  //       forces.push(createForceFromObject(receivedForce));
  //     }
  //   }
  //   //if there is a force in our list that isn't in the master list remove it
  //   for (let forceToCheck of forces) {
  //     if (forceToCheck.id != null) {
  //       let matchingForce = data.forces.find((dataForce) => dataForce.id === forceToCheck.id);
  //       if (matchingForce == null) {
  //         setForces(forces.filter((force) => force.id !== forceToCheck.id));
  //       }
  //     }
  //   }
  // }
  //don't curently sent this data
  if (data.otherPlayers && data.otherPlayers.length > 0) {
    setTimeSinceMessageFromMaster(0);
    // const otherPlayersInstances = data.otherPlayers.map(createPlayerFromObject);
    //setOtherPlayers(otherPlayersInstances);
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

function updateOtherPlayerData(player, data) {
  if (!player) return;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === "name") {
        if (data.name != null && data.name != "") {
          player.name = data.name;
        }
      } else if (key === "isDead") {
        player.setIsDead(data.isDead);
      } else if (key === "invincibleTimer") {
        player.setInvincibleTimer(data.invincibleTimer);
      } else if (key === "comboScaler") {
        player.setComboScaler(data.comboScaler);
      } else {
        player[key] = data[key];
      }
    }
  }

  if (isPlayerMasterPeer(player) && player.isMaster && !player.isBot) {
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  }
}

function updateOwnPlayerData(player, data) {
  if (!player || !data.id || data.id !== player.id) return;

  if (data.hasOwnProperty("powerUps")) {
    player.powerUps = data.powerUps;
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
    if (player.hitBy != null && player.hitBy != "") {
      setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
    } else {
      setEndGameMessage("Score: " + player.powerUps * 100);
    }
  }
  if (data.hasOwnProperty("kills")) {
    player.kills = data.kills;
  }
  if (data.hasOwnProperty("killed")) {
    player.killed = data.killed;
  }
  if (data.hasOwnProperty("killedBy")) {
    player.killedBy = data.killedBy;
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
}

function modifyGlobalPowerUps(data, globalPowerUps) {
  if (data.removePowerUps && data.removePowerUps.length > 0) {
    for (let dataPowerUp of data.removePowerUps) {
      if (dataPowerUp.id != null) {
        let matchingPowerUpIndex = globalPowerUps.findIndex((currentPowerUp) => currentPowerUp.id === dataPowerUp.id);
        if (matchingPowerUpIndex !== -1) {
          globalPowerUps.splice(matchingPowerUpIndex, 1);
        }
      }
    }
  }
}

function updateLocalForce(localForce, receivedForce) {
  const interpFactor = 0.2;

  if (localForce.tracks == null || localForce.tracks.id != player.id) {
    localForce.x = localForce.x + (receivedForce.x - localForce.x) * interpFactor;
    localForce.y = localForce.y + (receivedForce.y - localForce.y) * interpFactor;
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

function updateForces(data, player, forces) {
  if (data.forces && data.forces.length > 0) {
    setTimeSinceMessageFromMaster(0);

    for (const receivedForce of data.forces) {
      // Find the corresponding local bot by ID
      const localForce = findForceById(receivedForce.id);
      if (localForce) {
        updateLocalForce(localForce, receivedForce);
      } else if (receivedForce.tracks == null || receivedForce.tracks.id != player.id) {
        // If the local force doesn't exist, add it to the forces array
        forces.push(createForceFromObject(receivedForce));
      }
    }

    // Remove forces from the local list that are not in the master list
    for (let forceToCheck of forces) {
      if (forceToCheck.id != null) {
        let matchingForce = data.forces.find((dataForce) => dataForce.id === forceToCheck.id);
        if (matchingForce == null) {
          setForces(forces.filter((force) => force.id !== forceToCheck.id));
        }
      }
    }
  }
}
