import { World } from '.';

export function addTag(this: World, eid: number, identifier: string | number) {
  this.get.entity(eid)?.add.tag(identifier);
}
export function getTags(this: World, eid: number) {
  return this.get.entity(eid)?.get.allTags();
}

export function removeTag(
  this: World,
  eid: number,
  identifier: string | number
) {}

export function removeAllTags(this: World, eid: number) {
  this.get.entity(eid)?.remove.allTags();
}
export function hasTag(this: World, eid: number, identifier: string | number) {
  return this.get.entity(eid)?.has.tag(identifier);
}

export function destroyTag(this: World, identifier: string | number) {
  this.index.tags.delete(identifier);
}

export function destroyAllTags(this: World) {
  this.index.tags.clear();
}

export function addEntityToTagIndex(
  this: World,
  eid: number,
  identifier: string | number
) {
  if (!this.index.tags.get(identifier))
    this.index.tags.set(identifier, new Set());
  this.index.tags.get(identifier)!.add(eid);
}

export function removeEntityFromTagIndex(
  this: World,
  eid: number,
  identifier: string | number
) {
  const index = this.index.tags.get(identifier);
  index?.delete(eid);
  if (index && index.size === 0) this.index.tags.delete(identifier);
}
