import {
  setGameState,
  GameState,
  player,
  setMines,
  bots,
  otherPlayers,
  mines,
  setGameTimer,
  gameTimer,
  globalPowerUps,
  selectedColors,
} from "./main.js";
import { isPlayerMasterPeer, setTimeSinceMessageFromMaster, timeSinceMessageFromMaster } from "./connectionHandlers.js";
import { isSpokeCollision } from "./collisionLogic.js";
import {
  sendPlayerStates,
  sendEntitiesState,
  sendEntitiesUpdate,
  sendBotEntitiesUpdate,
  sendRemoveEntityUpdate,
  sendMinesUpdate,
  sendPowerUpsUpdate,
  sendForcesUpdate,
  sendBotsUpdate,
  sendEffectsUpdate,
} from "./sendData.js";
import { forces, Mine, PowerUp, ForceType, ForceArea, Entity, effects, Effect, EffectType, MineType, FreeMine } from "./entities.js";
import { Player, Bot } from "./player.js";
import { getRandomUniqueColor, findCompleteShape, isPointInsideShape } from "./gameUtils.js";

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
let maxBots = 4;
let maxDirectionalForces = 7;
// let directionalForces = [];
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

export const BoundaryForce = {
  LEFT: "leftBoundaryForce-",
  RIGHT: "rightBoundaryForce-",
  TOP: "topBoundaryForce-",
  BOTTOM: "bottomBoundaryForce-",
};

export class Pilot extends Entity {
  constructor(
    id = null,
    x = null,
    y = null,
    width = 100,
    height = 100,
    lore = "",
    name = "",
    src = "",
    pilotInvincibilityTime = 600,
    trailTime = 100,
    selected = false
  ) {
    super(id, x, y);
    this.image = new Image();
    this.width = width;
    this.height = height;
    this.lore = lore;
    this.name = name;
    this.src = src;
    //deafult 600 is 10 seconds
    this.invincibilityTime = pilotInvincibilityTime;
    this.trailTime = trailTime;
    this.selected = selected;
    this.pilotAnimationFrame = 0;
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
  "Orion, Speed: 4, Invicible Time: 10,Special: Gravity Attract, Agressive - likes to get powered up and use Gravity Attract to get kills",
  PilotName.PILOT_1,
  "images/wolf.webp",
  600,
  100
);
export const pilot2 = new Pilot(
  PilotName.PILOT_2,
  0,
  0,
  100,
  100,
  "Bumble, Speed: 2, Invicible Time: 15,Special: Gravity Repel, Defensive - not so fast but can use Gravity Repel to keep attackers away ",
  PilotName.PILOT_2,
  "images/slippy.webp",
  900,
  70
);
export const pilot3 = new Pilot(
  PilotName.PILOT_3,
  0,
  0,
  100,
  100,
  "Zippy, Speed: 5, Invicible Time: 10, Special: Speed Boost, Speedy - tricky to control. Not for scrubs! ",
  PilotName.PILOT_3,
  "images/mouse.webp",
  600,
  100
);
export const pilot4 = new Pilot(
  PilotName.PILOT_4,
  0,
  0,
  100,
  100,
  "Snaffle, Speed: 3, Invicible Time: 12, Special: Tractor Beam, Sneaky! Powerful long range narrow tractor beam can cause havok from afar!",
  PilotName.PILOT_4,
  "images/bore612.webp",
  700,
  150
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
    //   color:  getRandomUniqueColor(colors,selectedColors),
    // };
    let isStar = false;
    let radius = 50;
    let value = 2;

    if (Math.random() > 1 - chancePowerUpIsStar) {
      isStar = true;
      radius = 15;
      value = 1;
    }
    let hasGravity = 0;
    if (Math.random() > 0.9) {
      if (Math.random() > 0.2) {
        //push force
        hasGravity = -1;
        if (isStar) {
          value = 2;
          radius = 15;
        } else {
          value = 5;
          radius = 30;
        }
      } else {
        hasGravity = 1;
      }
    }

    let powerUp = new PowerUp(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      getRandomUniqueColor(colors, null),
      isStar,
      radius,
      value,
      hasGravity
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
  // Remove excess powerUps if there are more than maxPowerups
  while (globalPowerUps.length > maxPowerups) {
    const removedPowerUp = globalPowerUps.pop();
    if (isPlayerMasterPeer(player)) {
      sendRemoveEntityUpdate("removePowerUps", [removedPowerUp]);
    }
    //- in futre can add effect for this
  }
}

export function createBots(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  let addedBots = false;

  // Check if there are less than maxBots bots
  while (bots.length < maxBots) {
    let botID = Math.floor(Math.random() * 10000);
    let bot = new Bot(
      botID,
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      0, // Set other properties for the bot as needed
      getRandomUniqueColor(colors, selectedColors)
    );

    bot.isBot = true;
    bot.name = getRandomName();
    bots.push(bot);
    addedBots = true;
  }

  if (addedBots) {
    sendBotsUpdate(true);
  }

  // Remove excess bots if there are more than maxBots
  while (bots.length > maxBots) {
    const removedBot = bots.pop();
    if (isPlayerMasterPeer(player)) {
      sendRemoveEntityUpdate("removeBots", [removedBot]);
    }
    //  add effects in the future
  }
}

export function generateMines(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  let addedMines = false;
  const regularMines = mines.filter((mine) => mine.mineType === MineType.REGULAR);
  // Check if there are less than max powerups powerups
  while (regularMines.length < maxMines) {
    let hasGravity = 0;
    if (Math.random() > 0.8) {
      if (Math.random() > 0.9) {
        //test out push force even though it doesn't really make sense for a mine
        hasGravity = -1;
      } else {
        hasGravity = 1;
      }
    }
    let mine = new Mine(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      100,
      10,
      getRandomUniqueColor(colors, null),
      hasGravity
    );
    mines.push(mine);
    regularMines.push(mine);
    addedMines = true;
  }
  if (addedMines) {
    sendMinesUpdate(true);
  }
  // Remove excess regularMines if there are more than maxMines
  while (regularMines.length > maxMines) {
    const removedMine = regularMines.pop();
    setMines(mines.filter((mine) => mine.id != removedMine.id));
    if (isPlayerMasterPeer(player)) {
      sendRemoveEntityUpdate("removeMines", [removedMine]);
    }
    //- in futre can add effect for this
  }
}

export function generateDirectionalForces(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  let addedDirectionalForces = false;
  const directionalForces = forces.filter((force) => force.type === ForceType.DIRECTIONAL);
  const boundaryForceSize = 500;
  // Check if there are less than max powerups powerups
  while (directionalForces.length < maxDirectionalForces) {
    if (!hasGivenBoundaryForce(BoundaryForce.LEFT, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(boundaryForceSize / 2, worldHeight / 2, boundaryForceSize, worldHeight, Math.PI, BoundaryForce.LEFT, directionalForces);
    }
    if (!hasGivenBoundaryForce(BoundaryForce.RIGHT, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(
        worldWidth - boundaryForceSize / 2,
        worldHeight / 2,
        boundaryForceSize,
        worldHeight,
        0,
        BoundaryForce.RIGHT,
        directionalForces
      );
    }
    if (!hasGivenBoundaryForce(BoundaryForce.TOP, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(worldWidth / 2, boundaryForceSize / 2, boundaryForceSize, worldWidth, (3 * Math.PI) / 2, BoundaryForce.TOP, directionalForces);
    }
    if (!hasGivenBoundaryForce(BoundaryForce.BOTTOM, directionalForces)) {
      addedDirectionalForces = true;
      addBoundaryForce(
        worldWidth / 2,
        worldHeight - boundaryForceSize / 2,
        boundaryForceSize,
        worldWidth,
        Math.PI / 2,
        BoundaryForce.BOTTOM,
        directionalForces
      );
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
    );

    forces.push(force);
    directionalForces.push(force);
    addedDirectionalForces = true;
  }
  if (addedDirectionalForces) {
    sendForcesUpdate(true);
  }
  // Remove excess directional forces if there are more than maxDirectionalForces
  while (directionalForces.length > maxDirectionalForces) {
    const removedForce = directionalForces.pop();
    const index = forces.indexOf(removedForce);
    if (index !== -1) {
      if (isPlayerMasterPeer(player)) {
        sendRemoveEntityUpdate("removeForces", [forces[index]]);
      }
      forces.splice(index, 1);
    }
  }
}

function addBoundaryForce(x, y, width, height, angle, id, directionalForces) {
  let force = new ForceArea(id, x, y, 1.2, 10, 200, true, "blue", null, 0, angle, ForceType.DIRECTIONAL, width, height);
  forces.push(force);
  directionalForces.push(force);
}

function hasGivenBoundaryForce(id, boundaryForces) {
  // Use the some() method to check if any force meets the condition
  return boundaryForces.some((force) => force.id.startsWith(id));
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

function resolveMineHit(playerToCheck, mine, otherPlayers, bots, player) {
  let mineOwner = otherPlayers.find((otherPlayer) => otherPlayer.id == mine.playerId);
  if (!mineOwner) {
    mineOwner = bots.find((bot) => bot.id == mine.playerId);
  }
  if (!mineOwner) {
    if (player.id == mine.playerId) {
      mineOwner = player;
    }
  }
  if (mineOwner) {
    playerToCheck.gotHit(mineOwner.name);
    mineOwner.hitOtherPlayer(playerToCheck);
  } else {
    playerToCheck.gotHit("a mine");
  }
}

//todo more generic entity based collision function, maybe each entity has its own action upon collision
export function checkMineCollision(playerToCheck, mines) {
  for (let i = 0; i < mines.length; i++) {
    let mine = mines[i];

    if (mineCollided(mine, playerToCheck)) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.isVulnerable() && mine.hitFrames == -1 && (mine.playerId == "" || mine.playerId != playerToCheck.id)) {
        if (mine.mineType == MineType.REGULAR) {
          playerToCheck.gotHit("a mine");
        } else {
          resolveMineHit(playerToCheck, mine, otherPlayers, bots, player);
          // let mineOwner = otherPlayers.find((otherPlayer) => otherPlayer.id == mine.playerId);
          // if (!mineOwner) {
          //   mineOwner = bots.find((bot) => bot.id == mine.playerId);
          // }
          // if (!mineOwner) {
          //   if (player.id == mine.playerId) {
          //     mineOwner = player;
          //   }
          // }
          // if (mineOwner) {
          //   playerToCheck.gotHit(mineOwner.name);
          //   mineOwner.hitOtherPlayer(playerToCheck);
          // } else {
          //   playerToCheck.gotHit("a mine");
          // }
        }
        mine.hitFrames = 2;
        // mines.splice(i, 1);
      }
      // if (playerToCheck.invincibleTimer > 0 && !playerToCheck.isInSpawnProtectionTime() && mines[i].hitFrames == -1) {
      //if invincible ignore spawn protection
      if (playerToCheck.isInvincible() && mine.hitFrames == -1 && (mine.playerId == "" || mine.playerId != playerToCheck.id)) {
        if (playerToCheck.invincibleTimer > 115) {
          if (mine.mineType == MineType.REGULAR) {
            playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 100);
          } else if (mine.mineType == MineType.TRAIL) {
            playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 30);
          } else {
            resolveMineHit(playerToCheck, mine, otherPlayers, bots, player);
          }
        } else {
          //always leave a little bit of time to tick away (but don't increase if time already ticked nearly away)
          playerToCheck.setInvincibleTimer(Math.min(playerToCheck.invincibleTimer, 15));
        }
        mine.hitFrames = 2;
        let effectID = Math.floor(Math.random() * 10000);

        let effect = new Effect(effectID, mine.x, mine.y, 50, 30, "OrangeRed", EffectType.EXPLOSION);
        effects.push(effect);
        if (isPlayerMasterPeer(player)) {
          sendEffectsUpdate(true);
        }
        // mines.splice(i, 1);
      }
      // sendPowerups(globalPowerUps);
      // setMines(mines);
      if (isPlayerMasterPeer(player)) {
        sendMinesUpdate(true, true);
      }
      // break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
    }
  }
}

function mineCollided(mine, playerToCheck) {
  let collision = false;
  const relativeX = playerToCheck.x - mine.x;
  const relativeY = playerToCheck.y - mine.y;

  if (mine.mineType == MineType.REGULAR) {
    // Same as before, no changes needed
    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    if (distance < 10 * shipScale + mine.radius) {
      collision = true;
    }
  } else if (mine.mineType == MineType.TRAIL) {
    // Calculate the ship's position in local coordinates of the mine
    const localX = relativeX * Math.cos(-mine.angle) - relativeY * Math.sin(-mine.angle);
    const localY = relativeX * Math.sin(-mine.angle) + relativeY * Math.cos(-mine.angle);

    // Calculate half of the trailLength and half of the trailWidth
    const halfTrailLength = mine.length / 2;
    const halfTrailWidth = mine.width / 2;

    // Check if the player is within the bounds of the end circles
    const inCircle1 = localX * localX + (localY - halfTrailLength) * (localY - halfTrailLength) < halfTrailWidth * halfTrailWidth;
    const inCircle2 = localX * localX + (localY + halfTrailLength) * (localY + halfTrailLength) < halfTrailWidth * halfTrailWidth;

    // Check if the player is within the bounds of the rectangle
    const inRectangle = Math.abs(localX) <= halfTrailWidth && Math.abs(localY) <= halfTrailLength;

    // If the player is within any of the shapes, there is a collision
    if (inCircle1 || inCircle2 || inRectangle) {
      collision = true;
    }
  }

  return collision;
}

export function checkPlayerCollision(playerToCheck, allPlayers) {
  for (let i = 0; i < allPlayers.length; i++) {
    let hitCandidate = allPlayers[i];
    if (playerToCheck.id == hitCandidate.id) {
      //don't check collision against self
      continue;
    }
    if (playerToCheck.timeSinceSentMessageThatWasRecieved > 120) {
      //don't check collision against idle player
      continue;
    }
    let dx = playerToCheck.x - hitCandidate.x;
    let dy = playerToCheck.y - hitCandidate.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // treating hitbox/hurtbox of both ships as simple radius for now
    if (
      distance < 20 * shipScale &&
      playerToCheck.isPlaying == true &&
      hitCandidate.isPlaying == true &&
      !playerToCheck.isDead &&
      !hitCandidate.isDead &&
      !hitCandidate.timeSinceSentMessageThatWasRecieved <= 120 &&
      !(player.name == "" && player.pilot == "")
    ) {
      handlePlayerHit(playerToCheck, hitCandidate);
      handlePlayerHit(hitCandidate, playerToCheck);
    }
  }
}

function handlePlayerHit(playerOne, playerTwo) {
  if (playerTwo.isVulnerable()) {
    if (playerOne.isTangible()) {
      playerTwo.gotHit(playerOne.name);
    }
    // if (playerTwo.isBot) {
    //   playerTwo.delayReset(botRespawnDelay, true, true);
    // }
  }
  if (playerTwo.isInvincible() && playerOne.isVulnerable()) {
    playerTwo.hitOtherPlayer(playerOne);
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

function resetPowerLevels(player, otherPlayers, globalPowerUps) {
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
  // Remove mines with hit frames that have expired.
  for (let i = mines.length - 1; i >= 0; i--) {
    let mine = mines[i];
    mine.createForce();
    if (mine.hitFrames < -1) {
      // in "initialising" state - do this first before potential splicing
      mine.hitFrames++;
    }
    if (mine.hitFrames >= 0) {
      mine.hitFrames--;
      // If hit frames have expired, remove the mine.
      if (mine.hitFrames < 0) {
        if (isPlayerMasterPeer(player)) {
          sendRemoveEntityUpdate("removeMines", [mine]);
        }
        mines.splice(i, 1);
      }
    }

    if (mine.mineType == MineType.TRAIL || mine.mineType == MineType.FREE_MINE) {
      if (mine.duration > 0) {
        mine.duration--;
      }
      if (mine.duration <= 0) {
        if (isPlayerMasterPeer(player)) {
          //trying letting trails ride without syncing
          //sendRemoveEntityUpdate("removeMines", [mine]);
        }
        mines.splice(i, 1);
      }
    }
  }

  for (let powerUp of globalPowerUps) {
    powerUp.createForce();
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

export function updateOtherPlayers(deltaTime, mines) {
  otherPlayers.forEach((otherPlayer, index) => {
    // Check if player is an instance of the Player class
    if (otherPlayer != null && otherPlayer instanceof Player) {
      if (otherPlayer.name != "") {
        otherPlayer.updateTick(deltaTime, mines);
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

export function updateBots(deltaTime, mines) {
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
      console.log("had to reinitialise bot");
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
      bot.updateTick(deltaTime, mines);
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

export function masterUpdateGame(player, globalPowerUps, otherPlayers, bots, mines, deltaTime) {
  //this isn't synced between peers
  setGameTimer(gameTimer + 1);
  if (!isPlayerMasterPeer(player)) {
    setTimeSinceMessageFromMaster(timeSinceMessageFromMaster + 1);
  }
  player.updateTick(deltaTime, mines);
  // createBots(worldWidth,worldHeight,colors);
  updateBots(deltaTime, mines);
  updateOtherPlayers(deltaTime, mines);
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

  // Call the main function to execute the refactored code
  ProcessTrailShapesAllPlayers(player, otherPlayers, mines, effects, globalPowerUps);
  removeExpiredPowerUps(globalPowerUps, player);
  removeExpiredEffects(effects, player);
  basicAnimationTimer++;

  if (isPlayerMasterPeer(player)) {
    if (gameTimer % 2 == 1) {
      sendBotEntitiesUpdate();
    } else if (gameTimer % 11 == 1) {
      sendEntitiesUpdate();
    } else if (gameTimer % 59 == 1) {
      sendEntitiesState();
    }
  }
  if (!player.isDead && gameTimer % 1 == 0) {
    sendPlayerStates(player, isPlayerMasterPeer(player));
  }
}

function ProcessTrailShapesAllPlayers(player, otherPlayers, mines, effects, globalPowerUps) {
  let allPlayers = [...bots, ...otherPlayers, player];
  for (let candidatePlayer of allPlayers) {
    ProcessTrailShapes(candidatePlayer, allPlayers);
  }
}

function ProcessTrailShapes(candidatePlayer, allPlayers) {
  const shape = findCompleteShape(candidatePlayer.id, mines, 30000);

  if (shape && shape.shapePath) {
    let freeMine = createFreeMine(candidatePlayer, shape);
    handleFreeMineSpawn(candidatePlayer.id, mines, freeMine, shape, allPlayers);
    createEffects(shape.shapePath, effects);
    if (isPlayerMasterPeer(player)) {
      sendMinesUpdate();
    }
  }
}

// Function to create a FreeMine
function createFreeMine(player, shape) {
  let freeMine = new FreeMine(
    "trail-" + Math.floor(Math.random() * 10000),
    shape.center.x,
    shape.center.y,
    40,
    70,
    player.color,
    0,
    MineType.FREE_MINE,
    -1,
    player.id,
    0,
    shape.shapePath
  );
  freeMine.spokeWidth = shape.spokeWidth;
  freeMine.spokeLength = shape.spokeLength;
  return freeMine;
}
function createEffects(shapePath, effects) {
  for (let point of shapePath) {
    let effect = new Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", EffectType.EXPLOSION);
    effects.push(effect);
  }
}
// Function to set mines and remove overlapping mines
function handleFreeMineSpawn(playerId, mines, freeMine, shape, allPlayers) {
  //currently we remove all players trail mines if they make a shape
  setMines(mines.filter((mine) => mine.playerId != playerId));
  mines.push(freeMine);

  for (let point of shape.shapePath) {
    let effect = new Effect("effect-" + Math.floor(Math.random() * 10000), point.x, point.y, 40, 30, "OrangeRed", EffectType.EXPLOSION);
    effects.push(effect);
  }

  //destroy mines that overlap
  for (let mine of mines) {
    if (mine.mineType != MineType.FREE_MINE) {
      if (
        isPointInsideShape(shape.shapePath, { x: mine.x, y: mine.y }) ||
        isSpokeCollision(mine, mine.radius + 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
      ) {
        mine.hitFrames = 5;
      }
    }
  }
  //kill players caught
  for (let candidatePlayer of allPlayers) {
    if (candidatePlayer.id == playerId) {
      //don't hit the player who created this
      continue;
    }
    if (
      isPointInsideShape(shape.shapePath, { x: candidatePlayer.x, y: candidatePlayer.y }) ||
      isSpokeCollision(candidatePlayer, 10, freeMine.x, freeMine.y, 0, shape.spokeLength, shape.spokeWidth + 5)
    ) {
      let owner = allPlayers.find((player) => player.id == playerId);
      let name = "";
      if (owner && owner.name) {
        name = owner.name;
      }
      if (candidatePlayer.isVulnerable()) {
        candidatePlayer.gotHit(name);
        if (owner) {
          owner.hitOtherPlayer(candidatePlayer);
        }
      }
    }
  }
}

// Function to remove expired power-ups
function removeExpiredPowerUps(globalPowerUps, player) {
  for (let i = globalPowerUps.length - 1; i >= 0; i--) {
    if (globalPowerUps[i].hitFrames < -1) {
      globalPowerUps[i].hitFrames++;
    }
    if (globalPowerUps[i].hitFrames >= 0) {
      globalPowerUps[i].hitFrames--;
      if (globalPowerUps[i].hitFrames < 0) {
        if (isPlayerMasterPeer(player)) {
          sendRemoveEntityUpdate("removePowerUps", [globalPowerUps[i]]);
        }
        globalPowerUps.splice(i, 1);
      }
    }
  }
}

// Function to remove expired effects
function removeExpiredEffects(effects, player) {
  for (let i = effects.length - 1; i >= 0; i--) {
    if (effects[i].duration >= 0) {
      effects[i].duration--;
      if (effects[i].duration < 0) {
        if (isPlayerMasterPeer(player)) {
          sendRemoveEntityUpdate("removeEffect", [effects[i]]);
        }
        effects.splice(i, 1);
      }
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
    "Battle",
    "Flexy",
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
    "Beast",
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
