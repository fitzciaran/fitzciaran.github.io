import { setGameState, GameState, player, setGlobalPowerUps, getGlobalPowerUps, bots, PowerUp, otherPlayers } from "./astroids.js";
import { sendPlayerStates, sendGameState, isPlayerMasterPeer, addScore, sendBotsState } from "./connectionHandlers.js";
import {
  Player,
} from "./player.js";
//finish game after 5 for easier testing the finish
export let pointsToWin = 5;
let initialInvincibleTime = 60 * 10;
export let maxInvincibilityTime = initialInvincibleTime;
let maxPowerups = 10;
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
    let isStar = (Math.random() > 0.5);
    let powerUp = new PowerUp(
      Math.random() * 10000,
      (Math.random() * 0.8 + 0.1) * worldWidth,
      (Math.random() * 0.8 + 0.1) * worldHeight,
      colors[Math.floor(Math.random() * colors.length)],isStar
    );
    globalPowerUps.push(powerUp);
    setGlobalPowerUps(globalPowerUps);
    // Send the powerups every time you generate one
    // sendPowerups(globalPowerUps);

    //cf test do we need this sendGameState(globalPowerUps);
  }
}

export function checkPowerupCollision(playerToCheck, globalPowerUps) {
  // if (!isPlayerMasterPeer(player)) {
  //   return;
  // }
  for (let i = 0; i < globalPowerUps.length; i++) {
    let dx = playerToCheck.x - globalPowerUps[i].x;
    let dy = playerToCheck.y - globalPowerUps[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 20) {
      // assuming the radius of both ship and powerup is 10
      if (playerToCheck.ticksSincePowerUpCollection == -1) {
        //may need to make this an array of "recently collected / iteracted stuff" to be more robust in the future rather than a simple power up timer
        playerToCheck.powerUps += 1;
        playerToCheck.ticksSincePowerUpCollection = 0;
        if (globalPowerUps[i].isStar) {
          playerToCheck.invincibleTimer = initialInvincibleTime;
        }
      }
      globalPowerUps.splice(i, 1);
      // sendPowerups(globalPowerUps);
      setGlobalPowerUps(globalPowerUps);
      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      break; // exit the loop to avoid possible index errors - does that mean we can only register 1 collection per tick?
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
   
    if (distance < 20 && playerToCheck.isPlaying == true && allPlayers[i].isPlaying == true) {
      // assuming the radius of both ships is 10
      //for now just reset player if a crash
      if( playerToCheck.invincibleTimer == 0) {
        playerToCheck.gotHit();
      }
      if ( playerToCheck.invincibleTimer > 0 && !allPlayers[i].isDead && allPlayers[i].invincibleTimer == 0) {
        playerToCheck.hitOtherPlayer(allPlayers[i]);
      }
      if (playerToCheck.isBot && playerToCheck.invincibleTimer == 0) {
        // playerToCheck.resetState(true, true);
        allPlayers[i].delayReset(3);
      }
      if (allPlayers[i] instanceof Player) {
        // allPlayers[i].resetState(true, true);
        if ( allPlayers[i].invincibleTimer == 0) {
          allPlayers[i].gotHit();
        }
        if (allPlayers[i].invincibleTimer > 0  && !playerToCheck.isDead && playerToCheck.invincibleTimer == 0) {
          allPlayers[i].hitOtherPlayer(playerToCheck);
        }
        if (allPlayers[i].isBot && allPlayers[i].invincibleTimer == 0) {
          // allPlayers[i].resetState(true, true);
          allPlayers[i].delayReset(3);
        }
      } else {
        console.log("non player in players array");
      }
    }
  }
}

export function resetPowerLevels(player, otherPlayers) {
  // Reset my powerUps
  player.powerUps = 0;

  // Reset powerUps of other players
  otherPlayers.forEach((player) => {
    player.powerUps = 0;
  });

  // Send updated powerUps to other players
  sendPlayerStates(player);
}

function shipHitsBorder(x, y) {
  return x < 0 || y < 0 || x > worldWidth || y > worldHeight;
}

export function setGameWon(won) {
  gameWon = won;
}

export function updateEnemies(deltaTime) {
  // Update the positions, velocities, etc. of the enemies
}

export function updateBots(deltaTime) {
  bots.forEach((bot, index) => {
    // Check if bot is an instance of the Player class
    if (bot != null && bot instanceof Player) {
      bot.updateBotInputs();
      bot.updateTick(deltaTime);
    } else {
      console.log("Bot is not an instance of the Player class. Reinitializing...");

      // Create a new Player object using the properties of the bot
      const newPlayer = new Player(
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

      // Replace the old bot with the new Player object in the array
      bots[index] = newPlayer;
    }
  });
}

export function updatePowerups(deltaTime) {
  // Update the positions, velocities, etc. of the powerups
  //setGlobalPowerUps(getGlobalPowerUps());
}
export function detectCollisions(player, globalPowerUps, bots, otherPlayers) {
  // Detect collisions between the player's ship and the powerups or other ships
  // If a collision is detected, update the game state accordingly
  checkPowerupCollision(player, globalPowerUps);
  let allPlayers = [...bots, ...otherPlayers, player];
  checkPlayerCollision(player, allPlayers);
}

export function calculateAngle(player) {
  return Math.atan2(player.mousePosY - player.y, player.mousePosX - player.x);
}

export function masterPeerUpdateGame(globalPowerUps, otherPlayers, bots, deltaTime) {
  // This peer is the master, so it runs the game logic for shared objects

  //eventually run this based on how many bots and existing players in total currently
  createBots();
  updateBots(deltaTime);
  updateEnemies(deltaTime);
  updatePowerups(deltaTime);

  // The master peer also detects collisions between all ships and powerups
  otherPlayers.forEach((otherPlayer) => {
    detectCollisions(otherPlayer, globalPowerUps, bots, otherPlayers);
  });

  bots.forEach((bot) => {
    detectCollisions(bot, globalPowerUps, bots, otherPlayers);
  });

  // Send the game state to all other peers
  sendGameState(globalPowerUps);
  sendBotsState(bots);
}

//for now just create 4
export function createBots() {
  if (bots != null && bots[0] == null) {
    let botID = 1234;
    while (bots != null && bots.length < 4) {
      // let bot = new Player(botID, null, null, 0, "yellow", 0, "", getRandomName());
      let bot = new Player(botID, null, null, 0, null, 0, "", getRandomName());
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
    "Ranger",
    "Champion",
    "Seeker",
    "Phantom",
    "Hunter",
    "Shifter",
    "Whisper",
    "Dreamer",
    "Wanderer",
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
