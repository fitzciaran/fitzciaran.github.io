import { Player } from "./player.js";

export let forces = [];

export function setForces(newForces) {
  forces = newForces;
}

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
    length = 100
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
        //todo put the above line back this is just testing the directional force
        // let minesForce = new ForceArea(
        //   "mine-" + this.id,
        //   this.x,
        //   this.y,
        //   0.7,
        //   10,
        //   200,
        //   this.force == 1,
        //   "pink",
        //   this,
        //   0,
        //   Math.random() * 2 * Math.PI,
        //   ForceType.DIRECTIONAL,
        //   120,
        //   300
        // );
        //currently mine doesn't keep a reference to it's force, is that fine?
        forces.push(minesForce);
      }
    } else {
      existingForce.duration = 10;
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
  let tracks = new Player(
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
