import { Entity } from '../entity';
import { System } from '../types/system';
import { IDManager } from '../utils/id';
import {
  getComponent,
  hasComponent,
  removeComponent,
  addComponent,
  removeEntityFromComponentIndex,
  addEntityToComponentIndex,
  removeAllComponents,
} from './component';
import { createEntity, getEntity, hasEntity, removeEntity } from './entity';
import { query } from './query';
import {
  getSystem,
  hasSystem,
  destroySystem,
  destroyAllSystems,
  getSystemQueue,
} from './system';
import {
  addEntityToTagIndex,
  addTag,
  getTags,
  hasTag,
  removeAllTags,
  removeEntityFromTagIndex,
  removeTag,
} from './tag';

export class World {
  protected entityId = new IDManager();
  private tick = 0;

  protected systems = new Map<string | number, System<unknown>>();
  protected systemQueue = new Map<string | number, unknown[]>();

  definedComponents = new Map<string | number, unknown>();

  protected entities = new Map<number, Entity>();

  protected index = {
    components: new Map<string | number, Set<number>>(),
    tags: new Map<string | number, Set<number>>(),
  };

  registerSystem<Input>(system: System<Input>) {
    this.systems.set(system.identifier, system as System<unknown>);
  }

  defineComponent<T>(identifier: string | number, component: T) {
    this.definedComponents.set(identifier, component);
    this.index.components.set(identifier, new Set());
  }

  createEntity() {
    return createEntity.call(this);
  }

  get = {
    entity: (eid: number) => getEntity.call(this, eid),

    component: (eid: number, identifier: string | number) =>
      getComponent.call(this, eid, identifier),

    tags: (eid: number) => getTags.call(this, eid),

    system: (identifier: string | number) => getSystem.call(this, identifier),

    systemQueue: (identifier: string | number) =>
      getSystemQueue.call(this, identifier),
  };

  add = {
    component: (eid: number, identifier: string | number) =>
      addComponent.call(this, eid, identifier),

    tag: (eid: number, identifier: string | number) =>
      addTag.call(this, eid, identifier),

    entityToComponentIndex: (eid: number, identifier: string | number) =>
      addEntityToComponentIndex.call(this, eid, identifier),

    entityToTagIndex: (eid: number, identifier: string | number) =>
      addEntityToTagIndex.call(this, eid, identifier),
  };

  remove = {
    entity: (eid: number) => removeEntity.call(this, eid),

    component: (eid: number, identifier: string | number) =>
      removeComponent.call(this, eid, identifier),

    allComponents: (eid: number) => removeAllComponents.call(this, eid),

    entityFromComponentIndex: (eid: number, identifier: string | number) =>
      removeEntityFromComponentIndex.call(this, eid, identifier),

    tag: (eid: number, identifier: string | number) =>
      removeTag.call(this, eid, identifier),

    allTags: (eid: number) => removeAllTags.call(this, eid),

    entityFromTagIndex: (eid: number, identifier: string | number) =>
      removeEntityFromTagIndex.call(this, eid, identifier),
  };

  destroy = {
    system: (identifier: string | number) =>
      destroySystem.call(this, identifier),

    allSystems: () => destroyAllSystems.call(this),

    component: (identifier: string | number) => {
      this.definedComponents.delete(identifier);
      this.index.components.delete(identifier);
    },

    allComponents: () => {
      this.definedComponents.clear();
      this.index.components.clear();
    },
  };

  has = {
    component: (eid: number, identifier: string | number) =>
      hasComponent.call(this, eid, identifier),

    tag: (eid: number, identifier: string | number) =>
      hasTag.call(this, eid, identifier),

    system: (identifier: string | number) => hasSystem.call(this, identifier),

    entity: (eid: number) => hasEntity.call(this, eid),
  };

  query = (params: {
    all: { components: unknown[]; tags: unknown[] };
    any: { components: unknown[]; tags: unknown[] };
    none: { components: unknown[]; tags: unknown[] };
  }) => query.call(this, params);

  update() {
    this.tick++;
    this.systems.forEach((system) => {
      system.run(this, this.get.systemQueue(system.identifier) as unknown[]);
    });
  }
}

const world = new World();

const e = world.createEntity();
world.defineComponent<{ a?: string }>(1, {});
e.add.component(1);
const c = e.get.component(1);
