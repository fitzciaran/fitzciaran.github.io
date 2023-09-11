import { setGlobalPowerUps, player, otherPlayers, bots, mines, setBots, setMines, setOtherPlayers } from "./astroids.js";
import {
  connections,
  connectedPeers,
  setConnectedPeers,
  timeSinceMessageFromMaster,
  setTimeSinceMessageFromMaster,
  setTimeSinceAnyMessageRecieved,
  isPlayerMasterPeer,
  wrappedResolveConflicts,
  chooseNewMasterPeer,
  setMasterPeerId,
} from "./connectionHandlers.js";
import { setEndGameMessage } from "./gameLogic.js";
import { forces, setForces, createMineFromObject, createForceFromObject, createPowerUpFromObject } from "./entities.js";
import { createBotFromObject, Player, createPlayerFromObject } from "./player.js";

let handleCounter = 0;
let sendCounter = 0;

export function sendPlayerStates(playerToSend, globalPowerUps) {
  // Check if connection is open before sending data
  // Send player state to other players
  let data = {
    id: playerToSend.id,
    x: playerToSend.x,
    y: playerToSend.y,
    powerUps: playerToSend.powerUps,
    color: playerToSend.color,
    angle: playerToSend.angle,
    pilot: playerToSend.pilot,
    isBot: playerToSend.isBot,
    special: playerToSend.special,
    name: playerToSend.name,
    lives: playerToSend.lives,
    isMaster: playerToSend.isMaster,
    isDead: playerToSend.isDead,
    isPlaying: playerToSend.isPlaying,
    invincibleTimer: playerToSend.invincibleTimer,
    forceCoolDown: playerToSend.forceCoolDown,
    comboScaler: playerToSend.comboScaler,
    kills: playerToSend.kills,
    playerAngleData: playerToSend.playerAngleData,
    mousePosX: playerToSend.mousePosX,
    mousePosY: playerToSend.mousePosY,
    currentSpeed: playerToSend.currentSpeed,
    vel: playerToSend.vel,
    distanceFactor: playerToSend.distanceFactor,
    space: playerToSend.space,
    shift: playerToSend.shift,
    ticksSincePowerUpCollection: playerToSend.ticksSincePowerUpCollection,
    targetedBy: playerToSend.targetedBy,
    timeOfLastActive: playerToSend.timeOfLastActive,
    hitBy: playerToSend.hitBy,
  };
  connections.forEach((conn) => {
    if (conn && conn.open) {
      try {
        conn.send(data);
        sendCounter++;
        // Log the data every 1000 calls
        if (sendCounter === 5000) {
          // console.log("sending data:", data);
          sendCounter = 0; // reset the counter
        }
      } catch (error) {
        console.error("Error sending data:", error);
      }
    }
  });
}

export function sendGameState(globalPowerUps) {
  // Send game state to other player
  let data = {
    gameState: true,
    globalPowerUps: globalPowerUps,
    //enemies and stuff here
  };

  //console.log("Sending data:", data); // Log any data sent
  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        //console.log("sending game state data:", data);
        sendCounter = 0; // reset the counter
      }
    }
  });
}

export function sendEntitiesState(bots) {
  // Send game state to other player
  let data = {
    gameState: true,
    bots: bots,
    mines: mines,
    // otherPlayers: otherPlayers,
    forces: forces,
    // connectedPeers: connectedPeers,
    //enemies and stuff here
  };

  //console.log("Sending data:", data); // Log any data sent
  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        //console.log("sending entities state data:", data);
        sendCounter = 0; // reset the counter
      }
    }
  });
}

export function sendConnectedPeers() {
  // Send game state to other player
  let data = {
    gameState: true,
    //todo this could be the issue
    //connectedPeers: connectedPeers,
    //enemies and stuff here
  };

  //console.log("Sending data:", data); // Log any data sent
  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        //console.log("sending bots state data:", data);
        sendCounter = 0; // reset the counter
      }
    }
  });
}

export function handleData(player, otherPlayers, globalPowerUps, data) {
  setTimeSinceAnyMessageRecieved(0);
  //console.log("handling data:");
  // Find the otherPlayer in the array
  let otherPlayer = otherPlayers.find((player) => player.id === data.id);
  if (!otherPlayer) {
    otherPlayer = findBotById(data.id);
  }
  // If the player is found, update their data
  if (otherPlayer) {
    otherPlayer.timeSinceSentMessageThatWasRecieved = 0;
    otherPlayer.x = data.x;
    otherPlayer.y = data.y;
    otherPlayer.powerUps = data.powerUps;
    otherPlayer.color = data.color;
    otherPlayer.angle = data.angle;
    otherPlayer.pilot = data.pilot;
    otherPlayer.isBot = data.isBot;
    otherPlayer.special = data.special;
    otherPlayer.name = data.name;
    otherPlayer.lives = data.lives;
    otherPlayer.isMaster = data.isMaster;
    otherPlayer.setIsDead(data.isDead);
    otherPlayer.isPlaying = data.isPlaying;
    otherPlayer.setInvincibleTimer(data.invincibleTimer);
    otherPlayer.forceCoolDown = data.forceCoolDown;
    otherPlayer.comboScaler = data.comboScaler;
    otherPlayer.kills = data.kills;
    otherPlayer.playerAngleData = data.playerAngleData;
    otherPlayer.mousePosX = data.mousePosX;
    otherPlayer.mousePosY = data.mousePosY;
    otherPlayer.currentSpeed = data.currentSpeed;
    otherPlayer.vel = data.vel;
    otherPlayer.distanceFactor = data.distanceFactor;
    otherPlayer.space = data.space;
    otherPlayer.shift = data.shift;
    otherPlayer.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
    otherPlayer.targetedBy = data.targetedBy;
    otherPlayer.timeOfLastActive = data.timeOfLastActive;
    otherPlayer.hitBy = data.hitBy;

    if (isPlayerMasterPeer(player) && otherPlayer.isMaster && !otherPlayer.isBot) {
      wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
    }
  }
  // If the player is not found, add them to the array
  else if (data.id && data.id != player.id && !data.isBot) {
    let newPlayer = new Player(data.id, data.x, data.y, data.powerUps, data.color, data.angle, data.pilot, data.name, data.isPlaying, true);
    otherPlayers.push(newPlayer);
    if (!connectedPeers.includes(data.id)) {
      connectedPeers.push(data.id);
    }
    connectedPeers.sort();

    setMasterPeerId(chooseNewMasterPeer(player, otherPlayers));
    // if (data.powerUps > pointsToWin) {
    //   checkWinner(otherPlayer, otherPlayers);
    // }
  } else if (data.id && data.id == player.id) {
    //if this is our own data we only update key properties from the master, not position, velocity etc
    player.powerUps = data.powerUps;
    player.comboScaler = data.comboScaler;
    player.setIsDead(data.isDead);
    if (data.isDead) {
      player.vel.x = 0;
      player.vel.y = 0;
    }
    player.lives = data.lives;
    player.hitBy = data.hitBy;
    player.kills = data.kills;
    player.setInvincibleTimer(data.invincibleTimer);
    player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
    player.powerUps = data.powerUps;
    setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
  }
  // Only update the powerups if the received data contains different powerups
  if (data.globalPowerUps && JSON.stringify(globalPowerUps) !== JSON.stringify(data.globalPowerUps)) {
    const powerUpInstances = data.globalPowerUps.map(createPowerUpFromObject);
    setGlobalPowerUps(powerUpInstances);
  }
  if (data.bots) {
    setTimeSinceMessageFromMaster(0);
    const botInstances = data.bots.map(createBotFromObject);
    // setBots(botInstances);

    // Iterate through botInstances received from the master peer
    for (const receivedBot of botInstances) {
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
        localBot.u = receivedBot.u;
        localBot.forceCoolDown = receivedBot.forceCoolDown;
        localBot.comboScaler = receivedBot.comboScaler;
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
        localBot.name = receivedBot.name;
      } else {
        // If the local bot doesn't exist, add it to the bots array
        bots.push(receivedBot);
      }
    }

    // Optionally, you may want to remove bots from the local array that are not in botInstances
    // This ensures that local bots that have been removed on the master peer are also removed locally
    //bots = bots.filter((localBot) => botInstances.some((receivedBot) => receivedBot.id === localBot.id));
    setBots(bots.filter((localBot) => botInstances.some((receivedBot) => receivedBot.id === localBot.id)));
  }
  if (data.mines) {
    setTimeSinceMessageFromMaster(0);
    //const mineInstances = data.mines.map(createMineFromObject);
    //setMines(mineInstances);
    for (const receivedMine of data.mines) {
      // Find the corresponding local bot by ID
      const localMine = findMineById(receivedMine.id);
      const interpFactor = 0.2;
      if (localMine) {
        //if the local force is the current local players force don't need to update it
        // If the local force exists, interpolate its position
        // This assumes you have a variable for interpolation factor (e.g., interpFactor)
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
  if (data.forces) {
    setTimeSinceMessageFromMaster(0);
    const forceInstances = data.forces.map(createForceFromObject);
    // setForces(forceInstances);
    // Iterate through forceInstances received from the master peer
    for (const receivedForce of forceInstances) {
      // Find the corresponding local bot by ID
      const localForce = findForceById(receivedForce.id);
      const interpFactor = 0.2;
      if (localForce) {
        if (localForce.tracks.id != player.id) {
          //if the local force is the current local players force don't need to update it
          // If the local force exists, interpolate its position
          // This assumes you have a variable for interpolation factor (e.g., interpFactor)
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
        } else {
          console.log("currentplayers force");
        }
      } else if (receivedForce.tracks.id != player.id) {
        // If the local force doesn't exist, add it to the forces array
        forces.push(receivedForce);
      }
    }
  }
  if (data.otherPlayers) {
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
      }
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

  if (data.connectedPeers) {
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
  //   handleCounter++;
  //   // Log the data every 1000 calls
  //   if (handleCounter === 1000) {
  //     console.log("handling data:", data);
  //     handleCounter = 0; // reset the counter
  //   }
}

// Function to find a bot by ID in the bots array
function findBotById(id) {
  return bots.find((bot) => bot.id === id);
}

// Function to find a force by ID in the forces array
function findForceById(id) {
  return forces.find((force) => force.id === id);
}
// Function to find a bot by ID in the bots array
function findMineById(id) {
  return mines.find((mine) => mine.id === id);
}

function differsFrom(firstArray, secondArray) {
  // Convert the second array to a Set for efficient lookup
  const secondArraySet = new Set(secondArray);

  // Check if any element in the first array is not in the second array
  for (const element of firstArray) {
    if (!secondArraySet.has(element)) {
      return true; // Found a value in the first array that's not in the second array
    }
  }
  return false; // All values in the first array are also in the second array
}
