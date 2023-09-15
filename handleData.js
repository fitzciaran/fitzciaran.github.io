import {
  setGlobalPowerUps,
  player,
  otherPlayers,
  bots,
  mines,
  setBots,
  setMines,
  setOtherPlayers,
  fixedDeltaTime,
  globalPowerUps,
} from "./main.js";
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
import {
  forces,
  setForces,
  createMineFromObject,
  createForceFromObject,
  createPowerUpFromObject,
  serializeForces,
  serializeMines,
  serializeGlobalPowerUps,
} from "./entities.js";
import { createBotFromObject, Player, createPlayerFromObject, serializeBots } from "./player.js";

let handleCounter = 0;
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
  if(sendFullerData){
    priority = 2;
  }
  let data = {
    timestamp: Date.now(),
    priority: priority,
    fromMaster: isPlayerMasterPeer(player),
    id: playerToSend.id,
    // invincibleTimer: playerToSend.invincibleTimer,
  };

  // Define a function to add properties to the data object if they have changed
  function addPropertyIfChanged(propertyKey, playerKey) {
    if (lastSentPlayerData[propertyKey] !== playerToSend[playerKey]) {
      if (playerToSend[playerKey] == null) {
        console.log("null property in send player state");
        return false;
      }
      data[propertyKey] = playerToSend[playerKey];
      lastSentPlayerData[propertyKey] = playerToSend[playerKey];

      return true; // Indicates that the property was changed
    }
    return false; // Indicates that the property was not changed
  }

  function addProperty(propertyKey, playerKey) {
    if (playerToSend[playerKey] == null) {
      console.log("null property in send player state");
      return false;
    }
    data[propertyKey] = playerToSend[playerKey];
    lastSentPlayerData[propertyKey] = playerToSend[playerKey];

    return true;
  }

  let newDataToSend = false;
  newDataToSend = addPropertyIfChanged("x", "x") || newDataToSend;
  newDataToSend = addPropertyIfChanged("y", "y") || newDataToSend;
  newDataToSend = addPropertyIfChanged("powerUps", "powerUps") || newDataToSend;
  newDataToSend = addPropertyIfChanged("invincibleTimer", "invincibleTimer") || newDataToSend;
  if (sendFullerData) {
    newDataToSend = addProperty("color", "color") || newDataToSend;
    newDataToSend = addProperty("pilot", "pilot") || newDataToSend;
    newDataToSend = addProperty("name", "name") || newDataToSend;
    newDataToSend = addProperty("lives", "lives") || newDataToSend;
    newDataToSend = addProperty("isMaster", "isMaster") || newDataToSend;
    newDataToSend = addProperty("ticksSincePowerUpCollection", "ticksSincePowerUpCollection") || newDataToSend;
    newDataToSend = addProperty("targetedBy", "targetedBy") || newDataToSend;
    newDataToSend = addProperty("timeOfLastActive", "timeOfLastActive") || newDataToSend;
    newDataToSend = addProperty("hitBy", "hitBy") || newDataToSend;
    newDataToSend = addProperty("recentScoreTicks", "recentScoreTicks") || newDataToSend;
    newDataToSend = addProperty("recentScoreText", "recentScoreText") || newDataToSend;
    newDataToSend = addProperty("kills", "kills") || newDataToSend;
    newDataToSend = addProperty("angle", "angle") || newDataToSend;
    newDataToSend = addProperty("isBot", "isBot") || newDataToSend;
    newDataToSend = addProperty("special", "special") || newDataToSend;
    newDataToSend = addProperty("devMode", "devMode") || newDataToSend;
  } else {
    newDataToSend = addPropertyIfChanged("color", "color") || newDataToSend;
    newDataToSend = addPropertyIfChanged("pilot", "pilot") || newDataToSend;
    newDataToSend = addPropertyIfChanged("name", "name") || newDataToSend;
    newDataToSend = addPropertyIfChanged("lives", "lives") || newDataToSend;
    newDataToSend = addPropertyIfChanged("isMaster", "isMaster") || newDataToSend;
    newDataToSend = addPropertyIfChanged("ticksSincePowerUpCollection", "ticksSincePowerUpCollection") || newDataToSend;
    newDataToSend = addPropertyIfChanged("targetedBy", "targetedBy") || newDataToSend;
    newDataToSend = addPropertyIfChanged("timeOfLastActive", "timeOfLastActive") || newDataToSend;
    newDataToSend = addPropertyIfChanged("hitBy", "hitBy") || newDataToSend;
    newDataToSend = addPropertyIfChanged("recentScoreTicks", "recentScoreTicks") || newDataToSend;
    newDataToSend = addPropertyIfChanged("recentScoreText", "recentScoreText") || newDataToSend;
    newDataToSend = addPropertyIfChanged("kills", "kills") || newDataToSend;
    newDataToSend = addPropertyIfChanged("angle", "angle") || newDataToSend;
    newDataToSend = addPropertyIfChanged("isBot", "isBot") || newDataToSend;
    newDataToSend = addPropertyIfChanged("special", "special") || newDataToSend;
    newDataToSend = addPropertyIfChanged("devMode", "devMode") || newDataToSend;

  }

  // newDataToSend = addPropertyIfChanged("invincibleTimer", "invincibleTimer") || newDataToSend;

  newDataToSend = addPropertyIfChanged("forceCoolDown", "forceCoolDown") || newDataToSend;
  newDataToSend = addPropertyIfChanged("comboScaler", "comboScaler") || newDataToSend;
  newDataToSend = addPropertyIfChanged("playerAngleData", "playerAngleData") || newDataToSend;
  newDataToSend = addPropertyIfChanged("mousePosX", "mousePosX") || newDataToSend;
  newDataToSend = addPropertyIfChanged("mousePosY", "mousePosY") || newDataToSend;
  newDataToSend = addPropertyIfChanged("currentSpeed", "currentSpeed") || newDataToSend;
  newDataToSend = addPropertyIfChanged("vel", "vel") || newDataToSend;
  newDataToSend = addPropertyIfChanged("distanceFactor", "distanceFactor") || newDataToSend;
  newDataToSend = addPropertyIfChanged("space", "space") || newDataToSend;
  newDataToSend = addPropertyIfChanged("shift", "shift") || newDataToSend;

  if (isMaster || sendFullerData) {
    //only master sends is dead message since it is the abibter of collisions, apart from sendFullerData
    if (lastSentPlayerData.isDead != playerToSend.isDead || sendFullerData) {
      newDataToSend = true;
      data.isDead = playerToSend.isDead;
      lastSentPlayerData.isDead = playerToSend.isDead;
    }
  }
  if (!isMaster) {
    //only player sends timeSinceSpawned because it know when it has reset
    if (newDataToSend) {
      data.timeSinceSpawned = playerToSend.timeSinceSpawned;
    }
  }
  if (newDataToSend) {
    sendData(data);
  }
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

export function sendEntitiesState() {
  // Send game state to other player
  let data = {
    timestamp: Date.now(),
    priority: 2,
    fromMaster: isPlayerMasterPeer(player),
    gameState: true,
    globalPowerUps: serializeGlobalPowerUps(globalPowerUps),
    bots: serializeBots(bots),
    mines: serializeMines(mines),
    // otherPlayers: otherPlayers,
    forces: serializeForces(forces),
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
  // If the player is found, update their data
  // if (otherPlayer) {
  //   otherPlayer.x = data.x;
  //   otherPlayer.y = data.y;
  //   otherPlayer.powerUps = data.powerUps;
  //   otherPlayer.color = data.color;
  //   otherPlayer.angle = data.angle;
  //   otherPlayer.pilot = data.pilot;
  //   otherPlayer.isBot = data.isBot;
  //   otherPlayer.special = data.special;
  //   otherPlayer.name = data.name;
  //   otherPlayer.lives = data.lives;
  //   otherPlayer.isMaster = data.isMaster;
  //   otherPlayer.setIsDead(data.isDead);
  //   otherPlayer.isPlaying = data.isPlaying;
  //   otherPlayer.setInvincibleTimer(data.invincibleTimer);
  //   otherPlayer.forceCoolDown = data.forceCoolDown;
  //   otherPlayer.comboScaler = data.comboScaler;
  //   otherPlayer.kills = data.kills;
  //   otherPlayer.playerAngleData = data.playerAngleData;
  //   otherPlayer.mousePosX = data.mousePosX;
  //   otherPlayer.mousePosY = data.mousePosY;
  //   otherPlayer.currentSpeed = data.currentSpeed;
  //   otherPlayer.vel = data.vel;
  //   otherPlayer.distanceFactor = data.distanceFactor;
  //   otherPlayer.space = data.space;
  //   otherPlayer.shift = data.shift;
  //   otherPlayer.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
  //   otherPlayer.targetedBy = data.targetedBy;
  //   otherPlayer.timeOfLastActive = data.timeOfLastActive;
  //   otherPlayer.hitBy = data.hitBy;
  //   otherPlayer.recentScoreTicks = data.recentScoreTicks;
  //   otherPlayer.recentScoreText = data.recentScoreText;
  // If the player is found, update their data
  if (otherPlayer) {
    if (data.hasOwnProperty("x")) {
      otherPlayer.x = data.x;
    }
    if (data.hasOwnProperty("y")) {
      otherPlayer.y = data.y;
    }
    if (data.hasOwnProperty("powerUps")) {
      otherPlayer.powerUps = data.powerUps;
    }
    if (data.hasOwnProperty("color")) {
      otherPlayer.color = data.color;
    }
    if (data.hasOwnProperty("angle")) {
      otherPlayer.angle = data.angle;
    }
    if (data.hasOwnProperty("devMode")) {
      otherPlayer.devMode = data.devMode;
    }
    if (data.hasOwnProperty("pilot")) {
      otherPlayer.pilot = data.pilot;
    }
    if (data.hasOwnProperty("isBot")) {
      otherPlayer.isBot = data.isBot;
    }
    if (data.hasOwnProperty("special")) {
      otherPlayer.special = data.special;
    }
    if (data.hasOwnProperty("name")) {
      otherPlayer.name = data.name;
    }
    if (data.hasOwnProperty("lives")) {
      otherPlayer.lives = data.lives;
    }
    if (data.hasOwnProperty("isMaster")) {
      otherPlayer.isMaster = data.isMaster;
    }
    if (data.hasOwnProperty("isDead")) {
      otherPlayer.setIsDead(data.isDead);
    }
    if (data.hasOwnProperty("isPlaying")) {
      otherPlayer.isPlaying = data.isPlaying;
    }
    if (data.hasOwnProperty("invincibleTimer")) {
      otherPlayer.setInvincibleTimer(data.invincibleTimer);
    }
    if (data.hasOwnProperty("forceCoolDown")) {
      otherPlayer.forceCoolDown = data.forceCoolDown;
    }
    if (data.hasOwnProperty("comboScaler")) {
      otherPlayer.setComboScaler(data.comboScaler);
    }
    if (data.hasOwnProperty("kills")) {
      otherPlayer.kills = data.kills;
    }
    if (data.hasOwnProperty("playerAngleData")) {
      otherPlayer.playerAngleData = data.playerAngleData;
    }
    if (data.hasOwnProperty("mousePosX")) {
      otherPlayer.mousePosX = data.mousePosX;
    }
    if (data.hasOwnProperty("mousePosY")) {
      otherPlayer.mousePosY = data.mousePosY;
    }
    if (data.hasOwnProperty("currentSpeed")) {
      otherPlayer.currentSpeed = data.currentSpeed;
    }
    if (data.hasOwnProperty("vel")) {
      otherPlayer.vel = data.vel;
    }
    if (data.hasOwnProperty("distanceFactor")) {
      otherPlayer.distanceFactor = data.distanceFactor;
    }
    if (data.hasOwnProperty("space")) {
      otherPlayer.space = data.space;
    }
    if (data.hasOwnProperty("shift")) {
      otherPlayer.shift = data.shift;
    }
    if (data.hasOwnProperty("ticksSincePowerUpCollection")) {
      otherPlayer.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
    }
    if (data.hasOwnProperty("targetedBy")) {
      otherPlayer.targetedBy = data.targetedBy;
    }
    if (data.hasOwnProperty("timeOfLastActive")) {
      otherPlayer.timeOfLastActive = data.timeOfLastActive;
    }
    if (data.hasOwnProperty("hitBy")) {
      otherPlayer.hitBy = data.hitBy;
    }
    if (data.hasOwnProperty("recentScoreTicks")) {
      otherPlayer.recentScoreTicks = data.recentScoreTicks;
    }
    if (data.hasOwnProperty("recentScoreText")) {
      otherPlayer.recentScoreText = data.recentScoreText;
    }

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
    // } else if (data.id && data.id == player.id) {
    //   //if this is our own data we only update key properties from the master, not position, velocity etc
    //   player.powerUps = data.powerUps;
    //   player.comboScaler = data.comboScaler;
    //   player.setIsDead(data.isDead);
    //   if (data.isDead) {
    //     player.vel.x = 0;
    //     player.vel.y = 0;
    //   }
    //   player.lives = data.lives;
    //   player.hitBy = data.hitBy;
    //   player.kills = data.kills;
    //   player.setInvincibleTimer(data.invincibleTimer);
    //   player.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;
    //   player.powerUps = data.powerUps;
    //   player.recentScoreTicks = data.recentScoreTicks;
    //   player.recentScoreText = data.recentScoreText;
    //   if (player.hitBy != null && player.hitBy != "") {
    //     setEndGameMessage("Killed by: " + player.hitBy + "\nScore: " + player.powerUps * 100);
    //   } else {
    //     setEndGameMessage("Score: " + player.powerUps * 100);
    //   }
    // }
  } else if (data.id && data.id == player.id) {
    // If this is our own data, update key properties from the master, not position, velocity, etc.

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
  } else if (data.id && data.id == player.id) {
    // If this is our own data, update key properties from the master, not position, velocity, etc.

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
  // Only update the powerups if the received data contains different powerups
  if (data.globalPowerUps && JSON.stringify(globalPowerUps) !== JSON.stringify(data.globalPowerUps)) {
    const powerUpInstances = data.globalPowerUps.map(createPowerUpFromObject);
    setGlobalPowerUps(powerUpInstances);
  }
  if (data.bots) {
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
        localBot.name = receivedBot.name;
        localBot.inForce = receivedBot.inForce;
      } else {
        // If the local bot doesn't exist, add it to the bots array
        // bots.push(receivedBot);
        bots.push(createBotFromObject(receivedBot));
      }
    }

    // This ensures that local bots that have been removed on the master peer are also removed locally
    setBots(bots.filter((localBot) => data.bots.some((receivedBot) => receivedBot.id === localBot.id)));
  }
  if (data.mines) {
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
    //if there is a mine in our list that isn't in the master list remove it
    for (let mineToCheck of mines) {
      if (mineToCheck.id != null) {
        let matchingMine = data.mines.find((dataMine) => dataMine.id === mineToCheck.id);
        if (matchingMine == null) {
          setMines(mines.filter((mine) => mine.id !== mineToCheck.id));
        }
      }
    }
  }
  if (data.forces) {
    setTimeSinceMessageFromMaster(0);
    //const forceInstances = data.forces.map(createForceFromObject);
    // setForces(forceInstances);
    // Iterate through forceInstances received from the master peer
    // for (const receivedForce of forceInstances) {
    for (const receivedForce of data.forces) {
      // Find the corresponding local bot by ID
      const localForce = findForceById(receivedForce.id);
      const interpFactor = 0.2;
      if (localForce) {
        if (localForce.tracks == null || localForce.tracks.id != player.id) {
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
          localForce.type = receivedForce.type;
          localForce.width = receivedForce.width;
          localForce.length = receivedForce.length;
          localForce.numberArrowsEachSide = receivedForce.numberArrowsEachSide;
          localForce.numberArrowsDeep = receivedForce.numberArrowsDeep;
        } else {
          // console.log("currentplayers force");
        }
      } else if (receivedForce.tracks == null || receivedForce.tracks.id != player.id) {
        // If the local force doesn't exist, add it to the forces array
        //forces.push(receivedForce);
        forces.push(createForceFromObject(receivedForce));
      }
    }
    //if there is a force in our list that isn't in the master list remove it
    for (let forceToCheck of forces) {
      if (forceToCheck.id != null) {
        let matchingForce = data.forces.find((dataForce) => dataForce.id === forceToCheck.id);
        if (matchingForce == null) {
          setForces(forces.filter((force) => force.id !== forceToCheck.id));
        }
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
      } else if (player.isDead) {
        setEndGameMessage("Score: " + player.powerUps * 100);
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
