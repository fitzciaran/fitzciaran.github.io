import {
  bots,
  otherPlayers,
  player,
  worldDimensions,
  colors,
  PilotName,
  acceleration,
  setCam,
  camX,
  camY,
  ctx,
  setGameState,
  GameState,
  globalPowerUps,
} from "./astroids.js";
import { shuffleArray, setEndGameMessage, maxInvincibilityTime,spawnProtectionTime } from "./gameLogic.js";
import { drawKillInfo } from "./canvasDrawingFunctions.js";
import {
  attemptConnections,
  timeSinceAnyMessageRecieved,
  setTimeSinceAnyMessageRecieved,
  ticksSinceLastConnectionAttempt,
  setTicksSinceLastConnectionAttempt,
  wrappedResolveConflicts,
} from "./connectionHandlers.js";

const bounceFactor = 1.5;
const offset = 1;
const minBounceSpeed = 5;
const maxBotsThatCanTargetAtOnce = 1;
export const BotState = {
  FOLLOW_PLAYER: "followPlayer",
  RANDOM: "random",
  COLLECT: "collect",
};

export class Player {
  constructor(id = null, x = null, y = null, powerUps = 0, color = null, angle = 0, pilot = "", name = "") {
    this.id = id;
    this.x = x !== null ? x : 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = y !== null ? y : 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = powerUps;
    this.color = color !== null ? color : colors[Math.floor(Math.random() * colors.length)];
    this.angle = angle;
    this.pilot = pilot;
    this.name = name;
    this.lives = 1;
    this.isMaster = true;
    this.isDead = false;
    this.isPlaying = true;
    this.invincibleTimer = 0;
    this.comboScaler = 1;
    this.isUserControlledCharacter = false;
    this.kills = 0;
    this.isBot = false;
    this.playerAngleData = {};
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.distanceFactor = 0;
    this.space = false;
    this.shift = false;
    this.ticksSincePowerUpCollection = -1;
    this.targetedBy = [];
    this.timeSinceSpawned = 0;
    this.timeSinceSentMessageThatWasRecieved = 0;
  }

  resetState(keepName, keepColor) {
    this.x = 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = 0;
    if (!keepColor) {
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    this.angle = 0;
    //this.pilot = "";
    if (!keepName) {
      this.name = "";
    }
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.randomTarget = { x: 0, y: 0, id: "" };
    this.targetedBy = [];
    this.space = false;
    this.shift = false;
    this.isDead = false;
    this.invincibleTimer = 0;
    this.comboScaler = 1;
    this.kills = 0;
    this.inRangeTicks = 0;
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.timeSinceSpawned = 0;
  }

  delayReset(framesToDelay, keepName, keepColor) {
    if (framesToDelay > 0) {
      requestAnimationFrame(() => {
        this.delayReset(framesToDelay - 1, keepName, keepColor);
      });
    } else {
      // Execute the reset after the specified number of frames
      this.resetState(keepName, keepColor);
    }
  }
  gotHit() {
    this.isDead = true;
    if (this == player) {
      setEndGameMessage("Score: " + this.powerUps * 100);
    }
  }
  addScore(scoreToAdd) {
    this.powerUps += scoreToAdd;
    if (this.powerUps != Math.floor(this.powerUps)) {
      console.log("somehow not whole score added");
      this.powerUps = Math.floor(this.powerUps);
    }
  }
  setPilot(newPilot) {
    this.pilot = newPilot;
  }

  getPlayerName() {
    return this.name;
  }

  setPlayerName(newName) {
    this.name = newName;
  }

  isInSpawnProtectionTime(){
    return (this.timeSinceSpawned <= spawnProtectionTime);
  }
  //   getPlayerIsMaster() {
  //     return this.isMaster;
  //   }

  setPlayerIsMaster(isMaster) {
    this.isMaster = isMaster;
  }

  hitOtherPlayer(playerThatGotHit) {
    this.kills += 1;
    let score = 2 * this.comboScaler;
    score += Math.round(playerThatGotHit.powerUps / 3);

    this.addScore(score);
    this.recentKillTicks = 60;
    score *= 100;
    switch (this.comboScaler) {
      case 1:
        this.recentKillText = "KILL " + score;
        break;
      case 2:
        this.recentKillText = "Double KILL " + score;
        break;
      case 3:
        this.recentKillText = "Triple KILL " + score;
        break;
      case 4:
        this.recentKillText = "QUAD KILL " + score;
        break;
      case 5:
        this.recentKillText = "PENTA KILL " + score;
        break;
      case 6:
        this.recentKillText = "HEXAKILL " + score;
        break;
      case 7:
        this.recentKillText = "SEPTAKILL " + score;
        break;
      case 8:
        this.recentKillText = "OCTAKILL " + score;
        break;
      case 9:
        this.recentKillText = "NINELIFE KILL " + score;
        break;
      default:
        this.recentKillText = "MONSTER KILL " + score;
        break;
    }
    if (this.comboScaler < 10) {
      this.comboScaler += 1;
    }

    this.invincibleTimer += 300;
    this.invincibleTimer = Math.min(this.invincibleTimer, maxInvincibilityTime);
    // drawKillInfo(ctx, this, score, camX, camY);
  }

  bouncePlayer() {
    if (this.x < 0 || this.x > worldDimensions.width) {
      this.vel.x = -this.vel.x * bounceFactor;
      this.x = this.x < 0 ? offset : worldDimensions.width - offset;
      this.vel.x = (this.vel.x < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.x), minBounceSpeed);
    }

    if (this.y < 0 || this.y > worldDimensions.height) {
      this.vel.y = -this.vel.y * bounceFactor;
      this.y = this.y < 0 ? offset : worldDimensions.height - offset;
      this.vel.y = (this.vel.y < 0 ? -1 : 1) * Math.max(Math.abs(this.vel.y), minBounceSpeed);
    }
  }

  updatePlayerAngle() {
    let dx = this.x - this.mousePosX;
    let dy = this.y - this.mousePosY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    this.angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (isNaN(dx) || isNaN(dy) || isNaN(distance)) {
      console.log("player angle NaN data");
    } else {
      this.playerAngleData = { dx, dy, distance };
    }
  }

  updatePlayerVelocity(deltaTime) {
    let dx = this.playerAngleData.dx;
    let dy = this.playerAngleData.dy;
    let distance = this.playerAngleData.distance;
    let squareFactor = this.currentSpeed * this.currentSpeed;
    let newFriction = Math.pow(Math.max(0.99 - squareFactor * 0.0001, 0.95), deltaTime);

    let pilotBoostFactor = 1;
    if (this.pilot == PilotName.PILOT_1) {
      pilotBoostFactor = 1.1;
    } else if (this.pilot == PilotName.PILOT_2) {
      pilotBoostFactor = 0.6;
    }
    if (this.shift && this.invincibleTimer > 0) {
      if (this.invincibleTimer > 0) {
        this.invincibleTimer -= 5;
        this.invincibleTimer = Math.max(this.invincibleTimer, 0);
      }
      if (this.pilot == PilotName.PILOT_1) {
        pilotBoostFactor = 3;
      } else if (this.pilot == PilotName.PILOT_2) {
        pilotBoostFactor = 6;
      }
    }
    this.vel.x *= newFriction;
    this.vel.y *= newFriction;

    if (this.space || this.shift) {
      let mouseToCenter = { x: dx / distance, y: dy / distance };
      if (distance == 0 || isNaN(distance)) {
        mouseToCenter = { x: 0, y: 0 };
      }
      let maxForceDistance = 250;
      let minForceDistance = 100;

      this.distanceFactor = 1;
      if (distance < minForceDistance) {
        this.distanceFactor = 0.1; // minimum force
      } else if (distance < maxForceDistance) {
        let normalizedDistance = (distance - minForceDistance) / (maxForceDistance - minForceDistance);
        this.distanceFactor = 0.1 + normalizedDistance * 0.9; // gradually increase force
      }
      this.vel.x += acceleration * this.distanceFactor * mouseToCenter.x * pilotBoostFactor * deltaTime;
      this.vel.y += acceleration * this.distanceFactor * mouseToCenter.y * pilotBoostFactor * deltaTime;
      if (this.vel.x == null || isNaN(this.vel.x) || this.vel.y == null || isNaN(this.vel.y)) {
        console.log("Invalid velocity values: x =", this.vel.x, "y =", this.vel.y);
      }
    }
    this.currentSpeed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
  }

  updatePlayerPosition(deltaTime) {
    if (this.vel.x !== null && !isNaN(this.vel.x) && this.vel.y !== null && !isNaN(this.vel.y)) {
      this.x += this.vel.x * deltaTime;
      this.y += this.vel.y * deltaTime;
      if (this.vel.x != 0 && this.vel.y != 0) {
        this.timeOfLastActive = Date.now();
      }
    } else {
      console.log("Invalid velocity values: x =", this.vel.x, "y =", this.vel.y);
    }
  }

  centerCameraOnPlayer(viewportWidth, viewportHeight) {
    const targetCamX = this.x - viewportWidth / 2;
    let targetCamY;
    if (this.ySpeed < 0) {
      // Moving up
      targetCamY = this.y - (viewportHeight * 2) / 4;
    } else {
      // Moving down or not moving vertically
      targetCamY = this.y - (viewportHeight * 2) / 4;
    }
    let newCamX = targetCamX;
    let newCamY = targetCamY;

    let camX = Math.max(Math.min(newCamX, worldDimensions.width - viewportWidth), 0);
    let camY = Math.max(Math.min(newCamY, worldDimensions.height - viewportHeight), 0);
    setCam(camX, camY);
  }
  updateTick(deltaTime) {
    if (this.isDead && this.isUserControlledCharacter) {
      setGameState(GameState.FINISHED);
      return;
    }
    this.timeSinceSpawned++;
    this.updatePlayerAngle();
    this.updatePlayerVelocity(deltaTime);
    this.bouncePlayer();
    this.updatePlayerPosition(deltaTime);
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= 1;
      if (this.invincibleTimer == 0) {
        this.comboScaler = 1;
      }
    }

    if (this.ticksSincePowerUpCollection > -1) {
      this.ticksSincePowerUpCollection++;
    }
    if (this.ticksSincePowerUpCollection > 5) {
      this.ticksSincePowerUpCollection = -1;
    }
    setTicksSinceLastConnectionAttempt(ticksSinceLastConnectionAttempt + 1);
    setTimeSinceAnyMessageRecieved(timeSinceAnyMessageRecieved + 1);
    if (timeSinceAnyMessageRecieved > 100 && ticksSinceLastConnectionAttempt > 3000) {
        wrappedResolveConflicts(player, otherPlayers, globalPowerUps);
      //todo do we need to attemptConnections here?
    }
    otherPlayers.forEach((otherPlayer) => {
        otherPlayer.timeSinceSentMessageThatWasRecieved +=1;
    });
  }

  howLongSinceActive() {
    if (this.timeOfLastActive) {
      const currentTime = Date.now();
      const timeDifference = currentTime - this.timeOfLastActive;
      return timeDifference;
    } else {
      return 5000;
    }
  }
}

export class Bot extends Player {
  constructor(id = null, x = null, y = null, powerUps = 0, color = null, angle = 0, pilot = "", name = "") {
    super(id, x, y, powerUps, color, angle, pilot, name);
    this.previousAngleDifference = 0;
    this.previousTurnDirection = 0;
    this.botState = BotState.FOLLOW_PLAYER;
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.randomTarget = { x: 0, y: 0, id: "" };
    this.inRangeTicks = 0;
  }
  updateTick(deltaTime) {
    if (this.isDead) {
      //todo delay this?
      this.resetState(true, true);
      // delayReset(5,true,true);
      return;
    }
    super.updateTick(deltaTime);
  }
  updateBotInputs() {
    //this.randomlyConsiderChangingState();
    if (this.invincibleTimer > 30 && this.botState != BotState.FOLLOW_PLAYER) {
      this.#setFollowingTarget();
      if (this.followingPlayerID != "") {
        this.randomTarget.x = 0;
        this.randomTarget.y = 0;
        this.randomTarget.id = "random point";
        this.botState = BotState.FOLLOW_PLAYER;
      }
    }
    if (this.botState == BotState.FOLLOW_PLAYER) {
      this.#setFollowingTarget();
      if (this.followingPlayerID == "") {
        //if didn't manage to find a valid target.
        this.botState = BotState.RANDOM;
        return;
      }

      const allPlayers = [...otherPlayers, ...bots, player];
      let followingPlayer = allPlayers.find((candidate) => this.followingPlayerID === candidate.id);
      if (followingPlayer == null) {
        this.followingPlayerID = "";
        return;
      }
      if (followingPlayer.isBot) {
        //if bots are all following each other they can get into a spiral this should break them out of it.
        this.randomlyConsiderChangingState(0.95);
      }
      if (followingPlayer.invincibleTimer > 10) {
        this.randomlyConsiderChangingState(0.09);
      }
      if (followingPlayer.isDead) {
        this.followingPlayerID = "";
      }
      let targetX = followingPlayer.x;
      let targetY = followingPlayer.y;
      this.#checkIfGotToTarget(targetX, targetY);
      this.#aimAtTarget(targetX, targetY, followingPlayer.vel.x, followingPlayer.vel.y, 0.4);
    } else if (this.botState == BotState.RANDOM) {
      if (this.randomTarget.x == 0 && this.randomTarget.y == 0) {
        this.randomTarget.x = 100 + Math.random() * (worldDimensions.width - 200);
        this.randomTarget.y = 100 + Math.random() * (worldDimensions.height - 200);
      }
      let targetX = this.randomTarget.x;
      let targetY = this.randomTarget.y;
      this.#checkIfGotToTarget(targetX, targetY);
      this.#aimAtTarget(targetX, targetY, 0, 0, 0.4);
    } else if (this.botState == BotState.COLLECT) {
      if (this.randomTarget.x == 0 && this.randomTarget.y == 0) {
        let powerUpToTarget;
        if (globalPowerUps.length > 0) {
          const randomIndex = Math.floor(Math.random() * globalPowerUps.length);
          powerUpToTarget = globalPowerUps[randomIndex];
          this.randomTarget.x = powerUpToTarget.x;
          this.randomTarget.y = powerUpToTarget.y;
          this.randomTarget.id = powerUpToTarget.id;
        } else {
          this.botState = BotState.RANDOM;
          this.randomTarget.x = 100 + Math.random() * (worldDimensions.width - 200);
          this.randomTarget.y = 100 + Math.random() * (worldDimensions.height - 200);
        }
      } else {
        let powerUpStillExists = false;
        for (let globalPowerUp of globalPowerUps) {
          if (globalPowerUp.x == this.randomTarget.x && globalPowerUp.y == this.randomTarget.y) {
            powerUpStillExists = true;
            break;
          }
        }
        if (!powerUpStillExists) {
          this.botState = BotState.RANDOM;
        }
      }
      let targetX = this.randomTarget.x;
      let targetY = this.randomTarget.y;
      this.#checkIfGotToTarget(targetX, targetY);
      this.#aimAtTarget(targetX, targetY, 0, 0, 0.4);
    }
  }

  #setFollowingTarget() {
    if (this.followingPlayerID == "") {
      //lets try including other bots in the follow candidates
      let allPlayers = [player, ...otherPlayers, ...bots];
      //for debuging bot following I won't shuffle this and let it target player if possible
      //shuffleArray(allPlayers);
      let playerToFollow = null;

      for (const candidate of allPlayers) {
        candidate.targetedBy = candidate.targetedBy.filter((id) => id !== this.id);

        if (this.id === candidate.id) {
          // Don't follow yourself
          continue; // Skip to the next iteration
        }

        let candidateHowLongSinceActive = candidate.howLongSinceActive();

        if (
          candidateHowLongSinceActive < 300 &&
          candidate.targetedBy.length < maxBotsThatCanTargetAtOnce &&
          candidate.isPlaying &&
          candidate.timeSinceSpawned > 600 &&
          candidate.invincibleTimer < 10
        ) {
          playerToFollow = candidate;
          playerToFollow.targetedBy.push(this.id);
          this.followingPlayerID = playerToFollow.id;
          break;
        } else {
          //console.log(candidate.name + " is inactive not targeting");
        }
      }
    }
  }
  //this is doing more than checking if got there refactor this
  #checkIfGotToTarget(targetX, targetY) {
    let currentX = this.x;
    let currentY = this.y;
    let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

    if (this.botState == BotState.FOLLOW_PLAYER) {
      if (distance < 100) {
        //once we get there move on to a new target
        this.inRangeTicks += 1;
        if (this.inRangeTicks > 200) {
          let followingPlayer = null;
          let allPlayers = [player, ...otherPlayers, ...bots];

          for (const candidate of allPlayers) {
            if (this.followingPlayerID === candidate.id) {
              followingPlayer = candidate;
              break; // Exit the loop once the followingPlayer is found
            }
          }
          if (followingPlayer && followingPlayer.targetedBy.length > 0) {
            // this.followingPlayer.targetedBy -= 1;
            followingPlayer.targetedBy = followingPlayer.targetedBy.filter((id) => id !== this.id);
          } else {
            this.followingPlayerID ="";
            console.log("followingPlayer null ");
          }
          this.followingPlayerID = "";
          this.chooseNewBotState();
        } else if (distance < 50 && this.inRangeTicks > 80) {
          this.chooseNewBotState();
        }
      } else {
        if (this.inRangeTicks > 0) {
          this.inRangeTicks -= 1;
        }
      }
    } else if (distance < 300 && this.botState == BotState.RANDOM) {
      this.randomTarget.x = 0;
      this.randomTarget.y = 0;
      this.chooseNewBotState();
    } else if (distance < 20 && this.botState == BotState.COLLECT) {
      this.randomTarget.x = 0;
      this.randomTarget.y = 0;
      this.chooseNewBotState();
    }
  }
  //   #aimAtTarget(targetX, targetY, targetVelocityX, targetVelocityY, adjustmentFactor) {
  //     let currentX = this.x;
  //     let currentY = this.y;
  //     let currentVelocityX = this.vel.x;
  //     let currentVelocityY = this.vel.y;
  //     // Calculate the distance between the target and current points
  //     let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

  //     // Calculate the time it would take to reach the original target without considering target's velocity
  //     let currentSpeed = Math.sqrt(currentVelocityX ** 2 + currentVelocityY ** 2);
  //     let adjustedTargetX = targetX;
  //     let adjustedTargetY = targetY;

  //     if (currentSpeed != 0) {
  //       let timeToReachTarget = distance / currentSpeed;

  //       // Calculate the adjusted target by considering a weighted combination of position and velocity
  //       adjustedTargetX = targetX * (1 - adjustmentFactor) + (targetX + targetVelocityX * timeToReachTarget) * adjustmentFactor;
  //       adjustedTargetY = targetY * (1 - adjustmentFactor) + (targetY + targetVelocityY * timeToReachTarget) * adjustmentFactor;
  //     }
  //     // Calculate the adjusted mouse position
  //     let mousePos = this.mousePosToPositionAwayFromTarget(adjustedTargetX, adjustedTargetY, 200, this.mousePosX, this.mousePosY);

  //     if (!isNaN(mousePos.X) && !isNaN(mousePos.Y)) {
  //       this.mousePosX = mousePos.X;
  //       this.mousePosY = mousePos.Y;
  //     } else {
  //       console.log("mousePos NaN");
  //     }
  //     this.space = true;
  //   }

  #aimAtTarget(targetX, targetY, targetVelocityX, targetVelocityY, adjustmentFactor) {
    let currentX = this.x;
    let currentY = this.y;
    let currentVelocityX = this.vel.x;
    let currentVelocityY = this.vel.y;

    // Calculate the relative velocity between the bot and the target
    let relativeVelocityX = targetVelocityX - currentVelocityX;
    let relativeVelocityY = targetVelocityY - currentVelocityY;

    // Calculate the distance between the target and current points
    let distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);

    // Calculate the time it would take to reach the original target without considering target's velocity
    let currentSpeed = Math.sqrt(currentVelocityX ** 2 + currentVelocityY ** 2);
    let adjustedTargetX = targetX;
    let adjustedTargetY = targetY;

    if (currentSpeed != 0) {
      let timeToReachTarget = distance / currentSpeed;

      // Calculate the adjusted target by considering a weighted combination of position and velocity
      adjustedTargetX = targetX + relativeVelocityX * adjustmentFactor * timeToReachTarget;
      adjustedTargetY = targetY + relativeVelocityY * adjustmentFactor * timeToReachTarget;
    }

    // Calculate the adjusted mouse position
    let mousePos = this.mousePosToPositionAwayFromTarget(adjustedTargetX, adjustedTargetY, 200, this.mousePosX, this.mousePosY);

    if (!isNaN(mousePos.X) && !isNaN(mousePos.Y)) {
      this.mousePosX = mousePos.X;
      this.mousePosY = mousePos.Y;
    } else {
      console.log("mousePos NaN");
    }
    this.space = true;
  }

  mousePosToPositionAwayFromTarget(targetX, targetY, distanceFromCurrent, currentMousePosX, currentMousePosY) {
    let deltaX = targetX - this.x;
    let deltaY = targetY - this.y;

    // Calculate the distance between the target and current position
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    if (distance == 0) {
      return { X: 0, Y: 0 };
    }
    // Calculate the normalized direction vector
    let directionX = deltaX / distance;
    let directionY = deltaY / distance;

    // Calculate the new mouse position
    let mousePosX = this.x - directionX * distanceFromCurrent;
    let mousePosY = this.y - directionY * distanceFromCurrent;

    let currentAngle = Math.atan2(currentMousePosY - this.y, currentMousePosX - this.x);
    let desiredAngle = Math.atan2(mousePosY - this.y, mousePosX - this.x);

    // Calculate the angle difference
    let angleDifference = desiredAngle - currentAngle;

    // Wrap the angle difference between -π and π
    if (angleDifference > Math.PI) {
      angleDifference -= 2 * Math.PI;
    } else if (angleDifference < -Math.PI) {
      angleDifference += 2 * Math.PI;
    }

    // Interpolate between the current angle and the desired angle
    let interpolationFactor = 0.8; // Adjust this value to change the speed of the turn
    let interpolatedAngle = currentAngle + angleDifference * interpolationFactor;

    // Calculate the new mouse position based on the interpolated angle and the desired distance from the current position
    mousePosX = this.x + Math.cos(interpolatedAngle) * distanceFromCurrent;
    mousePosY = this.y + Math.sin(interpolatedAngle) * distanceFromCurrent;
    if (!isNaN(mousePosX) && !isNaN(mousePosY)) {
    } else {
      console.log("mousePos NaN");
    }
    return { X: mousePosX, Y: mousePosY };
  }
  randomlyConsiderChangingState(chance = 1) {
    if (Math.random() > chance) {
      this.followingPlayerID = "";
      this.randomTarget.x = 0;
      this.randomTarget.y = 0;
      this.chooseNewBotState();
    }
  }
  chooseNewBotState() {
    //for now randomly choose new state
    if (Math.random() > 0.8) {
      this.botState = BotState.FOLLOW_PLAYER;
    } else if (Math.random() > 0.4) {
      this.botState = BotState.RANDOM;
    } else {
      this.botState = BotState.COLLECT;
    }
  }
}
