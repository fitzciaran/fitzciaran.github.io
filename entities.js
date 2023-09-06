import { Player } from "./player.js";

export let forces = [];

export function setForces(newForces){
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

export class ForceArea extends Entity {
  constructor(id = null, x = null, y = null, force = 1, duration = 200, radius = 100, isAttractive, color = "red", tracks) {
    super(id, x, y);
    this.force = force;
    this.duration = duration;
    this.radius = radius;
    this.isAttractive = isAttractive;
    this.color = color;
    this.tracks = tracks;
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
  constructor(id = null, x = null, y = null, duration = -1, radius = 20, color = "red") {
    super(id, x, y);
    this.duration = duration;
    this.radius = radius;
    this.color = color;
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
    let tracks = new Player(obj.tracks.id,obj.tracks.x,obj.tracks.y, obj.tracks.powerUps,obj.tracks.color,obj.tracks.angle,obj.tracks.pilot,obj.tracks.name,obj.tracks.isPlaying,obj.tracks.isUserControlledCharacter );
    let force = new ForceArea(obj.id,obj.x,obj.y, obj.force,obj.duration,obj.radius,obj.isAttractive,obj.color,tracks );
    return force;
  }
  export function createMineFromObject(obj) {
    let mine = new Mine(obj.id,obj.x,obj.y, obj.duration,obj.radius,obj.color )
    return mine;
  }
  export function createPowerUpFromObject(obj) {
    let powerUp = new PowerUp(obj.id,obj.x,obj.y,obj.color,obj.isStar,obj.radius,obj.value )
    return powerUp;
  }
      