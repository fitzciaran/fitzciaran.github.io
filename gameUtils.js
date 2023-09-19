import { forces,effects } from "./entities.js";
import { bots, globalPowerUps, mines } from "./main.js";
// Function to find a bot by ID in the bots array
export function findBotById(id) {
  return bots.find((bot) => bot.id === id);
}

export function findForceById(id) {
  return forces.find((force) => force.id === id);
}

export function findMineById(id) {
  return mines.find((mine) => mine.id === id);
}

export function findEffectById(id) {
  return effects.find((effect) => effect.id === id);
}

export function findPowerUpById(id) {
  return globalPowerUps.find((powerUp) => powerUp.id === id);
}

export function differsFrom(firstArray, secondArray) {
  // Convert the second array to a Set for efficient lookup
  const secondArraySet = new Set(secondArray);

  // Check if any element in the first array is not in the second array
  for (const element of firstArray) {
    if (!secondArraySet.has(element)) {
      return true; // Found a value in the first array that's not in the second array
    }
  }
  return false; // All values in the first array are also in the second array
}

//check if the first letter of the string is a space
export function checkFirstLetterSpace(string) {
  return /^\s/.test(string);
}
