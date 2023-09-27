import {
  DEFAULT_INPUTS,
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
} from "../resources";

interface InputDefaultRelation {
  input: HTMLInputElement | null;
  label: HTMLElement | null;
  value: string;
}

const {
  organisms_amount,
  vegetables_amount,
  mutation_magnitude,
  mutation_probability,
  vegetables_rate,
} = DEFAULT_INPUTS;

const default_list: InputDefaultRelation[] = [
  {
    input: input_slider_organisms,
    label: label_organisms_amount,
    value: organisms_amount,
  },
  {
    input: input_slider_vegetables,
    label: label_vegetables_amount,
    value: vegetables_amount,
  },
  {
    input: input_mutation_magnitude,
    label: label_mutation_magnitude,
    value: mutation_magnitude,
  },
  {
    input: input_mutation_probability,
    label: label_mutation_probability,
    value: mutation_probability,
  },
  {
    input: input_vegetable_rate,
    label: label_vegetable_rate,
    value: vegetables_rate,
  },
];

export function set_input_defaults() {
  default_list.forEach(({ input, label, value }) => {
    if (input) input.value = value;
    if (label) label.textContent = value;
  });
}
