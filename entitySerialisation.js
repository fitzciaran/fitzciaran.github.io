let lastSentMasterMineData = [];
let lastSentGlobalPowerUps = [];
let lastSentForces = [];
let lastSentEffects = [];
import { MineType, Trail, FreeMine } from "./entities.js";

export function serializeForces(forces, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed forces
    const changedForceData = forces
      .map((currentForce) => {
        const lastSentForceData = lastSentForces.find((lastForceData) => lastForceData.id === currentForce.id);
        const serializedForce = serializeForce(currentForce);

        // Compare the serialized data of the current force with the last sent data
        if (!lastSentForceData || !isEqualForce(serializedForce, lastSentForceData)) {
          // Update lastSentForces with the new serialized data if changed
          lastSentForces = lastSentForces.map((force) => (force.id === currentForce.id ? serializedForce : force));
          return serializedForce;
        }

        // Return null for forces that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedForceData;
  } else {
    // If onlyChangedData is false, update lastSentForces with the current serialized data
    lastSentForces = forces.map(serializeForce);

    // Serialize and return all forces
    return lastSentForces;
  }
}

// Define a function to serialize a force's data
function serializeForce(force) {
  return {
    id: force.id,
    x: force.x,
    y: force.y,
    force: force.force,
    duration: force.duration,
    radius: force.radius,
    isAttractive: force.isAttractive,
    color: force.color,
    tracks: force.tracks,
    coneAngle: force.coneAngle,
    direction: force.direction,
    type: force.type,
    numberArrowsEachSide: force.numberArrowsEachSide,
    numberArrowsDeep: force.numberArrowsDeep,
    width: force.width,
    length: force.length,
  };
}

// compare force objects for equality
function isEqualForce(force1, force2) {
  const tolerance = 1e-4;
  return (
    Math.abs(force1.x - force2.x) < tolerance &&
    Math.abs(force1.y - force2.y) < tolerance &&
    force1.force === force2.force &&
    //we won't sent if only the duration is different
    // force1.duration === force2.duration &&
    force1.radius === force2.radius &&
    force1.isAttractive === force2.isAttractive &&
    force1.color === force2.color &&
    force1.tracks === force2.tracks &&
    force1.coneAngle === force2.coneAngle &&
    force1.direction === force2.direction &&
    force1.type === force2.type &&
    force1.numberArrowsEachSide === force2.numberArrowsEachSide &&
    force1.numberArrowsDeep === force2.numberArrowsDeep &&
    force1.width === force2.width &&
    force1.length === force2.length
  );
}

export function serializeMines(mines, onlyChangedData = false, omitTrailMines = true) {
  let minesToSerialize = null;
  if (omitTrailMines) {
    minesToSerialize = mines.filter((mine) => mine.mineType == MineType.REGULAR || mine.mineType == MineType.FREE_MINE);
  } else {
    minesToSerialize = mines;
  }
  if (onlyChangedData) {
    // Serialize and return only the changed mines
    const changedMineData = minesToSerialize
      .map((currentMine) => {
        const lastSentMineData = lastSentMasterMineData.find((lastMineData) => lastMineData.id === currentMine.id);
        let serializedMine;
        if (currentMine instanceof Trail) {
          serializedMine = serializeTrail(currentMine);
          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualTrail(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        } else if (currentMine instanceof FreeMine) {
          serializedMine = serializeFreeMine(currentMine);

          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualFreeMine(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        } else {
          serializedMine = serializeMine(currentMine);

          // Compare the serialized data of the current mine with the last sent data
          if (!lastSentMineData || !isEqualMine(serializedMine, lastSentMineData)) {
            // Update lastSentMasterMineData with the new serialized data if changed
            lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
            return serializedMine;
          }
        }
        // Return null for mines that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedMineData;
  } else {
    // If onlyChangedData is false, update lastSentMasterMineData with the current serialized data
    lastSentMasterMineData = minesToSerialize.map(serializeMine);

    // Serialize and return all mines
    return lastSentMasterMineData;
  }
}

function serializeMine(mine) {
  return {
    id: mine.id,
    x: mine.x,
    y: mine.y,
    force: mine.force,
    duration: mine.duration,
    radius: mine.radius,
    hitFrames: mine.hitFrames,
    color: mine.color,
    mineType: mine.mineType,
    playerId: mine.playerId,
  };
}

// Define a function to compare mine objects for equality
function isEqualMine(mine1, mine2) {
  const tolerance = 1e-4;
  return (
    Math.abs(mine1.x - mine2.x) < tolerance &&
    Math.abs(mine1.y - mine2.y) < tolerance &&
    mine1.force === mine2.force &&
    mine1.duration === mine2.duration &&
    mine1.radius === mine2.radius &&
    mine1.hitFrames === mine2.hitFrames &&
    mine1.color === mine2.color &&
    mine1.mineType === mine2.mineType &&
    mine1.playerId === mine2.playerId
  );
}

function serializeFreeMine(mine) {
  return {
    id: mine.id,
    x: mine.x,
    y: mine.y,
    force: mine.force,
    duration: mine.duration,
    radius: mine.radius,
    hitFrames: mine.hitFrames,
    color: mine.color,
    mineType: mine.mineType,
    playerId: mine.playerId,
    points: mine.points,
    angle: mine.angle,
  };
}

// Define a function to compare mine objects for equality
function isEqualFreeMine(mine1, mine2) {
  const tolerance = 1e-4;
  return (
    Math.abs(mine1.x - mine2.x) < tolerance &&
    Math.abs(mine1.y - mine2.y) < tolerance &&
    mine1.force === mine2.force &&
    mine1.duration === mine2.duration &&
    mine1.radius === mine2.radius &&
    mine1.hitFrames === mine2.hitFrames &&
    mine1.color === mine2.color &&
    mine1.mineType === mine2.mineType &&
    mine1.playerId === mine2.playerId &&
    mine1.points === mine2.points &&
    mine1.angle === mine2.angle
  );
}

function serializeTrail(trail) {
  return {
    id: trail.id,
    x: trail.x,
    y: trail.y,
    force: trail.force,
    duration: trail.duration,
    radius: trail.radius,
    hitFrames: trail.hitFrames,
    color: trail.color,
    trail: trail.mineType,
    playerId: trail.playerId,
    angle: trail.angle,
    length: trail.length,
    width: trail.width,
  };
}

// Define a function to compare mine objects for equality
function isEqualTrail(trail1, trail2) {
  const tolerance = 1e-4;
  return (
    Math.abs(trail1.x - trail2.x) < tolerance &&
    Math.abs(trail1.y - trail2.y) < tolerance &&
    trail1.force === trail2.force &&
    trail1.duration === trail2.duration &&
    trail1.radius === trail2.radius &&
    trail1.hitFrames === trail2.hitFrames &&
    trail1.color === trail2.color &&
    trail1.mineType === trail2.mineType &&
    trail1.playerId === trail2.playerId
  );
}

export function serializeGlobalPowerUps(globalPowerUps, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed globalPowerUps
    let changedGlobalPowerUpData = globalPowerUps
      .map((currentPowerUp) => {
        const lastSentPowerUpData = lastSentGlobalPowerUps.find((lastPowerUpData) => lastPowerUpData.id === currentPowerUp.id);
        const serializedPowerUp = serializeGlobalPowerUp(currentPowerUp);

        // Compare the serialized data of the current globalPowerUp with the last sent data
        if (!lastSentPowerUpData || !isEqualGlobalPowerUp(serializedPowerUp, lastSentPowerUpData)) {
          // Update lastSentGlobalPowerUps with the new serialized data if changed
          lastSentGlobalPowerUps = lastSentGlobalPowerUps.map((powerUp) => (powerUp.id === currentPowerUp.id ? serializedPowerUp : powerUp));
          return serializedPowerUp;
        }

        // Return null for globalPowerUps that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);
    return changedGlobalPowerUpData;
  } else {
    // If onlyChangedData is false, update lastSentGlobalPowerUps with the current serialized data
    lastSentGlobalPowerUps = globalPowerUps.map(serializeGlobalPowerUp);

    // Serialize and return all globalPowerUps
    return lastSentGlobalPowerUps;
  }
}

// Define a function to serialize a globalPowerUp's data
function serializeGlobalPowerUp(powerUp) {
  return {
    id: powerUp.id,
    x: powerUp.x,
    y: powerUp.y,
    color: powerUp.color,
    isStar: powerUp.isStar,
    radius: powerUp.radius,
    value: powerUp.value,
    hitFrames: powerUp.hitFrames,
  };
}

// Define a function to compare globalPowerUp objects for equality
function isEqualGlobalPowerUp(powerUp1, powerUp2) {
  const tolerance = 1e-4;
  return (
    Math.abs(powerUp1.x - powerUp2.x) < tolerance &&
    Math.abs(powerUp1.y - powerUp2.y) < tolerance &&
    powerUp1.color === powerUp2.color &&
    powerUp1.isStar === powerUp2.isStar &&
    powerUp1.radius === powerUp2.radius &&
    powerUp1.value === powerUp2.value &&
    powerUp1.hitFrames === powerUp2.hitFrames
  );
}

export function serializeEffects(effects, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed globalPowerUps
    let changedEffectsData = effects
      .map((currentEffect) => {
        const lastSentEffectData = lastSentEffects.find((lastPowerUpData) => lastPowerUpData.id === currentEffect.id);
        const serializedEffect = serializeEffect(currentEffect);

        // Compare the serialized data of the current globalPowerUp with the last sent data
        if (!lastSentEffectData || !isEqualEffect(serializedEffect, lastSentEffectData)) {
          // Update lastSentEffects with the new serialized data if changed
          lastSentEffects = lastSentEffects.map((effect) => (effect.id === currentEffect.id ? serializedEffect : effect));
          return serializedEffect;
        }

        // Return null for effects that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);
    return changedEffectsData;
  } else {
    // If onlyChangedData is false, update lastSentEffects with the current serialized data
    lastSentEffects = effects.map(serializeEffect);

    // Serialize and return all effects
    return lastSentEffects;
  }
}

// Define a function to serialize a globalPowerUp's data
function serializeEffect(effect) {
  return {
    id: effect.id,
    x: effect.x,
    y: effect.y,
    color: effect.color,
    duration: effect.isStar,
    radius: effect.radius,
    type: effect.type,
  };
}

// Define a function to compare globalPowerUp objects for equality
function isEqualEffect(effect1, effect2) {
  const tolerance = 1e-4;
  return (
    Math.abs(effect1.x - effect2.x) < tolerance &&
    Math.abs(effect1.y - effect2.y) < tolerance &&
    effect1.color === effect2.color &&
    effect1.duration === effect2.duration &&
    effect1.type === effect2.type &&
    effect1.radius === effect2.radius
  );
}
