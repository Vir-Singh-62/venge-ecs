import { World } from '.';

export function addComponent(
  this: World,
  eid: number,
  identifier: string | number
) {
  this.get.entity(eid)?.add.component(identifier);
}

export function removeAllComponents(this: World, eid: number) {
  this.get.entity(eid)?.remove.allComponents();
}

export function getComponent(
  this: World,
  eid: number,
  identifier: string | number
) {
  return this.entities.get(eid)?.get.component(identifier);
}

export function removeComponent(
  this: World,
  eid: number,
  identifier: string | number
) {
  this.get.entity(eid)?.remove.component(identifier);
}

export function hasComponent(
  this: World,
  eid: number,
  identifier: string | number
) {
  return this.get.entity(eid)?.has.component(identifier);
}

export function addEntityToComponentIndex(
  this: World,
  eid: number,
  identifier: string | number
) {
  this.index.components.get(identifier)?.add(eid);
}

export function removeEntityFromComponentIndex(
  this: World,
  eid: number,
  identifier: string | number
) {
  this.index.components.get(identifier)?.delete(eid);
}
