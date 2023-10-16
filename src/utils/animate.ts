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
    const qtree = new QuadTree(canvasRectangle, 10);

    Vegetable.vegetables.forEach((vegetable) => {
      vegetable.display(context);
      qtree.insert_vegetable(vegetable);
    });


    Organism.organisms.forEach((organism) => {

      qtree.insert_organism(organism);
      organism.update(context);
      organism.roam();


      // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
      let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);

      if(organism.energy <= organism.max_energy * globals.percentual_energy_to_eat){ // FOME
        // TODO: Lógica para definir se vai comer organismo ou vegetal
        // organism.hunt(qtree, vision); // Remover comentário para que ele coma organismos
        organism.search_for_vegetable(qtree, vision); // Remover comentário para que ele coma vegetais

      }

      // Pyodide
      const values = get_input_values_for_neuralnet(organism, qtree, vision);
      const valuesJSON = JSON.stringify(values);
      console.log(values["NumOfFoodInView"])
      pyodide.runPython(`
        import json

        # Deserialize the JSON data
        values = json.loads('${valuesJSON}')

        # print("py", values["AngleToClosestFood"])
        nn = neural_network.create_network()
        # print("Output:", nn.feed_forward(values))
      `);
      // organism.detect_predator(qtree, vision)
    });



  }
}
