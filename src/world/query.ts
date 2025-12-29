import { World } from '.';

export function query(
  this: World,
  params: {
    all: { components: unknown[]; tags: unknown[] };
    any: { components: unknown[]; tags: unknown[] };
    none: { components: unknown[]; tags: unknown[] };
  }
) {}
