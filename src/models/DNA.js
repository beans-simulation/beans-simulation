class DNA{
    constructor(initial_radius, max_speed, max_force, color, initial_detection_radius, litter_interval, sex){
        this.initial_radius = initial_radius;
        this.max_speed = max_speed;
        this.max_force = max_force;
        this.color = color;
        this.initial_detection_radius = initial_detection_radius;
        this.litter_interval = litter_interval;
        this.sex = sex; // string que pode ser XX (fêmea) ou XY (macho)
    }

    mutar(){
        var mutated_dna;

        // radius inicial
        var offspring_initial_radius = newMutation(this.initial_radius);
        if(offspring_initial_radius < 0){
            offspring_initial_radius = 0;
        }
        // velocidade máxima
        var offspring_max_speed = newMutation(this.max_speed);
        if(offspring_max_speed < 0){
            offspring_max_speed = 0;
        }

        // força máxima
        var offspring_max_force = newMutation(this.max_force);

        // color
        var offspring_color = corMutacao(this.color);

        // radius de detecção inicial
        var offspring_initial_detection_radius = newMutation(this.initial_detection_radius);
        if(offspring_initial_detection_radius < offspring_initial_radius){
            offspring_initial_detection_radius = offspring_initial_radius;
        }

        // tamanho da ninhada
        var offspring_litter_interval = mutacaoNinhada(this.litter_interval[0], this.litter_interval[1]);

        mutated_dna = new DNA(
            offspring_initial_radius, 
            offspring_max_speed,
            offspring_max_force,
            offspring_color,
            offspring_initial_detection_radius,
            offspring_litter_interval
            )

        return mutated_dna;
    }

}