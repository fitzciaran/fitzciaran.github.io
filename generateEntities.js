import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { player, setMines, bots, mines, selectedColors } from "./main.js";
import { sendRemoveEntityUpdate, sendMinesUpdate, sendPowerUpsUpdate, sendForcesUpdate, sendBotsUpdate } from "./sendData.js";
import { forces, Mine, PowerUp, ForceType, ForceArea, MineType } from "./entities.js";
import { Bot } from "./player.js";
import { getRandomUniqueColor } from "./gameUtils.js";

let maxPowerups = 10;
let maxMines = 14;
let maxBots = 4;
let maxDirectionalForces = 7;
let chancePowerUpIsStar = 0.2;

export const BoundaryForce = {
  LEFT: "leftBoundaryForce-",
  RIGHT: "rightBoundaryForce-",
  TOP: "topBoundaryForce-",
  BOTTOM: "bottomBoundaryForce-",
};

export function generatePowerups(globalPowerUps, worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  let addedPowerUps = false;
  // Check if there are less than max powerups powerups
  while (globalPowerUps.length < maxPowerups) {
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
      "regularPU-" + Math.floor(Math.random() * 10000),
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
  let regularPowerUps = globalPowerUps.filter((powerup) => powerup.id.startsWith("mineConvert-"));
  // Remove excess powerUps if there are more than maxPowerups
  while (regularPowerUps.length > maxPowerups) {
    let removedPowerUp = globalPowerUps.pop();
    removedPowerUp = regularPowerUps.pop();
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

  // Check if there are fewer than maxBots bots
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
    "Wesely",
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
    "Racoon",
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
