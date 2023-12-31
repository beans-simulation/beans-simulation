class Vegetable extends Point implements Drawable {
  static vegetables: Vegetable[] = [];
  static id: number = 0;
  public position: Vector;
  public radius: number;
  public energy: number;

  constructor(x: number, y: number, radius: number) {
    super(x, y);
    this.position = new Vector(x, y);
    this.radius = radius;
    // a energia do pedaço de vegetable é proporcinal à sua área
    this.energy = Math.floor(Math.PI * (this.radius * this.radius)) * 15;

    Vegetable.vegetables.push(this);

    // ID
    Vegetable.id++;
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = "rgb(115, 158, 115)";
    context.fill();
  }

  checkId(id: number) {
    return id === Vegetable.id;
  }
  kill() {
    Vegetable.vegetables = Vegetable.vegetables.filter((item) => item !== this);
  }

}
