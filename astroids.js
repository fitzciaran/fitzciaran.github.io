import { setupCanvas, drawBackground, drawWorldBounds,drawMinimap,drawRotatedShip,drawPowerups,drawMinimapPowerups,renderPowerupLevels } from './canvasDrawingFunctions.js';
import { resetPowerLevels,checkWinner,generatePowerups,checkPowerupCollision } from './gameLogic.js';
import { sendPlayerStates, sendPowerups } from './connectionHandlers.js';

const { canvas, ctx } = setupCanvas();

const worldWidth = 3600;
const worldHeight = 2400;

let globalPowerUps = [];

let powerUps = 0;
// Random initial position, at least 100 units away from each edge
let centerX = 100 + Math.random() * (worldWidth - 200);
let centerY = 100 + Math.random() * (worldHeight - 200);
const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "violet", "maroon", "crimson", "white"];
let color = colors[Math.floor(Math.random() * colors.length)];
let angle = 0;
let player = {
  id: null,
  x: centerX,
  y: centerY,
  powerUps: powerUps,
  color: color,
  angle: angle,
};

// Initial camera position at start of game
let camX = player.x - canvas.width / 2;
let camY = player.y - canvas.height / 2;
const radius = 50;
const maxDistance = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
const shipPoints = [
  { x: 0, y: -20 },
  { x: -10, y: 20 },
  { x: 0, y: 10 },
  { x: 10, y: 20 },
];
let mousePos = { x: 0, y: 0 };

const acceleration = 0.25;
const friction = 0.95;
let vel = { x: 0, y: 0 };

// Define the max distance (2 ship lengths in this case)
let maxForceDistance = 2 * 50;

let distanceFactor;
let keys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

let everConnected = false;
let conn;
let connections = [];
let peerIds = [
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
let peer; // Declare the peer variable here
let otherPlayers = [];
let handleCounter = 0;


/* START CONNECTION HANDLERS  */

function tryNextId() {
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

      tryNextId();
    } else {
      // console.log("Other error:", err);
      //console.log("Other error:");
    }
  });
}

tryNextId();
// Wait for a short delay to allow time for the connections to be attempted
setTimeout(function () {
  if (player.id === null) {
    console.log("All IDs are in use");
    return;
  }

  peer.on("connection", function (conn) {
    console.log("Connection made with peer:", conn.peer);
    addConnectionHandlers(conn);
  });

  peer.on("error", function (err) {
    //console.log("PeerJS error:");
  });

  peer.on("disconnected", function () {
    console.log("Disconnected from server");
  });

  connectToPeers();
}, 3000);

function addConnectionHandlers(conn) {
  everConnected = true;
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
      handleData(data);
    } else {
      console.log("Received unexpected data:", data);
    }
  });
}

function handleData(data) {
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
    globalPowerUps = data.globalPowerUps;
  }
  handleCounter++;
  // Log the data every 1000 calls
  if (handleCounter === 1000) {
    console.log("handling data:", data);
    handleCounter = 0; // reset the counter
  }
}

setInterval(connectToPeers, 6000);


setInterval(function() {
generatePowerups(globalPowerUps,connections,worldWidth,worldHeight,colors);
}, 3000);
setInterval(function() {
  sendPowerups(globalPowerUps, connections);
}, 3000);

function connectToPeers() {
  // Connect to the other peers
  peerIds.forEach((id) => {
    if (id !== player.id) {
      // Check if a connection with this id already exists
      let existingConnection = connections.find((conn) => conn.peer === id);
      if (!existingConnection) {
        let conn = peer.connect(id);
        if (conn != null && conn != undefined) {
          //connections.push(conn); // Add the connection to the array
          addConnectionHandlers(conn);
        }
      } else {
        console.log("existing connection with: " + id);
      }
    }
  });
}

/* END CONNECTION HANDLERS  */

/* START INPUT EVENT HANDLERS  */

window.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    keys.space = true;
  }
});

window.addEventListener("keyup", function (e) {
  if (e.code === "Space") {
    keys.space = false;
  }
});

canvas.addEventListener(
  "mousemove",
  function (evt) {
    let coords = getMousePos(canvas, evt);
    mousePos.x = coords.x + camX;
    mousePos.y = coords.y + camY;
    player.angle = calculateAngle(mousePos);
  },
  false
);

canvas.addEventListener("mousedown", function (e) {
  keys.space = true;
});

canvas.addEventListener("mouseup", function (e) {
  keys.space = false;
});

canvas.addEventListener("touchstart", function (e) {
  keys.space = true;

  // Update mouse position on touch start
  if (e.touches) {
    mousePos.x = e.touches[0].clientX + camX;
    mousePos.y = e.touches[0].clientY + camY;
    player.angle = calculateAngle(mousePos);
  }
});

canvas.addEventListener("touchend", function (e) {
  keys.space = false;
});

canvas.addEventListener(
  "touchmove",
  function (e) {
    // Prevent scrolling when touching the canvas
    e.preventDefault();

    if (e.touches) {
      let coords = getMousePos(canvas, e.touches[0]);
      mousePos.x = coords.x + camX;
      mousePos.y = coords.y + camY;
      player.angle = calculateAngle(mousePos);
    }
  },
  { passive: false }
); // Set passive to false to prevent scrolling

/* END INPUT EVENT HANDLERS  */

function shipHitsBorder(x, y) {
  return x < 0 || y < 0 || x > worldWidth || y > worldHeight;
}

function calculateAngle(mousePos) {
  return Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function update() {
  const bounceFactor = 1.5; // Adjust this to control bounce behavior
  const offset = 1; // Adjust this to make sure ship doesn't get "stuck" in the wall
  const camSpeed = 0.025; // Adjust this to control camera "lag"
  const minBounceSpeed = 5;

  // camera gradually moves towards the ship
  const targetCamX = player.x - canvas.width / 2;
  const targetCamY = player.y - canvas.height / 2;
  camX += (targetCamX - camX) * camSpeed;
  camY += (targetCamY - camY) * camSpeed;

  // prevent camera from going outside of world
  camX = Math.min(camX, worldWidth - canvas.width);
  camX = Math.max(camX, 0);
  camY = Math.min(camY, worldHeight - canvas.height);
  camY = Math.max(camY, 0);

  // compute a unit vector pointing from the mouse to the center
  let dx = player.x - mousePos.x;
  let dy = player.y - mousePos.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  player.angle = Math.atan2(dy, dx) + Math.PI / 2;

  let speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
  let squareFactor = speed * speed;
  let newFriction = 0.99 - squareFactor * 0.001;
  newFriction = Math.max(newFriction, 0.7);

  vel.x *= newFriction;
  vel.y *= newFriction;

  if (keys.space) {
    let mouseToCenter = { x: dx / distance, y: dy / distance };
    let maxForceDistance = 2 * 20;

    if (distance > maxForceDistance) {
      distanceFactor = 1;
    } else {
      distanceFactor = Math.min(1, distance / (canvas.width / 2));
    }

    vel.x += acceleration * distanceFactor * mouseToCenter.x;
    vel.y += acceleration * distanceFactor * mouseToCenter.y;
  }
  // If the ship hits the edge of the world, bounce
  if (player.x < 0) {
    vel.x = -vel.x * bounceFactor;
    player.x = offset;
    if (Math.abs(vel.x) < minBounceSpeed) {
      vel.x = (vel.x < 0 ? -1 : 1) * minBounceSpeed;
    }
  } else if (player.x > worldWidth) {
    vel.x = -vel.x * bounceFactor;
    player.x = worldWidth - offset;
    if (Math.abs(vel.x) < minBounceSpeed) {
      vel.x = (vel.x < 0 ? -1 : 1) * minBounceSpeed;
    }
  }

  if (player.y < 0) {
    vel.y = -vel.y * bounceFactor;
    player.y = offset;
    if (Math.abs(vel.y) < minBounceSpeed) {
      vel.y = (vel.y < 0 ? -1 : 1) * minBounceSpeed;
    }
  } else if (player.y > worldHeight) {
    vel.y = -vel.y * bounceFactor;
    player.y = worldHeight - offset;
    if (Math.abs(vel.y) < minBounceSpeed) {
      vel.y = (vel.y < 0 ? -1 : 1) * minBounceSpeed;
    }
  }

  // The position needs to be restricted to within the world
  player.x += vel.x;
  player.y += vel.y;
  // Check collision for you
  checkPowerupCollision(player,globalPowerUps,connections);
  // Don't Check collision for other players let each player do it for themselves
 
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground(ctx, camX,camY,canvas);
  drawWorldBounds(ctx, camX,camY,worldWidth,worldHeight);

  ctx.lineWidth = 2;

  // Draw other players
  otherPlayers.forEach((player) => {
    drawRotatedShip(ctx, camX,camY, player.x, player.y, player.angle, shipPoints, player.color);
  });

  drawPowerups(globalPowerUps,ctx,camX,camY);
  drawMinimap(player,otherPlayers, worldWidth, worldHeight);
  drawMinimapPowerups(globalPowerUps, worldWidth, worldHeight);
  drawRotatedShip(ctx, camX,camY,  player.x, player.y, player.angle, shipPoints, player.color);
  renderPowerupLevels(ctx,player,otherPlayers);
  if (everConnected) {
    sendPlayerStates(player,connections);
   
  } else {
    connections.forEach((conn) => {
      if (conn && conn.closed) {
        console.log("Connection closed with peer:", conn.peer);
        // Remove player from otherPlayers array
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
      } else if (!conn) {
        console.log("Connection null, removing from otherplayers list and from connections", conn.peer);
        // Remove player from otherPlayers array
        otherPlayers = otherPlayers.filter((player) => player.id !== conn.peer);
        //is it ok to do this in the foreach iterating over connections?
        connections = connections.filter((player) => player.id !== conn.peer);
      }
    });
  }
  if (checkWinner(player, otherPlayers,connections,ctx,canvas)) {
    return;
  }
  requestAnimationFrame(update);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}




update();
