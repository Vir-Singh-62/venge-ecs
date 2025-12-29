import { World } from '../world';

export interface System<I> {
  identifier: string | number;
  startAt?: number;
  runTimes?: number;
  every?: number;
  enabled?: boolean;

  run: (world: World, input: I[]) => {};
}
