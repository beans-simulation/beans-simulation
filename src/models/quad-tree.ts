import { Drawable } from "@/resources";
import { Circle, Organism, Point, Rectangle, Vegetable } from ".";

interface QuadTreeProps {
  rectangle: Rectangle;
  supported_amount_of_point: number;
  points: Point[];
  vegetables: Vegetable[];
  organisms: Organism[];
  division: {
    northeast: QuadTree;
    northwest: QuadTree;
    southeast: QuadTree;
    southwest: QuadTree;
  } | null;
}

export class QuadTree implements QuadTreeProps, Drawable {
  public rectangle: Rectangle;
  public supported_amount_of_point: number; // A partir de quantos points (neste caso, seres vivos) o retângulo se subdivide
  public points: Point[] = [];
  public vegetables: Vegetable[] = [];
  public organisms: Organism[] = [];
  public division: QuadTreeProps["division"] | null;

  constructor(rectangle: Rectangle, supported_amount_of_point: number) {
    this.rectangle = rectangle;
    this.supported_amount_of_point = supported_amount_of_point;
    this.division = null;
  }

  // Subdivide a QuadTree em 4 retângulos children
  subdivide() {
    const { x, y, h, w } = this.rectangle;

    const ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);

    const nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);

    const se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);

    const sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);

    this.division = {
      northeast: new QuadTree(ne, this.supported_amount_of_point), //nordeste
      northwest: new QuadTree(nw, this.supported_amount_of_point), //noroeste
      southeast: new QuadTree(se, this.supported_amount_of_point), //sudeste
      southwest: new QuadTree(sw, this.supported_amount_of_point), //sudoeste
    };
  }

  protected insert<T extends Organism | Vegetable | Point>(
    item: T,
    list: T[]
  ): void {
    if (this.rectangle.contains_point(item)) {
      if (list.length < this.supported_amount_of_point) {
        list.push(item);
      } else {
        // Se a supported_amount_of_point máxima tiver sido atingida
        if (!this.division) {
          // A QuadTree não irá se subdividir caso já o tenha feito
          this.subdivide();
        }

        // Não checamos a localização do point pois ele será checado no começo de cada chamada desses métodos
        this.division?.northeast.insert(item, list);
        this.division?.northwest.insert(item, list);
        this.division?.southeast.insert(item, list);
        this.division?.southwest.insert(item, list);
      }
    }
  }

  private intercepts_by_scope(scope: Circle | Rectangle) {
    if (scope instanceof Circle) {
      return this.rectangle.does_intercept_circle(scope);
    }
    return this.rectangle.does_intercept_rectangle(scope);
  }

  protected search<T extends Organism | Vegetable | Point>(
    scope: Rectangle | Circle,
    list: T[]
  ): T[] {
    const result: T[] = [];
    if (this.intercepts_by_scope(scope)) {
      for (const point of list) {
        // Para os points dessa QuadTree
        if (scope.contains_point(point)) {
          // Se o point pertencer ao retângulo "scope"
          result.push(point);
        }

        if (this.division) {
          // Se a QuadTree tiver QuadTrees filhas
          const nw = this.division.northwest.search(scope, list);
          const ne = this.division.northeast.search(scope, list);
          const sw = this.division.southwest.search(scope, list);
          const se = this.division.southeast.search(scope, list);
          result.push(...nw, ...ne, ...sw, ...se);
        }
      }
    }
    return result;
  }

  insert_point(point: Point): void {
    this.insert(point, this.points);
  }

  insert_vegetable(vegetable: Vegetable) {
    this.insert(vegetable, this.vegetables);
  }

  insert_organism(organism: Organism) {
    this.insert(organism, this.organisms);
  }

  search_points(rectangle: Rectangle) {
    return this.search(rectangle, this.points);
  }

  search_vegetables(detection_circle: Circle) {
    return this.search(detection_circle, this.vegetables);
  }

  find_prey_element(detection_circle: Circle) {
    return this.search(detection_circle, this.organisms);
  }

  // função para a procura de predador
  find_predator_element(detection_circle: Circle) {
    return this.search(detection_circle, this.organisms);
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.rect(
      this.rectangle.x - this.rectangle.w,
      this.rectangle.y - this.rectangle.h,
      this.rectangle.w * 2,
      this.rectangle.h * 2
    );
    context.stroke();
    if (this.division) {
      this.division.northeast.display(context);
      this.division.northwest.display(context);
      this.division.southeast.display(context);
      this.division.southwest.display(context);
    }
  }
}
