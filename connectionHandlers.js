import { resetPowerLevels } from './gameLogic.js';
import { setGlobalPowerUps } from './astroids.js';

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

shuffleArray(peerIds);
let index = 0;
let handleCounter = 0;
let sendCounter = 0;
let peer; 

export function sendPlayerStates(player,connections){
    // Check if connection is open before sending data
     // Send game state to other player
     let data = {
       id: player.id,
       x: player.x,
       y: player.y,
       angle: player.angle,
       color: player.color,
       powerUps: player.powerUps,
     };
     //console.log("Sending data:", data); // Log any data sent
     connections.forEach((conn) => {
       if (conn && conn.open) {
         conn.send(data);
         sendCounter++;
         // Log the data every 1000 calls
         if (sendCounter === 1000) {
           console.log("sending data:", data);
           sendCounter = 0; // reset the counter
         }
       }
     });
 }

 export function sendPowerups(globalPowerUps,connections) {
  let powerUpData = {
    globalPowerUps: globalPowerUps,
  };

  connections.forEach((conn) => {
    if (conn && conn.open) {
      conn.send(powerUpData);
    }
  });
}

// Wait for a short delay to allow time for the connections to be attempted
export function attemptConnections(player, peer, peerIds, otherPlayers, connections,globalPowerUps) {
  if (player.id === null) {
    console.log("All IDs are in use");
    return;
  }

  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    addConnectionHandlers(conn,player, otherPlayers, connections,globalPowerUps);
    everConnected = true;
  });

  peer.on("error", function (err) {
    //console.log("PeerJS error:");
  });

  peer.on("disconnected", function () {
    console.log("Disconnected from server");
  });

  connectToPeers(peerIds, player,otherPlayers,connections,globalPowerUps);
  return peer;
}

export function connectToPeers(peerIds,player, otherPlayers,connections,globalPowerUps) {
  // Connect to the other peers
  peerIds.forEach((id) => {
    if (id !== player.id) {
      // Check if a connection with this id already exists
      let existingConnection = connections.find((conn) => conn.peer === id);
      if (!existingConnection) {
        let conn = peer.connect(id);
        if (conn != null && conn != undefined) {
          //connections.push(conn); // Add the connection to the array
          everConnected = true;
          addConnectionHandlers(conn, player,otherPlayers, connections,globalPowerUps);
        }
      } else {
        console.log("existing connection with: " + id);
      }
    }
  });
}

export function tryNextId(peerIds,peer,player) {
  if (index >= peerIds.length) {
    console.log("All IDs are in use");
    return;
  }

  let id = peerIds[index];
  peer = new Peer(id); // Assign the new Peer to the peer variable

  peer.on("open", function () {
    // If the ID is already in use, this will not be called
    player.id = id;
    console.log("My peer ID is: " + id);
  });

  peer.on("error", function (err) {
    // If the ID is already in use, an error will be thrown
    if (err.type === "unavailable-id") {
      console.log("ID is in use:", id);
      index++;

      peer = tryNextId(peerIds,peer,player);
    } else {
      // console.log("Other error:", err);
      //console.log("Other error:");
    }
  });
  return peer;
}

function addConnectionHandlers(conn,player,otherPlayers,connections,globalPowerUps) {
  console.log("adding connection handlers");
  conn.on("open", function () {
    console.log("Connection opened with peer:", conn.peer);
    connections.push(conn);
    let existingOtherPlayer = otherPlayers.some((player) => player.id === conn.peer);
    if (!existingOtherPlayer) {
      let otherPlayerData = {
        id: conn.peer,
        x: -200,
        y: -200,
        angle: 0,
        color: "blue",
        powerUps: 0,
      };
      otherPlayers.push(otherPlayerData);
    }

    // Reset all powerUps when a new peer connects
    resetPowerLevels(player, otherPlayers, connections);

    // Send the current powerups to the new peer
    sendPowerups(globalPowerUps, connections);
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
      handleData(data,otherPlayers,globalPowerUps);
    } else {
      console.log("Received unexpected data:", data);
    }
  });
}

function handleData(data,otherPlayers,globalPowerUps) {
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
  }
  // If the player is not found, add them to the array
  else if (data.id) {
    otherPlayers.push(data);
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