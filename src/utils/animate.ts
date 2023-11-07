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

function animate(context: CanvasRenderingContext2D | null) {
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
    const qtreeVegetables = new VegetableQuadTree(canvasRectangle, 10);
    const qtreeOrganisms = new OrganismQuadTree(canvasRectangle, 10);

    // limitador_de_loop = 0;

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
      let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);
      // vision.display(context) // Descomentar para ver o raio de visão dos organismos   

      if(organism.energy <= organism.max_energy * globals.percentual_energy_to_eat){ // FOME
        // TODO: Lógica para definir se vai comer organismo ou vegetal
        // organism.hunt(qtreeOrganisms, vision); // Remover comentário para que ele coma organismos
        organism.search_for_vegetable(qtreeVegetables, vision); // Remover comentário para que ele coma vegetais

      } else {
        if(organism.maturity > 0.6 && organism.sexual_maturity >= 0.5 ){ // Requisitos para reprodução
          organism.sexually_procreate(qtreeOrganisms, vision)
        }
      }
    });

    qtreeOrganisms.display(context);

  }
}
