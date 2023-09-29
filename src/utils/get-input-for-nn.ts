import { global_timer, Organism } from "../models";

export function get_input_values_for_neuralnet(organism: Organism) {
    var input_values: {};
    var distance_food: number;
    var angle_food: number;
    var distance_organism: number;
    var angle_organism: number;
    var vegetable_distance_and_angle: Array<number>;
    var organism_distance_and_angle: Array<number>;


    vegetable_distance_and_angle = get_distance_and_angle_to_closest_vegetable(organism)
    distance_food = vegetable_distance_and_angle[0]
    angle_food = vegetable_distance_and_angle[1]

    organism_distance_and_angle = get_distance_and_angle_to_closest_organism(organism)
    distance_organism = organism_distance_and_angle[0]
    angle_organism = organism_distance_and_angle[1]

    input_values = {
        'EnergyLevel': organism.energy,
        'Temperature': get_temperature(),
        'Health': organism.health,
        'AngleToClosestFood': angle_food,
        'DistToClosestFood': distance_food,
        'NumOfFoodInView': get_amount_of_vegetable_in_view(organism),
        'AngleToClosestOrganism': angle_organism,
        'DistToClosestOrganism': distance_organism,
        'NumOfOrganismsInView': get_amount_of_organisms_in_view(organism),
        'Luminosity': get_luminosity(),
        'Maturity': organism.maturity,
        'TimeAlive': get_time_alive_in_seconds(organism)
    }
    return input_values
}

function get_distance_and_angle_to_closest_vegetable(organism: Organism) {
    var distance = 56
    var angle = - 30;

    //TODO: Código para encontrar alimento mais próximo (só vegetal por enquanto)
    let distance_and_angle: [number, number] = [distance, angle];
    return distance_and_angle;
}

function get_amount_of_vegetable_in_view(organism: Organism) {
    var food: number = 3;
    // TODO: calcular a quantidade de alimentos (vegetais só?) no campo de visão
    // pode se basear na função atual de encontrar organismo, por exemplo a find_prey() para organismos,
    // que retona os organismos proximos, ou na função da evolve de encontrar alimento
    return food
}

function get_distance_and_angle_to_closest_organism(organism: Organism) {
    var distance = 172
    var angle = -77;

    //TODO: Código para encontrar o organismo mais próximo
    let distance_and_angle: [number, number] = [distance, angle];
    return distance_and_angle;
}

function get_amount_of_organisms_in_view(organism: Organism) {
    var amount: number = 0;
    // TODO: calcular a quantidade de alimentos (vegetais só?) no campo de visão
    // pode se basear na função atual de encontrar organismo, por exemplo a find_prey() para organismos,
    // que retona os organismos proximos, ou na função da evolve de encontrar alimento
    return amount
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
