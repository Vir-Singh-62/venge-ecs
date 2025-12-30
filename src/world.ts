import { getEnumStrings } from './helpers/enum';
import { Tags } from './tags';
import { Components } from './components';
import { Entity } from './entity';
import { System, Systems } from './systems';
import { Layer, SpatialStore, Zone } from './space';

export class World {
  private entities = new Map<number, Entity>();
  private systems: System<unknown>[] = [];
  private queues = new Map<Systems, unknown[]>();
  private tick = 0;
  private space = new SpatialStore();

  index = {
    tag: new Map<Tags, Set<number>>(),
    component: new Map<Components, Set<number>>(),
  };

  constructor() {
    for (const c of getEnumStrings<Components>(Components)) {
      this.index.component.set(c, new Set<number>());
    }

    for (const t of getEnumStrings<Tags>(Tags)) {
      this.index.tag.set(t, new Set<number>());
    }
  }

  update() {
    this.tick++;
    for (const s of this.systems) {
      if (s.enabled && this.tick >= s.startAt! && this.tick % s.every! === 0) {
        s.run(this, this.queues.get(s.name) as unknown[]);
      }
    }
  }

  add = {
    system: <I>(s: System<I>) => {
      if (!s.enabled) s.enabled = true;
      if (!s.priority) s.priority = 0;
      if (!s.startAt) s.startAt = 0;
      if (!s.every) s.every = 1;

      if (this.queues.has(s.name)) {
        console.error(`System with name ${s.name} already exists`);
        return;
      }

      this.systems.push(s as System<unknown>);
      this.queues.set(s.name, []);
      this.systems.sort((a, b) => a.priority! - b.priority!);
    },

    entity: () => {
      const eid = this.private.getNewEntityeid();
      const entity = new Entity({ eid, world: this, space: this.space });
      this.entities.set(eid, entity);
      return entity;
    },
  };

  system = {
    input: {
      enqueue: <I>(s: System<I>, input: I) => {
        const queue = this.queues.get(s.name) as I[];
        queue.push(input);
      },
    },

    enable: (s: System<unknown>) => {
      s.enabled = true;
    },

    disable: (s: System<unknown>) => {
      s.enabled = false;
    },
  };

  remove = {
    entity: (eid: number) => {
      const entity = this.entities.get(eid);
      if (!entity) return;

      // Remove all tags from this entity from the index
      for (const tag of entity.get.tags()) {
        this.index.tag.get(tag)!.delete(eid);
      }

      // Remove all components from this entity from the index
      for (const componentType of entity.get.components().keys()) {
        this.index.component.get(componentType)!.delete(eid);
      }

      // Remove the entity itself
      this.entities.delete(eid);

      // Recycle the eid
      this.private.recycledEids.push(eid);
    },

    system: (s: System<unknown>) => {
      this.systems = this.systems.filter((sys) => sys !== s);
    },
  };

  reset() {
    this.entities.clear();
    this.index.tag.clear();
    this.index.component.clear();
    this.private.nextEid = 1;
    this.private.recycledEids = [];
    this.tick = 0;
    this.queues.clear();
    this.systems = [];
    this.space = new SpatialStore();
  }

  getEntity(eid: number) {
    return this.entities.get(eid);
  }

  query({
    allTags = [],
    allComponents = [],
    anyTags = [],
    anyComponents = [],
    noneTags = [],
    noneComponents = [],
  }: {
    allTags?: Tags[];
    allComponents?: Components[];
    anyTags?: Tags[];
    anyComponents?: Components[];
    noneTags?: Tags[];
    noneComponents?: Components[];
  } = {}) {
    let result: Set<number>;

    // Start with entities that have ALL required tags and components
    if (allTags.length > 0 || allComponents.length > 0) {
      result = this.private.intersect([
        ...allTags.map((t) => this.index.tag.get(t) ?? new Set<number>()),
        ...allComponents.map(
          (c) => this.index.component.get(c) ?? new Set<number>()
        ),
      ]);
    } else {
      // If no specific requirements, start with all entities
      result = new Set(this.entities.keys());
    }

    // Filter to include entities that have AT LEAST ONE of the anyTags
    if (anyTags.length > 0) {
      const anyTagEntities = this.private.union([
        ...anyTags.map((t) => this.index.tag.get(t) ?? new Set<number>()),
      ]);
      // Keep only entities that are in both result AND anyTagEntities
      for (const eid of result) {
        if (!anyTagEntities.has(eid)) {
          result.delete(eid);
        }
      }
    }

    // Filter to include entities that have AT LEAST ONE of the anyComponents
    if (anyComponents.length > 0) {
      const anyComponentEntities = this.private.union([
        ...anyComponents.map(
          (c) => this.index.component.get(c) ?? new Set<number>()
        ),
      ]);
      // Keep only entities that are in both result AND anyComponentEntities
      for (const eid of result) {
        if (!anyComponentEntities.has(eid)) {
          result.delete(eid);
        }
      }
    }

    // Remove entities with forbeidden tags
    for (const t of noneTags) {
      this.index.tag.get(t)?.forEach((eid) => result.delete(eid));
    }

    // Remove entities with forbeidden components
    for (const c of noneComponents) {
      this.index.component.get(c)?.forEach((eid) => result.delete(eid));
    }

    return Array.from(result).map((eid) => this.entities.get(eid)!);
  }

  spatialQuery = {
    inBox: (
      minX: number,
      minY: number,
      maxX: number,
      maxY: number,
      zones: Zone[],
      layers: Layer[]
    ) => {
      return this.space.entitiesInBox(minX, minY, maxX, maxY, zones, layers);
    },

    inCircle: (
      cx: number,
      cy: number,
      r: number,
      zones: Zone[],
      layers: Layer[]
    ) => {
      return this.space.entitiesInCircle(cx, cy, r, zones, layers);
    },

    atPoint: (x: number, y: number, zones: Zone[], layers: Layer[]) => {
      return this.space.entitiesAtPoint(x, y, zones, layers);
    },
  };

  private private = {
    intersect: (sets: Set<number>[]): Set<number> => {
      if (sets.length === 0) return new Set();

      // Sort by size to optimize intersection
      sets.sort((a, b) => a.size - b.size);
      const [smallest, ...rest] = sets;

      const result = new Set<number>();
      for (const eid of smallest) {
        if (rest.every((s) => s.has(eid))) {
          result.add(eid);
        }
      }
      return result;
    },

    union: (sets: Set<number>[]): Set<number> => {
      if (sets.length === 0) return new Set();

      const result = new Set<number>();
      for (const set of sets) {
        for (const eid of set) {
          result.add(eid);
        }
      }
      return result;
    },

    getNewEntityeid: (): number => {
      if (this.private.recycledEids.length > 0) {
        return this.private.recycledEids.shift()!;
      } else {
        // Return the next sequential eid
        return this.private.nextEid++;
      }
    },
    nextEid: 2,
    recycledEids: [1],
  };
}
