import { Entity } from '.';

export function addTag(this: Entity, identifier: string | number) {
  this.tags.add(identifier);
  this.world.add.entityToTagIndex(this.id, identifier);
}

export function removeTag(this: Entity, identifier: string | number) {
  this.tags.delete(identifier);
  this.world.remove.entityFromTagIndex(this.id, identifier);
}

export function removeAllTags(this: Entity) {
  const tags = Array.from(this.tags.values());
  for (const tag of tags) {
    this.world.remove.entityFromTagIndex(this.id, tag);
  }
  this.tags.clear();
}

export function hasTag(this: Entity, identifier: string | number) {
  return this.tags.has(identifier);
}

export function getAllTags(this: Entity) {
  return Array.from(this.tags);
}
