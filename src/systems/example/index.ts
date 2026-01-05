import { System, Systems } from '..';

export interface ExampleInput {}

export const ExampleSystem: System<ExampleInput> = {
  name: Systems.Example,

  run(_world, rawQueue) {
    const queue = Array.from(rawQueue);
    rawQueue = [];

    for (const _q of queue) {
    }
  },
};
