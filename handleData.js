import {
  connections,
  connectedPeers,
  timeSinceMessageFromMaster,
  setTimeSinceMessageFromMaster,
  setTimeSinceAnyMessageRecieved,
  isPlayerMasterPeer,
  wrappedResolveConflicts,
} from "./connectionHandlers.js";
import { setGlobalPowerUps, player, otherPlayers, bots, mines, setBots, setMines } from "./astroids.js";
import { forces, setForces,createMineFromObject,createForceFromObject,createPowerUpFromObject } from "./entities.js";
import { createBotFromObject,Player } from "./player.js";

let handleCounter = 0;
let sendCounter = 0;

export function sendPlayerStates(player, globalPowerUps) {
  // Check if connection is open before sending data
  // Send player state to other players
  let data = {
    id: player.id,
    x: player.x,
    y: player.y,
    powerUps: player.powerUps,
    color: player.color,
    angle: player.angle,
    pilot: player.pilot,
    special: player.special,
    name: player.name,
    lives: player.lives,
    isMaster: player.isMaster,
    isDead: player.isDead,
    isPlaying: player.isPlaying,
    isStar: player.isStar,
    invincibleTimer: player.invincibleTimer,
    forceCoolDown: player.forceCoolDown,
    comboScaler: player.comboScaler,
    kills: player.kills,
    playerAngleData: player.playerAngleData,
    mousePosX: player.mousePosX,
    mousePosY: player.mousePosY,
    currentSpeed: player.currentSpeed,
    vel: player.vel,
    distanceFactor: player.distanceFactor,
    space: player.space,
    shift: player.shift,
    ticksSincePowerUpCollection: player.ticksSincePowerUpCollection,
    targetedBy: player.targetedBy,
    timeOfLastActive: player.timeOfLastActive,
  };
  //console.log("Sending data:", data); // Log any data sent
  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        console.log("sending data:", data);
        sendCounter = 0; // reset the counter
      }
    }
  });
  if (timeSinceMessageFromMaster > 60 * 15 && !isPlayerMasterPeer(player)) {
    setTimeSinceMessageFromMaster(0);
    //try removing the current master
    //issue could be that peer doesn't think it is the master because it is connected to others.. need to sync connected lists I think.
    // Remove player from otherPlayers array, connections array and connectedPeers (array of id's of the connected peers)
    // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
    // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
    // connectedPeers.splice(0, 1);
    // setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
    // //what about "connections" how is connections and connectedPeers synced?
    // masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  }
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
        console.log("sending game state data:", data);
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
    forces: forces,
    connectedPeers: connectedPeers,
    //enemies and stuff here
  };

  //console.log("Sending data:", data); // Log any data sent
  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(data);
      sendCounter++;
      // Log the data every 1000 calls
      if (sendCounter === 5000) {
        console.log("sending bots state data:", data);
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
        console.log("sending bots state data:", data);
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

  // If the player is found, update their data
  if (otherPlayer) {
    otherPlayer.timeSinceSentMessageThatWasRecieved = 0;
    otherPlayer.x = data.x;
    otherPlayer.y = data.y;
    otherPlayer.powerUps = data.powerUps;
    otherPlayer.color = data.color;
    otherPlayer.angle = data.angle;
    otherPlayer.pilot = data.pilot;
    otherPlayer.special = data.special;
    otherPlayer.name = data.name;
    otherPlayer.lives = data.lives;
    otherPlayer.isMaster = data.isMaster;
    otherPlayer.isDead = data.isDead;
    otherPlayer.isPlaying = data.isPlaying;
    otherPlayer.invincibleTimer = data.invincibleTimer;
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
    otherPlayer.isStar = data.isStar;

    if (isPlayerMasterPeer(player) && otherPlayer.isMaster) {
      wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
    }
  }
  // If the player is not found, add them to the array
  else if (data.id) {
    let newPlayer = new Player(data.id, data.x, data.y, data.powerUps, data.color, data.angle, data.pilot, data.name,data.isPlaying,true);
    otherPlayers.push(newPlayer);
    if (!connectedPeers.includes(data.id)) {
      connectedPeers.push(data.id);
    }
    connectedPeers.sort();

    masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    if (data.powerUps > pointsToWin) {
      checkWinner(otherPlayer, otherPlayers);
    }
  }
  // Only update the powerups if the received data contains different powerups
  if (data.globalPowerUps && JSON.stringify(globalPowerUps) !== JSON.stringify(data.globalPowerUps)) {
    const powerUpInstances = data.globalPowerUps.map(createPowerUpFromObject);
    setGlobalPowerUps(powerUpInstances);
  }
  if (data.bots) {
    setTimeSinceMessageFromMaster(0);
    const botInstances = data.bots.map(createBotFromObject);
    setBots(botInstances);
  }
  if (data.mines) {
    setTimeSinceMessageFromMaster(0);
    const mineInstances = data.mines.map(createMineFromObject);
    setMines(mineInstances);
  }
  if (data.forces) {
    setTimeSinceMessageFromMaster(0);
    const forceInstances = data.forces.map(createForceFromObject);
    setForces(forceInstances);
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
      connectedPeers = [...new Set([...data.connectedPeers, ...connectedPeers])];
      // connectedPeers.forEach((connectedID) => {
      //   connection.
      // });
      setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
      sendConnectedPeers();
    }
  }
  handleCounter++;
  // Log the data every 1000 calls
  if (handleCounter === 1000) {
    console.log("handling data:", data);
    handleCounter = 0; // reset the counter
  }
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
