export function isSpokeCollision(entity, playerRadius, centerX, centerY, angle, spokeLength, spokeWidth) {
  let playerX = entity.x;
  let playerY = entity.y;
  // Check for collision with each of the 8 spokes (or 4 diameters)
  for (let angleDegrees = 0; angleDegrees < 360; angleDegrees += 45) {
    const spokeAngleRadians = (angleDegrees + angle) * (Math.PI / 180); // Convert to radians

    // Calculate the start and end points of the spoke
    const spokeStartX = centerX;
    const spokeStartY = centerY;
    const spokeEndX = centerX + spokeLength * Math.cos(spokeAngleRadians);
    const spokeEndY = centerY + spokeLength * Math.sin(spokeAngleRadians);

    // Calculate the vector from the player's position to the spoke's start point
    const dx = spokeStartX - playerX;
    const dy = spokeStartY - playerY;

    // Calculate the dot product of the vector from player to spoke and the spoke's direction vector
    const dotProduct = dx * (spokeEndX - spokeStartX) + dy * (spokeEndY - spokeStartY);

    // Check if the player is within the length of the spoke
    if (dotProduct >= 0 && dotProduct <= spokeLength * spokeLength) {
      // Calculate the perpendicular distance from the player to the spoke
      const distance = Math.abs(dx * (spokeEndY - spokeStartY) - dy * (spokeEndX - spokeStartX)) / spokeLength;

      // Check if the distance is less than the player's radius plus half of the spoke width
      if (distance <= playerRadius + spokeWidth / 2) {
        return true; // Collision detected with this spoke
      }
    }
  }

  // No collision with any spoke
  return false;
}
