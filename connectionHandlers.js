import { otherPlayers } from "./main.js";

import { shuffleArray } from "./gameLogic.js";

import { handleData } from "./handleData.js";
import { sendPlayerStates } from "./sendData.js";
import { Player } from "./player.js";
export let everConnected = false;
export let connections = [];
export let peerIds = [
  "a7ef962d-14a8-40e4-8a1e-226a438a3321",
  "b7ef962d-14a8-40e4-8a1e-226a438a3321",
  "c7ef962d-14a8-40e4-8a1e-226a438a3321",
  "d7ef962d-14a8-40e4-8a1e-226a438a3321",
  "e7ef962d-14a8-40e4-8a1e-226a438a3321",
  "a6ef962d-14a8-40e4-8a1e-226a438a3321",
  "b6ef962d-14a8-40e4-8a1e-226a438a3321",
];
let reconnectionAttempts = 0;
shuffleArray(peerIds);
export let ticksSinceLastConnectionAttempt = 0;
export function setTicksSinceLastConnectionAttempt(newTime) {
  ticksSinceLastConnectionAttempt = newTime;
}
let masterPeerId = peerIds[0]; // start off with the first peer as the master
export function setMasterPeerId(newID) {
  masterPeerId = newID;
}
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
export function setConnectedPeers(newConnectedPeers) {
  connectedPeers = newConnectedPeers;
}
let connectionBackOffTime = 0;

// Wait for a short delay to allow time for the connections to be attempted
export function attemptConnections(player, otherPlayers, globalPowerUps) {
  if (player.id === null) {
    console.log("in attemptConnections PLayer id is null");
    connectionBackOffTime = (connectionBackOffTime + 500) * 2;
    setTimeout(() => createPeer(player, otherPlayers, globalPowerUps), connectionBackOffTime);
    return;
  }
  verifyPeerHealth(player, otherPlayers, globalPowerUps);
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
    createPeer(player, otherPlayers, globalPowerUps);
    //  }
  });

  connectToPeers(player, otherPlayers, globalPowerUps);
}

export function isPlayerMasterPeer(player) {
  if (player.id == null) {
    return true;
  }
  return player.id === masterPeerId;
}

export function connectToPeers(player, otherPlayers, globalPowerUps) {
  // Connect to the other peers
  peerIds.forEach((id) => {
    if (id !== player.id) {
      checkAndReplaceConnectionsFromId(id, player, otherPlayers, globalPowerUps);
    }
  });
}

export function checkAndReplaceConnectionsFromId(id, player, otherPlayers, globalPowerUps) {
  // Check if a connection with this id already exists
  let existingConnection = connections.find((conn) => conn.peer === id);
  if (!existingConnection || !existingConnection.open) {
    // If the connection doesn't exist or is closed, retry it
    let conn = null;
    verifyPeerHealth(player, otherPlayers, globalPowerUps);
    if (peer && !peer.disconnected) {
      conn = peer.connect(id);
    } else {
      console.log("peer undefined/closed/disconneced in connect to peers");
      if (peer) {
        // console.log("peer open: " + peer.open);
        // console.log("peer disconnected: " + peer.disconnected);
      }
    }
    checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps);
  } else {
    // The existing connection is open, so no action needed
  }
}

export function checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps) {
  if (conn != null && conn != undefined) {
    // If the connection was successfully (re)established, update or replace it
    if (existingConnection) {
      // If there was an existing connection, replace it with the new one
      const index = connections.indexOf(existingConnection);
      if (index !== -1) {
        connections.splice(index, 1, conn);
      }
    } else {
      // If there wasn't an existing connection, add the new one to the array
      connections.push(conn);
    }
    everConnected = true;
    //todo carefully assess result of removing this
    addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
  }
}

export function createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts = -1) {
  if (!reconnectionAttempts == -1) {
    reconnectionAttempts++;
    let rand = Math.random();
    if (reconnectionAttempts > 20) {
      if (rand > 0.1) {
        return;
      }
    }
    if (reconnectionAttempts > 10) {
      if (rand > 0.2) {
        return;
      }
    }
    if (reconnectionAttempts > 3) {
      if (rand > 0.5) {
        return;
      }
    }
  }
  if (index >= peerIds.length) {
    console.log("All IDs are in use - createPeer function");
    resolveConnectionConflicts(player, otherPlayers, globalPowerUps);
    return;
  }

  let id = peerIds[index];
  setPeer(new Peer(id)); // Assign the new Peer to the peer variable
  verifyPeerHealth(player, otherPlayers, globalPowerUps);
  peer.on("open", function () {
    // If the ID is already in use, this will not be called
    player.id = id;
    //when we connect initially we set ourselves as master
    masterPeerId = id;
    // Add the local player's ID to the connectedPeers array //why is our id in this list?
    connectedPeers.push(id);
    console.log("My peer ID is: " + id);
  });

  peer.on("error", function (err) {
    // If the ID is already in use, an error will be thrown
    if (err.type === "unavailable-id") {
      console.log("ID is in use:", id);
      index++;

      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    } else if (err.type === "browser-incompatible") {
      console.log("browser incompatible:", err);
      //console.log("Other error:");
    } else {
      //console.log("Other error:", err);
      //console.log("Other error:");
    }
  });
  peer.on("close", () => {
    //peer.destroy();
    // console.log("Connection to signaling server closed. Attempting to reconnect...");
    // createPeer(player, otherPlayers, globalPowerUps);
    console.log("Connection to signaling server closed. ");
    if (peer.disconnected) {
      peer.destroy();
      createPeer(player, otherPlayers, globalPowerUps);
    }
  });
}

function verifyPeerHealth(player, otherPlayers, globalPowerUps) {
  // Check if peer.disconnected is true
  if (peer.disconnected) {
    console.log("peer was disconnected");
    try {
      // Attempt to reconnect
      peer.reconnect();
    } catch (error) {
      console.log("error reconnecting peer: " + error);
      index = 0;
      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    }
    // Listen for the 'open' event to determine if the reconnection was successful
    // peer.on("open", () => {
    //   // The Peer connection is now open, you can proceed to create connections
    //   const conn = peer.connect(id);

    //   // Handle the connection as needed
    //   conn.on("open", () => {
    //     // Connection is open and ready to send data
    //     console.log("Connected to peer:", conn.peer);
    //   });

    //   conn.on("data", (data) => {
    //     // Handle incoming data
    //     console.log("Received data:", data);
    //   });
    // });
  }
  if (!peer.open) {
    // console.log("peer was closed");
    // // Listen for the 'open' event to determine when the Peer connection becomes open
    // peer.on("open", () => {
    //   // The Peer connection is now open, you can proceed to create connections
    //   const conn = peer.connect(id);
    //   // Handle the connection as needed
    //   conn.on("open", () => {
    //     // Connection is open and ready to send data
    //     console.log("Connected to peer:", conn.peer);
    //   });
    //   conn.on("data", (data) => {
    //     // Handle incoming data
    //     console.log("Received data:", data);
    //   });
    // });
  }
}
function addConnectionHandlers(player, otherPlayers, conn, globalPowerUps) {
  // console.log("adding connection handlers");
  conn.on("open", function () {
    console.log("Connection opened with peer:", conn.peer);
    // Check if a connection with the same peer already exists
    const existingConnection = connections.find((existingConn) => existingConn.peer === conn.peer);

    if (existingConnection) {
      // // Close the existing connection
      // existingConnection.close();
      // // Remove the existing connection from the connections array
      // const index = connections.indexOf(existingConnection);
      // if (index !== -1) {
      //   connections.splice(index, 1);
      // }
    } else {
      // Push the new connection
      // connections.push(conn);
    }
    //not sure why this seems to be needed even if there is existing connection
    // connections.push(conn);
    checkAndReplaceConnection(conn, existingConnection, player, otherPlayers, globalPowerUps);
    let existingOtherPlayer = otherPlayers.some((player) => player.id === conn.peer);

    //todo check consequennces of removing below - I don't think we should be adding player to list based on connect
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
    //todo should remove from connnections too?
  });

  conn.on("data", function (data) {
    //console.log("Received data:", data);
    if ((data && data.id) || (data && data.globalPowerUps) || (data && data.bots) || (data && data.requestForFullStates)) {
      handleData(player, otherPlayers, globalPowerUps, data);
    } else {
      console.log("Received unexpected data:", data);
    }
    // If there is a conflict between the local game state and the received game state,
    // update the local game state to match the received game state
    //todo not sure why this was a good place to do this but do need to have times to call this to try to resync
    // wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
  });
}

export function getPeer() {
  return peer;
}

function setPeer(newPeer) {
  peer = newPeer;
}

// export function updateConnections(player, globalPowerUps) {
//   if (everConnected || true) {
//     sendPlayerStates(player, isPlayerMasterPeer(player));
//   }
// }

export function removeClosedConnections(otherPlayers) {
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

export function getPlayerId() {
  return id;
}

export function chooseNewMasterPeer(player, otherPlayers) {
  //ok so we remove inactive player from connectedPeers list... but how can that player reconnect? do we want / need to remove from otherplayers too? do we just set it to dead?
  otherPlayers.forEach((otherPlayer) => {
    if (otherPlayer.timeSinceSentMessageThatWasRecieved > 60) {
      //connectedPeers = connectedPeers.filter((peer) => peer !== otherPlayer.id);
    } else {
      if (!connectedPeers.includes(otherPlayer.id)) {
        connectedPeers.push(otherPlayer.id);
      }
    }
  });
  let foundActivePlayerWithId = false;
  if (connectedPeers.length > 0) {
    connectedPeers.sort();
    for (let connectedPeer of connectedPeers) {
      if (connectedPeer == player.id) {
        foundActivePlayerWithId = true;
      }
      otherPlayers.forEach((otherPlayer) => {
        if (otherPlayer.timeSinceSentMessageThatWasRecieved <= 60 && otherPlayer.id == connectedPeer) {
          foundActivePlayerWithId = true;
        }
      });
      if (foundActivePlayerWithId) {
        masterPeerId = connectedPeer;

        if (masterPeerId === player.id) {
          player.setPlayerIsMaster(true);
        } else {
          player.setPlayerIsMaster(false);
        }
        break;
      }
    }
  }
  if (!foundActivePlayerWithId) {
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

  return function (player, otherPlayers, globalPowerUps) {
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
    createPeer(player, otherPlayers, globalPowerUps);
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
  if (timeSinceAnyMessageRecieved > 1000) {
    setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps), 50);
  }
  masterPeerId = chooseNewMasterPeer(player, otherPlayers);
}
