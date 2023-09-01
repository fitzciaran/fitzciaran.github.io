import { setGameState, GameState, player, setGlobalPowerUps, getGlobalPowerUps, bots, Player, otherPlayers } from "./astroids.js";
import { sendPlayerStates, sendGameState, isPlayerMasterPeer, addScore, sendBotsState } from "./connectionHandlers.js";

//finish game after 5 for easier testing the finish
export let pointsToWin = 5;
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

export function generatePowerups(globalPowerUps, worldWidth, worldHeight, colors) {
  if (!isPlayerMasterPeer(player)) {
    return;
  }
  // Check if there are less than max powerups powerups
  while (globalPowerUps.length < maxPowerups) {
    // Generate a new dot with random x and y within the world
    let powerup = {
      x: (Math.random() * 0.8 + 0.1) * worldWidth,
      y: (Math.random() * 0.8 + 0.1) * worldHeight,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    globalPowerUps.push(powerup);
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
      }
      globalPowerUps.splice(i, 1);
      // sendPowerups(globalPowerUps);
      setGlobalPowerUps(globalPowerUps);
      //cf test do we need this looks like yes
      //sendGameState(globalPowerUps);
      break; // exit the loop to avoid possible index errors
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
  bots.forEach((bot) => {
    // Check if bot is an instance of the Player class
    if (bot != null && bot instanceof Player) {
      bot.updateBotInputs();
      bot.updateTick(deltaTime);
    } else {
      console.log("Bot is not an instance of the Player class.");
    }
  });
}

export function updatePowerups(deltaTime) {
  // Update the positions, velocities, etc. of the powerups
  //setGlobalPowerUps(getGlobalPowerUps());
}
export function detectCollisions(player, globalPowerUps) {
  // Detect collisions between the player's ship and the powerups or other ships
  // If a collision is detected, update the game state accordingly
  checkPowerupCollision(player, globalPowerUps);
}

export function calculateAngle(player) {
  return Math.atan2(player.mousePosY - player.y, player.mousePosX - player.x);
}

export function masterPeerUpdateGame(globalPowerUps, bots, deltaTime) {
  // This peer is the master, so it runs the game logic for shared objects

  //eventually run this based on how many bots and existing players in total currently
  createBots();
  updateBots(deltaTime);
  updateEnemies(deltaTime);
  updatePowerups(deltaTime);

  // The master peer also detects collisions between all ships and powerups
  otherPlayers.forEach((otherPlayer) => {
    detectCollisions(otherPlayer, globalPowerUps, otherPlayers);
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
    "Butthole",
    "Tosser",
    "Wanker",
    "Killer",
    "Chubb",
  ];

  // Generate a random index for prefix and suffix
  const prefixIndex = Math.floor(Math.random() * prefixes.length);
  const suffixIndex = Math.floor(Math.random() * suffixes.length);

  // Generate a random number between 10 and 99
  const randomNumber = Math.floor(Math.random() * 90) + 10;

  // Concatenate prefix, suffix and random number to form the name
  let randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;

  // If the name is longer than 10 characters, regenerate it
  while (randomName.length > max_player_name) {
    const prefixIndex = Math.floor(Math.random() * prefixes.length);
    const suffixIndex = Math.floor(Math.random() * suffixes.length);
    const randomNumber = Math.floor(Math.random() * 90) + 10;
    randomName = prefixes[prefixIndex] + suffixes[suffixIndex] + randomNumber;
  }

  return randomName;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
  }
}
