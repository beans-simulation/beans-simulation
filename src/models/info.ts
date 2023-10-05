class Info {
  public population: number[];
  public speed: number[];
  public agility: number[];
  public radius: number[];
  public detection: number[];
  public energy: number[];
  public energy_expenditure: number[];
  public avg_litter_size: number[];

  constructor() {
    this.population = [];
    this.speed = [];
    this.agility = [];
    this.radius = [];
    this.detection = [];
    this.energy = [];
    this.energy_expenditure = [];
    this.avg_litter_size = [];
  }

  clear() {
    this.population.length = 0;
    this.speed.length = 0;
    this.agility.length = 0;
    this.radius.length = 0;
    this.detection.length = 0;
    this.energy.length = 0;
    this.energy_expenditure.length = 0;
    this.avg_litter_size.length = 0;
  }
}
