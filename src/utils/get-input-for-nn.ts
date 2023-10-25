function get_input_values_for_neuralnet(organism: Organism, qtreeOrganisms: OrganismQuadTree, qtreeVegetables:VegetableQuadTree, vision: Circle) {
    var input_values: { [key: string]: number } = {};
    var index_closest_food: number;
    var index_closest_organism: number;
    var distance_closest_food: number;
    var distance_closest_organism: number;
    var angle_food: number;
    var angle_organism: number;
    var vegetable_distance_and_index: Array<number>;
    var vegetables_in_view: Array<Point>;
    var organisms_in_view: Array<Point>;
    var organism_distance_and_index: Array<number>;

    vegetables_in_view = qtreeVegetables.search_elements(vision)
    vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view)
    distance_closest_food = vegetable_distance_and_index[0]
    index_closest_food = vegetable_distance_and_index[1]
    angle_food = get_angle_to_closest_element(organism, index_closest_food)

    organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);
    organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view)
    distance_closest_organism = organism_distance_and_index[0]
    index_closest_organism = organism_distance_and_index[1]
    angle_organism = get_angle_to_closest_element(organism, index_closest_organism)



    input_values = {
        'EnergyLevel': organism.energy,
        'Temperature': get_temperature(),
        'Health': organism.health,
        'AngleToClosestFood': angle_food,
        'DistToClosestFood': distance_closest_food,
        'NumOfFoodInView': vegetables_in_view.length,
        'AngleToClosestOrganism': angle_organism,
        'DistToClosestOrganism': distance_closest_organism,
        'NumOfOrganismsInView': organisms_in_view.length,
        'Luminosity': get_luminosity(),
        'Maturity': organism.maturity,
        'TimeAlive': get_time_alive_in_seconds(organism)
    }
    return input_values
}

function get_distance_and_index_of_closest_element(organism: Organism, clostest_elements: Point[]) {
    let min_distance = Infinity;
    let closest_index = -1;
    for (let i = clostest_elements.length - 1; i >= 0; i--) {
        let distance_x = organism.position.x - clostest_elements[i].position.x
        let distance_y = organism.position.y - clostest_elements[i].position.y
        let squared_distance =(distance_x*distance_x) + (distance_y*distance_y)
        if (squared_distance <= min_distance) {
          min_distance = squared_distance;
          closest_index = i;
        }
      }

    let distance_and_index: [number, number] = [min_distance, closest_index];
    return distance_and_index;
}

function get_angle_to_closest_element(organism: Organism, index_closest_food: number){
    // TODO: código para calcular o ângulo
    return 0
}

function get_distance_and_angle_to_closest_organism(organism: Organism) {
    var distance = 172
    var angle = -77;

    //TODO: Código para encontrar o organismo mais próximo
    let distance_and_angle: [number, number] = [distance, angle];
    return distance_and_angle;
}


function get_temperature() {
    // Baseado na quantidade de elementos vivos, calcula a temperatura do ambiente
    var temperature: number = 16;
    // TODO: código para calcular temperatura
    return temperature
}

function get_luminosity() {
    // TODO: checar como calcular isso e construir o código
    return 0.56;
}

function get_time_alive_in_seconds(organism: Organism) {
    // TODO: checar se o valor está fazendo sentido
    return (global_timer.total - organism.birth_moment_in_milliseconds) / 1000;
}
