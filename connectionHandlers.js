import { setGlobalPowerUps, Player, player, otherPlayers, bots,setBots } from "./astroids.js";
import {
  resetPowerLevels,
  updateEnemies,
  updatePowerups,
  pointsToWin,
  checkWinner,
  detectCollisions,
  updateBots,
  masterPeerUpdateGame,
} from "./gameLogic.js";


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
let connectionBackOffTime = 0;
let firebaseConfig = {
  apiKey: "AIzaSyAKNQY57EwlQ6TAf13wSx4eba4NK-MAN88",
  authDomain: "p2p-game-test.firebaseapp.com",
  projectId: "p2p-game-test",
  storageBucket: "p2p-game-test.appspot.com",
  messagingSenderId: "849363353418",
  appId: "1:849363353418:web:13c04c4ac2ef99c88b4bb3",
};
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

export function sendPlayerStates(player) {
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
    ticksSincePowerUpCollection: player.ticksSincePowerUpCollection,
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

// Wait for a short delay to allow time for the connections to be attempted
export function attemptConnections(player, otherPlayers, peerIds, globalPowerUps) {
  if (player.id === null) {
    console.log("All IDs are in use");
    connectionBackOffTime = (connectionBackOffTime + 500) * 2;
    setTimeout(() => tryNextId(player, peerIds), connectionBackOffTime);
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
    tryNextId();
    //  }
  });

  connectToPeers(player, otherPlayers, peerIds, globalPowerUps);
}

export function isPlayerMasterPeer(player) {
  return player.id === masterPeerId;
}

export function connectToPeers(player, otherPlayers, peerIds, globalPowerUps) {
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
          addConnectionHandlers(player, otherPlayers, conn, globalPowerUps);
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

      tryNextId(player, peerIds);
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

    // Reset all powerUps when a new peer connects
    resetPowerLevels(player, otherPlayers);

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
    if ((data && data.id) || (data && data.globalPowerUps)|| (data && data.bots)) {
      handleData(player, otherPlayers, globalPowerUps, data);
    } else {
      console.log("Received unexpected data:", data);
    }
    // If there is a conflict between the local game state and the received game state,
    // update the local game state to match the received game state
    resolveConflicts(data, player, globalPowerUps, otherPlayers);
  });
}

function handleData(player, otherPlayers, globalPowerUps, data) {
  //console.log("handling data:");
  // Find the otherPlayer in the array
  let otherPlayer = otherPlayers.find((player) => player.id === data.id);

  // If the player is found, update their data
  if (otherPlayer) {
    otherPlayer.x = data.x;
    otherPlayer.y = data.y;
    otherPlayer.angle = data.angle;
    otherPlayer.color = data.color;
    otherPlayer.powerUps = data.powerUps;
    otherPlayer.name = data.name;
    otherPlayer.pilot = data.pilot;
    otherPlayer.isMaster = data.isMaster;
    otherPlayer.ticksSincePowerUpCollection = data.ticksSincePowerUpCollection;

    if (player.getPlayerIsMaster() && otherPlayer.isMaster) {
      resolveConflicts(data, player, globalPowerUps, otherPlayers);
    }
  }
  // If the player is not found, add them to the array
  else if (data.id) {
    otherPlayers.push(data);
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
  if(data.bots){
    setBots(data.bots);
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

function setPeer(newPeer) {
  peer = newPeer;
}

//todo this is now also updating game if master peer, need to separate this
export function updateConnections(player, otherPlayers, globalPowerUps) {
  if (everConnected) {
    sendPlayerStates(player);
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
  if (player.id == null) {
    tryNextId(player, peerIds);
  }
  masterPeerId = chooseNewMasterPeer(player, otherPlayers);
}

export function addScore(category, name, score) {
  var collection = db.collection(category);

  // Get the current top 10 scores
  collection
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      var lowestScore = null;

      querySnapshot.forEach((doc) => {
        if (lowestScore == null || doc.data().score < lowestScore) {
          lowestScore = doc.data().score;
        }
      });

      // If the new score is in the top 10, add it to the database
      if (lowestScore == null || score > lowestScore) {
        collection
          .add({
            name: name,
            score: score,
            date: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(function (docRef) {
            console.log("Score written with ID: ", docRef.id);
          })
          .catch(function (error) {
            console.error("Error adding score: ", error);
          });
      }
    });
}

export function getTopScores(category, X) {
  return new Promise((resolve, reject) => {
    var scores = [];
    db.collection(category)
      .orderBy("score", "desc")
      .limit(X)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          var data = doc.data();
          scores.push(`Name: ${data.name}, Score: ${data.score}`);
        });
        resolve(scores);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
