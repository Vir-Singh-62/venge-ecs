import { World } from '../world';
import {
  addComponent,
  removeComponent,
  removeAllComponents,
  hasComponent,
  getComponent,
  getAllComponents,
} from './component';
import { addTag, removeTag, removeAllTags, hasTag, getAllTags } from './tag';

export class Entity {
  id: number;
  protected components = new Map<string | number, unknown>();
  protected tags = new Set<string | number>();

  protected world: World;

  constructor(world: World, eid: number) {
    this.id = eid;
    this.world = world;
  }

  has = {
    component: (identifier: string | number) =>
      hasComponent.call(this, identifier),

    tag: (identifier: string | number) => hasTag.call(this, identifier),
  };

  get = {
    component: (identifier: string | number) =>
      getComponent.call(this, identifier),

    allComponents: () => getAllComponents.call(this),

    allTags: () => getAllTags.call(this),
  };

  add = {
    component: (identifier: string | number) =>
      addComponent.call(this, identifier),

    tag: (identifier: string | number) => addTag.call(this, identifier),
  };

  remove = {
    component: (identifier: string | number) =>
      removeComponent.call(this, identifier),

    allComponents: () => removeAllComponents.call(this),

    tag: (identifier: string | number) => removeTag.call(this, identifier),

    allTags: () => removeAllTags.call(this),
  };

  destroy() {
    this.remove.allComponents();
    this.remove.allTags();
    this.world.remove.entity(this.id);
  }
}
