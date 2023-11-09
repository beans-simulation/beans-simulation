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
function is_close_to_target(organism: Organism, distance_closest_target:number){
  const detection_radius_squared = organism.detection_radius ** 2;
  const eat_distance_squared = EAT_DISTANCE ** 2;

  return distance_closest_target <= (detection_radius_squared < eat_distance_squared ? detection_radius_squared : eat_distance_squared);}

function accelerate(value: number, organism: Organism) {

  // organism.accelerate(value)
}

function rotate(value: number, organism: Organism, output: {}) {
  organism.is_rotating = true;
  organism.speed.rotate_degrees(value);
  organism.is_rotating = false;
}

function desireToReproduce(value: number, organism: Organism) {
  // TODO: chamar a função reprodução
  // console.log('Calling DesireToReproduce with value:', value);
}

function desireToEat(value: number, organism: Organism) {
  if(value == 0){ // não deseja comer
    return
  }
  // console.log("fome", value)
  organism.is_eating = true;

  if(organism.closest_target){
    if (is_close_to_target(organism, organism.distance_closest_target)) {
      // console.log("comendo", organism.closest_target)
      organism.eat(organism.closest_target as any)
    }
  }else{
    // ALIMENTAÇÃO EMERGENCIAL
    // caso nao exista target, ele esteja morrendo de fome e existir outra opção de alimento
    if(organism.energy<20){
      if(organism.closest_food){
        if (is_close_to_target(organism, organism.distance_closest_food)) {
          organism.eat(organism.closest_food as any)
        }
      }else if(organism.closest_organism){
        if (is_close_to_target(organism, organism.distance_closest_organism)) {
          organism.eat(organism.closest_organism as any)
        }
      }

    }
  }

  organism.is_eating = false;
}

// Define a mapping between keys and functions
const map_outputs_from_net: { [key: string]: (value: number, organism: Organism, output:{}) => void } = {
  'Accelerate': accelerate,
  'Rotate': rotate,
  'DesireToReproduce': desireToReproduce,
  'DesireToEat': desireToEat,
};

function animate(context: CanvasRenderingContext2D | null) {
  if (!global_timer.is_paused && context && globals.pyodide) {
    const pyodide = globals.pyodide;
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
    const qtreeVegetables = new VegetableQuadTree(canvasRectangle, 10);
    const qtreeOrganisms = new OrganismQuadTree(canvasRectangle, 10);

    Vegetable.vegetables.forEach((vegetable) => {
      vegetable.display(context);

      qtreeVegetables.insert(vegetable); // Insere o vegetable na QuadTree
    });

    Organism.organisms.forEach((organism) => {
      // Insere o organism na QuadTree
      qtreeOrganisms.insert(organism);
    });

    Organism.organisms.forEach(( organism) => {
      organism.update(context);
      // organism.roam();


      // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
      let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);
      // vision.display(context) // Descomentar para ver o raio de visão dos organismos

      // vai ser substituído pelo output de desireToReproduce da rede neural
      if(organism.maturity > 0.6){ // Requisitos para reprodução
        organism.sexually_procreate(qtreeOrganisms, vision)
      }


      // Pyodide
      const values = get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision);
      const valuesJSON = JSON.stringify(values);
      const network_id_JSON = JSON.stringify(organism.neural_network_id);
      pyodide.runPython(`
        import json

        # Desserializa 'values' para um dicionário
        input_values = json.loads('${valuesJSON}')
        network_id = json.loads('${network_id_JSON}')

        output_nn = neural_network.NeuralNetwork.neural_networks.get(f"{network_id}").feed_forward(input_values)
      `);
      let output = pyodide.globals.get('output_nn').toJs();
      // console.log(output)
      // Chamando as funções com base no output da rede
      for (const [key, value] of output) {
        if (map_outputs_from_net[key]) {
          map_outputs_from_net[key](value,organism,output);
        }
      }

      organism.roam();
    });

    // qtreeOrganisms.display(context);
  }

}
