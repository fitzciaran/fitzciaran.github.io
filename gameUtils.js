import { forces, effects } from "./entities.js";
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

export function screenShake(canvas, intensity, duration) {
  const originalX = canvas.style.left || "0px";
  const originalY = canvas.style.top || "0px";

  const startTime = Date.now();

  function shake() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime < duration) {
      // Generate random displacement within the intensity range
      const deltaX = (Math.random() - 0.5) * intensity * 2;
      const deltaY = (Math.random() - 0.5) * intensity * 2;

      canvas.style.left = `${parseFloat(originalX) + deltaX}px`;
      canvas.style.top = `${parseFloat(originalY) + deltaY}px`;

      // Request the next frame
      requestAnimationFrame(shake);
    } else {
      // Reset the canvas position after the duration
      canvas.style.left = originalX;
      canvas.style.top = originalY;
    }
  }

  // Start the shake effect
  shake();
}
