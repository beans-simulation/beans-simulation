import { Drawable } from "@/resources";
import { Rectangle } from "./Rectangle";
import { Vegetable } from "./Vegetable";
import { Circle } from "./Circle";

enum TreeListCategory {
  organism = "organism",
  point = "point",
  vegetable = "vegetable",
}

interface QuadTreeProps {
  rectangle: Rectangle;
  supported_amount_of_point: number;
  points: Point[];
  vegetables: Vegetable[];
  organisms: any[];
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
  public organisms = [];
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

  private get_insert_list(category: TreeListCategory): Point[] {
    switch (category) {
      case TreeListCategory.organism:
        return this.organisms;
      case TreeListCategory.point:
        return this.points;
      case TreeListCategory.vegetable:
        return this.vegetables;
      default:
        throw new Error(`Invalid category while inserting list: ${category}`);
    }
  }

  protected insert(point: Point, category: TreeListCategory): void {
    if (this.rectangle.contains_point(point)) {
      const list = this.get_insert_list(category);

      if (list.length < this.supported_amount_of_point) {
        list.push(point);
      } else {
        // Se a supported_amount_of_point máxima tiver sido atingida
        if (!this.division) {
          // A QuadTree não irá se subdividir caso já o tenha feito
          this.subdivide();
        }

        // Não checamos a localização do point pois ele será checado no começo de cada chamada desses métodos
        this.division?.northeast.insert(point, category);
        this.division?.northwest.insert(point, category);
        this.division?.southeast.insert(point, category);
        this.division?.southwest.insert(point, category);
      }
    }
  }

  private intercepts_by_scope(scope: Circle | Rectangle) {
    if (scope instanceof Circle) {
      return this.rectangle.does_intercept_circle(scope);
    }
    return this.rectangle.does_intercept_rectangle(scope);
  }

  protected search(
    scope: Rectangle | Circle,
    category: TreeListCategory
  ): Point[] {
    const result: Point[] = [];
    if (this.intercepts_by_scope(scope)) {
      const list = this.get_insert_list(category);
      for (const point of list) {
        // Para os points dessa QuadTree
        if (scope.contains_point(point)) {
          // Se o point pertencer ao retângulo "scope"
          result.push(point);
        }

        if (this.division) {
          // Se a QuadTree tiver QuadTrees filhas
          const nw = this.division.northwest.search(scope, category);
          const ne = this.division.northeast.search(scope, category);
          const sw = this.division.southwest.search(scope, category);
          const se = this.division.southeast.search(scope, category);
          result.push(...nw, ...ne, ...sw, ...se);
        }
      }
    }
    return result;
  }

  insert_point(point: Point): void {
    this.insert(point, TreeListCategory.point);
  }

  insert_vegetable(vegetable: Vegetable) {
    this.insert(vegetable, TreeListCategory.vegetable);
  }

  insert_organism(organism: any) {
    this.insert(organism, TreeListCategory.organism);
  }

  search_points(rectangle: Rectangle): Point[] {
    return this.search(rectangle, TreeListCategory.point);
  }

  search_vegetables(circle: Circle) {
    return this.search(circle, TreeListCategory.vegetable);
  }

  find_prey_element(circle: Circle) {
    return this.search(circle, TreeListCategory.organism);
  }

  // função para a procura de predador
  find_predator_element(circle: Circle) {
    return this.search(circle, TreeListCategory.organism);
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
