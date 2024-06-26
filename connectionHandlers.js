import { shuffleArray } from "./gameUtils.js";
import { handleData } from "./handleData.js";
import { sendEntitiesState } from "./sendData.js";

import { Player } from "./player.js";
export let everConnected = false;
export let connections = [];
export const compression = false;

export let versionNumber = 115;
export let peerIds = [
  "a7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "b7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "c7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "d7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "e7ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "a6ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
  "b6ef962d-14a9-40e5-8a2d-226c548b3" + versionNumber,
];
if (!compression) {
  peerIds = [
    "a7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "b7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "c7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "d7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "e7ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "a6ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
    "b6ef962d-14a9-40e5-8a2d-226e638b3" + versionNumber,
  ];
}
let reconnectionAttempts = 0;
shuffleArray(peerIds);
export let ticksSinceLastConnectionAttempt = 0;
export function setTicksSinceLastConnectionAttempt(newTime) {
  ticksSinceLastConnectionAttempt = newTime;
}
export let ticksSinceLastFullSendRequestResponse = 0;
export function setTicksSinceLastFullSendRequestResponse(newTime) {
  ticksSinceLastFullSendRequestResponse = newTime;
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
export function attemptConnections(player, otherPlayers, globalPowerUps, addHandlers = true, connectPeers = true) {
  if (player.id === null) {
    console.log("in attemptConnections Player id is null");
    connectionBackOffTime = (connectionBackOffTime + 500) * 2;
    setTimeout(() => createPeer(player, otherPlayers, globalPowerUps), connectionBackOffTime);
    return;
  }
  verifyPeerHealth(player, otherPlayers, globalPowerUps);
  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    everConnected = true;

    if (addHandlers) {
      addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
    }
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
  if (connectPeers) {
    connectToPeers(player, otherPlayers, globalPowerUps);
  }
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
    attemptConnections(player, otherPlayers, globalPowerUps, true, true);
  });

  peer.on("error", function (err) {
    // If the ID is already in use, an error will be thrown
    if (err.type === "unavailable-id") {
      console.log("ID is in use:", id);
      index++;

      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    } else if (err.type === "browser-incompatible") {
      console.log("browser incompatible:", err);
    } else if (err.type === "network") {
      console.log("network error :", err);
      createPeer(player, otherPlayers, globalPowerUps, reconnectionAttempts);
    } else {
      console.log("Other error:", err);
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

    if (isPlayerMasterPeer(player)) {
      sendEntitiesState(conn.peer);
    }
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
    if (!data) {
      return;
    }
    if (compression) {
      // Decompress the data using Pako
      const inflatedData = pako.inflate(data);

      // Convert the decompressed Uint8Array directly to a JavaScript object
      data = JSON.parse(new TextDecoder().decode(inflatedData));
    }
    //console.log("Received data:", data);
    if ((data && data.id) || (data && data.gameState) || (data && data.requestForFullStates) || (data && data.requestFullUpdate)) {
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
  resolveConnectionConflicts(player, otherPlayers, globalPowerUps, true);
}

function resolveConnectionConflicts(player, otherPlayers, globalPowerUps, tryToRedoConnections = false) {
  // If there is a conflict between the local game state and the received game state,

  //not sure about the below might need to keep it in mind but I think it was causing major issues.
  // setTicksSinceLastConnectionAttempt(0);
  // otherPlayers = otherPlayers.filter((player) => player.id !== connectedPeers[0]);
  // connections = connections.filter((connection) => connection.peer !== connectedPeers[0]);
  // connectedPeers.splice(0, 1);
  //might not be able to attempt connections again without issues
  if (timeSinceAnyMessageRecieved > 1000 && tryToRedoConnections == true) {
    console.log("attempting resolveConnections");
    setTimeout(() => attemptConnections(player, otherPlayers, globalPowerUps, true, false), 50);
  }
  masterPeerId = chooseNewMasterPeer(player, otherPlayers);
}
