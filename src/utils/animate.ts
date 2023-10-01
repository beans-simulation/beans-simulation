import { global_timer, Organism, Vegetable, QuadTree, Rectangle} from "../models";
import { globals } from "../resources";

function create_background(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, globals.universe_width, globals.universe_height);
  context.beginPath();
  context.moveTo(-3, -4);
  context.lineTo(globals.universe_width + 3, -3);
  context.lineTo(globals.universe_width + 3, globals.universe_height + 3);
  context.lineTo(-3, globals.universe_height + 3);
  context.lineTo(-3, -3);
  context.strokeStyle = "white";
  context.stroke();
}

export function animate(context: CanvasRenderingContext2D | null) {
  if (!global_timer.is_paused && context) {
    // if (is_paused == false) {
    requestAnimationFrame(() => animate(context));
    // }

    create_background(context);

    // QuadTree
    const canvasRectangle = new Rectangle(
      globals.universe_width / 2,
      globals.universe_height / 2,
      globals.universe_width / 2,
      globals.universe_height / 2
    );

    // Criando a Quadtree
    const qtree = new QuadTree(canvasRectangle, 10);

    // limitador_de_loop = 0;

    Vegetable.vegetables.forEach((vegetable) => {
      vegetable.display(context);
      qtree.insert_vegetable(vegetable); // Insere o vegetable na QuadTree
    });

    Organism.organisms.forEach((organism) => {
        organism.create_space_delimitation();
    })

    Organism.organisms.forEach(organism => {
        qtree.insert_organism(organism); // Insere o organism na QuadTree
    });

    Organism.organisms.forEach((organism) => {
      organism.update();
      organism.roam();
      organism.display(context);

      // // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
      // let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);

      // if(organism.energy <= organism.max_energy * globals.percentual_energy_to_eat){ // FOME
      //     organism.hunt(qtree, vision);
      // }
      // organism.detect_predator(qtree, vision)

    });

    // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
    //   let vision = new Circle(
    //     organism.position.x,
    //     organism.position.y,
    //     organism.detection_radius
    //   );

  }
}
