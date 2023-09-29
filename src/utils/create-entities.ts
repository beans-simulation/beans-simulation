import { DNA, Organism, Vegetable } from "../models";
import { sex, globals } from "../resources";
import { generate_color, generate_float, generate_integer } from ".";

function generate_organism(x: number, y: number): Organism {
  // função para poder adicionar mais carnívoros manualmente
  const initial_radius = generate_float(3, 8);
  const max_speed = generate_float(1, 2.2);
  const max_strength = generate_float(0.01, 0.05);
  const color = generate_color();
  const initial_detection_radius = generate_float(40, 120);
  const ninhada_min = generate_integer(1, 1);
  const ninhada_max = ninhada_min + generate_integer(1, 8);
  const litter_interval = [ninhada_min, ninhada_max];
  const o_sex = Math.random() < 0.5 ? sex.female : sex.male;

  var dna = new DNA(
    initial_radius,
    max_speed,
    max_strength,
    color,
    initial_detection_radius,
    litter_interval,
    o_sex
  );

  return new Organism(x, y, dna);
}

function generate_vegetable(x: number, y: number): Vegetable {
  const radius = generate_float(1, 2);
  return new Vegetable(x, y, radius);
}

function random_position(size: number) {
  return Math.random() * (size - 50) + 25;
}

export function create_entities(n_organisms: number, n_vegetables: number) {
  for (let i = 0; i < n_organisms; i++) {
    const x = random_position(globals.universe_width);
    const y = random_position(globals.universe_height);
    Organism.organisms.push(generate_organism(x, y));
  }

  for (let i = 0; i < n_vegetables; i++) {
    const x = random_position(globals.universe_width);
    const y = random_position(globals.universe_height);
    Vegetable.vegetables.push(generate_vegetable(x, y));
  }
}
