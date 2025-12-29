import { World } from '.';
import { System } from '../types/system';

export function getSystem(this: World, identifier: string | number) {
  return this.systems.get(identifier);
}

export function getSystemQueue(this: World, identifier: string | number) {
  return this.systemQueue.get(identifier);
}

export function runSystem<I>(this: World, identifier: string | number) {
  const system = this.systems.get(identifier) as System<I> | undefined;
  if (!system) return;
  system?.run(this, this.get.systemQueue(identifier) as I[]);
}

export function hasSystem(this: World, identifier: string | number) {
  return this.systems.has(identifier);
}

export function destroySystem(this: World, identifier: string | number) {
  this.systems.delete(identifier);
  this.systemQueue.delete(identifier);
}
export function destroyAllSystems(this: World) {
  this.systems.clear();
  this.systemQueue.clear();
}
