import { isPlayerMasterPeer, setTimeSinceMessageFromMaster, timeSinceMessageFromMaster } from "./connectionHandlers.js";
import { detectCollisions } from "./collisionLogic.js";
import {
  getTopScores,
  incrementFirebaseGivenPropertyValue,
  readUserDataFromFirestore,
  getFirebaseProperty,
  DbPropertyKey,
  DbDocumentKey,
  getFirebase,
  allTimeKills,
  allTimePoints,
  allTimeLogins,
} from "./db.js";
import { forces, Entity, effects, MineType } from "./entities.js";
import { achievementsTitleText } from "./login.js";
import { generatePowerups, generateMines, generateDirectionalForces, generateBots } from "./generateEntities.js";
import { player, bots, otherPlayers, mines, setGameTimer, gameTimer, globalPowerUps, worldDimensions, colors, powerUpColors } from "./main.js";
import { Player, Bot } from "./player.js";
import { sendPlayerStates, sendEntitiesState, sendEntitiesUpdate, sendBotEntitiesUpdate, sendRemoveEntityUpdate } from "./sendData.js";
import { ProcessTrailShapesAllPlayers } from "./trailShapes.js";

export let initialInvincibleTime = 60 * 10;
export let maxInvincibilityTime = initialInvincibleTime;
export let maxSpecialMeter = 200;

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
export let levelAnimationFrame = 0;

export function incrementLevelAnimationFrame() {
  levelAnimationFrame++;
}
export let achievementsTitle = achievementsTitleText.LOGIN_TO_TRACK;

export function setAchievementsTitle(newTitle) {
  achievementsTitle = newTitle;
}

export class Pilot extends Entity {
  constructor(
    id = null,
    x = null,
    y = null,
    width = 100,
    height = 130,
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
  130,
  "Sunny Sam; Speed: 4; Invicible Time: 10;Special: Gravity Attract; Ugh, here's Sunny Side-Up Sam, the carrot who's always shining bright. How original, right? He's the 'hero' of this carrot caper, or so he thinks. Just an average carrot trying way too hard to be cool. Yawn. Is he in this tournament to prove he's the 'coolest' carrot around?;Agressive: likes to get powered up and use Gravity Attract to get kills",
  PilotName.PILOT_1,
  "carrot1Canvas",
  600,
  100
);
export const pilot2 = new Pilot(
  PilotName.PILOT_2,
  0,
  0,
  100,
  130,
  "Girthy Gordon; Speed: 2; Invicible Time: 15;Special: Gravity Repel; A Grumpy, portly carrot with a penchant for defense. You've seen it all before, right? He might be slow, but that doesn't stop him from being the predictable 'tank' of the group. Originality, anyone? Is he here for vengeance, or is there something even darker lurking beneath his carrot exterior?;Defensive: not so fast but can use Gravity Repel to keep attackers away ",
  PilotName.PILOT_2,
  "carrot2Canvas",
  900,
  120
);
export const pilot3 = new Pilot(
  PilotName.PILOT_3,
  0,
  0,
  100,
  130,
  "Zippy; Speed: 5; Invicible Time: 10; Special: Speed Boost; Fast but weak, unathletic, and clumsier than a bull in a china shop. He's also surprisingly tight with his money, counting every last carrot coin. Zipping around like he's in a hurry to save a few bucks. A tiny carrot with a big cliché and an even smaller wallet. Maybe he stumbled into the tournament by accident, and now he's just trying to survive the chaos!;Speedy: tricky to control. Not for scrubs! ",
  PilotName.PILOT_3,
  "carrot3Canvas",
  600,
  100
);
export const pilot4 = new Pilot(
  PilotName.PILOT_4,
  0,
  0,
  100,
  130,
  "Stan; Speed: 3; Invicible Time: 12; Special: Tractor Beam; Forever in shock, like he just found out he's a carrot. With his bleeding eyes and a backstory that involves suffering radiation poisoning from being half-cooked in the microwave. In endless pain some say he want's to win the tournament only as part of his plan to make sure the entire universe suffers as he does.;Sneaky!: Powerful long range narrow tractor beam can cause havok from afar!",
  PilotName.PILOT_4,
  "carrot4Canvas",
  700,
  150
);

export let pilots = [pilot1, pilot2, pilot3, pilot4];

export const max_player_name = 15;

export function setEndGameMessage(newMessage) {
  endGameMessage = newMessage;
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

export function updateOtherPlayers(deltaTime, mines, camX, camY) {
  otherPlayers.forEach((otherPlayer, index) => {
    // Check if player is an instance of the Player class
    if (otherPlayer != null && otherPlayer instanceof Player) {
      if (otherPlayer.name != "") {
        otherPlayer.updateTick(deltaTime, mines, camX, camY);
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
        otherPlayer.getAngle(),
        otherPlayer.pilot,
        otherPlayer.name,
        otherPlayer.isPlaying
      );

      // Replace the old player with the new Player instance in the array
      otherPlayer[index] = newPlayer;
    }
  });
}

export function updateBots(deltaTime, mines, camX, camY) {
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
        bot.getAngle(),
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
      bot.updateTick(deltaTime, mines, camX, camY);
    }
  });
}

export function updatePowerups(deltaTime) {
  // Update the positions, velocities, etc. of the powerups once they move... they need their own update tick
  //setGlobalPowerUps(getGlobalPowerUps());
}

export function masterUpdateGame(player, globalPowerUps, otherPlayers, bots, mines, deltaTime, camX, camY) {
  //this isn't synced between peers
  setGameTimer(gameTimer + 1);
  if (!isPlayerMasterPeer(player)) {
    setTimeSinceMessageFromMaster(timeSinceMessageFromMaster + 1);
  }
  player.updateTick(deltaTime, mines, camX, camY);
  // generateBots(worldWidth,worldHeight,colors);
  updateBots(deltaTime, mines, camX, camY);
  updateOtherPlayers(deltaTime, mines, camX, camY);
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

  if (gameTimer % 2 == 0) {
    ProcessTrailShapesAllPlayers(player, otherPlayers, mines, effects, globalPowerUps);
  }
  removeExpiredPowerUps(globalPowerUps, player);
  removeExpiredEffects(effects, player);
  basicAnimationTimer++;
  incrementLevelAnimationFrame();
  if (isPlayerMasterPeer(player)) {
    if (gameTimer % 89 == 1) {
      sendEntitiesState();
    } else if (gameTimer % 21 == 1) {
      sendEntitiesUpdate();
    } else if (gameTimer % 2 == 1) {
      sendBotEntitiesUpdate();
    }
  }
  if (!player.isDead && gameTimer % 1 == 0) {
    sendPlayerStates(player, isPlayerMasterPeer(player));
  }

  if (gameTimer % 100 == 2 && isPlayerMasterPeer(player)) {
    generateBots(worldDimensions.width, worldDimensions.height, colors);
    generatePowerups(globalPowerUps, worldDimensions.width, worldDimensions.height, powerUpColors);
    generateMines(worldDimensions.width, worldDimensions.height, colors);
    generateDirectionalForces(worldDimensions.width, worldDimensions.height, colors);
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
// Initial XP required for first level up
let initialXPRequired = 100;
let xpRequiredGrowthFactor = 1.6;

export function getXp() {
  let totalXp = 0;
  totalXp += allTimePoints;
  totalXp += allTimeKills * 500;
  totalXp += allTimeLogins * 1;
  return totalXp;
}

export function calculateLevelXP(xp, initialXPRequired, growthFactor) {
  let level = 1;
  let xpRequired = initialXPRequired;

  // Find the level at which the given XP belongs
  while (xp >= xpRequired) {
    xp -= xpRequired;
    level++;
    xpRequired = Math.floor(xpRequired * growthFactor); // Increase XP required for the next level
  }
  let xpToNextLevel = xpRequired - xp;

  return { level, remainingXP: xp, nextLevelXP: xpRequired, xpToNextLevel };
}

export function getLevel(xp) {
  const { level } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return level;
}

export function getLevelXP(xp) {
  const { remainingXP } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return remainingXP;
}

export function getNextLevelXP(xp) {
  const { nextLevelXP } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return nextLevelXP;
}

export function getXpToNextLevel(xp) {
  const { xpToNextLevel } = calculateLevelXP(xp, initialXPRequired, xpRequiredGrowthFactor);
  return xpToNextLevel;
}
