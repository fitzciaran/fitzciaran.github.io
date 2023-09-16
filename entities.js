// import { globalPowerUps } from "./astroids.js";
import { Player } from "./player.js";

export let forces = [];

export function setForces(newForces) {
  forces = newForces;
}
let lastSentMasterMineData = [];

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
      forces = forces.filter(function (element) {
        return element !== this;
      }, this);
    }
  }
}

export class Enemy extends Entity {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red") {
    super(id, x, y);
  }
}

export class Mine extends Enemy {
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red", force = 0) {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.hitFrames = 0;
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
  constructor(id = null, x = null, y = null, color = null, isStar = false, radius = 5, value = 1) {
    super(id, x, y);
    this.color = color;
    this.isStar = isStar;
    this.radius = radius;
    this.value = value;
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

export function serializeForces(forces) {
  return forces.map((force) => ({
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
  }));
}


export function serializeMines(mines, onlyChangedData = false) {
  if (onlyChangedData) {
    // Calculate the differences between the current mines and lastSentMasterMineData
    const changedMines = mines.filter((currentMine) => {
      const lastSentMine = lastSentMasterMineData.find((lastMine) => lastMine.id === currentMine.id);
      return !lastSentMine || !isEqualMine(currentMine, lastSentMine);
    });

    // Update lastSentMasterMineData with the new data
    lastSentMasterMineData = mines.slice();

    // Serialize and return the changed mines
    return changedMines.map((mine) => ({
      id: mine.id,
      x: mine.x,
      y: mine.y,
      force: mine.force,
      duration: mine.duration,
      radius: mine.radius,
      hitFrames: mine.hitFrames,
      color: mine.color,
    }));
  } else {
    // If onlyChangedData is false, update lastSentMasterMineData with the current mines
    lastSentMasterMineData = mines.slice();

    // Serialize and return all mines
    return mines.map((mine) => ({
      id: mine.id,
      x: mine.x,
      y: mine.y,
      force: mine.force,
      duration: mine.duration,
      radius: mine.radius,
      hitFrames: mine.hitFrames,
      color: mine.color,
    }));
  }
}

// Define a function to compare mine objects for equality
function isEqualMine(mine1, mine2) {
  // Implement your logic for comparing mine objects here
  // For example, you can compare relevant properties to check if they are equal
  return (
    mine1.x === mine2.x &&
    mine1.y === mine2.y &&
    mine1.force === mine2.force &&
    mine1.duration === mine2.duration &&
    mine1.radius === mine2.radius &&
    mine1.hitFrames === mine2.hitFrames &&
    mine1.color === mine2.color
  );
}

export function serializeGlobalPowerUps(globalPowerUps) {
  return globalPowerUps.map((globalPowerUp) => ({
    id: globalPowerUp.id,
    x: globalPowerUp.x,
    y: globalPowerUp.y,
    color: globalPowerUp.color,
    isStar: globalPowerUp.isStar,
    radius: globalPowerUp.radius,
    value: globalPowerUp.value,
  }));
}
