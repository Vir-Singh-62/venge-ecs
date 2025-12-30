import { System, Systems } from '..';

export interface ExampleInput {}

export const ExampleSystem: System<ExampleInput> = {
  name: Systems.Example,

  run(_world, _queue) {},
};
