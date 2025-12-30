import { DirectionComponent } from './direction';
import { HealthComponent } from './health';

export interface ComponentMap {
  [Components.Health]: HealthComponent;
  [Components.Direction]: DirectionComponent;
}

export enum Components {
  Health,
  Direction,
}
