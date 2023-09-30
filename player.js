import {
  bots,
  otherPlayers,
  player,
  worldDimensions,
  colors,
  acceleration,
  setCam,
  setGameState,
  GameState,
  globalPowerUps,
  canvas,
  selectedColors,
} from "./main.js";
import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { forces, ForceArea, ForceType, Effect, effects, EffectType, MineType, Trail } from "./entities.js";
import { checkFirstLetterSpace } from "./gameUtils.js";
import {
  setEndGameMessage,
  maxInvincibilityTime,
  spawnProtectionTime,
  maxSpecialMeter,
  PilotName,
  initialInvincibleTime,
  botRespawnDelay,
  pilots,
  basicAnimationTimer,
} from "./gameLogic.js";
import { screenShake, getRandomUniqueColor } from "./gameUtils.js";
import { sendPlayerStates, sendRequestForStates, requestFullUpdate, sendEffectsUpdate } from "./sendData.js";

const bounceFactor = 1.5;
const offset = 1;
const minBounceSpeed = 5;
const maxBotsThatCanTargetAtOnce = 1;
const maxVel = 50;
const minVel = -50;
const resettingBackupTimeout = 200;
let lastSentBots = [];

export const BotState = {
  FOLLOW_PLAYER: "followPlayer",
  RANDOM: "random",
  COLLECT: "collect",
};

export const Special = {
  BOOST: "boost",
  FORCE_PULL: "pull",
  FORCE_PULL_FOCUS: "pullfocus",
  FORCE_PUSH: "push",
};

export class Player {
  constructor(
    id = null,
    x = null,
    y = null,
    powerUps = 0,
    color = null,
    angle = 0,
    pilot = "",
    name = "",
    isPlaying = true,
    isUserControlledCharacter = false
  ) {
    this.id = id;
    this.x = x !== null ? x : 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = y !== null ? y : 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = powerUps;
    this.color = color !== null ? color : getRandomUniqueColor(colors, selectedColors);
    this.angle = angle;
    this.pilot = pilot;
    this.name = name;
    this.isPlaying = isPlaying;
    this.isUserControlledCharacter = isUserControlledCharacter;
    this.lives = 1;
    this.isMaster = false;
    this.setIsDead(false);
    this.invincibleTimer = 0;
    this.forceCoolDown = 0;
    this.setComboScaler(1);
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
    this.u = false;
    this.ticksSincePowerUpCollection = -1;
    this.targetedBy = [];
    this.timeSinceSpawned = 0;
    this.timeSinceSentMessageThatWasRecieved = 0;
    this.special = Special.FORCE_PULL;
    this.specialMeter = 100;
    this.usingSpecial = 0;
    this.hitBy = "";
    this.recentScoreTicks = 0;
    this.isLocal = false;
    this.timeOfLastActive = "";
    this.recentScoreText = "";
    this.recentKillScoreText = "";
    this.devMode = false;
    this.killed = [];
    this.killedBy = [];
    this.resetting = false;
  }

  resetState(keepName, keepColor) {
    this.x = 1200 + Math.random() * (worldDimensions.width - 2400);
    this.y = 600 + Math.random() * (worldDimensions.height - 1200);
    this.powerUps = 0;
    if (!keepColor) {
      this.color = getRandomUniqueColor(colors, selectedColors);
    }
    this.angle = 0;
    if (!keepName) {
      this.name = "";
    }
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.timeOfLastActive = "";
    this.target = { x: 0, y: 0, id: "" };
    this.targetedBy = [];
    this.space = false;
    this.shift = false;
    //don't reset isDead, that can be done explicity when game is (re)started
    // this.setIsDead(false);
    this.invincibleTimer = 0;
    this.setComboScaler(1);
    this.kills = 0;
    this.inRangeTicks = 0;
    this.mousePosX = 0;
    this.mousePosY = 0;
    this.currentSpeed = 0;
    this.vel = { x: 0, y: 0 };
    this.timeSinceSpawned = 0;
    this.hitBy = "";
    this.recentScoreTicks = 0;
    this.recentScoreText = "";
    this.recentKillScoreText = "";
    this.resetting = false;
    this.inForce = 0;
  }
  isDead() {
    return this.isDead;
  }
  setIsDead(newIsDead) {
    this.isDead = newIsDead;
  }

  delayReset(framesToDelay, keepName, keepColor, inProgress = false) {
    if (!inProgress && this.resetting == true) {
      // If already have a scheduled reset, ignore future requests.//could do this timeout only if master?
      if (!this.resettingTimeout) {
        this.resettingTimeout = setTimeout(() => {
          this.resetting = false;
          this.resettingTimeout = null;
          console.log("Resetting flag was forcefully reset.");
        }, resettingBackupTimeout);
      }
      return;
    }

    // Resetting is in progress, clear the timeout if it exists.
    if (this.resettingTimeout) {
      clearTimeout(this.resettingTimeout);
      this.resettingTimeout = null;
    }

    this.resetting = true;
    if (framesToDelay > 0) {
      requestAnimationFrame(() => {
        this.delayReset(framesToDelay - 1, keepName, keepColor, true);
      });
    } else {
      // Execute the reset after the specified number of frames.
      this.resetState(keepName, keepColor);
    }
  }

  //gotHit and addScore are both doing an additional key function of sending the playerstates as master.
  //Need to unpick this, maybe there should be events for gotHit and addscore and masterpeer responds to such events with sending player state for the given player
  gotHit(hitBy) {
    this.setIsDead(true);
    this.recentScoreTicks = 0;
    this.setComboScaler(1);
    this.hitBy = hitBy;

    this.updateKilledAndKilledByLists(hitBy, this == player);

    if (!this.killedBy.includes(hitBy) && hitBy != "a mine") {
      this.killedBy.push(hitBy);
    }
    let effectID = Math.floor(Math.random() * 10000);

    let effect = new Effect(effectID, this.x, this.y, 100, 50, "orange", EffectType.EXPLOSION);
    effects.push(effect);
    // sendEffectsUpdate(true)
    if (isPlayerMasterPeer(player)) {
      sendPlayerStates(this, true, true);
      sendEffectsUpdate(true);
    }
    if (this.isLocal) {
      screenShake(canvas, 30, 1000);
    }
    if (this.isBot) {
      this.delayReset(botRespawnDelay, true, true);
    }
  }

  updateKilledAndKilledByLists(hitBy, isPlayer) {
    if (hitBy != null && hitBy != "") {
      this.updateKilledAndKilledByListsValidHitBy(hitBy, isPlayer);
    } else if (isPlayer) {
      setEndGameMessage("Score: " + this.powerUps * 100);
    }
  }

  updateKilledAndKilledByListsValidHitBy(hitBy, isPlayer) {
    if (!this.killed.includes(hitBy)) {
      if (!this.killedBy.includes(hitBy)) {
        if (isPlayer) {
          if (hitBy == "a mine") {
            setEndGameMessage("Watch out for mines! \nScore: " + this.powerUps * 100);
          } else {
            setEndGameMessage("Killed by: " + hitBy + "\nScore: " + this.powerUps * 100);
          }
        }
      } else {
        if (isPlayer) {
          setEndGameMessage(hitBy + " is dominating you" + "\nScore: " + this.powerUps * 100);
        }
      }
    } else {
      this.killed = this.killed.filter((item) => item !== hitBy);
      if (isPlayer) {
        setEndGameMessage(hitBy + " took their revenge!" + "\nScore: " + this.powerUps * 100);
      }
    }
  }

  addScore(scoreToAdd) {
    this.powerUps += scoreToAdd;
    if (this.powerUps != Math.floor(this.powerUps)) {
      //I'm trying out not whole number combo scaling so not unexpected now
      // console.log("somehow not whole score added");
      this.powerUps = Math.floor(this.powerUps);
    }
    // if (isPlayerMasterPeer(player) && !isPlayerMasterPeer(this)) {
    if (isPlayerMasterPeer(player)) {
      sendPlayerStates(this, true, true);
    }
  }

  gotPowerUp(isStar, scoreToAdd, powerUpIndex) {
    this.ticksSincePowerUpCollection = 0;
    if (isStar) {
      let invcibilityTime = initialInvincibleTime;
      for (let pilot of pilots) {
        if (this.pilot == pilot.name) {
          invcibilityTime = pilot.invincibilityTime;
          break;
        }
      }
      this.setInvincibleTimer(invcibilityTime);
    }

    scoreToAdd *= this.comboScaler;

    this.recentScoreTicks = 150;
    let textScore = scoreToAdd * 100;
    this.setRecentScoreText(textScore);
    if (this.comboScaler < 10) {
      this.setComboScaler(this.comboScaler + 0.5);
    }
    globalPowerUps[powerUpIndex].hitFrames = 2;
    // // globalPowerUps.splice(powerUpIndex, 1);

    // if (isPlayerMasterPeer(player)) {
    //   setGlobalPowerUps(globalPowerUps);
    // }
    this.addScore(scoreToAdd);
    this.recentKillScoreText = "";
    if (this.isLocal) {
      // screenShake(canvas, 2, 200);
    }
  }

  setComboScaler(newValue) {
    if (newValue < 1) {
      this.comboScaler = 1;
    } else {
      this.comboScaler = newValue;
    }
  }

  setRecentScoreText(textScore) {
    if (this.comboScaler >= 5.5) {
      this.recentScoreText = this.getComboText("Monster!", textScore);
    } else if (this.comboScaler >= 5) {
      this.recentScoreText = this.getComboText("Epic!", textScore);
    } else if (this.comboScaler >= 4.5) {
      this.recentScoreText = this.getComboText("Awesome!", textScore);
    } else if (this.comboScaler >= 4) {
      this.recentScoreText = this.getComboText("Insane!", textScore);
    } else if (this.comboScaler >= 3.5) {
      this.recentScoreText = this.getComboText("Unreal!", textScore);
    } else if (this.comboScaler >= 3) {
      this.recentScoreText = this.getComboText("Fierce!", textScore);
    } else if (this.comboScaler >= 2.5) {
      this.recentScoreText = this.getComboText("Sick!", textScore);
    } else if (this.comboScaler >= 2.1) {
      this.recentScoreText = this.getComboText("Wild!", textScore);
    } else if (this.comboScaler >= 1.8) {
      this.recentScoreText = this.getComboText("Cool!", textScore);
    } else if (this.comboScaler >= 1.5) {
      this.recentScoreText = this.getComboText("Combo!", textScore);
    } else {
      this.recentScoreText = this.getComboText("", textScore);
    }
  }

  getComboText(comboName, textScore) {
    return comboName + " " + textScore;
  }

  setRecentKillText(playerThatGotHitName, revenge = true) {
    const killFlavorText = ["KILL!", "GOTTEM!", "SMASH!", "OOOF!"];

    const revengeFlavorText = ["Got Revenge on ", " gets served with payback", " won't mess with you again", " found out"];

    const dominatingFlavorText = ["Dominating poor ", " dies again", " bites the dust again", " found out again"];

    // Generate random index, can split this out if want to have different number of options for each text
    const textIndex = Math.floor(Math.random() * killFlavorText.length);
    if (playerThatGotHitName != null && playerThatGotHitName != "") {
      if (revenge) {
        if (checkFirstLetterSpace(revengeFlavorText[textIndex])) {
          this.recentKillScoreText = playerThatGotHitName + revengeFlavorText[textIndex];
        } else {
          this.recentKillScoreText = revengeFlavorText[textIndex] + playerThatGotHitName;
        }
      } else {
        //if not revenge then dominating
        if (checkFirstLetterSpace(dominatingFlavorText[textIndex])) {
          this.recentKillScoreText = playerThatGotHitName + dominatingFlavorText[textIndex];
        } else {
          this.recentKillScoreText = dominatingFlavorText[textIndex] + playerThatGotHitName;
        }
      }
    } else {
      //if no name passed then set regular flavour text
      this.recentKillScoreText = killFlavorText[textIndex];
    }
  }

  hitOtherPlayer(playerThatGotHit) {
    this.kills += 1;
    if (this.killedBy.includes(playerThatGotHit.name)) {
      this.killedBy = this.killedBy.filter((item) => item !== playerThatGotHit.name);
      this.setRecentKillText(playerThatGotHit.name, true);
    } else if (this.killed.includes(playerThatGotHit.name)) {
      this.setRecentKillText(playerThatGotHit.name, false);
    } else {
      this.setRecentKillText("");
    }
    if (!this.killed.includes(playerThatGotHit.name)) {
      this.killed.push(playerThatGotHit.name);
    }

    let score = 2 * this.comboScaler;
    score += Math.round(playerThatGotHit.powerUps / 3);
    this.recentScoreTicks = 250;
    let textScore = score * 100;

    this.setRecentScoreText(textScore);
    if (this.invincibleTimer > 165) {
      this.setInvincibleTimer(this.invincibleTimer - 150);
    } else {
      this.setInvincibleTimer(15);
    }
    this.addScore(score);
    if (this.comboScaler < 10) {
      this.setComboScaler(this.comboScaler + 0.5);
    }
    if (this.isLocal) {
      screenShake(canvas, 30, 500);
    }
  }

  isActive() {
    return (this.isPlaying || this.isBot) && !this.isDead;
  }

  isInvincible() {
    return this.invincibleTimer > 0;
  }
  isVulnerable() {
    return !this.isInvincible() && !this.isInSpawnProtectionTime() && this.isActive();
  }
  isTangible() {
    return !this.isInSpawnProtectionTime() || this.isInvincible();
  }

  isInSpawnProtectionTime() {
    return this.timeSinceSpawned <= spawnProtectionTime;
  }

  setInvincibleTimer(newTime) {
    let invcibilityTime = maxInvincibilityTime;
    for (let pilot of pilots) {
      if (this.pilot == pilot.name) {
        invcibilityTime = pilot.invincibilityTime;
        break;
      }
    }

    this.invincibleTimer = Math.min(newTime, invcibilityTime);
    this.invincibleTimer = Math.max(this.invincibleTimer, 0);
  }

  setSpecialMeter(newTime) {
    this.specialMeter = Math.min(newTime, maxSpecialMeter);
    this.specialMeter = Math.max(this.specialMeter, 0);
  }
  setPilot(newPilot) {
    this.pilot = newPilot;
    if (this.pilot == PilotName.PILOT_1) {
      this.special = Special.FORCE_PULL;
    }
    if (this.pilot == PilotName.PILOT_2) {
      this.special = Special.FORCE_PUSH;
    }
    if (this.pilot == PilotName.PILOT_3) {
      this.special = Special.BOOST;
    }
    if (this.pilot == PilotName.PILOT_4) {
      this.special = Special.FORCE_PULL_FOCUS;
    }
  }

  getPlayerName() {
    return this.name;
  }

  setPlayerName(newName) {
    this.name = newName;
  }

  setPlayerIsMaster(isMaster) {
    if (this.isLocal && !isMaster && this.isMaster) {
      //if switching away from being master send basic ship data
      sendPlayerStates(this, false, true);
    }
    if (isMaster && !this.isMaster) {
      //if switching any player to being master request basic ship data
      sendRequestForStates();
    }
    if (isMaster && !this == player) {
      //if switching another player to master ask master for a full update. Not sure if master will be ready as master immediately so schedule a few requests
      setTimeout(() => requestFullUpdate(), 20);
      setTimeout(() => requestFullUpdate(), 500);
      setTimeout(() => requestFullUpdate(), 2000);
    }
    this.isMaster = isMaster;
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
    this.boundVelocity();
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
      pilotBoostFactor = 0.7;
    } else if (this.pilot == PilotName.PILOT_3) {
      pilotBoostFactor = 1.3;
    } else if (this.pilot == PilotName.PILOT_4) {
      pilotBoostFactor = 1.0;
    }
    let boosting = false;
    if (this.shift && (this.specialMeter > 50 || (this.usingSpecial && this.specialMeter > 1))) {
      if (this.usingSpecial < 1 && !this.devMode) {
        //initial cost more than keeping it going
        this.setSpecialMeter(this.specialMeter - 10);
      }
      this.usingSpecial = 3;
      //todo specials other than boost shouldn't be triggered here
      if (
        this.special == Special.FORCE_PULL ||
        this.special == Special.FORCE_PULL_FOCUS ||
        this.special == Special.FORCE_PUSH ||
        this.special == Special.BOOST
      ) {
        // if (this.forceCoolDown < 1) {
        //try a gradual effect
        //this.forceCoolDown = 200;
        if (!this.devMode) {
          this.setSpecialMeter(this.specialMeter - 3);
        }
        if (this.specialMeter == 0) {
          this.usingSpecial = 0;
        }

        if (this.special == Special.FORCE_PULL || this.special == Special.FORCE_PULL_FOCUS || this.special == Special.FORCE_PUSH) {
          let attractive = true;
          if (this.special == Special.FORCE_PUSH) {
            attractive = false;
          }
          // Calculate the cone's direction based on the ship's angle is needed since everything is offset by this
          const coneDirection = this.angle - Math.PI / 2;
          // Specify the desired cone angle (in radians) for the force
          let coneAngle = Math.PI * 2;
          let forcePower = 1.5;
          let radius = 200;

          if (this.special == Special.FORCE_PULL_FOCUS) {
            coneAngle = Math.PI / 4; // 45-degree cone
            forcePower = 3.0;
            radius = 500;
          }
          let forceType = ForceType.POINT;
          // Create the ForceArea with the cone properties
          this.createForce(this.x, this.y, forcePower, 5, radius, attractive, this.color, this, coneAngle, coneDirection, forceType);
        } else if (this.special == Special.BOOST) {
          //give a bit of meter back for the boost so it works out cheaper than force.
          this.setSpecialMeter(this.specialMeter + 1);
          boosting = true;
          if (this.specialMeter > 0 && !this.devMode) {
            this.setSpecialMeter(this.specialMeter - 5);
          }
          if (this.pilot == PilotName.PILOT_1) {
            pilotBoostFactor = 3;
          }
          if (this.pilot == PilotName.PILOT_2) {
            pilotBoostFactor = 5;
          }
          if (this.pilot == PilotName.PILOT_3) {
            pilotBoostFactor = 7;
          }
        }
      }
    }
    this.vel.x *= newFriction;
    this.vel.y *= newFriction;

    if (this.space || boosting) {
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
    this.boundVelocity();
    this.currentSpeed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
  }
  createForce(
    x,
    y,
    force = 1,
    duration = 10,
    radius = 200,
    isAttractive = true,
    color = "red",
    tracks = null,
    coneAngle = 0,
    direction = 0,
    type = ForceType.POINT,
    width = 100,
    length = 200
  ) {
    //note this assumes a given player will always use the same force. If that ever changes we just need to remove the old force from forces. If the play can have multiple forces then we'll have to revist this.
    // Check if there is already a force with the same id
    const existingForce = forces.find((force) => force.id === "player-" + this.id);
    // const existingForce = null;

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      let playerForce = new ForceArea(
        "player-" + this.id,
        x,
        y,
        force,
        duration,
        radius,
        isAttractive,
        color,
        tracks,
        coneAngle,
        direction,
        type,
        width,
        length,
        true
      );

      //currently  doesn't keep a reference to it's force, is that fine?
      forces.push(playerForce);
    } else {
      existingForce.duration = 10;
      existingForce.x = x;
      existingForce.y = y;
      existingForce.force = force;
      existingForce.radius = radius;
      existingForce.isAttractive = isAttractive;
      existingForce.color = color;
      existingForce.tracks = tracks;
      existingForce.coneAngle = coneAngle;
      existingForce.direction = direction;
      existingForce.type = type;
      existingForce.width = width;
      existingForce.length = length;
    }
  }

  setDevMode(newMode) {
    this.devMode = newMode;
    sendPlayerStates(this, true, true);
  }
  boundVelocity() {
    if (this.vel.x > maxVel) {
      this.vel.x = maxVel;
    } else if (this.vel.x < minVel) {
      this.vel.x = minVel;
    }
    if (this.vel.y > maxVel) {
      this.vel.y = maxVel;
    } else if (this.vel.y < minVel) {
      this.vel.y = minVel;
    }
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
      if (isNaN(this.vel.x)) {
        this.vel.x = 0;
      }
      if (isNaN(this.vel.y)) {
        this.vel.y = 0;
      }
      this.boundVelocity();
    }
  }

  emitTrail(mines) {
    let trailTime = 100;
    for (let pilot of pilots) {
      if (this.pilot == pilot.name) {
        trailTime = pilot.trailTime;
        break;
      }
    }
    // trailTime = 10000;
    const velocityAngle = Math.atan2(this.vel.y, this.vel.x);
    const velocitySize = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);

    let length = 15;
    // let length = 45;
    if (velocitySize > 2) {
      length *= Math.min(4, velocitySize / 2);
    }
    // let width = 20;
    let width = 50;

    // Calculate the offset based on velocityAngle and a distance (e.g., 10 pixels)
    const offsetDistance = 20; // Adjust this as needed
    const xOffset = offsetDistance * Math.cos(velocityAngle);
    const yOffset = offsetDistance * Math.sin(velocityAngle);

    // Calculate the new x and y coordinates for the trail
    const trailX = this.x - xOffset;
    const trailY = this.y - yOffset;

    let trail = new Trail(
      "trail-" + Math.floor(Math.random() * 10000),
      trailX,
      trailY,
      trailTime,
      // 30,
      70,
      this.color,
      0,
      MineType.TRAIL,
      -5,
      this.id,
      velocityAngle + Math.PI / 2,
      length,
      width
    );
    mines.push(trail);
    if (isPlayerMasterPeer(this)) {
      // trying without the send, trusting on sync a bit here... maybe every 10 frames send?
      // sendMinesUpdate(true);
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
  updateTick(deltaTime, mines) {
    if (this.id == player.id && player.isDead) {
      setGameState(GameState.FINISHED);
      return;
    }
    if (!this.isDead) {
      this.timeSinceSpawned++;
      this.updatePlayerAngle();
      this.updatePlayerVelocity(deltaTime);
      this.bouncePlayer();
      this.updatePlayerPosition(deltaTime);
      if (this.u && this.devMode) {
        //this is a debug cheat
        this.setInvincibleTimer(this.invincibleTimer + 100);
        this.setSpecialMeter(this.specialMeter + 100);
      }
      if (this.invincibleTimer > 0 && !this.devMode) {
        this.setInvincibleTimer(this.invincibleTimer - 1);
        if (this.invincibleTimer == 0) {
          //can react to ending this state here, maybe animation/effect
        }
      }
      if (this.specialMeter < maxSpecialMeter) {
        this.specialMeter++;
      }
      this.usingSpecial = Math.max(this.usingSpecial - 1, 0);

      if (this.ticksSincePowerUpCollection > -1) {
        this.ticksSincePowerUpCollection++;
      }
      if (this.ticksSincePowerUpCollection > 5) {
        this.ticksSincePowerUpCollection = -1;
      }
      this.forceCoolDown = Math.max(this.forceCoolDown - 1, 0);
      if (this.recentScoreTicks > 0) {
        this.recentScoreTicks = Math.max(this.recentScoreTicks - 1, 0);
        if (this.recentScoreTicks == 0) {
          this.setComboScaler(1);
          this.recentKillScoreText = "";
        }
      }
      if (basicAnimationTimer % 2 == 0 && !this.isInSpawnProtectionTime() && this.currentSpeed > 0.2) {
        this.emitTrail(mines);
      }
    }
    otherPlayers.forEach((otherPlayer) => {
      otherPlayer.timeSinceSentMessageThatWasRecieved += 1;
    });
    this.inForce = Math.max(this.inForce - 1, 0);
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

export function createPlayerFromObject(obj, excludeCurrentPlayer = true) {
  let newPlayer = new Player(
    obj.id,
    obj.x,
    obj.y,
    obj.powerUps,
    obj.color,
    obj.angle,
    obj.pilot,
    obj.name,
    obj.isPlaying,
    obj.isUserControlledCharacter
  );
  newPlayer.timeOfLastActive = obj.timeOfLastActive;
  newPlayer.playerAngleData = obj.playerAngleData;
  newPlayer.mousePosX = obj.mousePosX;
  newPlayer.mousePosY = obj.mousePosY;
  newPlayer.currentSpeed = obj.currentSpeed;
  newPlayer.vel = obj.vel;
  newPlayer.distanceFactor = obj.distanceFactor;
  newPlayer.space = obj.space;
  newPlayer.shift = obj.shift;
  newPlayer.u = obj.u;
  newPlayer.timeSinceSpawned = obj.timeSinceSpawned;
  newPlayer.setIsDead(obj.isDead);
  return newPlayer;
}

export function createBotFromObject(obj) {
  let bot = new Bot(obj.id, obj.x, obj.y, obj.powerUps, obj.color, obj.angle, obj.pilot, obj.name, obj.isPlaying, obj.isUserControlledCharacter);
  bot.timeOfLastActive = obj.timeOfLastActive;
  bot.playerAngleData = obj.playerAngleData;
  bot.mousePosX = obj.mousePosX;
  bot.mousePosY = obj.mousePosY;
  bot.currentSpeed = obj.currentSpeed;
  bot.vel = obj.vel;
  bot.isPlaying = obj.isPlaying;
  bot.special = obj.special;
  bot.distanceFactor = obj.distanceFactor;
  bot.lives = obj.lives;
  bot.space = obj.space;
  bot.shift = obj.shift;
  bot.u = obj.u;
  bot.forceCoolDown = obj.forceCoolDown;
  bot.setComboScaler(obj.comboScaler);
  bot.kills = obj.kills;
  bot.ticksSincePowerUpCollection = obj.ticksSincePowerUpCollection;
  bot.timeSinceSpawned = obj.timeSinceSpawned;
  bot.setInvincibleTimer(obj.invincibleTimer);
  bot.setIsDead(obj.isDead);
  return bot;
}

export class Bot extends Player {
  constructor(
    id = null,
    x = null,
    y = null,
    powerUps = 0,
    color = null,
    angle = 0,
    pilot = "",
    name = "",
    isPlaying = true,
    isUserControlledCharacter = false
  ) {
    super(id, x, y, powerUps, color, angle, pilot, name, isPlaying, (isUserControlledCharacter = false));
    this.previousAngleDifference = 0;
    this.previousTurnDirection = 0;
    this.botState = BotState.FOLLOW_PLAYER;
    this.followingPlayerID = "";
    this.timeOfLastMessage = "";
    this.target = { x: 0, y: 0, id: "" };
    this.inRangeTicks = 0;
    this.isBot = true;
  }
  resetState(keepName, keepColor) {
    super.resetState(keepName, keepColor);
    this.setIsDead(false);
  }

  updateTick(deltaTime, mines) {
    if (this.isDead) {
      //todo delay this?
      //this.resetState(true, true);
      // this.delayReset(botRespawnDelay, true, true);
      return;
    }

    super.updateTick(deltaTime, mines);
  }

  updateBotInputs() {
    //this.randomlyConsiderChangingState();
    if (this.invincibleTimer > 30 && this.botState != BotState.FOLLOW_PLAYER) {
      this.#setFollowingTarget();
      if (this.followingPlayerID != "") {
        this.setRandomTarget(0, 0, "random point");
        this.setBotState(BotState.FOLLOW_PLAYER);
      }
    }
    if (isNaN(this.inForce)) {
      this.inForce = 0;
    }
    if (this.inForce > 50) {
      //try to get bots out of a force they may be stuck in by aiming somewhere new
      this.setRandomTargetInMainArea();
      this.inForce = 0;
    }

    if (this.botState == BotState.FOLLOW_PLAYER) {
      this.handleFollowPlayerState();
    } else if (this.botState == BotState.RANDOM) {
      this.handleRandomState();
    } else if (this.botState == BotState.COLLECT) {
      this.handleCollectState();
    }
  }

  handleFollowPlayerState() {
    this.#setFollowingTarget();
    if (this.followingPlayerID == "") {
      this.setBotState(BotState.RANDOM);
      // return;
      this.handleRandomState();
    }

    const allPlayers = [...otherPlayers, ...bots, player];
    let followingPlayer = allPlayers.find((candidate) => this.followingPlayerID === candidate.id);
    if (followingPlayer == null || followingPlayer.isDead || !followingPlayer.isPlaying) {
      this.followingPlayerID = "";
      return;
    }
    if (followingPlayer.isBot) {
      this.randomlyConsiderChangingState(0.1);
    }
    if (followingPlayer.invincibleTimer > 10) {
      this.randomlyConsiderChangingState(0.03);
    }
    if (followingPlayer.isDead) {
      this.followingPlayerID = "";
    }
    this.handleTargeting(followingPlayer.x, followingPlayer.y, followingPlayer.vel.x, followingPlayer.vel.y, 0.4);
  }

  handleRandomState() {
    if (this.target.x == 0 && this.target.y == 0) {
      this.setRandomTargetInMainArea();
    }
    this.handleTargeting(this.target.x, this.target.y, 0, 0, 0.4);
  }

  handleCollectState() {
    if (this.target.x == 0 && this.target.y == 0) {
      // Calculate the soonPosition
      const soonPosition = {
        x: this.x + 3 * this.vel.x,
        y: this.y + 3 * this.vel.y,
      };

      let closestPowerUp;
      let closestDistance = Infinity;

      // Iterate over globalPowerUps to find the closest one to soonPosition
      for (const powerUp of globalPowerUps) {
        const distance = Math.sqrt(Math.pow(soonPosition.x - powerUp.x, 2) + Math.pow(soonPosition.y - powerUp.y, 2));

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPowerUp = powerUp;
        }
      }

      if (closestPowerUp) {
        // Use the closest power-up as the target
        this.setRandomTarget(closestPowerUp.x, closestPowerUp.y, closestPowerUp.id);
      } else {
        // If no power-ups are available, switch to RANDOM state
        this.setBotState(BotState.RANDOM);
      }
    } else {
      let powerUpStillExists = globalPowerUps.some((globalPowerUp) => globalPowerUp.x == this.target.x && globalPowerUp.y == this.target.y);
      if (!powerUpStillExists) {
        this.setBotState(BotState.RANDOM);
      }
    }
    this.handleTargeting(this.target.x, this.target.y, 0, 0, 0.4);
  }

  setRandomTargetInMainArea() {
    this.setRandomTarget(300 + Math.random() * (worldDimensions.width - 600), 300 + Math.random() * (worldDimensions.height - 600), "random");
  }
  setRandomTarget(x, y, id) {
    this.target.x = x;
    this.target.y = y;
    this.target.id = id;
  }

  setBotState(state) {
    if (state == this.botState) {
      return;
    }
    if (state == BotState.RANDOM) {
      this.setRandomTargetInMainArea();
    }
    this.botState = state;
  }

  handleTargeting(targetX, targetY, velX, velY, factor) {
    this.#checkIfGotToTarget(targetX, targetY);
    this.#aimAtTarget(targetX, targetY, velX, velY, factor);
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
        let distance = Math.sqrt((this.x - candidate.x) ** 2 + (this.y - candidate.y) ** 2);
        if (
          distance < 1000 &&
          candidateHowLongSinceActive < 300 &&
          candidate.targetedBy.length < maxBotsThatCanTargetAtOnce &&
          candidate.isPlaying &&
          candidate.timeSinceSpawned > 600 &&
          candidate.invincibleTimer < 10 &&
          !candidate.isDead
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
            this.followingPlayerID = "";
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
      this.target.x = 0;
      this.target.y = 0;
      this.chooseNewBotState();
    } else if (distance < 20 && this.botState == BotState.COLLECT) {
      this.target.x = 0;
      this.target.y = 0;
      this.chooseNewBotState();
    }
  }

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
      console.log("mousePos NaN in aimAtTarget");
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
      this.target.x = 0;
      this.target.y = 0;
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

export function serializeBots(bots, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed bots
    const changedBotData = bots
      .map((currentBot) => {
        const lastSentBotData = lastSentBots.find((lastBotData) => lastBotData.id === currentBot.id);
        const serializedBot = serializeBot(currentBot);

        // Compare the serialized data of the current bot with the last sent data
        if (!lastSentBotData || !areUpdateCriticalValuesSameBot(serializedBot, lastSentBotData)) {
          // Update lastSentBots with the new serialized data if changed
          lastSentBots = lastSentBots.map((bot) => (bot.id === currentBot.id ? serializedBot : bot));
          return serializedBot;
        }

        // Return null for bots that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedBotData;
  } else {
    // If onlyChangedData is false, update lastSentBots with the current serialized data
    lastSentBots = bots.map(serializeBot);

    // Serialize and return all bots
    return lastSentBots;
  }
}

// Define a function to serialize a bot's data
function serializeBot(bot) {
  return {
    id: bot.id,
    x: bot.x,
    y: bot.y,
    vel: bot.vel,
    isDead: bot.isDead,
    angle: bot.angle,
    currentSpeed: bot.currentSpeed,
    timeOfLastActive: bot.timeOfLastActive,
    playerAngleData: bot.playerAngleData,
    mousePosX: bot.mousePosX,
    mousePosY: bot.mousePosY,
    isPlaying: bot.isPlaying,
    special: bot.special,
    distanceFactor: bot.distanceFactor,
    lives: bot.lives,
    space: bot.space,
    shift: bot.shift,
    u: bot.u,
    forceCoolDown: bot.forceCoolDown,
    comboScaler: bot.comboScaler,
    kills: bot.kills,
    ticksSincePowerUpCollection: bot.ticksSincePowerUpCollection,
    timeSinceSpawned: bot.timeSinceSpawned,
    botState: bot.botState,
    target: bot.target,
    followingPlayerID: bot.followingPlayerID,
    previousAngleDifference: bot.previousAngleDifference,
    previousTurnDirection: bot.previousTurnDirection,
    invincibleTimer: bot.invincibleTimer,
    name: bot.name,
    inForce: bot.inForce,
  };
}

// Define a function to compare bot objects for equality
function areUpdateCriticalValuesSameBot(bot1, bot2) {
  let isSame =
    bot1.isDead === bot2.isDead &&
    bot1.angle === bot2.angle &&
    bot1.isPlaying === bot2.isPlaying &&
    bot1.distanceFactor === bot2.distanceFactor &&
    bot1.lives === bot2.lives &&
    bot1.space === bot2.space &&
    bot1.shift === bot2.shift &&
    bot1.u === bot2.u &&
    bot1.comboScaler === bot2.comboScaler &&
    bot1.kills === bot2.kills &&
    bot1.botState === bot2.botState &&
    bot1.target === bot2.target &&
    bot1.followingPlayerID === bot2.followingPlayerID &&
    bot1.name === bot2.name &&
    bot1.inForce === bot2.inForce;
  return isSame;
}

function isEqualBot(bot1, bot2) {
  const tolerance = 1e-4;

  let isSame =
    Math.abs(bot1.x - bot2.x) < tolerance &&
    Math.abs(bot1.y - bot2.y) < tolerance &&
    bot1.x === bot2.x &&
    bot1.y === bot2.y &&
    bot1.vel === bot2.vel &&
    bot1.isDead === bot2.isDead &&
    bot1.angle === bot2.angle &&
    bot1.currentSpeed === bot2.currentSpeed &&
    bot1.timeOfLastActive === bot2.timeOfLastActive &&
    bot1.playerAngleData === bot2.playerAngleData &&
    bot1.mousePosX === bot2.mousePosX &&
    bot1.mousePosY === bot2.mousePosY &&
    bot1.isPlaying === bot2.isPlaying &&
    bot1.special === bot2.special &&
    bot1.distanceFactor === bot2.distanceFactor &&
    bot1.lives === bot2.lives &&
    bot1.space === bot2.space &&
    bot1.shift === bot2.shift &&
    bot1.u === bot2.u &&
    bot1.forceCoolDown === bot2.forceCoolDown &&
    bot1.comboScaler === bot2.comboScaler &&
    bot1.kills === bot2.kills &&
    bot1.ticksSincePowerUpCollection === bot2.ticksSincePowerUpCollection &&
    bot1.timeSinceSpawned === bot2.timeSinceSpawned &&
    bot1.botState === bot2.botState &&
    bot1.target === bot2.target &&
    bot1.followingPlayerID === bot2.followingPlayerID &&
    bot1.previousAngleDifference === bot2.previousAngleDifference &&
    bot1.previousTurnDirection === bot2.previousTurnDirection &&
    bot1.invincibleTimer === bot2.invincibleTimer &&
    bot1.name === bot2.name &&
    bot1.inForce === bot2.inForce;
  return isSame;
}
