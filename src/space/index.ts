export interface Position {
  x: number;
  y: number;
  z: number;
  zone: Zone;
  layer: Layer;
}

export enum Zone {}
export enum Layer {}

export { SpatialStore } from './space';
