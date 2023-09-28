// botoes
export const button_pause_simulation = document.getElementById(
  "button_pause_simulation"
);
export const button_resume_simulation = document.getElementById(
  "button_resume_simulation"
);
export const button_set_default = document.getElementById("button_set_default");
export const button_start_simulation = document.getElementById(
  "button_start_simulation"
);
export const button_restart_simulation = document.getElementById(
  "button_restart_simulation"
);

// inputs iniciais
export const input_vegetable_rate = document.getElementById(
  "input_vegetable_rate"
) as HTMLInputElement | null;

export const input_mutation_probability = document.getElementById(
  "input_mutation_probability"
) as HTMLInputElement | null;

export const input_mutation_magnitude = document.getElementById(
  "input_mutation_magnitude"
) as HTMLInputElement | null;

export const input_slider_organisms = document.getElementById(
  "slider_input_organisms"
) as HTMLInputElement | null;

export const input_slider_vegetables = document.getElementById(
  "slider_input_vegetables"
) as HTMLInputElement | null;

// labels inputs iniciais
export const label_vegetable_rate = document.getElementById(
  "label_vegetable_rate"
);
export const label_mutation_probability = document.getElementById(
  "label_mutation_probability"
);
export const label_mutation_magnitude = document.getElementById(
  "label_mutation_magnitude"
);
export const label_organisms_amount =
  document.getElementById("label_organisms");
export const label_vegetables_amount =
  document.getElementById("label_vegetables");

// grupos de componentes
export const group_initial_inputs = document.getElementById("initial_inputs");
export const group_initial_buttons = document.getElementById("initial_buttons");
export const group_extra_buttons = document.getElementById("extra_buttons");
export const group_extra_panel = document.getElementById("extra_panel");

// cronometro
export const label_timer = document.getElementById("label_timer");
