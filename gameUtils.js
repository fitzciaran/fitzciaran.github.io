import { forces, effects, MineType } from "./entities.js";
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
      // canvas.style.left = originalX;
      // canvas.style.top = originalY;
      canvas.style.left = "0px";
      canvas.style.top = "0px";
    }
  }

  // Start the shake effect
  shake();
}

export function getRandomUniqueColor(colors, selectedColors) {
  let remainingColors;
  if (selectedColors) {
    remainingColors = colors.filter((color) => !selectedColors.includes(color));
  } else {
    remainingColors = colors;
  }
  if (remainingColors.length === 0 && selectedColors) {
    // Reset the selected colors array if all colors have been used
    selectedColors.length = 0;
    remainingColors = colors;
  }

  const randomIndex = Math.floor(Math.random() * remainingColors.length);
  const selectedColor = remainingColors[randomIndex];
  if (selectedColors) {
    selectedColors.push(selectedColor);
  }
  if (!selectedColor) {
    console.log("issue getting random unique color");
  }
  return selectedColor;
}

// Generate circles to approximate the shape
function generateCircles(shapePath, radius) {
  const circles = [];

  for (let i = 0; i < shapePath.length; i++) {
    const currentPoint = shapePath[i];
    const nextPoint = shapePath[(i + 1) % shapePath.length];

    const distance = Math.sqrt((nextPoint.x - currentPoint.x) ** 2 + (nextPoint.y - currentPoint.y) ** 2);
    const numCircles = Math.max(2, Math.ceil(distance / (2 * radius))); // Ensure a minimum of 2 circles

    for (let j = 0; j < numCircles; j++) {
      const fraction = j / (numCircles - 1); // Adjusted for inclusiveness
      const x = currentPoint.x + fraction * (nextPoint.x - currentPoint.x);
      const y = currentPoint.y + fraction * (nextPoint.y - currentPoint.y);
      circles.push({ x, y, radius });
    }
  }

  return circles;
}

export function findCompleteShape(playerID, mines, minShapeArea) {
  // Filter mines belonging to the specified player
  const playerMines = mines.filter((mine) => mine.playerId === playerID && mine.mineType == MineType.TRAIL);
  // Sort the player mines by mine.duration (in descending order)
  playerMines.sort((a, b) => b.duration - a.duration);

  if (playerMines.length < 15) {
    // Not enough mines to form a shape
    return null;
  }

  // Check if there is a closed shape
  const shapePath = [];

  for (let i = 0; i < playerMines.length; i++) {
    const currentMine = playerMines[i];
    shapePath.push({ x: currentMine.x, y: currentMine.y });
  }

  // Check if the shapePath forms a closed shape
  if (shapePath.length >= 3) {
    const firstPoint = shapePath[0];
    const lastPoint = shapePath[shapePath.length - 1];
    const distanceBetweenStartAndEnd = Math.sqrt((firstPoint.x - lastPoint.x) ** 2 + (firstPoint.y - lastPoint.y) ** 2);

    // if (distanceBetweenStartAndEnd <= minShapeArea) {
    if (distanceBetweenStartAndEnd <= 100) {
      // Calculate the center of the shape
      const centerX = shapePath.reduce((sum, point) => sum + point.x, 0) / shapePath.length;
      const centerY = shapePath.reduce((sum, point) => sum + point.y, 0) / shapePath.length;

      // Calculate the area of the shape
      let shapeArea = 0;
      for (let i = 0; i < shapePath.length; i++) {
        const currentPoint = shapePath[i];
        const nextPoint = shapePath[(i + 1) % shapePath.length];
        shapeArea += (currentPoint.x * nextPoint.y - nextPoint.x * currentPoint.y) / 2;
      }
      shapeArea = Math.abs(shapeArea);
      //let triangulationShapeArea = calculateArea(shapePath);
      if (shapeArea < minShapeArea) {
        return null;
      }
      // Describe the shape
      if (playerMines.length === 2) {
        return { type: "Ring", center: { x: centerX, y: centerY }, area: shapeArea };
      } else {
        // const circles = generateCircles(shapePath, playerMines[0].width / 2);
        // const spokeLength = 3 * calculateAverageDistance(centerX, centerY, shapePath);
        const spokeLength = 3.5 * calculateAverageDistance(centerX, centerY, shapePath);
        const spokeWidth = 70;
        // const spokeWidth = 250;
        return {
          type: "Bounded Shape",
          center: { x: centerX, y: centerY },
          area: shapeArea,
          mines: playerMines,
          shapePath: shapePath,
          spokeLength: spokeLength,
          spokeWidth: spokeWidth,
          // circles: circles,
        };
      }
    } else {
      //remove the first matching mine
      // playerMines.pop();
      // return findCompleteShape(playerID, playerMines, minShapeArea)
    }
  }

  // No closed shape found or it's too small or not closed enough
  return null;
}

function calculateAverageDistance(centerX, centerY, points) {
  const numSamplePoints = 10;
  let totalDistance = 0;

  for (let i = 0; i < numSamplePoints; i++) {
    const randomIndex = Math.floor(Math.random() * points.length);
    const samplePoint = points[randomIndex];

    const dx = samplePoint.x - centerX;
    const dy = samplePoint.y - centerY;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return totalDistance / numSamplePoints;
}

function calculateArea(shapePath) {
  if (shapePath.length < 3) {
    // Cannot calculate area for shapes with less than 3 vertices.
    return 0;
  }

  let totalArea = 0;
  const n = shapePath.length;

  // Triangulate the shape and sum up the areas of individual triangles.
  for (let i = 1; i < n - 1; i++) {
    const x1 = shapePath[0].x;
    const y1 = shapePath[0].y;
    const x2 = shapePath[i].x;
    const y2 = shapePath[i].y;
    const x3 = shapePath[i + 1].x;
    const y3 = shapePath[i + 1].y;

    const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
    totalArea += area;
  }

  return totalArea;
}

export function isPointInsideShape(shapePath, point) {
  const x = point.x;
  const y = point.y;

  let isInside = false;
  const n = shapePath.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = shapePath[i].x;
    const yi = shapePath[i].y;
    const xj = shapePath[j].x;
    const yj = shapePath[j].y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}
