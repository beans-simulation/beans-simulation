import { Info } from "./info";

class History {
  public organisms: Info;
  public seconds: number[];
  public vegetables_per_seconds: number[];

  constructor() {
    this.organisms = new Info();
    this.seconds = [];
    this.vegetables_per_seconds = [];
  }

  clear() {
    this.organisms.clear();
    this.seconds.length = 0;
  }
}

export { History };
