const DEFAULT_INPUTS = {
  mutation_magnitude: "5",
  mutation_probability: "10",
  organisms_amount: "10",
  vegetables_amount: "10",
  vegetables_rate: "1",
} as const;

class GlobalPreferences {
  public mutation_magnitude = 0.1; // magnitude da mutação (o quanto vai variar)
  public mutation_probability = 0.3;
  public universe_width = 0;
  public universe_height = 0;
  public universe_size = 1;
  public percentual_energy_to_eat = 0.8; // porcentagem da energia máxima acima da qual eles não comerão
  public pyodide: Pyodide | null = null;
  public luminosity_cycle_time = 180; // Tempo em segundos do ciclo dia-noite
  public luminosity: number = 0;
  public temperature: number = 0;
  public noise: number = 0;
  public tick: number = 0; // Tick temporal que alterna entre 0 e 1
  public tick_aux: number = 1; // Guarda o inverso do tick
  public tick_period: number = 5; // Guarda o número de passos (frames) que leva para alternar o tick
  public tick_step_count: number = 0; // Guarda quantos passos já passaram desde a última alteração do tick

  public count: number = 0;
}

const globals = new GlobalPreferences();
