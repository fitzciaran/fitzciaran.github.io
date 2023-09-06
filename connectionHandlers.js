import {  otherPlayers } from "./astroids.js";

import {
  shuffleArray,
} from "./gameLogic.js";

import { sendPlayerStates, handleData} from "./handleData.js";
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

let peer;
export let connectedPeers = [];
let connectionBackOffTime = 0;

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
  if(player.id == null){
    return true;
  }
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
  if (everConnected || true) {
    sendPlayerStates(player,globalPowerUps);
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
     // console.error("otherPlayer is not an instance of Player:", otherPlayer);
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