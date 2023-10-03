import { Organism, Vegetable, QuadTree, Circle } from "../models";
export function find_nearby_element<T extends Organism | Vegetable>(qtree: QuadTree, vision: Circle, organism: Organism, is_eating_vegetable:boolean=false): [number, T[], number] {
    let min_distance = Infinity;
    let closer_index = -1;
    let close_elements: T[] = [];
    if(is_eating_vegetable){
        close_elements = qtree.search_vegetables(vision) as T[];
    }else{
        close_elements = qtree.find_prey_element(vision, organism.id) as T[];
    }


    for (let i = close_elements.length - 1; i >= 0; i--) {
        let d2 =
            Math.pow(organism.position.x - close_elements[i].position.x, 2) +
            Math.pow(organism.position.y - close_elements[i].position.y, 2);

        if (d2 <= min_distance) {
            min_distance = d2;
            closer_index = i;
        }
    }
    return [min_distance, close_elements, closer_index];
  }
