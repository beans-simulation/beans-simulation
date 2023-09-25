import { global_timer, Organism, Vegetable } from "../models";
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
    //   if (is_paused == false) {
    //     idAnimate = requestAnimationFrame(animate);
    //   }

    create_background(context);

    // Criando a Quadtree
    //   const qtree = new QuadTree(retanguloCanvas, 10);

    // limitador_de_loop = 0;

    Vegetable.vegetables.forEach((vegetable) => {
      vegetable.display(context);
      // qtree.insert_vegetable(vegetable); // Insere o vegetable na QuadTree
    });

    Organism.organisms.forEach((organism) => {
      organism.avoid_space_limits(); // telaDividida: false
      // qtree.insert_organism(organism); // Insere o organism na QuadTree
      organism.update();
      organism.roam();
      organism.display(context);
    });

    // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
    //   let vision = new Circle(
    //     organism.position.x,
    //     organism.position.y,
    //     organism.detection_radius
    //   );

    // julia: essa chamada de função não está funcionando, vale checar se a função está correta, quando tiro o comentário ele começa a procreate infinitamente
    // if(organism.energy <= organism.max_energy * percentual_energy_to_eat){ // FOME
    //     organism.find_prey(qtree, vision);
    // }
    //   });
  }
}
