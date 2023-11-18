function generate_organism(x: number, y: number): void {
  // função para poder adicionar mais carnívoros manualmente
  const initial_radius = generate_float(3, 8);
  const max_speed = generate_float(1, 2.2);
  const max_force = generate_float(0.01, 0.05);
  const color = generate_color();
  const initial_detection_radius = generate_float(40, 120);
  const ninhada_min = 1;
  const ninhada_max = ninhada_min + generate_integer(1, 3);
  const litter_interval = [ninhada_min, ninhada_max];
  const o_sex = Math.random() < 0.5 ? sex.female : sex.male;
  const diet = generate_float(0, 1);
  const metabolic_rate = generate_float(0.5, 3.0);
  const min_temp = generate_float(0, 5.0);
  const max_temp = min_temp + generate_float(25, 30);
  const min_max_temperature_tolerated = [min_temp, max_temp];
  const body_growth_rate = generate_float(0, 0.4);;
  const lifespan = generate_integer(200, 300);
  const percentage_to_mature = generate_float(0.01, 0.03); // maturidade é atingida entre 1% e 3% da vida

  var dna = new DNA(
    initial_radius,
    max_speed,
    max_force,
    color,
    initial_detection_radius,
    litter_interval,
    o_sex,
    diet,
    metabolic_rate,
    min_max_temperature_tolerated,
    body_growth_rate,
    lifespan,
    percentage_to_mature
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
