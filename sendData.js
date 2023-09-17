import { player, bots, mines, globalPowerUps } from "./main.js";
import { connections, isPlayerMasterPeer } from "./connectionHandlers.js";
import { forces, serializeForces, serializeMines, serializeGlobalPowerUps } from "./entities.js";
import { serializeBots } from "./player.js";

let sendCounter = 0;
let lastSentPlayerData = [];

export function sendRequestForStates() {
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    requestForFullStates: true,
  };
  sendData(data);
}
// Send player state to other connected players
export function sendPlayerStates(playerToSend, isMaster, sendFullerData = false) {
  if (Math.random() > 0.99) {
    //every so often we will send the full data just to be sure master is in sync with important properties which don't often change
    sendFullerData = true;
  }
  let priority = 3;
  if (sendFullerData) {
    priority = 2;
  }
  let data = {
    timestamp: Date.now(),
    priority: priority,
    fromMaster: isPlayerMasterPeer(player),
    id: playerToSend.id,
    // invincibleTimer: playerToSend.invincibleTimer,
  };

  let newDataToSend = false;
  newDataToSend = addProperty(playerToSend, data, "x", "x") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "y", "y") || newDataToSend;
  // newDataToSend = addProperty(playerToSend, data, "powerUps", "powerUps") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "invincibleTimer", "invincibleTimer") || newDataToSend;
  if (sendFullerData) {
    newDataToSend = addProperty(playerToSend, data, "color", "color", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "pilot", "pilot", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "name", "name", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "lives", "lives", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isMaster", "isMaster", true) || newDataToSend;
    // newDataToSend = addProperty(playerToSend, data, "ticksSincePowerUpCollection", "ticksSincePowerUpCollection") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "targetedBy", "targetedBy", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "timeOfLastActive", "timeOfLastActive", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "hitBy", "hitBy", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "recentScoreTicks", "recentScoreTicks", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "recentScoreText", "recentScoreText", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "kills", "kills", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "angle", "angle", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isBot", "isBot", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "special", "special", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "devMode", "devMode", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "killed", "killed", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "killedBy", "killedBy", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isPlaying", "isPlaying", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "space", "space", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "shift", "shift", true) || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "resetting", "resetting", true) || newDataToSend;
  } else {
    newDataToSend = addProperty(playerToSend, data, "color", "color") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "pilot", "pilot") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "name", "name") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "lives", "lives") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isMaster", "isMaster") || newDataToSend;
    // newDataToSend = addProperty(playerToSend, data, "ticksSincePowerUpCollection", "ticksSincePowerUpCollection") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "targetedBy", "targetedBy") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "timeOfLastActive", "timeOfLastActive") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "hitBy", "hitBy") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "recentScoreTicks", "recentScoreTicks") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "recentScoreText", "recentScoreText") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "kills", "kills") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "angle", "angle") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isBot", "isBot") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "special", "special") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "devMode", "devMode") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "killed", "killed") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "killedBy", "killedBy") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "isPlaying", "isPlaying") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "space", "space") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "shift", "shift") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "resetting", "resetting") || newDataToSend;
  }

  // newDataToSend = addProperty(playerToSend, data, "invincibleTimer", "invincibleTimer") || newDataToSend;

  newDataToSend = addProperty(playerToSend, data, "forceCoolDown", "forceCoolDown") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "comboScaler", "comboScaler") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "playerAngleData", "playerAngleData") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "mousePosX", "mousePosX") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "mousePosY", "mousePosY") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "currentSpeed", "currentSpeed") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "vel", "vel") || newDataToSend;
  newDataToSend = addProperty(playerToSend, data, "distanceFactor", "distanceFactor") || newDataToSend;

  if (isMaster || sendFullerData) {
    //only master sends is dead message since it is the abibter of collisions, apart from sendFullerData
    if (lastSentPlayerData.isDead != playerToSend.isDead || sendFullerData) {
      newDataToSend = true;
      data.isDead = playerToSend.isDead;
      lastSentPlayerData.isDead = playerToSend.isDead;
    }
    newDataToSend = addProperty(playerToSend, data, "powerUps", "powerUps") || newDataToSend;
    newDataToSend = addProperty(playerToSend, data, "ticksSincePowerUpCollection", "ticksSincePowerUpCollection", true) || newDataToSend;
  }
  if (!isMaster) {
    //only player sends timeSinceSpawned because it knows when it has reset
    if (newDataToSend) {
      data.timeSinceSpawned = playerToSend.timeSinceSpawned;
    }
  }
  if (newDataToSend) {
    sendData(data);
  }
}

// Define a function to add properties to the data object if they have changed
function addProperty(playerToSend, data, propertyKey, playerKey, sendAnyway = false) {
  if (lastSentPlayerData[propertyKey] !== playerToSend[playerKey] || sendAnyway) {
    if (playerToSend[playerKey] == null) {
      console.log("null property in send player state: " + playerKey);
      return false;
    }
    data[propertyKey] = playerToSend[playerKey];
    lastSentPlayerData[propertyKey] = playerToSend[playerKey];

    return true; // Indicates that the property was changed
  }
  return false; // Indicates that the property was not changed
}

//this is the full send that will only be sent on request / occasionally
export function sendEntitiesState() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    fullSend: true,
    globalPowerUps: serializeGlobalPowerUps(globalPowerUps),
    bots: serializeBots(bots),
    mines: serializeMines(mines),
    // otherPlayers: otherPlayers,
    forces: serializeForces(forces),
    // connectedPeers: connectedPeers,
    //enemies and stuff here
  };

  sendData(data);
}

//this is the full send that will only be sent on request / occasionally
export function sendEntitiesUpdate() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    globalPowerUps: serializeGlobalPowerUps(globalPowerUps, true),
    bots: serializeBots(bots,true),
    mines: serializeMines(mines, true),
    forces: serializeForces(forces, true),
    // connectedPeers: connectedPeers,
  };

  sendData(data);
}

//this is the full send that will only be sent on request / occasionally
export function sendPowerUpsUpdate(onlyChangedData = true) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    globalPowerUps: serializeGlobalPowerUps(globalPowerUps, onlyChangedData),
  };

  sendData(data);
}

//this is the full send that will only be sent on request / occasionally
export function sendMinesUpdate(onlyChangedData = true) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    mines: serializeMines(mines, onlyChangedData),
  };

  sendData(data);
}

export function sendForcesUpdate(onlyChangedData = true) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    forces: serializeForces(forces, onlyChangedData),
  };

  sendData(data);
}

export function sendBotsUpdate(onlyChangedData = true) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    bots: serializeBots(bots, onlyChangedData),
  };

  sendData(data);
}

export function sendRemoveEntityUpdate(propertyName, entitiesToRemove) {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
  };

  // Add the specified property name and its value to the data object
  data[propertyName] = entitiesToRemove;

  sendData(data);
}

export function sendConnectedPeers() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    gameState: true,
    fromMaster: isPlayerMasterPeer(player),
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

function sendData(data) {
  connections.forEach((conn) => {
    if (conn && conn.open) {
      try {
        conn.send(data);
        // sendCounter++;
        // // Log the data every 1000 calls
        // if (sendCounter === 5000) {
        //   // console.log("sending data:", data);
        //   sendCounter = 0; // reset the counter
        // }
      } catch (error) {
        console.error("Error sending data:", error);
      }
    }
  });
}
