import { Point } from "@/resources";

class Circle {
  public x: number;
  public y: number;
  public radius: number;
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  // Checa se o point esta contido dentro de seus limites (fronteiras)
  contains_point(point: Point): boolean {
    const xPoint = point.x;
    const yPoint = point.y;

    return (
      Math.sqrt(Math.pow(xPoint - this.x, 2) + Math.pow(yPoint - this.y, 2)) <=
      this.radius // Se a distancia do point ate o circulo for menor ou igual ao radius
    );
  }

  // Método para saber se os retangulos se interseptam
  intersect(scope): boolean {
    return !(
      // Se essa expressao for verdade, eles NÃO se interceptam
      (
        scope.x - scope.w > this.x ||
        scope.x + scope.w < this.x ||
        scope.y - scope.h > this.y ||
        scope.y + scope.h < this.y
      )
    );
  }
}

export { Circle };
