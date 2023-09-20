import { Timer } from "../../models";

export const global_timer = new Timer();

export const DEFAULT_INPUTS = {
  mutation_magnitude: "5",
  mutation_probability: "10",
  organisms_amount: "35",
  vegetables_amount: "800",
  vegetables_rate: "100",
} as const;

class GlobalPreferences {
  public mutation_magnitude = 0.1; // magnitude da mutação (o quanto vai variar)
  public mutation_probability = 0.3;
  public universe_width = 0;
  public universe_height = 0;
  public universe_size = 1;
}

export const globals = new GlobalPreferences();
