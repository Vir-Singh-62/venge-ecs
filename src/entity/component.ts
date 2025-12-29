import { Entity } from '.';
import { clone } from '../utils/clone';

export function addComponent(this: Entity, identifier: string | number) {
  const component = this.world.definedComponents.get(identifier);

  if (!component) {
    console.error(`Component ${identifier} not registered`);
    return;
  }

  this.components.set(identifier, clone(component));
  this.world.add.entityToComponentIndex(this.id, identifier);

  return this.components.get(identifier);
}

export function removeComponent(this: Entity, identifier: string | number) {
  this.components.delete(identifier);
  this.world.remove.entityFromComponentIndex(this.id, identifier);
}

export function removeAllComponents(this: Entity) {
  const components = this.components.keys();
  for (const c of components) {
    this.world.remove.entityFromComponentIndex(this.id, c);
  }

  this.components.clear();
}

export function hasComponent(this: Entity, identifier: string | number) {
  return this.components.has(identifier);
}

export function getComponent(this: Entity, identifier: string | number) {
  return this.components.get(identifier);
}

export function getAllComponents(this: Entity) {
  return Array.from(this.components.keys());
}
