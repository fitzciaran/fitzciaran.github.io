import { player, bots, otherPlayers, mines, setGameTimer, gameTimer, globalPowerUps } from "./main.js";
import { isPlayerMasterPeer, setTimeSinceMessageFromMaster, timeSinceMessageFromMaster } from "./connectionHandlers.js";
import { detectCollisions } from "./collisionLogic.js";
import { sendPlayerStates, sendEntitiesState, sendEntitiesUpdate, sendBotEntitiesUpdate, sendRemoveEntityUpdate } from "./sendData.js";
import { forces, Entity, effects, MineType } from "./entities.js";
import { Player, Bot } from "./player.js";
import { ProcessTrailShapesAllPlayers } from "./trailShapes.js";

//finish game after 5 for easier testing the finish
export let pointsToWin = 5;
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
