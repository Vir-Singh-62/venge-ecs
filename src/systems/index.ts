import { World } from '../world';

export interface System<Input> {
  name: Systems;
  startAt?: number;
  every?: number;
  priority?: number;
  enabled?: boolean;

  run: (world: World, queue: Input[]) => void;
}

export enum Systems {
  Example,
}
