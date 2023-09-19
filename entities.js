import { Player } from "./player.js";
import { player } from "./main.js";
import { isPlayerMasterPeer } from "./connectionHandlers.js";
import { sendRemoveEntityUpdate } from "./sendData.js";

export let forces = [];
export let effects = [];

export function setForces(newForces) {
  if (newForces !== forces) {
    //update original array
    forces.length = 0;
    forces.push(...newForces);
  }
}

let lastSentMasterMineData = [];
let lastSentGlobalPowerUps = [];
let lastSentForces = [];
let lastSentEffects = [];

export const EffectType = {
  EXPLOSION: "explosion",
};

export class Entity {
  constructor(id = null, x = null, y = null) {
    this.id = id;
    if (this.id == null) {
      this.id = Math.floor(Math.random() * 10000);
    }
    this.x = x;
    this.y = y;
  }
}

export const ForceType = {
  POINT: "point",
  DIRECTIONAL: "directional",
};

export class ForceArea extends Entity {
  constructor(
    id = null,
    x = null,
    y = null,
    force = 1,
    duration = 200,
    radius = 100,
    isAttractive,
    color = "red",
    tracks,
    coneAngle = Math.PI * 2,
    direction = 0,
    type = ForceType.POINT,
    width = 100,
    length = 100,
    effect = false
  ) {
    super(id, x, y);
    this.force = force;
    this.duration = duration;
    this.radius = radius;
    this.isAttractive = isAttractive;
    this.color = color;
    this.tracks = tracks;
    this.coneAngle = coneAngle;
    this.direction = direction;
    this.type = type;
    this.width = width;
    this.length = length;
    this.effect = effect;
  }
  setDuration(newDuration) {
    this.duration = newDuration;
    if (this.duration < 1) {
      // forces = forces.filter(function (element) {
      setForces(
        forces.filter(function (element) {
          return element !== this;
        }, this)
      );
      if (isPlayerMasterPeer(player)) {
        sendRemoveEntityUpdate("removeForces", [this]);
      }
    }
  }
}

export class Enemy extends Entity {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red") {
    super(id, x, y);
  }
}

export class Effect extends Enemy {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red", type = "") {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.type = type;
  }
}

export class Mine extends Enemy {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red", force = 0) {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.hitFrames = -105;
    this.force = force;
    if (force != 0) {
      this.createForce();
    }
  }
  createForce() {
    // Check if there is already a force with the same id
    const existingForce = forces.find((force) => force.id === "mine-" + this.id);

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      if (this.force !== 0) {
        let minesForce = new ForceArea("mine-" + this.id, this.x, this.y, 0.3, 10, 200, this.force == 1, "pink", this);
        //currently mine doesn't keep a reference to it's force, is that fine?
        forces.push(minesForce);
      }
    } else {
      existingForce.duration = 10;
      existingForce.x = this.x;
      existingForce.y = this.y;
      //may need to update other properties in future if mine/ mine force behaviour change
    }
  }
}

export class PowerUp extends Entity {
  constructor(id = null, x = null, y = null, color = null, isStar = false, radius = 5, value = 1, force = 0) {
    super(id, x, y);
    this.color = color;
    this.isStar = isStar;
    this.radius = radius;
    this.value = value;
    this.hitFrames = -56;
    this.force = force;
    if (force != 0) {
      this.createForce();
    }
  }

  createForce() {
    // Check if there is already a force with the same id
    const existingForce = forces.find((force) => force.id === "powerUp-" + this.id);

    if (!existingForce) {
      // If no force with the same id exists, create a new one
      if (this.force !== 0) {
        let powerUpForce = new ForceArea("powerUp-" + this.id, this.x, this.y, 0.3, 10, 200, this.force == 1, "yellow", this);
        forces.push(powerUpForce);
      }
    } else {
      existingForce.duration = 10;
      existingForce.x = this.x;
      existingForce.y = this.y;
      //may need to update other properties in future if mine/ mine force behaviour change
    }
  }
}

export function createForceFromObject(obj) {
  //why is tracks a new player not a found one?
  let tracks = null;
  if (obj.tracks != null) {
    tracks = new Player(
      obj.tracks.id,
      obj.tracks.x,
      obj.tracks.y,
      obj.tracks.powerUps,
      obj.tracks.color,
      obj.tracks.angle,
      obj.tracks.pilot,
      obj.tracks.name,
      obj.tracks.isPlaying,
      obj.tracks.isUserControlledCharacter
    );
  }
  let force = new ForceArea(
    obj.id,
    obj.x,
    obj.y,
    obj.force,
    obj.duration,
    obj.radius,
    obj.isAttractive,
    obj.color,
    tracks,
    obj.coneAngle,
    obj.direction,
    obj.type,
    obj.width,
    obj.length
  );
  force.numberArrowsEachSide = obj.numberArrowsEachSide;
  force.numberArrowsDeep = obj.numberArrowsDeep;
  return force;
}
export function createMineFromObject(obj) {
  let mine = new Mine(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color);
  return mine;
}
export function createPowerUpFromObject(obj) {
  let powerUp = new PowerUp(obj.id, obj.x, obj.y, obj.color, obj.isStar, obj.radius, obj.value);
  return powerUp;
}
export function createEffectFromObject(obj) {
  let effect = new Effect(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color, obj.type);
  return effect;
}

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

export function serializeMines(mines, onlyChangedData = false) {
  if (onlyChangedData) {
    // Serialize and return only the changed mines
    const changedMineData = mines
      .map((currentMine) => {
        const lastSentMineData = lastSentMasterMineData.find((lastMineData) => lastMineData.id === currentMine.id);
        const serializedMine = serializeMine(currentMine);

        // Compare the serialized data of the current mine with the last sent data
        if (!lastSentMineData || !isEqualMine(serializedMine, lastSentMineData)) {
          // Update lastSentMasterMineData with the new serialized data if changed
          lastSentMasterMineData = lastSentMasterMineData.map((mine) => (mine.id === currentMine.id ? serializedMine : mine));
          return serializedMine;
        }

        // Return null for mines that haven't changed
        return null;
      })
      .filter((changedData) => changedData !== null);

    return changedMineData;
  } else {
    // If onlyChangedData is false, update lastSentMasterMineData with the current serialized data
    lastSentMasterMineData = mines.map(serializeMine);

    // Serialize and return all mines
    return lastSentMasterMineData;
  }
}

// Define a function to serialize a mine's data
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
    mine1.color === mine2.color
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

export function setEffects(newEffects) {
  if (newEffects !== effects) {
    //update original array while keeping the reference
    effects.length = 0;
    effects.push(...newEffects);
  }
}
