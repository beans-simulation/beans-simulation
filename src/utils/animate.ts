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

function accelerate(value: number, organism: Organism) {
  organism.accelerate(value)
}

function rotate(value: number, organism: Organism) {
  organism.rotate(value)
}

function desireToReproduce(value: number, organism: Organism) {
  // TODO: chamar a função reprodução
  console.log('Calling DesireToReproduce with value:', value);
}

function desireToEat(value: number, organism: Organism) {
  // TODO: chamar a função de comer organismo ou de comer alimento
  console.log('Calling desireToEat with value:', value);
}

// Define a mapping between keys and functions
const map_outputs_from_net: { [key: string]: (value: number, organism: Organism) => void } = {
  'Accelerate': accelerate,
  'Rotate': rotate,
  'DesireToReproduce': desireToReproduce,
  'DesireToEat': desireToEat,
};

function animate(context: CanvasRenderingContext2D | null, pyodide: Pyodide) {
  if (!global_timer.is_paused && context && pyodide) {
    // if (is_paused == false) {
    requestAnimationFrame(() => animate(context, pyodide));
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
    const qtreeOrganisms = new OrganismQuadTree(canvasRectangle, 3);

    Vegetable.vegetables.forEach((vegetable) => {
      vegetable.display(context);

      qtreeVegetables.insert(vegetable); // Insere o vegetable na QuadTree
    });

    Organism.organisms.forEach((organism) => {
      // Insere o organism na QuadTree
      qtreeOrganisms.insert(organism);
    });

    Organism.organisms.forEach((organism) => {
      organism.update(context);
      organism.roam();

      // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
      let vision = new Circle(
        organism.position.x,
        organism.position.y,
        organism.detection_radius
      );

      if (
        organism.energy <=
        organism.max_energy * globals.percentual_energy_to_eat
      ) {
        // FOME
        // TODO: Lógica para definir se vai comer organismo ou vegetal
        organism.hunt(qtreeOrganisms, vision); // Remover comentário para que ele coma organismos
        // organism.search_for_vegetable(qtreeVegetables, vision); // Remover comentário para que ele coma vegetais
      }

      // Pyodide
      const values = get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision);
      const valuesJSON = JSON.stringify(values);
      pyodide.runPython(`
        import json

        # Deserialize the JSON data
        values = json.loads('${valuesJSON}')
        nn = neural_network.create_network()

        output_nn = nn.feed_forward(values)
        # print("Output:", nn.feed_forward(values))
      `);
      let output = pyodide.globals.get('output_nn').toJs();
      console.log(output)

      // Chamando as funções com base no output da rede
      for (const [key, value] of output) {
        if (map_outputs_from_net[key]) {
          map_outputs_from_net[key](value,organism);
        }
      }  
    });
    
    qtreeOrganisms.display(context);
    //debugger;
  }

}
