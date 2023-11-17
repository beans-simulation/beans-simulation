class DNA {
  public readonly initial_radius: number;
  public readonly max_speed: number;
  public readonly max_force: number;
  public readonly color: string;
  public readonly initial_detection_radius: number;
  public readonly litter_interval: number[];
  public readonly sex: sex_type;
  public readonly diet: number;
  public readonly metabolic_rate: number;
  public readonly min_max_temperature_tolerated: number[];
  public readonly body_growth_rate: number;
  public readonly lifespan: number;
  public readonly percentage_to_mature: number;
  private genome: ConstructorParameters<typeof DNA>;

  constructor(
    initial_radius: number,
      max_speed: number,
      max_force: number,
      color: string,
      initial_detection_radius: number,
      litter_interval: number[],
      sex: sex_type,
      diet: number,
      metabolic_rate: number,
      min_max_temperature_tolerated: number[],
      body_growth_rate: number,
      lifespan: number,
      percentage_to_mature: number,
  ) {
    this.initial_radius = initial_radius;
    this.max_speed = max_speed;
    this.max_force = max_force;
    this.color = color;
    this.initial_detection_radius = initial_detection_radius;
    this.litter_interval = litter_interval;
    this.sex = sex; // string que pode ser XX (fêmea) ou XY (macho)
    this.diet = diet; // se for 0 é herbívoro, se for 1 é carnívoro
    this.metabolic_rate =  metabolic_rate;
    this.min_max_temperature_tolerated = min_max_temperature_tolerated;
    this.body_growth_rate = body_growth_rate;
    this.lifespan = lifespan;
    this.percentage_to_mature = percentage_to_mature;

    this.genome = [
      initial_radius,
      max_speed,
      max_force,
      color,
      initial_detection_radius,
      litter_interval,
      sex,
      diet,
      metabolic_rate,
      min_max_temperature_tolerated,
      body_growth_rate,
      lifespan,
      percentage_to_mature
    ]
  }


  public get_genome(): ConstructorParameters<typeof DNA>{
    return this.genome;
  }

  private get_positive_mutation(value: number, step: number) {
    const new_value = this.new_mutation(value, step);
    return new_value >= 0 ? new_value : 0;
  }

  private get_mutation_between_zero_one(value: number, step: number) {
    const new_value = this.new_mutation(value, step);
    if (new_value >= 1){
      return 1
    } else if(new_value <= 0){
      return 0
    }
    return new_value;
  }

  private get_offspring_detection_radius(initial_radius: number, step: number) {
    const value = this.new_mutation(this.initial_detection_radius, step);
    return value < initial_radius ? initial_radius : value;
  }

  private variate_range(min: number, max: number) {
    const maximumRange = Math.floor(globals.mutation_magnitude * 10) + 2;
    // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
    const min_variation = generate_integer(0, maximumRange);
    const max_variation = generate_integer(0, maximumRange);

    if (Math.random() >= 0.5) {
      //Soma
      return {
        min: min + min_variation,
        max: max + max_variation,
      };
    }

    // Subtrai
    return {
      min: min - min_variation,
      max: max - max_variation,
    };
  }

  private get_range_mutation(values_array: number[]): number[] {
    const min_value = values_array[0];
    const max_value = values_array[1];

    if (Math.random() < globals.mutation_probability) {
      const { min, max } = this.variate_range(min_value, max_value);

      const min_mutated = min >= 0 ? min : 0;
      const max_mutated = max <= max_value ? max : max_value;

      return [min_mutated, max_mutated];
    }

    return [min_value, max_value];
  }

  private get_new_mutation_multiplier() {
    const probability = Math.random();
    //  variacao = 20 * 0.05 = 1, ou seja, poderá variar de +1 a -1 no resultado

    if (probability < 0.001) {
      // Há 0.1% de chance de a mutação ser bem grande
      return 10;
    }
    if (probability < 0.003) {
      // Há 0.2% de chance (0.3% - 0.1% do if anterior) de a mutação ser grande
      return 6;
    }
    if (probability < 0.008) {
      /// Há 0.5% de chance (0.8% - o 0.3% do if anterior) de a mutação ser razoavelmente grande
      return 3.5;
    }

    return probability < 0.028 ? 2 : 1;
  }

  private get_minimum(value: number, variation: number) {
    const minimum = value - variation; //  minimo = 20 - 1 = 19. Para que não precise sub-dividir o return em adição ou subtração

    // Se a mutação diminuir o valor para menos que 0, ela será simplesmente muito pequena
    return minimum <= 0 ? value * 0.01 : minimum;
  }

  private new_mutation(value: number, step: number) {
    // exemplo: valor = 20;  magnitude_mutacao = 0.05 || 5%
    if (Math.random() < globals.mutation_probability) {
      // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
      const multiplier = this.get_new_mutation_multiplier();
      const variation = value + Math.random() * step * globals.mutation_magnitude * multiplier;

      const minimum = this.get_minimum(value, variation);
      const double_variation = variation * 2; //  puxo o point de referência para o menor valor possível. Logo, o resultado variará de
      //  0 a +2, afinal a distância de 1 até -1 é 2.

      return minimum + Math.random() * double_variation; // 19 + Math.randon() * 2. O resultado estará entre o intervalo [19, 21]
    } else {
      // Caso não ocorra mutação, retorna o valor original
      return value;
    }
  }

  private get_color_operation_type(color: number): color_operation_type {
    const min = 10;
    const max = 245;

    if (color <= min) {
      return color_operation.addition;
    } else if (color >= max) {
      return color_operation.subtraction;
    }

    return Math.random() < 0.5
      ? color_operation.addition
      : color_operation.subtraction;
  }

  private get_color_mutation_value(
    color: number,
    operation: color_operation_type,
    multiplier: number
  ): number {
    const mutation =
      color * (Math.random() * globals.mutation_magnitude * multiplier);

    const value =
      operation === color_operation.addition
        ? color + mutation
        : color - mutation;

    return Math.ceil(value);
  }

  private get_color_mutation_multiplier(): number {
    const probability = Math.random();

    if (probability < 0.002) {
      // Há 0.2% de chance de a mutação ser grande
      return 10;
    } else if (probability < 0.008) {
      // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
      return 4;
    }
    // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
    return probability < 0.028 ? 2 : 1;
  }

  private get_color_mutation() {
    const color = this.color;
    if (Math.random() < globals.mutation_probability) {
      // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
      const colors = color
        .replace(/[^\d,]/g, "") // remover os caracteres de texto. ex: "rgb(256,20,40)"
        .split(",") // retornar um array com os elementos separados por virgula. ex: 256,20,40
        .map((color) => {
          const parsedColor = parseInt(color);
          const operation = this.get_color_operation_type(parsedColor);
          const multiplier = this.get_color_mutation_multiplier();

          return this.get_color_mutation_value(
            parsedColor,
            operation,
            multiplier
          );
        });

      return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
    }
    return color;
  }

  public mutate() {
    // raio inicial
    const offspring_initial_radius = this.get_positive_mutation(
      this.initial_radius, 0.5
    );

    // velocidade máxima
    const offspring_max_speed = this.get_positive_mutation(this.max_speed, 2);

    // força máxima
    var offspring_max_force = this.new_mutation(this.max_force, 2);

    // color
    var offspring_color = this.get_color_mutation();

    // raio de detecção inicial
    const offspring_initial_detection_radius =
      this.get_offspring_detection_radius(offspring_initial_radius, 0.5);

    // tamanho da ninhada
    const offspring_litter_interval = this.get_range_mutation(this.litter_interval);

    // dieta
    const offspring_diet = this.get_mutation_between_zero_one(this.diet, 0.1);

    // taxa metabolica
    const offspring_metabolic_rate = this.get_positive_mutation(this.metabolic_rate, 1);

    // temperatura mais baixa suportada
    const offspring_min_max_temperature_tolerated = this.get_range_mutation(this.min_max_temperature_tolerated);

    // taxa de crescimento corporal
    const offspring_body_growth_rate = this.get_mutation_between_zero_one(this.body_growth_rate, 0.1);

    // tempo de vida
    const offspring_lifespan = this.get_positive_mutation(this.lifespan, 0.5);

    // tempo até ficar maduro
    const offspring_percentage_to_mature = this.get_mutation_between_zero_one(this.percentage_to_mature, 0.1);


    return new DNA(
      offspring_initial_radius,
      offspring_max_speed,
      offspring_max_force,
      offspring_color,
      offspring_initial_detection_radius,
      offspring_litter_interval,
      this.sex,
      offspring_diet,
      offspring_metabolic_rate,
      offspring_min_max_temperature_tolerated,
      offspring_body_growth_rate,
      offspring_lifespan,
      offspring_percentage_to_mature
    );
  }


}
