import { Layer, Position, Zone } from '.';

export class SpatialStore {
  private readonly positions = new Map<EntityId, Position>();
  private readonly grids = new Map<string, PointGrid>();

  /* ---------- internal ---------- */

  private gridKey(zone: Zone, layer: Layer): string {
    return `${zone}:${layer}`;
  }

  private grid(zone: Zone, layer: Layer): PointGrid {
    const key = this.gridKey(zone, layer);
    let grid = this.grids.get(key);
    if (!grid) {
      grid = new PointGrid();
      this.grids.set(key, grid);
    }
    return grid;
  }
  /* ---------- lifecycle ---------- */

  create(eid: EntityId, pos: Position) {
    if (this.positions.has(eid)) {
      throw new Error(`Entity ${eid} already exists`);
    }

    this.positions.set(eid, pos);
    this.grid(pos.zone, pos.layer).insert(eid, pos.x, pos.y);
  }

  update(eid: EntityId, newPos: Position) {
    const old = this.positions.get(eid);
    if (!old) {
      this.create(eid, newPos);
      return;
    }

    // zone or layer changed → move grids
    if (old.zone !== newPos.zone || old.layer !== newPos.layer) {
      this.grid(old.zone, old.layer).remove(eid);
      this.grid(newPos.zone, newPos.layer).insert(eid, newPos.x, newPos.y);
    } else {
      this.grid(old.zone, old.layer).update(eid, newPos.x, newPos.y);
    }

    this.positions.set(eid, newPos);
  }

  remove(eid: EntityId) {
    const pos = this.positions.get(eid);
    if (!pos) return;

    this.grid(pos.zone, pos.layer).remove(eid);
    this.positions.delete(eid);
  }

  get(eid: EntityId): Position | undefined {
    return this.positions.get(eid);
  }

  /* ---------- queries ---------- */

  entitiesInBox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    zones: Zone[],
    layers: Layer[]
  ): EntityId[] {
    const result: EntityId[] = [];

    // Process zones first, then layers within each zone
    for (const zone of zones) {
      const zoneResults: EntityId[] = [];

      for (const layer of layers) {
        const grid = this.grids.get(this.gridKey(zone, layer));
        if (!grid) continue;

        for (const id of grid.queryBox(minX, minY, maxX, maxY)) {
          const p = this.positions.get(id)!;
          if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
            zoneResults.push(id);
          }
        }
      }

      // Sort layer results by z-value in descending order
      zoneResults.sort((a, b) => {
        const posA = this.positions.get(a)!;
        const posB = this.positions.get(b)!;
        return posB.z - posA.z; // Descending order
      });

      // Add sorted results to final result array
      result.push(...zoneResults);
    }

    return result;
  }

  entitiesInCircle(
    cx: number,
    cy: number,
    r: number,
    zones: Zone[],
    layers: Layer[]
  ): EntityId[] {
    const r2 = r * r;
    const result: EntityId[] = [];

    const minX = cx - r;
    const minY = cy - r;
    const maxX = cx + r;
    const maxY = cy + r;

    for (const zone of zones) {
      const zoneResults: EntityId[] = [];

      for (const layer of layers) {
        const grid = this.grids.get(this.gridKey(zone, layer));
        if (!grid) continue;

        for (const id of grid.queryBox(minX, minY, maxX, maxY)) {
          const p = this.positions.get(id)!;
          const dx = p.x - cx;
          const dy = p.y - cy;
          if (dx * dx + dy * dy <= r2) {
            zoneResults.push(id);
          }
        }
      }

      // Sort layer results by z-value in descending order
      zoneResults.sort((a, b) => {
        const posA = this.positions.get(a)!;
        const posB = this.positions.get(b)!;
        return posB.z - posA.z; // Descending order
      });

      // Add sorted results to final result array
      result.push(...zoneResults);
    }

    return result;
  }

  entitiesAtPoint(
    x: number,
    y: number,
    zones: Zone[],
    layers: Layer[]
  ): EntityId[] {
    return this.entitiesInBox(x, y, x, y, zones, layers);
  }
}

class PointGrid {
  private cells = new Map<string, Set<EntityId>>();
  private entityCell = new Map<EntityId, string>();

  insert(id: EntityId, x: number, y: number) {
    const cx = toCell(x);
    const cy = toCell(y);
    const key = cellKey(cx, cy);

    let set = this.cells.get(key);
    if (!set) {
      set = new Set();
      this.cells.set(key, set);
    }

    set.add(id);
    this.entityCell.set(id, key);
  }

  update(id: EntityId, x: number, y: number) {
    const oldKey = this.entityCell.get(id);
    const cx = toCell(x);
    const cy = toCell(y);
    const newKey = cellKey(cx, cy);

    if (oldKey === newKey) return;

    if (oldKey) {
      const oldSet = this.cells.get(oldKey);
      oldSet?.delete(id);
      if (oldSet && oldSet.size === 0) {
        this.cells.delete(oldKey);
      }
    }

    let newSet = this.cells.get(newKey);
    if (!newSet) {
      newSet = new Set();
      this.cells.set(newKey, newSet);
    }

    newSet.add(id);
    this.entityCell.set(id, newKey);
  }

  remove(id: EntityId) {
    const key = this.entityCell.get(id);
    if (!key) return;

    const set = this.cells.get(key);
    set?.delete(id);
    if (set && set.size === 0) this.cells.delete(key);

    this.entityCell.delete(id);
  }

  queryBox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): Set<EntityId> {
    const minCX = toCell(minX);
    const minCY = toCell(minY);
    const maxCX = toCell(maxX);
    const maxCY = toCell(maxY);

    const result = new Set<EntityId>();

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const set = this.cells.get(cellKey(cx, cy));
        if (!set) continue;
        for (const id of set) result.add(id);
      }
    }

    return result;
  }
}
// ----------- Helpers ------------

type EntityId = number;

function toCell(v: number): number {
  return Math.floor(v);
}

function cellKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}
