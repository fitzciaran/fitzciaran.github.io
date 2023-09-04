import { setGlobalPowerUps, player, otherPlayers, bots, setBots } from "./astroids.js";
import {
  resetPowerLevels,
  updateEnemies,
  updatePowerups,
  pointsToWin,
  checkWinner,
  detectCollisions,
  updateBots,
  masterPeerUpdateGame,
  shuffleArray,
} from "./gameLogic.js";

import { Player } from "./player.js";
export let everConnected = false;
export let connections = [];
export let peerIds = [
  "a7ef962d-14a8-40e4-8a1e-226a438a3456",
  "b7ef962d-14a8-40e4-8a1e-226a438a3456",
  "c7ef962d-14a8-40e4-8a1e-226a438a3456",
  "d7ef962d-14a8-40e4-8a1e-226a438a3456",
  "e7ef962d-14a8-40e4-8a1e-226a438a3456",
  "a6ef962d-14a8-40e4-8a1e-226a438a3456",
  "b6ef962d-14a8-40e4-8a1e-226a438a3456",
];
shuffleArray(peerIds);
export let ticksSinceLastConnectionAttempt = 0;
export function setTicksSinceLastConnectionAttempt(newTime) {
  ticksSinceLastConnectionAttempt = newTime;
}
let masterPeerId = peerIds[0]; // start off with the first peer as the master
export let timeSinceMessageFromMaster = 0;
export function setTimeSinceMessageFromMaster(newTime) {
  timeSinceMessageFromMaster = newTime;
}
export let timeSinceAnyMessageRecieved = 0;
export function setTimeSinceAnyMessageRecieved(newTime) {
  timeSinceAnyMessageRecieved = newTime;
}
export const wrappedResolveConflicts = createResolveConflictsWrapper();

let index = 0;
let handleCounter = 0;
let sendCounter = 0;
let peer;
let connectedPeers = [];
let connectionBackOffTime = 0;

export function sendPlayerStates(player) {
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
    name: player.name,
    lives: player.lives,
    isMaster: player.isMaster,
    isDead: player.isDead,
    isPlaying: player.isPlaying,
    isStar: player.isStar,
    invincibleTimer: player.invincibleTimer,
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

export function sendBotsState(bots) {
  // Send game state to other player
  let data = {
    gameState: true,
    bots: bots,
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

function handleData(player, otherPlayers, globalPowerUps, data) {
  timeSinceAnyMessageRecieved = 0;
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
    otherPlayer.name = data.name;
    otherPlayer.lives = data.lives;
    otherPlayer.isMaster = data.isMaster;
    otherPlayer.isDead = data.isDead;
    otherPlayer.isPlaying = data.isPlaying;
    otherPlayer.invincibleTimer = data.invincibleTimer;
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
    let newPlayer = new Player(data.id, data.x, data.y, data.powerUps, data.color, data.angle, data.pilot, data.name);
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
    setGlobalPowerUps(data.globalPowerUps);
  }
  if (data.bots) {
    setTimeSinceMessageFromMaster(0);
    setBots(data.bots);
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

// Wait for a short delay to allow time for the connections to be attempted
export function attemptConnections(player, otherPlayers, globalPowerUps) {
  if (player.id === null) {
    console.log("in attemptConnections PLayer id is null");
    connectionBackOffTime = (connectionBackOffTime + 500) * 2;
    setTimeout(() => tryNextId(player), connectionBackOffTime);
    return;
  }

  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    everConnected = true;
    //todo not sure if we need to move out this below line
    addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
    if (!connectedPeers.includes(conn.peer)) {
      connectedPeers.push(conn.peer);
    }
    connectedPeers.sort();

    masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    conn.on("close", function () {
      console.log("Connection closed with peer:", conn.peer);
      connectedPeers = connectedPeers.filter((id) => id !== conn.peer);
      connectedPeers.sort();
      masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    });
  });

  peer.on("error", function (err) {
    //console.log("PeerJS error:");
  });

  peer.on("disconnected", function () {
    console.log("Disconnected from server");

    // If the master peer has disconnected, choose a new master peer
    // if (isPlayerMasterPeer(player)) {
    masterPeerId = chooseNewMasterPeer(player, otherPlayers);
    tryNextId(player);
    //  }
  });

  connectToPeers(player, otherPlayers, globalPowerUps);
}

export function isPlayerMasterPeer(player) {
  return player.id === masterPeerId;
}

export function connectToPeers(player, otherPlayers, globalPowerUps) {
  // Connect to the other peers
  peerIds.forEach((id) => {
    if (id !== player.id) {
      // Check if a connection with this id already exists
      let existingConnection = connections.find((conn) => conn.peer === id);
      if (!existingConnection) {
        let conn = null;
        if (peer) {
          conn = peer.connect(id);
        } else {
          if (Math.random() > 0.9) {
            console.log("peer undefined in connect to peeers");
          }
        }
        if (conn != null && conn != undefined) {
          //connections.push(conn); // Add the connection to the array
          everConnected = true;
         //todo carefully assess result of removing this
          addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
        }
      } else {
        console.log("existing connection with: " + id);
      }
    }
  });
}

export function tryNextId(player) {
  if (index >= peerIds.length) {
    console.log("All IDs are in use - trynextid function");
    resolveConnectionConflicts(player, otherPlayers, globalPowerUps);
    return;
  }

  let id = peerIds[index];
  setPeer(new Peer(id)); // Assign the new Peer to the peer variable

  peer.on("open", function () {
    // If the ID is already in use, this will not be called
    player.id = id;
    //when we connect initially we set ourselves as master
    masterPeerId = id;
    // Add the local player's ID to the connectedPeers array
    connectedPeers.push(id);
    console.log("My peer ID is: " + id);
  });

  peer.on("error", function (err) {
    // If the ID is already in use, an error will be thrown
    if (err.type === "unavailable-id") {
      console.log("ID is in use:", id);
      index++;

      tryNextId(player);
    } else if (err.type === "browser-incompatible") {
      console.log("browser incompatible:", err);
      //console.log("Other error:");
    } else {
      //console.log("Other error:", err);
      //console.log("Other error:");
    }
  });
}

function addConnectionHandlers(player, otherPlayers, conn, globalPowerUps) {
  console.log("adding connection handlers");
  conn.on("open", function () {
    console.log("Connection opened with peer:", conn.peer);
    connections.push(conn);
    let existingOtherPlayer = otherPlayers.some((player) => player.id === conn.peer);
    if (!existingOtherPlayer) {
      let otherPlayerData = new Player(conn.peer, -200, -200, 0, "blue", 0, "", "", player.worldDimensions, player.colors);
      otherPlayers.push(otherPlayerData);
      if (!connectedPeers.includes(otherPlayerData.id)) {
        connectedPeers.push(otherPlayerData.id);
      }
      connectedPeers.sort();
    }

    // Reset all powerUps when a new peer connects : don't do this anymore ongoing game
    //resetPowerLevels(player, otherPlayers);

    // Send the current powerups to the new peer
    //don't need to under master peer system
    //sendPowerups(globalPowerUps);
  });

  conn.on("error", function (err) {
    console.log("Connection error with peer:", conn.peer, ", error:", err);
  });

  conn.on("close", function () {
    console.log("Connection closed with peer:", conn.peer);
    // Remove player from otherPlayers array
    otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
  });

  conn.on("data", function (data) {
    //console.log("Received data:", data);
    if ((data && data.id) || (data && data.globalPowerUps) || (data && data.bots)) {
      handleData(player, otherPlayers, globalPowerUps, data);
    } else {
      console.log("Received unexpected data:", data);
    }
    // If there is a conflict between the local game state and the received game state,
    // update the local game state to match the received game state
    wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  });
}

export function getPeer() {
  return peer;
}

function setPeer(newPeer) {
  peer = newPeer;
}

//todo this is now also updating game if master peer, need to separate this
export function updateConnections(player, otherPlayers, globalPowerUps) {
  if (everConnected) {
    sendPlayerStates(player);
    if (!isPlayerMasterPeer(player)) {
      setTimeSinceMessageFromMaster(timeSinceMessageFromMaster + 1);
    }
  } else {
    connections.forEach((conn, index) => {
      if (conn && conn.closed) {
        console.log("Connection closed with peer:", conn.peer);
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
        connections.splice(index, 1); // Remove the connection from the connections array
      } else if (!conn) {
        console.log("Connection null, removing from otherplayers list and from connections", conn.peer);
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
        connections = connections.filter((player) => player.id !== conn.peer);
      }
    });
  }
}

export function getPlayerId() {
  return id;
}

function chooseNewMasterPeer(player, otherPlayers) {
  if (connectedPeers.length > 0) {
    masterPeerId = connectedPeers[0];

    if (masterPeerId === player.id) {
      player.setPlayerIsMaster(true);
    } else {
      player.setPlayerIsMaster(false);
    }
  } else {
    masterPeerId = player.id;
    player.setPlayerIsMaster(true);
  }
  otherPlayers.forEach((otherPlayer) => {
    if (otherPlayer instanceof Player) {
      if (masterPeerId === otherPlayer.id) {
        otherPlayer.setPlayerIsMaster(true);
      } else {
        otherPlayer.setPlayerIsMaster(false);
      }
    } else {
      console.error("otherPlayer is not an instance of Player:", otherPlayer);
    }
  });

  return masterPeerId;
}
export function createResolveConflictsWrapper() {
  let isScheduled = false;

  return function(player, otherPlayers, globalPowerUps) {
    if (!isScheduled) {
      // If not scheduled, call the function and set the flag
      resolveConflicts(player, otherPlayers, globalPowerUps);
      isScheduled = true;

      // Schedule to reset the flag after 5 seconds
      setTimeout(() => {
        isScheduled = false;
      }, 5000);
    }
  };
}


function resolveConflicts(player, otherPlayers, globalPowerUps) {
  // If there is a conflict between the local game state and the received game state,
  // update the local game state to match the received game state
  if (player.id == null) {
    tryNextId(player);
  }
  resolveConnectionConflicts(player, otherPlayers, globalPowerUps);
}

function resolveConnectionConflicts(player, otherPlayers, globalPowerUps) {
  // If there is a conflict between the local game state and the received game state,
  
  //not sure about the below might need to keep it in mind but I think it was causing major issues.
  // setTicksSinceLastConnectionAttempt(0);
  // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
  // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
  // connectedPeers.splice(0, 1);
  //might not be able to attempt connections again without issues
 // setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
  masterPeerId = chooseNewMasterPeer(player, otherPlayers);
}