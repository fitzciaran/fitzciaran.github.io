import { resetPowerLevels,updateEnemies, updatePowerups,pointsToWin,checkWinner } from "./gameLogic.js";
import { setGlobalPowerUps, Player, player, otherPlayers } from "./astroids.js";

export let everConnected = false;
export let connections = [];
export let peerIds = [
  "a7ef962d-14a8-40e4-8a1e-226a438a345d",
  "b7ef962d-14a8-40e4-8a1e-226a438a345d",
  "c7ef962d-14a8-40e4-8a1e-226a438a345d",
  "d7ef962d-14a8-40e4-8a1e-226a438a345d",
  "e7ef962d-14a8-40e4-8a1e-226a438a345d",
  "a6ef962d-14a8-40e4-8a1e-226a438a345d",
  "b6ef962d-14a8-40e4-8a1e-226a438a345d",
];

let masterPeerId = peerIds[0]; // start off with the first peer as the master

shuffleArray(peerIds);
let index = 0;
let handleCounter = 0;
let sendCounter = 0;
let peer;
let connectedPeers = [];

export function sendPlayerStates(player, connections) {
  // Check if connection is open before sending data
  // Send game state to other player
  let data = {
    id: player.id,
    x: player.x,
    y: player.y,
    angle: player.angle,
    color: player.color,
    powerUps: player.powerUps,
    name: player.name,
    pilot: player.pilot,
    isMaster: player.isMaster,
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

export function sendGameState(globalPowerUps, connections) {
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

export function sendPowerups(globalPowerUps, connections) {
  // let powerUpData = {
  //   globalPowerUps: globalPowerUps,
  // };

  // connections.forEach((conn) => {
  //   if (conn && conn.open) {
  //     conn.send(powerUpData);
  //   }
  // });
  console.log("tried old send powerups");
}

// Wait for a short delay to allow time for the connections to be attempted
export function attemptConnections(player, otherPlayers, peerIds, connections, globalPowerUps) {
  if (player.id === null) {
    console.log("All IDs are in use");
    return;
  }

  // peer.on("connection", function (conn) {
  //   console.log("Connection made with peer:", conn.peer);
  //   addConnectionHandlers(player, otherPlayers, conn, connections, globalPowerUps);
  //   everConnected = true;
  // });

  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    everConnected = true;
    //todo not sure if we need to move out this below line
    addConnectionHandlers(player, otherPlayers, conn, connections, globalPowerUps);
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
    //  }
  });

  connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps);
}

export function isPlayerMasterPeer(player) {
  return player.id === masterPeerId;
}

export function connectToPeers(player, otherPlayers, peerIds, connections, globalPowerUps) {
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
          addConnectionHandlers(player, otherPlayers, conn, connections, globalPowerUps);
        }
      } else {
        console.log("existing connection with: " + id);
      }
    }
  });
}

export function tryNextId(player, peerIds) {
  if (index >= peerIds.length) {
    console.log("All IDs are in use - trynextid function");
    return;
  }

  let id = peerIds[index];
  peer = new Peer(id); // Assign the new Peer to the peer variable

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

      tryNextId(player, peerIds);
    } else {
      // console.log("Other error:", err);
      //console.log("Other error:");
    }
  });
}

function addConnectionHandlers(player, otherPlayers, conn, connections, globalPowerUps) {
  console.log("adding connection handlers");
  conn.on("open", function () {
    console.log("Connection opened with peer:", conn.peer);
    connections.push(conn);
    let existingOtherPlayer = otherPlayers.some((player) => player.id === conn.peer);
    if (!existingOtherPlayer) {
      let otherPlayerData = new Player(conn.peer, -200, -200, 0, "blue", 0, "", "", player.worldDimensions, player.colors);
      otherPlayers.push(otherPlayerData);
    }

    // Reset all powerUps when a new peer connects
    resetPowerLevels(player, otherPlayers, connections);

    // Send the current powerups to the new peer
    //don't need to under master peer system
    //sendPowerups(globalPowerUps, connections);
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
    if ((data && data.id) || (data && data.globalPowerUps)) {
      handleData(data, otherPlayers, globalPowerUps);
    } else {
      console.log("Received unexpected data:", data);
    }
    // If there is a conflict between the local game state and the received game state,
    // update the local game state to match the received game state
    resolveConflicts(data, player, globalPowerUps, otherPlayers);
  });
}

function handleData(data, otherPlayers, globalPowerUps) {
  //console.log("handling data:");
  // Find the player in the array
  let player = otherPlayers.find((player) => player.id === data.id);

  // If the player is found, update their data
  if (player) {
    player.x = data.x;
    player.y = data.y;
    player.angle = data.angle;
    player.color = data.color;
    player.powerUps = data.powerUps;
    player.name = data.name;
    player.pilot = data.pilot;
  }
  // If the player is not found, add them to the array
  else if (data.id) {
    otherPlayers.push(data);
    if(data.powerUps > pointsToWin){
      checkWinner(player, otherPlayers, connections);
    }
  }
  // Only update the powerups if the received data contains different powerups
  if (data.globalPowerUps && JSON.stringify(globalPowerUps) !== JSON.stringify(data.globalPowerUps)) {
    setGlobalPowerUps(data.globalPowerUps);
  }
  handleCounter++;
  // Log the data every 1000 calls
  if (handleCounter === 1000) {
    console.log("handling data:", data);
    handleCounter = 0; // reset the counter
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function getPeer() {
  return peer;
}

export function setPeer(newPeer) {
  peer = newPeer;
}

//todo this is now also updating game if master peer, need to separate this
export function updateConnections(player, otherPlayers, connections) {
  if (everConnected) {
    sendPlayerStates(player, connections);
    if (isPlayerMasterPeer(player)) {
      masterPeerUpdateGame;
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

export function masterPeerUpdateGame() {
  // This peer is the master, so it runs the game logic for shared objects
  updateEnemies();
  updatePowerups();
  
  // Send the game state to all other peers
  sendGameState(connections);
}

function chooseNewMasterPeer(player, otherPlayers) {
  masterPeerId = connectedPeers[0];
  if (masterPeerId === player.id) {
    player.setPlayerIsMaster(true);
  } else {
    player.setPlayerIsMaster(false);
  }
  otherPlayers.forEach((otherPlayer) => {
    if (masterPeerId === otherPlayer.id) {
      otherPlayer.setPlayerIsMaster(true);
    } else {
      otherPlayer.setPlayerIsMaster(false);
    }
  });

  return masterPeerId;
}

function resolveConflicts(data, player, powerups, otherPlayers) {
  // If there is a conflict between the local game state and the received game state,
  // update the local game state to match the received game state
  if(player.id == null){
    tryNextId(player, peerIds);
  }
}
