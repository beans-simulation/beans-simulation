import {
  color_operation,
  color_operation_type,
  globals,
  sex_type,
} from "../resources";
import { generate_integer } from "../utils";

class DNA {
  public readonly initial_radius: number;
  public readonly max_speed: number;
  public readonly max_force: number;
  public readonly color: string;
  public readonly initial_detection_radius: number;
  public readonly litter_interval: number[];
  public readonly sex: sex_type;

  constructor(
    initial_radius: number,
    max_speed: number,
    max_force: number,
    color: string,
    initial_detection_radius: number,
    litter_interval: number[],
    sex: sex_type
  ) {
    this.initial_radius = initial_radius;
    this.max_speed = max_speed;
    this.max_force = max_force;
    this.color = color;
    this.initial_detection_radius = initial_detection_radius;
    this.litter_interval = litter_interval;
    this.sex = sex; // string que pode ser XX (fêmea) ou XY (macho)
  }

  private get_positive_mutation(value: number) {
    const new_value = this.new_mutation(value);
    return new_value >= 0 ? new_value : 0;
  }

  private get_offspring_detection_radius(initial_radius: number) {
    const value = this.new_mutation(this.initial_detection_radius);
    return value < initial_radius ? initial_radius : value;
  }

  private variate_litter(min: number, max: number) {
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

  private get_litter_mutation(): number[] {
    const min_litter = this.litter_interval[0];
    const max_litter = this.litter_interval[1];

    if (Math.random() < globals.mutation_probability) {
      const { min, max } = this.variate_litter(min_litter, max_litter);

      const min_mutated = min >= 0 ? min : 0;
      const max_mutated = max >= min_litter ? max : min_litter + 1;

      return [min_mutated, max_mutated];
    }

    return [min_litter, max_litter];
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

  private new_mutation(value: number) {
    // exemplo: valor = 20;  magnitude_mutacao = 0.05 || 5%
    if (Math.random() < globals.mutation_probability) {
      // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
      const multiplier = this.get_new_mutation_multiplier();
      const variation = value * globals.mutation_magnitude * multiplier;

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
      this.initial_radius
    );

    // velocidade máxima
    const offspring_max_speed = this.get_positive_mutation(this.max_speed);

    // força máxima
    var offspring_max_force = this.new_mutation(this.max_force);

    // color
    var offspring_color = this.get_color_mutation();

    // raio de detecção inicial
    const offspring_initial_detection_radius =
      this.get_offspring_detection_radius(offspring_initial_radius);

    // tamanho da ninhada
    const offspring_litter_interval = this.get_litter_mutation();

    return new DNA(
      offspring_initial_radius,
      offspring_max_speed,
      offspring_max_force,
      offspring_color,
      offspring_initial_detection_radius,
      offspring_litter_interval,
      this.sex
    );
  }
}

export { DNA };
