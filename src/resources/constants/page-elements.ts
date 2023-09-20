const button_pause_simulation = document.getElementById(
  "button_pause_simulation"
);
const button_resume_simulation = document.getElementById(
  "button_resume_simulation"
);

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
const label_vegetable_rate = document.getElementById("num_vegetable_rate");
const label_mutation_probability = document.getElementById(
  "num_mutation_probability"
);
const label_mutation_magnitude = document.getElementById(
  "num_mutation_magnitude"
);
const label_organisms_amount = document.getElementById("output_organisms");
const label_vegetables_amount = document.getElementById("output_vegetables");

// grupos de componentes
const group_initial_inputs = document.getElementById("initial_inputs");
const group_initial_buttons = document.getElementById("initial_buttons");
const group_extra_buttons = document.getElementById("extra_buttons");
const group_extra_panel = document.getElementById("extra_panel");

export {
  button_pause_simulation,
  button_resume_simulation,
  group_extra_buttons,
  group_extra_panel,
  group_initial_buttons,
  group_initial_inputs,
  input_mutation_magnitude,
  input_mutation_probability,
  input_slider_organisms,
  input_slider_vegetables,
  input_vegetable_rate,
  label_mutation_magnitude,
  label_mutation_probability,
  label_organisms_amount,
  label_vegetable_rate,
  label_vegetables_amount,
};
