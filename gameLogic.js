import { setGameState, GameState, player, setGlobalPowerUps, setMines, bots, otherPlayers, mines } from "./astroids.js";
import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { sendPlayerStates, sendGameState, sendEntitiesState } from "./handleData.js";
import { addScore } from "./db.js";
import { forces, Mine, PowerUp } from "./entities.js";
import { Player, Bot } from "./player.js";
// import { Bot } from "./bot.js";

//if mess with these need to change the collision detection - factor these in
export const shipScale = 2;
export const mineScale = 0.7;

//finish game after 5 for easier testing the finish
export let pointsToWin = 5;
let initialInvincibleTime = 60 * 10;
export let maxInvincibilityTime = initialInvincibleTime;
export let maxSpecialMeter = 200;
let maxPowerups = 10;
let maxMines = 15;
export let spawnProtectionTime = 100;
export let endGameMessage = "";
export let gameWon = false;
export const pilot1 = {
  image: new Image(),
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  selected: false,
  lore: "Orion is the muscle-bound moral compass of the cosmos. Born in a dying star, Orion's got strength that makes bodybuilders weep and a heart that's never heard of a grey area. He's saved more worlds than he's had hot dinners, and his name is basically a synonym for 'awesome' in every galaxy. But don't worry, he hasn't let it go to his head. He's always ready to lend a hand, or a bicep. Orion: not just a pilot, but a one-man, space-faring beacon of hope.",
};

export const pilot2 = {
  image: new Image(),
  x: 100,
  y: 0,
  width: 100,
  height: 100,
  selected: false,
  lore: "Bumble, the hero nobody asked for, and who just won't go away. He's got a unique talent for tripping over absolutely nothing and a flying skill that's... well, let's just call it 'creative'. He might not have Orion's strength, or any gazelle's grace, or even the reflexes of a half-asleep sloth, but boy, does he have determination. And a knack for surviving situations he really shouldn't. Bumble is proof that some people have no potential.",
};

export const max_player_name = 15;
let chancePowerUpIsStar = 0.2;
export function checkWinner(player, otherPlayers) {
  //for now won't have a winner in this sense still thinking about what the game should be
  return false;
  if (player.powerUps >= pointsToWin) {
    sendPlayerStates(player);
    setGameState(GameState.FINISHED);
    endGameMessage = "Winner! Rivals dreams crushed.";
    var date = new Date();
    var dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    //todo update this when have a real notion of score - for now random for testing
    //will only be adding if/when it is in the top 10 for a category.
    var score = Math.floor(Math.random() * 100) + 1;
    addScore("daily-" + dateString, player.name, score);
    gameWon = true;
    return true;
  }
  for (let otherPlayer of otherPlayers) {
    if (otherPlayer.powerUps >= pointsToWin) {
      gameWon = false;
      setGameState(GameState.FINISHED);
      endGameMessage = "Get good scrub! You lose";
      // drawWinnerMessage(ctx, canvas, "Get good scrub! You lose");
      return true;
    }
  }
  return false;
}

export function setEndGameMessage(newMessage) {
  endGameMessage = newMessage;
}

export function generatePowerups(globalPowerUps, worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
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
    globalPowerUps.push(powerUp);
    // setGlobalPowerUps(globalPowerUps);
    // Send the powerups every time you generate one
    // sendPowerups(globalPowerUps);

    //cf test do we need this sendGameState(globalPowerUps);
  }
}

export function generateMines(worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  // Check if there are less than max powerups powerups
  while (mines.length < maxMines) {
    let hasGravity = 0;
    if (Math.random() > 0.4) {
      hasGravity = 1;
    }
    let powerUp = new Mine(
      Math.floor(Math.random() * 10000),
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      100,
      10,
      colors[Math.floor(Math.random() * colors.length)],
      hasGravity
    );
    mines.push(powerUp);
  }
}

export function checkPowerupCollision(playerToCheck, globalPowerUps) {
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10 * shipScale + globalPowerUps[i].radius) {
      // assuming the radius of ship is 10 - todo update for better hitbox on ship
      if (playerToCheck.ticksSincePowerUpCollection == -1) {
        //may need to make this an array of "recently collected / iteracted stuff" to be more robust in the future rather than a simple power up timer
        // playerToCheck.powerUps += globalPowerUps[i].value;
        let scoreToAdd = globalPowerUps[i].value;
        playerToCheck.ticksSincePowerUpCollection = 0;
        if (globalPowerUps[i].isStar) {
          playerToCheck.setInvincibleTimer(initialInvincibleTime);
        }
        globalPowerUps.splice(i, 1);
        playerToCheck.addScore(scoreToAdd);
      }
      // sendPowerups(globalPowerUps);
      setGlobalPowerUps(globalPowerUps);
      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick? if so we could simply schedule the removal of collected until after this loop
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
      if (playerToCheck.invincibleTimer == 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime && mines[i].hitFrames < 1) {
        playerToCheck.gotHit("a mine");
        mines[i].hitFrames = 5;
        // mines.splice(i, 1);
      }
      if (playerToCheck.invincibleTimer > 0 && playerToCheck.timeSinceSpawned > spawnProtectionTime && mines[i].hitFrames < 1) {
        playerToCheck.setInvincibleTimer(playerToCheck.invincibleTimer - 100);
        mines[i].hitFrames = 5;
        // mines.splice(i, 1);
      }
      // sendPowerups(globalPowerUps);
      setMines(mines);
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
    let dx = playerToCheck.x - allPlayers[i].x;
    let dy = playerToCheck.y - allPlayers[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance < 20 * shipScale &&
      playerToCheck.isPlaying == true &&
      allPlayers[i].isPlaying == true &&
      !playerToCheck.isDead &&
      !allPlayers[i].isDead
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
        playerToCheck.delayReset(3, true, true);
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
          allPlayers[i].delayReset(3, true, true);
        }
      } else {
        console.log("non player in players array");
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
  sendPlayerStates(player, globalPowerUps);
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

export function checkForcesCollision(playerToCheck, forces) {
  for (let force of forces) {
    if (playerToCheck == force.tracks) {
      continue;
    }
    if (playerToCheck != null && force.tracks != null && playerToCheck.id === force.tracks.id && playerToCheck.name === force.tracks.name) {
      //might not be matching above if force.tracks has been recreated after being serialised and sent.
      continue;
    }

    // Calculate the distance between the player and the center of the circle
    const dx = playerToCheck.x - force.x;
    const dy = playerToCheck.y - force.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > force.radius) {
      continue;
    }
    // Calculate the proportional force strength
    let strength = 0;
    if (distance > 0 && distance <= 50) {
      // Calculate strength based on the inverse square of the distance
      strength = force.force / 2500 / (distance * distance);
    } else if (distance > 50 && distance <= force.radius) {
      // Gradual decrease in force from max at 50 to 40% at force.radius
      const maxForce = force.force;
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
    if (bot != null && bot instanceof Bot) {
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

export function masterPeerUpdateGame(player, globalPowerUps, otherPlayers, bots, deltaTime) {
  // This peer is the master, so it runs the game logic for shared objects

  //eventually run this based on how many bots and existing players in total currently
  createBots();
  updateBots(deltaTime);
  updateOtherPlayers(deltaTime);
  updateEnemies(deltaTime);
  updatePowerups(deltaTime);

  // The master peer also detects collisions between all ships and powerups
  otherPlayers.forEach((otherPlayer) => {
    detectCollisions(otherPlayer, globalPowerUps, bots, otherPlayers, forces);
  });

  bots.forEach((bot) => {
    detectCollisions(bot, globalPowerUps, bots, otherPlayers, forces);
  });

  // Remove mines with hit frames that have expired.
  for (let i = mines.length - 1; i >= 0; i--) {
    if (mines[i].hitFrames > 0) {
      mines[i].hitFrames--;
      // If hit frames have expired, remove the mine.
      mines.splice(i, 1);
    }
  }
  // Send the game state to all other peers

  //...not sending game state of otherplayers...hmm?
  //todo might need to undo condition
  if (isPlayerMasterPeer(player)) {
    sendGameState(globalPowerUps);
    sendEntitiesState(bots);
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
    "Stein",
    "Freedom",
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
