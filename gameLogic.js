import { setGameState, GameState, player, setMines, bots, otherPlayers, mines, setGameTimer, gameTimer } from "./main.js";
import { isPlayerMasterPeer, setTimeSinceMessageFromMaster, timeSinceMessageFromMaster } from "./connectionHandlers.js";
import { sendPlayerStates, sendEntitiesState, sendEntitiesUpdate, sendRemoveEntityUpdate, sendMinesUpdate, sendPowerUpsUpdate } from "./sendData.js";
import { forces, Mine, PowerUp, ForceType, ForceArea, Entity } from "./entities.js";
import { Player, Bot } from "./player.js";

//if mess with these need to change the collision detection - factor these in
export const shipScale = 2;
export const mineScale = 0.7;

//finish game after 5 for easier testing the finish
export let pointsToWin = 5;
export let initialInvincibleTime = 60 * 10;
export let maxInvincibilityTime = initialInvincibleTime;
export let maxSpecialMeter = 200;
let maxPowerups = 10;
let maxMines = 14;
let maxDirectionalForces = 3;
let directionalForces = [];
export let spawnProtectionTime = 200;
export let endGameMessage = "";
export let gameWon = false;
export let basicAnimationTimer = 0;
export let updateRequested = false;
export function setUpdateRequested(newValue) {
  updateRequested = newValue;
}
export const botRespawnDelay = 240;
export const PilotName = {
  PILOT_1: "pilot1",
  PILOT_2: "pilot2",
  PILOT_3: "pilot3",
  PILOT_4: "pilot4",
};

export class Pilot extends Entity {
  constructor(id = null, x = null, y = null, width = 100, height = 100, lore = "", name = "", src = "", selected = false, pilotAnimationFrame = 0) {
    super(id, x, y);
    this.image = new Image();
    this.width = width;
    this.height = height;
    this.lore = lore;
    this.name = name;
    this.src = src;
    this.selected = selected;
    this.pilotAnimationFrame = pilotAnimationFrame;
  }
  setSelected(newSelectedValue) {
    if (newSelectedValue && !this.selected) {
      this.pilotAnimationFrame = 0;
    }
    this.selected = newSelectedValue;
  }
}
export const pilot1 = new Pilot(
  PilotName.PILOT_1,
  0,
  0,
  100,
  100,
  "Orion, Speed: 4, Special: Gravity Attract, Agressive - likes to get powered up and use Gravity Attract to get kills",
  PilotName.PILOT_1,
  "images/wolf.webp"
);
export const pilot2 = new Pilot(
  PilotName.PILOT_2,
  0,
  0,
  100,
  100,
  "Bumble, Speed: 2, Special: Gravity Repel, Defensive - not so fast but can use Gravity Repel to keep attackers away ",
  PilotName.PILOT_2,
  "images/slippy.webp"
);
export const pilot3 = new Pilot(
  PilotName.PILOT_3,
  0,
  0,
  100,
  100,
  "Zippy, Speed: 5, Special: Speed Boost, Speedy - tricky to control. Not for scrubs! ",
  PilotName.PILOT_3,
  "images/mouse.webp"
);
export const pilot4 = new Pilot(
  PilotName.PILOT_4,
  0,
  0,
  100,
  100,
  "Snaffle, Speed: 3, Special: Tractor Beam, Sneaky! Powerful long range narrow tractor beam can cause havok from afar!",
  PilotName.PILOT_4,
  "images/bore612.webp"
);

export let pilots = [pilot1, pilot2, pilot3, pilot4];

export const max_player_name = 15;
let chancePowerUpIsStar = 0.2;

export function setEndGameMessage(newMessage) {
  endGameMessage = newMessage;
}

export function generatePowerups(globalPowerUps, worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  let addedPowerUps = false;
  // Check if there are less than max powerups powerups
  while (globalPowerUps.length < maxPowerups) {
    // Generate a new dot with random x and y within the world
    // let powerup = {
    //   x: (Math.random() * 0.8 + 0.1) * worldWidth,
    //   y: (Math.random() * 0.8 + 0.1) * worldHeight,
    //   color: colors[Math.floor(Math.random() * colors.length)],
    // };
    let isStar = false;
    let radius = 50;
    let value = 2;

    if (Math.random() > 1 - chancePowerUpIsStar) {
      isStar = true;
      radius = 15;
      value = 1;
    }

    let powerUp = new PowerUp(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      colors[Math.floor(Math.random() * colors.length)],
      isStar,
      radius,
      value
    );
    addedPowerUps = true;
    globalPowerUps.push(powerUp);
    // setGlobalPowerUps(globalPowerUps);
    // Send the powerups every time you generate one
    // sendPowerups(globalPowerUps);

    //cf test do we need this sendGameState(globalPowerUps);
  }
  if (addedPowerUps) {
    sendPowerUpsUpdate(true);
  }
}

export function generateMines(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  // Check if there are less than max powerups powerups
  while (mines.length < maxMines) {
    let hasGravity = 0;
    if (Math.random() > 0.8) {
      hasGravity = 1;
    }
    let mine = new Mine(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      100,
      10,
      colors[Math.floor(Math.random() * colors.length)],
      hasGravity
    );
    mines.push(mine);
  }
}

export function generateDirectionalForces(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  // let directionalForcesToGenerate = 4;
  // let directionalForcesGenerated = 0;
  // Check if there are less than max powerups powerups
  while (directionalForces.length < maxDirectionalForces) {
    let hasGravity = 0;
    if (Math.random() > 0.4) {
      hasGravity = 1;
    }
    let force = new ForceArea(
      "force-" + Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      0.7,
      10,
      200,
      true,
      "green",
      null,
      0,
      Math.random() * 2 * Math.PI,
      ForceType.DIRECTIONAL,
      420 + Math.floor((Math.random() - 1) * 300),
      600 + Math.floor((Math.random() - 1) * 300)
      // 420 + Math.floor((Math.random() - 1) * 0),
      // 600 + Math.floor((Math.random() - 1) * 0)
    );

    forces.push(force);
    directionalForces.push(force);
    // directionalForcesGenerated++;
  }
}

export function checkPowerupCollision(playerToCheck, globalPowerUps) {
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 * shipScale + globalPowerUps[i].radius && globalPowerUps[i].hitFrames == -1) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.ticksSincePowerUpCollection == -1) {
        //may need to make this an array of "recently collected / iteracted stuff" to be more robust in the future rather than a simple power up timer
        // playerToCheck.powerUps += globalPowerUps[i].value;
        let scoreToAdd = globalPowerUps[i].value;

        playerToCheck.gotPowerUp(globalPowerUps[i].isStar, scoreToAdd, i);
        if (isPlayerMasterPeer(player)) {
          sendPowerUpsUpdate(false);
        }
      }
      // sendPowerups(globalPowerUps);

      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      // break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
    }
  }
}

//todo more generic entity based collision function, maybe each entity has its own action upon collision
export function checkMineCollision(playerToCheck, mines) {
  for (let i = 0; i < mines.length; i++) {
    let dx = playerToCheck.x - mines[i].x;
    let dy = playerToCheck.y - mines[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 * shipScale + mines[i].radius) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.invincibleTimer == 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime && mines[i].hitFrames == -1) {
        playerToCheck.gotHit("a mine");
        mines[i].hitFrames = 2;
        // mines.splice(i, 1);
      }
      if (playerToCheck.invincibleTimer > 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime && mines[i].hitFrames == -1) {
        if (playerToCheck.invincibleTimer > 115) {
          playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 100);
        } else {
          playerToCheck.setInvincibleTimer(15);
        }
        mines[i].hitFrames = 2;
        // mines.splice(i, 1);
      }
      // sendPowerups(globalPowerUps);
      // setMines(mines);
      if (isPlayerMasterPeer(player)) {
        sendMinesUpdate(false);
      }
      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
    }
  }
}

export function checkPlayerCollision(playerToCheck, allPlayers) {
  for (let i = 0; i < allPlayers.length; i++) {
    if (playerToCheck.id == allPlayers[i].id) {
      //don't check collision against self
      continue;
    }
    if (playerToCheck.timeSinceSentMessageThatWasRecieved > 120) {
      //don't check collision against idle player
      continue;
    }
    let dx = playerToCheck.x - allPlayers[i].x;
    let dy = playerToCheck.y - allPlayers[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance < 20 * shipScale &&
      playerToCheck.isPlaying == true &&
      allPlayers[i].isPlaying == true &&
      !playerToCheck.isDead &&
      !allPlayers[i].isDead &&
      !allPlayers[i].timeSinceSentMessageThatWasRecieved <= 120 &&
      playerToCheck.timeSinceSpawned > spawnProtectionTime &&
      allPlayers[i].timeSinceSpawned > spawnProtectionTime
    ) {
      // assuming hitbox  of both ships is simple radius
      //for now just reset player if a crash

      if (playerToCheck.invincibleTimer == 0) {
        if (
          playerToCheck.timeSinceSpawned > spawnProtectionTime &&
          (allPlayers[i].timeSinceSpawned > spawnProtectionTime || allPlayers[i].invincibleTimer > 0)
        ) {
          playerToCheck.gotHit(allPlayers[i].name);
        } //spawn protection todo show an effect to illustrate the protection during this period
      }
      if (playerToCheck.invincibleTimer > 0 && allPlayers[i].invincibleTimer == 0 && allPlayers[i].timeSinceSpawned > spawnProtectionTime) {
        playerToCheck.hitOtherPlayer(allPlayers[i]);
      }
      if (playerToCheck.isBot && playerToCheck.invincibleTimer == 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime) {
        // playerToCheck.resetState(true, true);
        playerToCheck.delayReset(botRespawnDelay, true, true);
      }
      if (allPlayers[i] instanceof Player) {
        if (allPlayers[i].invincibleTimer == 0) {
          if (
            allPlayers[i].timeSinceSpawned > spawnProtectionTime &&
            (playerToCheck.timeSinceSpawned > spawnProtectionTime || playerToCheck.invincibleTimer > 0)
          ) {
            allPlayers[i].gotHit(playerToCheck.name);
          }
        }
        if (allPlayers[i].invincibleTimer > 0 && playerToCheck.invincibleTimer == 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime) {
          allPlayers[i].hitOtherPlayer(playerToCheck);
        }
        if (allPlayers[i].isBot && allPlayers[i].invincibleTimer == 0 && allPlayers[i].timeSinceSpawned > spawnProtectionTime) {
          // allPlayers[i].resetState(true, true);
          allPlayers[i].delayReset(botRespawnDelay, true, true);
        }
      } else {
        console.log("non player in players array");
      }
    }
  }
}

export function checkForcesCollision(playerToCheck, forces) {
  for (let force of forces) {
    if (force.type == ForceType.DIRECTIONAL) {
      //for now we make directional forces not expire naturally
      force.duration = 10;
    }
    if (playerToCheck == force.tracks) {
      continue;
    }
    if (playerToCheck != null && force.tracks != null && playerToCheck.id === force.tracks.id && playerToCheck.name === force.tracks.name) {
      continue;
    }

    // Calculate the vector from the force to the player
    const dx = playerToCheck.x - force.x;
    const dy = playerToCheck.y - force.y;

    // Calculate the distance between the player and the force
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the angle between the ship's direction and the vector to the player
    const angleToPlayer = Math.atan2(dy, dx);
    const angleDifference = Math.abs(force.direction - angleToPlayer);

    if (force.type == ForceType.POINT) {
      // Check if the player is within the cone and distance range
      if (distance > force.radius || (angleDifference > force.coneAngle / 2 && force.coneAngle < 2 * Math.PI - 0.01)) {
        continue;
      }
      playerToCheck.inForce += 2;
      // Calculate the proportional force strength
      let strength = 0;
      const maxForce = force.force;

      if (distance > 0 && distance <= 50) {
        // Calculate strength based on the inverse square of the distance
        // strength = force.force / 2500 / (distance * distance);
        strength = maxForce;
      } else if (distance > 50 && distance <= force.radius) {
        // Gradual decrease in force from max at 50 to 40% at force.radius
        const minForce = 0.6 * maxForce;
        const forceRange = maxForce - minForce;
        const distanceRange = force.radius - 50;
        const forceIncrement = forceRange / distanceRange;
        strength = maxForce - forceIncrement * (distance - 50);
      }

      // Calculate the force components
      let forceX = (dx / distance) * strength;
      let forceY = (dy / distance) * strength;

      if (force.isAttractive) {
        forceX *= -1;
        forceY *= -1;
      }

      // Apply the force to playerToCheck's velocity
      playerToCheck.vel.x += forceX;
      playerToCheck.vel.y += forceY;
      playerToCheck.boundVelocity();
    } else if (force.type == ForceType.DIRECTIONAL) {
      // Calculate the vector from the force to the player
      const dx = playerToCheck.x - force.x;
      const dy = playerToCheck.y - force.y;

      // Rotate the player's position relative to the force direction
      const rotatedX = dx * Math.cos(-force.direction) - dy * Math.sin(-force.direction);
      const rotatedY = dx * Math.sin(-force.direction) + dy * Math.cos(-force.direction);

      // Calculate half of the width and length of the rectangle
      const halfWidth = force.width / 2;
      const halfLength = force.length / 2;

      // Check if the player is within the rotated rectangle and distance range
      if (Math.abs(rotatedX) <= halfWidth && Math.abs(rotatedY) <= halfLength) {
        playerToCheck.inForce += 5;
        // Calculate the proportional force strength
        let strength = 0;
        const maxForce = force.force;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance <= halfLength) {
          // Gradual decrease in force from max at 0 to 40% at halfLength
          const minForce = 0.6 * maxForce;
          const forceRange = maxForce - minForce;
          strength = maxForce - (distance / halfLength) * forceRange;
        }

        // Calculate the force components based on the force's direction
        const forceX = Math.cos(force.direction) * strength;
        const forceY = Math.sin(force.direction) * strength;

        if (force.isAttractive) {
          // If the force is attractive, apply it in the opposite direction
          playerToCheck.vel.x += -forceX;
          playerToCheck.vel.y += -forceY;
        } else {
          // If the force is repulsive, apply it in the specified direction
          playerToCheck.vel.x += forceX;
          playerToCheck.vel.y += forceY;
        }

        playerToCheck.boundVelocity();
      }
    }
  }
}

export function resetPowerLevels(player, otherPlayers, globalPowerUps) {
  // Reset my powerUps
  player.powerUps = 0;

  // Reset powerUps of other players
  otherPlayers.forEach((player) => {
    player.powerUps = 0;
  });

  // Send updated powerUps to other players
  sendPlayerStates(player, isPlayerMasterPeer(player));
}

function shipHitsBorder(x, y) {
  return x < 0 || y < 0 || x > worldWidth || y > worldHeight;
}

export function setGameWon(won) {
  gameWon = won;
}

export function updateEnemies(deltaTime) {
  // Update the positions, velocities, etc. of the enemies, create and track forces
  //todo sync forces to deltaTime... could the level of force be linked?
  //or could we get away with only creating new force if old one doesn't exist?
  for (let mine of mines) {
    mine.createForce();
  }

  for (let force of forces) {
    if (force.duration > 0) {
      // for (let effectedPlayer of allPlayers){
      if (force.tracks != null && force.tracks.isPlaying && !force.tracks.isDead) {
        force.x = force.tracks.x;
        force.y = force.tracks.y;
      }
      // }
      try {
        force.setDuration(force.duration - 1);
      } catch (Exception) {
        console.log("force issue");
      }
    }
  }
}

export function updateOtherPlayers(deltaTime) {
  otherPlayers.forEach((otherPlayer, index) => {
    // Check if player is an instance of the Player class
    if (otherPlayer != null && otherPlayer instanceof Player) {
      if (otherPlayer.name != "") {
        otherPlayer.updateTick(deltaTime);
      }
    } else {
      console.log("otherPlayer is not an instance of the Player class. Reinitializing...");

      // Create a new Player object using the properties of the otherplayer
      const newPlayer = new Player(
        otherPlayer.id,
        otherPlayer.x,
        otherPlayer.y,
        otherPlayer.powerUps,
        otherPlayer.color,
        otherPlayer.angle,
        otherPlayer.pilot,
        otherPlayer.name,
        otherPlayer.isPlaying
      );

      // Replace the old player with the new Player instance in the array
      otherPlayer[index] = newPlayer;
    }
  });
}

export function updateBots(deltaTime) {
  bots.forEach((bot, index) => {
    // Check if bot is an instance of the Bot class
    if (bot == null || !(bot instanceof Bot)) {
      // console.log("Bot is not an instance of the Bot class. Reinitializing...");

      // Create a new Bot object using the properties of the bot
      const newPlayer = new Bot(
        bot.id,
        bot.x,
        bot.y,
        bot.powerUps,
        bot.color,
        bot.angle,
        bot.pilot,
        bot.name
        // Add other properties as needed
      );

      // Replace the old bot with the new Bot instance in the array
      bots[index] = newPlayer;
    }
    if (bot != null && bot instanceof Bot && bot.isDead) {
      bot.delayReset(botRespawnDelay, true, true);
    }
    if (bot != null && bot instanceof Bot && !bot.isDead) {
      //todo not sure about this conditional
      if (isPlayerMasterPeer(player)) {
        bot.updateBotInputs();
      }
      bot.updateTick(deltaTime);
    }
  });
}

export function updatePowerups(deltaTime) {
  // Update the positions, velocities, etc. of the powerups once they move... they need their own update tick
  //setGlobalPowerUps(getGlobalPowerUps());
}
export function detectCollisions(playerToCheck, globalPowerUps, bots, otherPlayers, forces) {
  // Detect collisions between the player's ship and the powerups or other ships
  // If a collision is detected, update the game state accordingly
  checkPowerupCollision(playerToCheck, globalPowerUps);
  checkMineCollision(playerToCheck, mines);
  let allPlayers = [...bots, ...otherPlayers, player];
  checkPlayerCollision(playerToCheck, allPlayers);
  checkForcesCollision(playerToCheck, forces);
}

export function calculateAngle(player) {
  return Math.atan2(player.mousePosY - player.y, player.mousePosX - player.x);
}

export function masterUpdateGame(player, globalPowerUps, otherPlayers, bots, deltaTime) {
  //this isn't synced between peers
  setGameTimer(gameTimer + 1);
  if (!isPlayerMasterPeer(player)) {
    setTimeSinceMessageFromMaster(timeSinceMessageFromMaster + 1);
  }
  player.updateTick(deltaTime);
  createBots();
  updateBots(deltaTime);
  updateOtherPlayers(deltaTime);
  updateEnemies(deltaTime);
  updatePowerups(deltaTime);

  // Detect collisions with powerups or other ships
  detectCollisions(player, globalPowerUps, bots, otherPlayers, forces);

  // The master peer also detects collisions between all ships and powerups
  otherPlayers.forEach((otherPlayer) => {
    detectCollisions(otherPlayer, globalPowerUps, bots, otherPlayers, forces);
  });

  bots.forEach((bot) => {
    detectCollisions(bot, globalPowerUps, bots, otherPlayers, forces);
  });

  // Remove mines with hit frames that have expired.
  for (let i = mines.length - 1; i >= 0; i--) {
    if (mines[i].hitFrames < -1) {
      // in "initialising" state - do this first before potential splicing
      mines[i].hitFrames++;
    }
    if (mines[i].hitFrames >= 0) {
      mines[i].hitFrames--;
      // If hit frames have expired, remove the mine.
      if (mines[i].hitFrames < 0) {
        if (isPlayerMasterPeer(player)) {
          sendRemoveEntityUpdate("removeMines", [mines[i]]);
        }
        mines.splice(i, 1);
      }
    }
    
  }

  // Remove PowerUps with hit frames that have expired.
  for (let i = globalPowerUps.length - 1; i >= 0; i--) {
    if (globalPowerUps[i].hitFrames < -1) {
      // in "initialising" state  - do this first before potential splicing
      globalPowerUps[i].hitFrames++;
    }
    if (globalPowerUps[i].hitFrames >= 0) {
      globalPowerUps[i].hitFrames--;
      // If hit frames have expired, remove the PowerUps.
      if (globalPowerUps[i].hitFrames < 0) {
        if (isPlayerMasterPeer(player)) {
          sendRemoveEntityUpdate("removePowerUps", [globalPowerUps[i]]);
        }
        globalPowerUps.splice(i, 1);
      }
    }
    
  }

  basicAnimationTimer++;

  //...not sending game state of otherplayers...hmm?
  //trying out not sending updates every frame
  if (isPlayerMasterPeer(player)) {
    if (gameTimer % 2 == 1) {
      sendEntitiesUpdate();
    } else if (gameTimer % 59 == 1) {
      sendEntitiesState();
    }
  }
  if (!player.isDead && gameTimer % 2 == 1) {
    sendPlayerStates(player, isPlayerMasterPeer(player));
  }
}

//for now just create 4
export function createBots() {
  if (bots != null && bots[0] == null) {
    let botID = 1234;
    while (bots != null && bots.length < 4) {
      // let bot = new Bot(botID, null, null, 0, "yellow", 0, "", getRandomName());
      let bot = new Bot(botID, null, null, 0, null, 0, "", getRandomName());
      bot.isBot = true;
      // bot.name = getRandomName();
      botID += 1;
      bots.push(bot);
    }
  }
}
export function getRandomName() {
  const prefixes = [
    "Astro",
    "Galaxy",
    "Star",
    "Cosmo",
    "Rocket",
    "Lunar",
    "Solar",
    "Free",
    "Quasar",
    "Pulsar",
    "Meteor",
    "Poopy",
    "Sneaky",
    "Stinky",
    "Drunk",
    "Mean",
    "Tree",
    "Dave",
    "Chuck",
    "Fire",
    "Ice",
    "Mystic",
    "Electric",
    "Nebula",
    "Aqua",
    "Cyber",
    "Shadow",
    "Crystal",
    "Golden",
    "Silver",
    "Ein",
    "Kevin",
    "Jiggly",
    "Pork",
  ];
  const suffixes = [
    "Rider",
    "Pilot",
    "Crusher",
    "Dasher",
    "Blaster",
    "Buster",
    "Zoomer",
    "Flyer",
    "Racer",
    "Striker",
    "Tosser",
    "Wanderer",
    "Maverick",
    "Slinger",
    "Jester",
    "Lover",
    "Ranger",
    "Champion",
    "Seeker",
    "Phantom",
    "Hunter",
    "Shifter",
    "Whisper",
    "Dreamer",
    "Log",
    "stein",
    "Freedom",
    "Pup",
  ];

  // Generate random indexes for prefix and suffix
  const prefixIndex = Math.floor(Math.random() * prefixes.length);
  const suffixIndex = Math.floor(Math.random() * suffixes.length);

  // Generate a random number between 10 and 99
  const randomNumber = Math.floor(Math.random() * 90) + 10;

  // Decide whether to place the number at the beginning or end
  const placeAtEnd = Math.random() < 0.3;

  const skipSuffix = Math.random() < 0.3;

  // Build the name based on the placement of the number
  let randomName;
  if (!placeAtEnd) {
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex];
  } else if (skipSuffix) {
    randomName = prefixes[prefixIndex] + randomNumber;
  } else {
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;
  }

  // If the name is longer than 15 characters, truncate it
  if (randomName.length > 15) {
    randomName = randomName.slice(0, 15);
  }

  return randomName;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
  }
}
