export class IDManager {
  private id = 1;
  private used: Set<number> = new Set();
  private removed: Set<number> = new Set();

  getNew(): number {
    if (this.removed.size > 0) {
      return this.removed.values().next().value!;
    }
    return this.id++;
  }

  getUsed(): number[] {
    return Array.from(this.used);
  }

  delete(id: number): void {
    this.used.delete(id);
    this.removed.add(id);
  }
}
