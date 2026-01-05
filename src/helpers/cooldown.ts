export class Cooldown {
  private map = new Map<number, number>();
  private duration: number;

  constructor(duration: number, cleanUpInterval?: number) {
    this.duration = duration;

    if (cleanUpInterval) {
      setInterval(this.cleanUp.bind(this) as () => void, cleanUpInterval);
    }
  }

  canUse(eid: number): boolean {
    if (!this.map.has(eid)) return true;
    return this.map.get(eid)! <= Date.now();
  }

  use(eid: number): void {
    this.map.set(eid, Date.now() + this.duration);
  }

  clear() {
    this.map.clear();
  }

  updateDuration(newDuration: number) {
    this.duration = newDuration;
  }

  cleanUp() {
    this.map = new Map(
      [...this.map.entries()].filter(([, endTime]) => endTime > Date.now())
    );
  }
}
