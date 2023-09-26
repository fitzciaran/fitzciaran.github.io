import { player, bots, otherPlayers, mines } from "./main.js";
import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { sendMinesUpdate, sendPowerUpsUpdate, sendEffectsUpdate } from "./sendData.js";
import { ForceType, effects, Effect, EffectType, MineType } from "./entities.js";

//if mess with these need to change the collision detection - factor these in
export const shipScale = 2;
export const mineScale = 0.7;

export function detectCollisions(playerToCheck, globalPowerUps, bots, otherPlayers, forces) {
  // Detect collisions between the player's ship and the powerups or other ships
  // If a collision is detected, update the game state accordingly
  checkPowerupCollision(playerToCheck, globalPowerUps);
  checkMineCollision(playerToCheck, mines);
  let allPlayers = [...bots, ...otherPlayers, player];
  checkPlayerCollision(playerToCheck, allPlayers);
  checkForcesCollision(playerToCheck, forces);
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
    let mine = mines[i];

    if (mineCollided(mine, playerToCheck)) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.isVulnerable() && mine.hitFrames == -1 && (mine.playerId == "" || mine.playerId != playerToCheck.id)) {
        if (mine.mineType == MineType.REGULAR) {
          playerToCheck.gotHit("a mine");
        } else {
          resolveMineHit(playerToCheck, mine, otherPlayers, bots, player);
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

export function isSpokeCollision(entity, playerRadius, centerX, centerY, angle, spokeLength, spokeWidth) {
  let playerX = entity.x;
  let playerY = entity.y;
  // Check for collision with each of the 8 spokes (or 4 diameters)
  for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += 45) {
    const spokeAngleRadians = (angleDegrees + angle) * (Math.PI / 180); // Convert to radians

    // Calculate the start and end points of the spoke
    const spokeStartX = centerX;
    const spokeStartY = centerY;
    const spokeEndX = centerX + spokeLength * Math.cos(spokeAngleRadians);
    const spokeEndY = centerY + spokeLength * Math.sin(spokeAngleRadians);

    // Calculate the vector from the player's position to the spoke's start point
    const dx = spokeStartX - playerX;
    const dy = spokeStartY - playerY;

    // Calculate the dot product of the vector from player to spoke and the spoke's direction vector
    const dotProduct = dx * (spokeEndX - spokeStartX) + dy * (spokeEndY - spokeStartY);

    // Check if the player is within the length of the spoke
    if (dotProduct >= 0 && dotProduct <= spokeLength * spokeLength) {
      // Calculate the perpendicular distance from the player to the spoke
      const distance = Math.abs(dx * (spokeEndY - spokeStartY) - dy * (spokeEndX - spokeStartX)) / spokeLength;

      // Check if the distance is less than the player's radius plus half of the spoke width
      if (distance <= playerRadius + spokeWidth / 2) {
        return true; // Collision detected with this spoke
      }
    }
  }

  // No collision with any spoke
  return false;
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
