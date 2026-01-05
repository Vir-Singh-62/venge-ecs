export class IDManager {
  private id = 1;
  private recycledIds: number[] = [];
  public newId() {
    if (this.recycledIds.length > 0) {
      return this.recycledIds.shift()!;
    } else {
      return this.id++;
    }
  }
  public recycleId(id: number) {
    this.recycledIds.push(id);
  }

  public reset() {
    this.id = 1;
    this.recycledIds = [];
  }
}
