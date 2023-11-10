function get_input_values_for_neuralnet(organism: Organism, qtreeOrganisms: OrganismQuadTree, qtreeVegetables:VegetableQuadTree, vision: Circle) {
    var input_values: { [key: string]: number } = {};
    var index_closest_food: number | null;
    var index_closest_organism: number | null;
    var distance_closest_food: number | null;
    var distance_closest_organism: number | null;
    var distance_closest_target: number | null;
    var angle_closest_food: number | null;
    var angle_closest_organism: number | null;
    var angle_closest_target: number | null;
    var vegetable_distance_and_index: Array<number> | null;
    var vegetables_in_view: Array<Point> | null;
    var organisms_in_view: Array<Point> | null;
    var targets_in_view: Array<Point> | null;
    var organism_distance_and_index: Array<number> | null;
    var num_of_food_in_view: number;
    var num_of_organisms_in_view: number;
    var num_of_targets_in_view: number;


    vegetables_in_view = null;
    vegetable_distance_and_index = null;
    distance_closest_food = 0;
    index_closest_food = null;
    angle_closest_food = 0;

    organisms_in_view = null;
    organism_distance_and_index = null;
    distance_closest_organism = 0;
    index_closest_organism = null;
    angle_closest_organism = 0;

    num_of_food_in_view = 0
    num_of_organisms_in_view = 0
    num_of_targets_in_view = 0

    // Só faz os cálculos se o organismo tiver algum desses neurônios de enxergar alvos
    if(["NumOfTargetsInView", "DistToClosestTarget", "AngleToClosestTarget"].some(str => organism.input_neurons_list?.includes(str))){
        vegetables_in_view = qtreeVegetables.search_elements(vision);
        organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);



        // Se o organismo não tiver nenhum desses dois neurônios abaixo, não faz sentido calcular esses valores
        if(["DistToClosestTarget", "AngleToClosestTarget"].some(str => organism.input_neurons_list?.includes(str))){
            
            // VEGETAIS
            vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view);
            distance_closest_food = vegetable_distance_and_index[0];
            index_closest_food = vegetable_distance_and_index[1];
            angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food]);

            organism.closest_food = vegetables_in_view[index_closest_food]
            organism.angle_closest_food = angle_closest_food
            organism.distance_closest_food = distance_closest_food

            // ORGANISMOS
            organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view)
            distance_closest_organism = organism_distance_and_index[0]
            index_closest_organism = organism_distance_and_index[1]
            angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism])

            organism.angle_closest_organism = angle_closest_organism
            organism.distance_closest_organism = distance_closest_organism
            organism.closest_organism = organisms_in_view[index_closest_organism]
        }

        // Se não tem nenhum neurônio de Target, vemos se tem algum dos especializados (Food / Organism)
    } else {
        // Só faz os cálculos se o organismo tiver algum desses neurônios de enxergar alimento
        if(["NumOfFoodInView", "DistToClosestFood", "AngleToClosestFood"].some(str => organism.input_neurons_list?.includes(str))){
            vegetables_in_view = qtreeVegetables.search_elements(vision);

            // Se o organismo não tiver nenhum desses dois neurônios abaixo, não faz sentido calcular esses valores
            if(["DistToClosestFood", "AngleToClosestFood"].some(str => organism.input_neurons_list?.includes(str))){
                vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view);
                distance_closest_food = vegetable_distance_and_index[0];
                index_closest_food = vegetable_distance_and_index[1];
                angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food]);

                organism.closest_food = vegetables_in_view[index_closest_food]
                organism.angle_closest_food = angle_closest_food
                organism.distance_closest_food = distance_closest_food
            }
        }

        // Só faz os cálculos se o organismo tiver algum desses neurônios de enxergar organismo
        if(["NumOfOrganismsInView", "DistToClosestOrganism", "AngleToClosestOrganism"].some(str => organism.input_neurons_list?.includes(str))){
            organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);

            // Se o organismo não tiver nenhum desses dois neurônios abaixo, não faz sentido calcular esses valores
            if(["DistToClosestOrganism", "AngleToClosestOrganism"].some(str => organism.input_neurons_list?.includes(str))){
                organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view)
                distance_closest_organism = organism_distance_and_index[0]
                index_closest_organism = organism_distance_and_index[1]
                angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism])

                organism.angle_closest_organism = angle_closest_organism
                organism.distance_closest_organism = distance_closest_organism
                organism.closest_organism = organisms_in_view[index_closest_organism]
            }
        }
    } 



    
    if(organism.diet_variant >= organism.diet){ // Come vegetal
        if(vegetables_in_view != null && index_closest_food != null){
            organism.closest_target = vegetables_in_view[index_closest_food]
        }else{
            organism.closest_target = null
        }
        
        distance_closest_target = distance_closest_food;
        organism.distance_closest_target = distance_closest_food;
        angle_closest_target = angle_closest_food;
        num_of_targets_in_view = num_of_food_in_view;
    }else{ // Come outro organismo
        if(organisms_in_view != null && index_closest_organism != null){
            organism.closest_target = organisms_in_view[index_closest_organism]
        }else{
            organism.closest_target = null
        }
        
        distance_closest_target = distance_closest_organism;
        organism.distance_closest_target = distance_closest_organism;
        angle_closest_target = angle_closest_organism;
        num_of_targets_in_view = num_of_organisms_in_view;
    }
    

    

    input_values = {
        'EnergyLevel': organism.energy,
        'Temperature': globals.temperature,
        'Health': organism.health,
        'AngleToClosestFood': angle_closest_food,
        'DistToClosestFood': distance_closest_food,
        'NumOfFoodInView': num_of_food_in_view,
        'AngleToClosestOrganism': angle_closest_organism,
        'DistToClosestOrganism': distance_closest_organism,
        'NumOfOrganismsInView': num_of_organisms_in_view,
        'AngleToClosestTarget': angle_closest_target,
        'DistToClosestTarget': distance_closest_target,
        'NumOfTargetsInView': num_of_targets_in_view,
        'Luminosity': globals.luminosity,
        'Maturity': organism.maturity,
        'TimeAlive': organism.get_time_alive_in_seconds()
    }

    return input_values
}

function get_distance_and_index_of_closest_element(organism: Organism, closests_elements: Point[]) {

    let min_distance = Infinity;
    let closest_index = -1;
    if(closests_elements.length !== 0){ // se a lista de organismos próximos não estiver vazia ele calcula, senão retorna o default
        for (let i = closests_elements.length - 1; i >= 0; i--) {
            let distance_x = organism.position.x - closests_elements[i].position.x
            let distance_y = organism.position.y - closests_elements[i].position.y
            let squared_distance =(distance_x*distance_x) + (distance_y*distance_y)
            if (squared_distance <= min_distance) {
                min_distance = squared_distance;
                closest_index = i;
            }
        }
    }
    if(min_distance == Infinity){
        min_distance = 0 // evitar cenários Infinity que quebram a rede
    }
    let distance_and_index: [number, number] = [min_distance, closest_index];
    return distance_and_index;
}



function set_temperature() {
    // Obtendo o valor de luminosidade atual, pois a temperatura estará diretamente relacionada à luminosidade
    const luminosity = globals.luminosity;

    // Calculando a temperatura com base na luminosidade (5 quando a luminosidade for 0, e 30 quando for 1)
    let temperature = 5 + (25 * luminosity);

    // Mudando o valor do ruído em pequenos passos para que mude gradualmente a cada frame
    const noiseChange = (Math.random() * 2 - 1) * 0.5; // Muda o ruído em até ±0.5
    globals.noise += noiseChange;
    globals.noise = Math.max(Math.min(globals.noise, 5), -5); // Garante que o ruído permaneça dentro dos limites de -5 a 5

    // Adicionando o ruído à temperatura
    temperature += globals.noise;

    // Garantindo que a temperatura esteja dentro dos limites (0 a 35) após adicionar o ruído
    temperature = Math.max(Math.min(temperature, 35), 0);

    globals.temperature = temperature;
}

function set_luminosity() {
    // Convertendo o tempo de milissegundos (do global_timer.total) para segundos em um ciclo senoidal
    const cycle = (2 * Math.PI * global_timer.total / 1000) / globals.luminosity_cycle_time;

    // Calculando o valor senoidal e ajustando o ciclo para começar em 0.5
    const sinusoidal_value = Math.sin(cycle + Math.PI / 2);

    // Reescalando o valor para variar de 0 a 1 (ao invés de -1 a 1), que são os ranges da luminosidade
    const luminosity = (sinusoidal_value + 1) / 2;

    globals.luminosity = luminosity; // setando na variável global
}
