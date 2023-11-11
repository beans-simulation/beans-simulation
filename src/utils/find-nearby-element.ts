function find_nearby_element<T extends Organism | Vegetable>(
  qtree: VegetableQuadTree | OrganismQuadTree,
  vision: Circle,
  organism: Organism,
  is_eating_vegetable: boolean = false
): [number, T[], number] {
  let min_distance = Infinity;
  let closest_index = -1;
  let closest_elements: T[] = [];
  if (is_eating_vegetable) {
    closest_elements = qtree.search_elements(vision) as T[];
  } else {
    closest_elements = qtree.search_elements(vision, organism.id) as T[];
  }

  for (let i = closest_elements.length - 1; i >= 0; i--) {
    let d2 =
      Math.pow(organism.position.x - closest_elements[i].position.x, 2) +
      Math.pow(organism.position.y - closest_elements[i].position.y, 2);
    if (d2 <= min_distance) {
      min_distance = d2;
      closest_index = i;
    }
  }
  return [min_distance, closest_elements, closest_index];
}
