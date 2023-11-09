function generate_organism(x: number, y: number): void {
  // função para poder adicionar mais carnívoros manualmente
  const initial_radius = generate_float(3, 8);
  const max_speed = generate_float(1, 2.2);
  const max_force = generate_float(0.01, 0.05);
  const color = generate_color();
  const initial_detection_radius = generate_float(40, 120);
  const ninhada_min = generate_integer(1, 1);
  const ninhada_max = ninhada_min + generate_integer(1, 8);
  const litter_interval = [ninhada_min, ninhada_max];
  const o_sex = Math.random() < 0.5 ? sex.female : sex.male;
  const diet = generate_float(0, 1);

  var dna = new DNA(
    initial_radius,
    max_speed,
    max_force,
    color,
    initial_detection_radius,
    litter_interval,
    o_sex,
    diet
  );

  let neural_network_id = null;
  if(globals.pyodide){
    neural_network_id = create_neural_network(globals.pyodide)
  }
  new Organism(x, y, dna, neural_network_id);
}

function generate_vegetable(x: number, y: number): void {
  const radius = generate_float(1, 2);
  new Vegetable(x, y, radius);
}

function random_position(size: number) {
  return Math.random() * (size - 50) + 25;
}

function create_entities(n_organisms: number, n_vegetables: number) {
  for (let i = 0; i < n_organisms; i++) {
    const x = random_position(globals.universe_width);
    const y = random_position(globals.universe_height);
    generate_organism(x, y);
  }

  for (let i = 0; i < n_vegetables; i++) {
    const x = random_position(globals.universe_width);
    const y = random_position(globals.universe_height);
    generate_vegetable(x, y);
  }
}
