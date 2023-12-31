// botoes
const button_pause_simulation = document.getElementById(
  "button_pause_simulation"
);
const button_resume_simulation = document.getElementById(
  "button_resume_simulation"
);
const button_set_default = document.getElementById("button_set_default");
const button_start_simulation = document.getElementById(
  "button_start_simulation"
);
const button_resize_chart = document.getElementById("button_resize_chart");

// inputs iniciais
const input_vegetable_rate = document.getElementById(
  "input_vegetable_rate"
) as HTMLInputElement | null;

const input_mutation_probability = document.getElementById(
  "input_mutation_probability"
) as HTMLInputElement | null;

const input_mutation_magnitude = document.getElementById(
  "input_mutation_magnitude"
) as HTMLInputElement | null;

const input_slider_organisms = document.getElementById(
  "slider_input_organisms"
) as HTMLInputElement | null;

const input_slider_vegetables = document.getElementById(
  "slider_input_vegetables"
) as HTMLInputElement | null;

// labels inputs iniciais
const label_vegetable_rate = document.getElementById("label_vegetable_rate");
const label_mutation_probability = document.getElementById(
  "label_mutation_probability"
);
const label_mutation_magnitude = document.getElementById(
  "label_mutation_magnitude"
);
const label_organisms_amount = document.getElementById("label_organisms");
const label_vegetables_amount = document.getElementById("label_vegetables");

// grupos de componentes
const group_initial_inputs = document.getElementById("initial_inputs");
const group_initial_buttons = document.getElementById("initial_buttons");
const group_extra_buttons = document.getElementById("extra_buttons");
const group_extra_panel = document.getElementById("extra_panel");

// cronometro
const label_timer = document.getElementById("label_timer");

// tabs
const tab_chart = document.getElementById("tab_graficos");

// grafico
const chart = document.getElementById("plotly-graph");
const button_population_chart = document.getElementById(
  "button_population_chart"
);
const button_detection_chart = document.getElementById(
  "button_detection_chart"
);
const button_energy_chart = document.getElementById("button_energy_chart");
const button_lifetime_chart = document.getElementById("button_lifetime_chart");
const button_speed_chart = document.getElementById("button_speed_chart");
const button_force_chart = document.getElementById("button_force_chart");
const button_maturity_chart = document.getElementById("button_maturity_chart");
const button_diet_chart = document.getElementById("button_diet_chart");
const button_size_chart = document.getElementById("button_size_chart");
const button_consumption_chart = document.getElementById(
  "button_consumption_chart"
);
