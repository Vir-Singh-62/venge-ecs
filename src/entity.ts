import { Tags } from './tags';
import { ComponentMap, Components } from './components';
import { World } from './world';
import { Position, SpatialStore } from './space';

export class Entity {
  private world: World;
  private space: SpatialStore;
  id: number;
  private components = new Map<Components, unknown>();
  private tags = new Set<Tags>();

  constructor(params: { eid: number; world: World; space: SpatialStore }) {
    this.id = params.eid;
    this.world = params.world;
    this.space = params.space;
  }

  add = {
    component: <C extends keyof ComponentMap>(
      component: C,
      data: ComponentMap[C]
    ) => {
      this.components.set(component, data);

      this.world.index.component.get(component)!.add(this.id);
    },

    tag: (tag: Tags) => {
      this.tags.add(tag);

      this.world.index.tag.get(tag)!.add(this.id);
    },
  };

  get = {
    component: <C extends keyof ComponentMap>(
      component: C
    ): ComponentMap[C] | undefined => {
      return this.components.get(component) as ComponentMap[C] | undefined;
    },

    components: (): Components[] => {
      return Array.from(this.components.keys());
    },

    tags: (): Tags[] => {
      return Array.from(this.tags);
    },

    position: () => {
      return this.space.get(this.id);
    },
  };

  has = {
    component: (component: Components) => {
      return this.components.has(component);
    },

    tag: (tag: Tags) => {
      return this.tags.has(tag);
    },

    position: () => {
      return this.space.get(this.id) !== undefined;
    },
  };

  remove = {
    component: (component: Components) => {
      this.components.delete(component);

      this.world.index.component.get(component)!.delete(this.id);
    },

    tag: (tag: Tags) => {
      this.tags.delete(tag);

      this.world.index.tag.get(tag)!.delete(this.id);
    },

    position: () => {
      this.space.remove(this.id);
    },
  };

  updatePosition(newPos: Position) {
    this.space.update(this.id, newPos);
  }
}
