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

export const EffectType = {
  EXPLOSION: "explosion",
};

export const MineType = {
  REGULAR: "regular",
  TRAIL: "trail",
  FREE_MINE: "freemine",
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
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.REGULAR,
    hitFrame = -105,
    playerId = ""
  ) {
    super(id, x, y, duration, radius, color);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
    this.hitFrames = hitFrame;
    this.force = force;
    if (force != 0) {
      this.createForce();
    }
    this.mineType = mineType;
    this.playerId = playerId;
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

export class Trail extends Mine {
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.TRAIL,
    hitFrame = -105,
    playerId = "",
    angle,
    length,
    width
  ) {
    super(id, x, y, duration, radius, color, force, mineType, hitFrame, playerId);
    this.angle = angle;
    this.length = length;
    this.width = width;
  }
  createForce() {
    super.createForce();
  }
}

export class FreeMine extends Mine {
  constructor(
    id = null,
    x = null,
    y = null,
    duration = -1,
    radius = 20,
    color = "red",
    force = 0,
    mineType = MineType.FREE_MINE,
    hitFrame = -105,
    playerId = "",
    angle,
    points
  ) {
    super(id, x, y, duration, radius, color, force, mineType, hitFrame, playerId);
    this.angle = angle;
    this.points = points;
  }
  createForce() {
    super.createForce();
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
      //may need to update other properties in future behaviour changes
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
  let mine = new Mine(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color, obj.force, obj.mineType, obj.hitFrame, obj.playerId);
  return mine;
}
export function createTrailFromObject(obj) {
  let trail = new Trail(
    obj.id,
    obj.x,
    obj.y,
    obj.duration,
    obj.radius,
    obj.color,
    obj.force,
    obj.mineType,
    obj.hitFrame,
    obj.playerId,
    obj.angle,
    obj.length,
    obj.width
  );
  return trail;
}
export function createFreeMineFromObject(obj) {
  let freeMine = new FreeMine(
    obj.id,
    obj.x,
    obj.y,
    obj.duration,
    obj.radius,
    obj.color,
    obj.force,
    obj.mineType,
    obj.hitFrame,
    obj.playerId,
    obj.points,
    obj.angle
  );
  return freeMine;
}
export function createPowerUpFromObject(obj) {
  let powerUp = new PowerUp(obj.id, obj.x, obj.y, obj.color, obj.isStar, obj.radius, obj.value);
  return powerUp;
}
export function createEffectFromObject(obj) {
  let effect = new Effect(obj.id, obj.x, obj.y, obj.duration, obj.radius, obj.color, obj.type);
  return effect;
}

export function setEffects(newEffects) {
  if (newEffects !== effects) {
    //update original array while keeping the reference
    effects.length = 0;
    effects.push(...newEffects);
  }
}
