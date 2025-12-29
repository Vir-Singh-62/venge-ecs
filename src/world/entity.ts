import { World } from '.';
import { Entity } from '../entity';

export function createEntity(this: World) {
  const eid = this.entityId.getNew();
  const e = new Entity(this, eid);
  this.entities.set(eid, e);
  return e;
}

export function getEntity(this: World, eid: number) {
  return this.entities.get(eid);
}

export function removeEntity(this: World, eid: number) {
  const e = this.entities.get(eid);
  if (!e) return;
  e.destroy();
}

export function hasEntity(this: World, eid: number) {
  return this.entities.has(eid);
}
