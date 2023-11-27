"use strict";
function loadWasmFile(url) {
    const load = async () => {
        let binary = null;
        try {
            const response = await fetch(url);
            binary = await response.arrayBuffer();
        }
        catch (ex) {
            console.error("Erro ao baixar o arquivo wasm: " + ex.message);
        }
        return binary;
    };
    return {
        binary: load(),
    };
}
var Plotly;
(function (Plotly) {
})(Plotly || (Plotly = {}));
const DEFAULT_INPUTS = {
    mutation_magnitude: "5",
    mutation_probability: "10",
    organisms_amount: "10",
    vegetables_amount: "10",
    vegetables_rate: "1",
};
class GlobalPreferences {
    constructor() {
        this.mutation_magnitude = 0.1;
        this.mutation_probability = 0.3;
        this.universe_width = 0;
        this.universe_height = 0;
        this.universe_size = 1;
        this.percentual_energy_to_eat = 0.8;
        this.pyodide = null;
        this.luminosity_cycle_time = 180;
        this.luminosity = 0;
        this.temperature = 0;
        this.noise = 0;
        this.tick = 0;
        this.tick_aux = 1;
        this.tick_period = 5;
        this.tick_step_count = 0;
    }
}
const globals = new GlobalPreferences();
const button_pause_simulation = document.getElementById("button_pause_simulation");
const button_resume_simulation = document.getElementById("button_resume_simulation");
const button_set_default = document.getElementById("button_set_default");
const button_start_simulation = document.getElementById("button_start_simulation");
const button_resize_chart = document.getElementById("button_resize_chart");
const input_vegetable_rate = document.getElementById("input_vegetable_rate");
const input_mutation_probability = document.getElementById("input_mutation_probability");
const input_mutation_magnitude = document.getElementById("input_mutation_magnitude");
const input_slider_organisms = document.getElementById("slider_input_organisms");
const input_slider_vegetables = document.getElementById("slider_input_vegetables");
const label_vegetable_rate = document.getElementById("label_vegetable_rate");
const label_mutation_probability = document.getElementById("label_mutation_probability");
const label_mutation_magnitude = document.getElementById("label_mutation_magnitude");
const label_organisms_amount = document.getElementById("label_organisms");
const label_vegetables_amount = document.getElementById("label_vegetables");
const group_initial_inputs = document.getElementById("initial_inputs");
const group_initial_buttons = document.getElementById("initial_buttons");
const group_extra_buttons = document.getElementById("extra_buttons");
const group_extra_panel = document.getElementById("extra_panel");
const label_timer = document.getElementById("label_timer");
const tab_chart = document.getElementById("tab_graficos");
const chart = document.getElementById("plotly-graph");
const button_population_chart = document.getElementById("button_population_chart");
const button_detection_chart = document.getElementById("button_detection_chart");
const button_energy_chart = document.getElementById("button_energy_chart");
const button_lifetime_chart = document.getElementById("button_lifetime_chart");
const button_speed_chart = document.getElementById("button_speed_chart");
const button_force_chart = document.getElementById("button_force_chart");
const button_maturity_chart = document.getElementById("button_maturity_chart");
const button_diet_chart = document.getElementById("button_diet_chart");
const button_size_chart = document.getElementById("button_size_chart");
const button_consumption_chart = document.getElementById("button_consumption_chart");
const color_operation = {
    addition: "add",
    subtraction: "sub",
};
const organism_status = {
    eating: "eating",
    hunting: "hunting",
    roaming: "roaming",
    running_away: "running_away",
};
const sex = {
    female: "XX",
    male: "XY",
};
function generate_integer(min, max) {
    const minimum = Math.ceil(min);
    const delta = Math.floor(max) - minimum;
    return Math.floor(Math.random() * delta) + minimum;
}
const MILLISECONDS_LIMIT = 1000;
const SECONDS_LIMIT = 60;
const MINUTES_LIMIT = 60;
class Timer {
    constructor() {
        this.time = 0;
        this.interval_milliseconds = 10;
        this.callback = undefined;
    }
    run() {
        this.time += this.interval_milliseconds;
        if (this.callback)
            this.callback(this.time, this.formatted_timer);
    }
    play(callback) {
        if (callback)
            this.callback = callback;
        this.interval = setInterval(() => this.run(), this.interval_milliseconds);
    }
    pause() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    reset() {
        this.pause();
        this.time = 0;
    }
    restart() {
        this.reset();
        this.play();
    }
    clear_callback() {
        this.callback = undefined;
    }
    formatTime(time, min_length = 2) {
        return String(time).padStart(min_length, "0");
    }
    get formatted_timer() {
        const hours = this.formatTime(this.hours);
        const minutes = this.formatTime(this.minutes);
        const seconds = this.formatTime(this.seconds);
        const milliseconds = this.formatTime(this.milliseconds, 3);
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    get hours() {
        return Math.floor(this.time / MINUTES_LIMIT / SECONDS_LIMIT / MILLISECONDS_LIMIT);
    }
    get minutes() {
        return Math.floor((this.time / SECONDS_LIMIT / MILLISECONDS_LIMIT) % MINUTES_LIMIT);
    }
    get seconds() {
        return Math.floor((this.time % (SECONDS_LIMIT * MILLISECONDS_LIMIT)) / MILLISECONDS_LIMIT);
    }
    get milliseconds() {
        return this.time % MILLISECONDS_LIMIT;
    }
    get total() {
        return this.time;
    }
    get is_paused() {
        return !this.interval;
    }
    get formatted_timer_for_chart() {
        const hours = this.hours ? this.hours + "h" : "";
        const minutes = this.minutes ? this.minutes + "m" : "";
        const seconds = this.seconds ? this.seconds + "s" : "";
        if (!hours && !minutes && !seconds) {
            return "0s";
        }
        return `${hours}${minutes}${seconds}`;
    }
}
const global_timer = new Timer();
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    magnitude_squared() {
        const x = this.x;
        const y = this.y;
        return x * x + y * y;
    }
    magnitude() {
        return Math.sqrt(this.magnitude_squared());
    }
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    subtract_new(vector) {
        const x = this.x - vector.x;
        const y = this.y - vector.y;
        return new Vector(x, y);
    }
    divide(divider) {
        this.x /= divider;
        this.y /= divider;
        return this;
    }
    multiply(multiplier) {
        this.x *= multiplier;
        this.y *= multiplier;
        return this;
    }
    normalize() {
        return this.divide(this.magnitude());
    }
    set_magnitude(multiplier) {
        return this.normalize().multiply(multiplier);
    }
    distance(vector) {
        return vector.subtract_new(this).magnitude();
    }
    limit(limit) {
        const mSq = this.magnitude_squared();
        if (mSq > limit * limit) {
            this.divide(Math.sqrt(mSq));
            this.multiply(limit);
        }
        return this;
    }
    heading_radians() {
        return Math.atan2(this.y, this.x);
    }
    heading_degrees() {
        const radians = this.heading_radians();
        return (radians * 180.0) / Math.PI;
    }
    rotate_radians(angle_radians) {
        const newHead = this.heading_radians() + angle_radians;
        const magnitude = this.magnitude();
        this.x = Math.cos(newHead) * magnitude;
        this.y = Math.sin(newHead) * magnitude;
        return this;
    }
    rotate_degrees(angle_degrees) {
        const angle_radians = (angle_degrees * Math.PI) / 180;
        return this.rotate_radians(angle_radians);
    }
    equals(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
    equalsNumber(a, b) {
        return this.x === a && this.y === b;
    }
    copy() {
        return new Vector(this.x, this.y);
    }
    get_angle_to_another_vector(other_vector) {
        const dot_product = this.x * other_vector.x + this.y * other_vector.y;
        const this_magnitude = this.magnitude();
        const other_magnitude = other_vector.magnitude();
        if (this_magnitude === 0 || other_magnitude === 0) {
            return 0;
        }
        var cos_theta = dot_product / (this_magnitude * other_magnitude);
        if (cos_theta < -1) {
            cos_theta = -1;
        }
        else if (cos_theta > 1) {
            cos_theta = 1;
        }
        const angle_radians = Math.acos(cos_theta);
        const angle_degrees = angle_radians * (180 / Math.PI);
        return angle_degrees;
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.position = new Vector(x, y);
    }
}
class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.radiusSquared = this.radius * this.radius;
    }
    contains(point) {
        return (((point.position.x - this.x) * (point.position.x - this.x)) + ((point.position.y - this.y) * (point.position.y - this.y)) <= this.radiusSquared);
    }
    intersects(range) {
        let x_dist = Math.abs(range.x - this.x);
        let y_dist = Math.abs(range.y - this.y);
        var radius = this.radius;
        var width = range.width;
        var height = range.height;
        var edges = ((x_dist - width) * (x_dist - width)) + ((y_dist - height) * (x_dist - width));
        if (x_dist > radius + width || y_dist > radius + height) {
            return false;
        }
        else if (x_dist <= width || y_dist <= height) {
            return true;
        }
        return edges <= this.radiusSquared;
    }
    display(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.lineWidth = 5;
        context.stroke();
    }
}
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    contains(point) {
        return (point.position.x >= this.x - this.width &&
            point.position.x <= this.x + this.width &&
            point.position.y >= this.y - this.height &&
            point.position.y <= this.y + this.height);
    }
    intersects(range) {
        return !(range.x - range.width > this.x + this.width ||
            range.x + range.width < this.x - this.width ||
            range.y - range.height > this.y + this.height ||
            range.y + range.height < this.y - this.height);
    }
}
class DNA {
    constructor(initial_radius, max_speed, max_force, color, initial_detection_radius, litter_interval, sex, diet, metabolic_rate, min_max_temperature_tolerated, body_growth_rate, lifespan, percentage_to_mature) {
        this.initial_radius = initial_radius;
        this.max_speed = max_speed;
        this.max_force = max_force;
        this.color = color;
        this.initial_detection_radius = initial_detection_radius;
        this.litter_interval = litter_interval;
        this.sex = sex;
        this.diet = diet;
        this.metabolic_rate = metabolic_rate;
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
        ];
    }
    get_genome() {
        return this.genome;
    }
    get_positive_mutation(value, step) {
        const new_value = this.new_mutation(value, step);
        return new_value >= 0 ? new_value : 0;
    }
    get_mutation_between_zero_one(value, step) {
        const new_value = this.new_mutation(value, step);
        if (new_value >= 1) {
            return 1;
        }
        else if (new_value <= 0) {
            return 0;
        }
        return new_value;
    }
    get_offspring_detection_radius(initial_radius, step) {
        const value = this.new_mutation(this.initial_detection_radius, step);
        return value < initial_radius ? initial_radius : value;
    }
    variate_range(min, max) {
        const maximumRange = Math.floor(globals.mutation_magnitude * 10) + 2;
        const min_variation = generate_integer(0, maximumRange);
        const max_variation = generate_integer(0, maximumRange);
        if (Math.random() >= 0.5) {
            return {
                min: min + min_variation,
                max: max + max_variation,
            };
        }
        return {
            min: min - min_variation,
            max: max - max_variation,
        };
    }
    get_range_mutation(values_array) {
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
    get_new_mutation_multiplier() {
        const probability = Math.random();
        if (probability < 0.001) {
            return 10;
        }
        if (probability < 0.003) {
            return 6;
        }
        if (probability < 0.008) {
            return 3.5;
        }
        return probability < 0.028 ? 2 : 1;
    }
    get_minimum(value, variation) {
        const minimum = value - variation;
        return minimum <= 0 ? value * 0.01 : minimum;
    }
    new_mutation(value, step) {
        if (Math.random() < globals.mutation_probability) {
            const multiplier = this.get_new_mutation_multiplier();
            const variation = value + Math.random() * step * globals.mutation_magnitude * multiplier;
            const minimum = this.get_minimum(value, variation);
            const double_variation = variation * 2;
            return minimum + Math.random() * double_variation;
        }
        else {
            return value;
        }
    }
    get_color_operation_type(color) {
        const min = 10;
        const max = 245;
        if (color <= min) {
            return color_operation.addition;
        }
        else if (color >= max) {
            return color_operation.subtraction;
        }
        return Math.random() < 0.5
            ? color_operation.addition
            : color_operation.subtraction;
    }
    get_color_mutation_value(color, operation, multiplier) {
        const mutation = color * (Math.random() * globals.mutation_magnitude * multiplier);
        const value = operation === color_operation.addition
            ? color + mutation
            : color - mutation;
        return Math.ceil(value);
    }
    get_color_mutation_multiplier() {
        const probability = Math.random();
        if (probability < 0.002) {
            return 10;
        }
        else if (probability < 0.008) {
            return 4;
        }
        return probability < 0.028 ? 2 : 1;
    }
    get_color_mutation() {
        const color = this.color;
        if (Math.random() < globals.mutation_probability) {
            const colors = color
                .replace(/[^\d,]/g, "")
                .split(",")
                .map((color) => {
                const parsedColor = parseInt(color);
                const operation = this.get_color_operation_type(parsedColor);
                const multiplier = this.get_color_mutation_multiplier();
                return this.get_color_mutation_value(parsedColor, operation, multiplier);
            });
            return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
        }
        return color;
    }
    mutate() {
        const offspring_initial_radius = this.get_positive_mutation(this.initial_radius, 0.5);
        const offspring_max_speed = this.get_positive_mutation(this.max_speed, 2);
        var offspring_max_force = this.new_mutation(this.max_force, 2);
        var offspring_color = this.get_color_mutation();
        const offspring_initial_detection_radius = this.get_offspring_detection_radius(offspring_initial_radius, 0.5);
        const offspring_litter_interval = this.get_range_mutation(this.litter_interval);
        const offspring_diet = this.get_mutation_between_zero_one(this.diet, 0.1);
        const offspring_metabolic_rate = this.get_positive_mutation(this.metabolic_rate, 1);
        const offspring_min_max_temperature_tolerated = this.get_range_mutation(this.min_max_temperature_tolerated);
        const offspring_body_growth_rate = this.get_mutation_between_zero_one(this.body_growth_rate, 0.1);
        const offspring_lifespan = this.get_positive_mutation(this.lifespan, 0.5);
        const offspring_percentage_to_mature = this.get_mutation_between_zero_one(this.percentage_to_mature, 0.1);
        return new DNA(offspring_initial_radius, offspring_max_speed, offspring_max_force, offspring_color, offspring_initial_detection_radius, offspring_litter_interval, this.sex, offspring_diet, offspring_metabolic_rate, offspring_min_max_temperature_tolerated, offspring_body_growth_rate, offspring_lifespan, offspring_percentage_to_mature);
    }
}
class Info {
    constructor() {
        this.population = [];
        this.speed = [];
        this.agility = [];
        this.radius = [];
        this.detection = [];
        this.energy = [];
        this.energy_expenditure = [];
        this.avg_litter_size = [];
    }
    clear() {
        this.population.length = 0;
        this.speed.length = 0;
        this.agility.length = 0;
        this.radius.length = 0;
        this.detection.length = 0;
        this.energy.length = 0;
        this.energy_expenditure.length = 0;
        this.avg_litter_size.length = 0;
    }
}
class ChartHistory {
    constructor() {
        this.organisms = new Info();
        this.seconds = [];
        this.vegetables_per_seconds = [];
    }
    clear() {
        this.organisms.clear();
        this.seconds.length = 0;
    }
}
class Vegetable extends Point {
    constructor(x, y, radius) {
        super(x, y);
        this.position = new Vector(x, y);
        this.radius = radius;
        this.energy = Math.floor(Math.PI * (this.radius * this.radius)) * 15;
        Vegetable.vegetables.push(this);
        Vegetable.id++;
    }
    display(context) {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = "rgb(115, 158, 115)";
        context.fill();
    }
    checkId(id) {
        return id === Vegetable.id;
    }
    kill() {
        Vegetable.vegetables = Vegetable.vegetables.filter((item) => item !== this);
    }
}
Vegetable.vegetables = [];
Vegetable.id = 0;
const EAT_DISTANCE = 5;
class Organism extends Point {
    constructor(x, y, dna, neural_network_id, parent_id) {
        super(x, y);
        this.acceleration = new Vector(0, 0);
        this.border_distance_until_make_curves = 20;
        this.circle_radius = 1;
        this.consumed_energy_rate = 0;
        this.distance_make_circle = 2;
        this.health = 85;
        this.maturity = 0;
        this.food_eaten = 0;
        this.is_eating = false;
        this.is_reproducing = false;
        this.is_roaming = false;
        this.is_rotating = false;
        this.is_running_away = false;
        this.is_ready_to_reproduce = true;
        this.is_organism_dead = 0;
        this.litter_size = 0;
        this.procreation_count = 0;
        this.procreation_probability = 0.5;
        this.roaming_angle = Math.random() * 360;
        this.sexual_maturity = 0;
        this.speed = new Vector(0.0001, 0.0001);
        this.add_time_to_reproduction = 1;
        this.time_to_unlock_next_meal_miliseconds = 0;
        this.add_time_to_meal = 3;
        this.index_closest_food = -1;
        this.distance_closest_food = -1;
        this.angle_target_food = -1;
        this.closest_target = null;
        this.distance_closest_target = -1;
        this.angle_target_signal = 0;
        this.angle_closest_food = 0;
        this.closest_food = null;
        this.angle_closest_organism = 0;
        this.distance_closest_organism = 0;
        this.closest_organism = null;
        this.id = Organism.id++;
        this.position = new Vector(x, y);
        if (parent_id) {
            this.parent_id = parent_id;
        }
        this.initial_radius = dna.initial_radius;
        this.max_speed = dna.max_speed;
        this.max_force = dna.max_force;
        this.color = dna.color;
        this.initial_detection_radius = dna.initial_detection_radius;
        this.litter_interval = dna.litter_interval;
        this.sex = dna.sex;
        this.diet = dna.diet;
        this.metabolic_rate = dna.metabolic_rate;
        this.min_max_temperature_tolerated = dna.min_max_temperature_tolerated;
        this.body_growth_rate = dna.body_growth_rate;
        this.lifespan = dna.lifespan;
        this.percentage_to_mature = dna.percentage_to_mature;
        this.lifetime_in_miliseconds = this.lifespan * 1000;
        this.diet_variant = generate_float(0, 1);
        this.radius = this.initial_radius;
        this.minimal_consumption = 0.0032 * ((this.radius * this.radius) ** 0.75);
        this.max_energy_consumption_rate = this.minimal_consumption + ((this.initial_radius * 1.5) * (this.initial_radius * 1.5)) * (this.max_speed * this.max_speed) * 0.00012;
        this.status = organism_status.roaming;
        this.dna = dna;
        this.other_color = this.get_other_color(this.color);
        this.detection_radius = this.initial_detection_radius;
        this.max_energy = (this.radius * this.radius) * 6;
        this.fixed_max_energy = (this.initial_radius * 1.5 * this.initial_radius * 1.5) * 6;
        this.birth_moment_in_milliseconds = global_timer.total;
        this.time_to_unlock_next_reproduction_miliseconds = (this.birth_moment_in_milliseconds) + this.add_time_to_reproduction * 1000;
        this.time_to_maturity_in_seconds = this.lifetime_in_miliseconds * this.percentage_to_mature / 1000;
        this.neural_network_id = neural_network_id;
        this.input_neurons_list = [];
        if (globals.pyodide) {
            globals.pyodide.runPython(`
        import json

        this_nn_id = json.loads('${JSON.stringify(this.neural_network_id)}')

        # Pegando a redes através do ID
        this_nn = neural_network.NeuralNetwork.neural_networks.get(f"{this_nn_id}")
        input_neurons = [neuron.name for neuron in this_nn.neurons if neuron.neuron_type == "Input"]

      `);
            this.input_neurons_list = globals.pyodide.globals.get('input_neurons');
        }
        if (parent_id) {
            this.energy =
                this.max_energy *
                    (0.75 + Math.random() / 4) * 0.6;
        }
        else {
            this.energy = this.max_energy * 0.75;
        }
        Organism.organisms.push(this);
    }
    get_other_color(color) {
        var _a;
        const multiplied_colors = (_a = color
            .match(/\d+/)) === null || _a === void 0 ? void 0 : _a.map((c) => Math.floor(parseInt(c) * 0.4));
        return `rgba(${multiplied_colors === null || multiplied_colors === void 0 ? void 0 : multiplied_colors.join(",")})`;
    }
    create_child(offspring_dna, neural_network_id, parent_id) {
        this.procreation_count++;
        const offspring = new Organism(this.position.x, this.position.y, offspring_dna, neural_network_id, parent_id);
        this.childrenIds ? this.childrenIds.push(offspring.id) : [offspring.id];
        offspring.time_to_unlock_next_meal_miliseconds = (this.get_time_alive_in_seconds() + this.add_time_to_meal) * 1000;
        return offspring;
    }
    change_status(status) {
        if (this.status !== status) {
            this.status = status;
        }
    }
    assexually_procreate() {
        const offspring_dna = this.dna.mutate();
        return this.create_child(offspring_dna, null, [this.id]);
    }
    sexually_procreate(qtree, vision) {
        let current_organism_genome = this.dna.get_genome();
        let [min_distance, possible_partners, closest_index] = this.find_close_partners(qtree, vision);
        if (possible_partners.length > 0) {
            let partner = possible_partners[closest_index];
            let partner_genome = partner.dna.get_genome();
            if (this.approach_partner(min_distance, possible_partners, closest_index)) {
                this.is_reproducing = true;
                partner.is_reproducing = true;
                this.litter_size = generate_integer(this.litter_interval[0], this.litter_interval[1] + 1);
                for (var i = 0; i < this.litter_size; i++) {
                    if (Math.random() < 1) {
                        let offspring_dna = this.crossover_dnas(current_organism_genome, partner_genome);
                        const offspring_dna_mutated = offspring_dna.mutate();
                        const this_nn_id = this.neural_network_id;
                        const partner_nn_id = partner.neural_network_id;
                        const this_nn_id_JSON = JSON.stringify(this_nn_id);
                        const partner_nn_id_JSON = JSON.stringify(partner_nn_id);
                        if (globals.pyodide) {
                            globals.pyodide.runPython(`
                import json

                this_nn_id = json.loads('${this_nn_id_JSON}')
                partner_nn_id = json.loads('${partner_nn_id_JSON}')

                # Pegando as redes através de seus IDs
                this_nn = neural_network.NeuralNetwork.neural_networks.get(f"{this_nn_id}")
                partner_nn = neural_network.NeuralNetwork.neural_networks.get(f"{partner_nn_id}")

                # Criando a rede filha
                child_nn = neural_network.breed_neural_networks(this_nn, partner_nn)

                child_nn_id = child_nn.id

              `);
                            this.create_child(offspring_dna_mutated, globals.pyodide.globals.get('child_nn_id'), [this.id, partner.id]);
                        }
                    }
                }
                this.energy = (this.energy / 2);
                this.is_reproducing = false;
                partner.energy = (partner.energy / 2);
                partner.is_reproducing = false;
                this.time_to_unlock_next_reproduction_miliseconds = (this.get_time_alive_in_seconds() + this.add_time_to_reproduction) * 1000;
                this.time_to_unlock_next_meal_miliseconds = (this.get_time_alive_in_seconds() + this.add_time_to_meal) * 1000;
            }
        }
    }
    get_time_alive_in_seconds() {
        return (global_timer.total - this.birth_moment_in_milliseconds) / 1000;
    }
    update(context) {
        var speed_magnitude = this.speed.magnitude();
        if (speed_magnitude > this.max_speed) {
            speed_magnitude = this.max_speed;
        }
        this.consumed_energy_rate = (this.radius * this.radius) * (speed_magnitude * speed_magnitude) * 0.0002;
        const achieved_age_limit = global_timer.total - this.birth_moment_in_milliseconds >
            this.lifetime_in_miliseconds;
        const time_alive = this.get_time_alive_in_seconds();
        if (this.energy > 0 && !achieved_age_limit && this.min_max_temperature_tolerated[0] <= globals.temperature && this.min_max_temperature_tolerated[1] >= globals.temperature) {
            this.energy -= this.consumed_energy_rate + this.minimal_consumption * this.metabolic_rate;
        }
        else {
            if (this.energy <= 0) {
                console.log(`O indivíduo ${this.id} veio a falecer de fome :(`);
            }
            else if (achieved_age_limit) {
                console.log(`O indivíduo ${this.id} tava velho e morreu de velhice...`);
            }
            else if (globals.temperature < this.min_max_temperature_tolerated[0]) {
                console.log(`O indivíduo ${this.id} morreu de hipotermia pq fez muito muito frio pra ele... :{`);
            }
            else if (globals.temperature > this.min_max_temperature_tolerated[1]) {
                console.log(`O indivíduo ${this.id} simplesmente derreteu devido ao calor... :{`);
            }
            else {
                console.log(`O indivíduo ${this.id} foi de drake e josh, foi de americanas, foi de arrasta pra cima`);
            }
            return 1;
        }
        this.health = 85;
        this.avoid_space_limits();
        if (this.maturity < 1) {
            const maturity = time_alive / this.time_to_maturity_in_seconds;
            if (maturity > 1) {
                this.maturity = 1;
            }
            else if (maturity < 0) {
                this.maturity = 0;
            }
            else {
                this.maturity = maturity;
            }
        }
        this.create_space_delimitation();
        this.speed.add(this.acceleration);
        this.speed.limit(this.max_speed);
        this.position.add(this.speed);
        this.acceleration.multiply(0);
        this.display(context);
        return 0;
    }
    increase_size() {
        const max_radius = this.initial_radius * 1.5;
        if (this.radius < max_radius) {
            this.radius = this.radius + this.radius * this.body_growth_rate;
        }
        this.max_energy = (this.radius * this.radius) * 6;
    }
    get nearRightBorder() {
        return (this.position.x + this.radius >
            globals.universe_width - this.border_distance_until_make_curves);
    }
    get nearLeftBorder() {
        return (this.position.x - this.radius < this.border_distance_until_make_curves);
    }
    get nearBottom() {
        return (this.position.y + this.radius >
            globals.universe_height - this.border_distance_until_make_curves);
    }
    get nearTop() {
        return (this.position.y - this.radius < this.border_distance_until_make_curves);
    }
    get_desired_speed_to_avoid_borders() {
        if (this.nearLeftBorder) {
            this.speed.x = this.speed.x * -1;
            return new Vector(this.max_speed, this.speed.y);
        }
        if (this.nearRightBorder) {
            this.speed.x = this.speed.x * -1;
            return new Vector(-this.max_speed, this.speed.y);
        }
        if (this.nearTop) {
            this.speed.y = this.speed.y * -1;
            return new Vector(this.speed.x, this.max_speed);
        }
        if (this.nearBottom) {
            this.speed.y = this.speed.y * -1;
            return new Vector(this.speed.x, -this.max_speed);
        }
        return null;
    }
    create_space_delimitation() {
        this.create_canvas_space_delimitation();
        this.avoid_space_limits();
    }
    create_canvas_space_delimitation() {
        if (this.position.x + 2 * this.radius > globals.universe_width)
            this.speed.x = this.speed.x * -1;
        if (this.position.x - this.radius < 0)
            this.speed.x = this.speed.x * -1;
        if (this.position.y + this.radius > globals.universe_height)
            this.speed.y = this.speed.y * -1;
        if (this.position.y < 0)
            this.speed.y = this.speed.y * -1;
    }
    avoid_space_limits() {
        const desired_speed = this.get_desired_speed_to_avoid_borders();
        if (desired_speed) {
            desired_speed
                .normalize()
                .multiply(this.max_speed);
            const redirection = desired_speed
                .subtract_new(this.speed)
                .limit(this.max_force * 100);
            this.apply_force(redirection);
        }
    }
    apply_force(force) {
        this.acceleration.add(force);
    }
    detect_predator(qtree, vision) {
        this.is_running_away = false;
        let [min_distance, close_organisms, closest_index] = find_nearby_element(qtree, vision, this);
        if (min_distance <= this.detection_radius * this.detection_radius) {
            if (close_organisms.length !== 0) {
                this.run_away(close_organisms[closest_index]);
            }
        }
    }
    run_away(target) {
        let desired_speed = {
            x: target.position.x - this.position.x,
            y: target.position.y - this.position.y,
        };
        desired_speed.x = -desired_speed.x;
        desired_speed.y = -desired_speed.y;
        let magnitude = Math.sqrt(desired_speed.x ** 2 + desired_speed.y ** 2);
        desired_speed.x = (desired_speed.x / magnitude) * this.max_speed;
        desired_speed.y = (desired_speed.y / magnitude) * this.max_speed;
        let redirection = {
            x: desired_speed.x - this.speed.x,
            y: desired_speed.y - this.speed.y,
        };
        let redirectionMagnitude = Math.sqrt(redirection.x ** 2 + redirection.y ** 2);
        if (redirectionMagnitude > this.max_force) {
            redirection.x = (redirection.x / redirectionMagnitude) * this.max_force;
            redirection.y = (redirection.y / redirectionMagnitude) * this.max_force;
        }
        this.apply_force(new Vector(redirection.x, redirection.y));
    }
    search_for_vegetable(qtree, vision) {
        this.is_ready_to_reproduce = false;
        this.is_eating = false;
        const is_searching_vegetable = true;
        let [min_distance, nearby_vegetables, closest_index] = find_nearby_element(qtree, vision, this, is_searching_vegetable);
        if (min_distance <= this.detection_radius * this.detection_radius) {
            this.is_eating = true;
            this.is_roaming = false;
            if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
                this.eat_vegetable(nearby_vegetables[closest_index]);
            }
            else if (nearby_vegetables.length !== 0) {
                this.pursue(nearby_vegetables[closest_index]);
            }
        }
    }
    eat_vegetable(vegetable) {
        this.food_eaten++;
        if (this.max_energy - this.energy >= vegetable.energy * 0.1) {
            this.energy += vegetable.energy * 0.1;
        }
        else {
            this.energy = this.max_energy;
        }
        if (this.energy > this.max_energy) {
            this.energy = this.max_energy;
        }
        Vegetable.vegetables = Vegetable.vegetables.filter((item) => item !== vegetable);
        this.increase_size();
    }
    hunt(qtree, vision) {
        this.is_eating = false;
        let [min_distance, close_organisms, closest_index] = find_nearby_element(qtree, vision, this);
        if (min_distance <= this.detection_radius * this.detection_radius) {
            this.is_eating = true;
            this.is_roaming = false;
            if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
                this.eat_organism(close_organisms[closest_index]);
            }
            else if (close_organisms.length != 0) {
                this.pursue(close_organisms[closest_index]);
            }
        }
    }
    eat_organism(organism) {
        if (this.max_energy - this.energy >= organism.max_energy * 0.1) {
            this.energy += organism.max_energy * 0.2;
        }
        else {
            this.energy = this.max_energy;
        }
        if (this.energy > this.max_energy) {
            this.energy = this.max_energy;
        }
        console.log(`O organismo ${organism.id} foi simplesmente AMASSADO, comido, devorado, papado`);
        organism.kill();
        this.increase_size();
        this.food_eaten++;
    }
    eat(element) {
        if (this.max_energy - this.energy >= element.energy * 0.1) {
            this.energy += element.energy * 0.1;
        }
        else {
            this.energy = this.max_energy;
        }
        if (this.energy > this.max_energy) {
            this.energy = this.max_energy;
        }
        if (element instanceof Organism) {
            console.log(`O organismo ${element.id} foi simplesmente AMASSADO, comido, devorado, papado pelo organismo ${this.id}`);
        }
        if (element && Organism.organisms.includes(this)) {
            element.kill();
        }
        this.increase_size();
        this.food_eaten++;
        this.diet_variant = generate_float(0, 1);
    }
    roam() {
        this.change_status(organism_status.roaming);
        this.is_roaming = true;
        const circle_center = this.speed
            .copy()
            .normalize()
            .multiply(this.distance_make_circle);
        const movement = new Vector(0, -1)
            .multiply(this.circle_radius)
            .rotate_degrees(this.roaming_angle);
        this.roaming_angle += Math.random() * 30 - 15;
        const roaming_force = circle_center.add(movement);
        if (this.is_eating || this.is_running_away || this.is_ready_to_reproduce || this.is_reproducing || this.is_rotating) {
            roaming_force.multiply(0.03);
        }
        this.apply_force(roaming_force.multiply(0.2));
    }
    pursue(target, to_reproduce = false) {
        if (target instanceof Organism && !to_reproduce) {
            target.is_running_away = true;
        }
        let desired_speed = target.position.subtract_new(this.position);
        desired_speed.set_magnitude(this.max_speed);
        let redirection = desired_speed.subtract_new(this.speed);
        redirection.limit(this.max_force);
        const rotation_value = get_angle_to_closest_element(this, target) * 0.5;
        this.speed.rotate_degrees(rotation_value);
        this.apply_force(redirection);
    }
    find_close_partners(qtree, vision) {
        this.is_eating = false;
        let min_distance = Infinity;
        let closest_index = -1;
        let possible_partners = qtree.search_elements(vision, this.id);
        possible_partners = possible_partners.filter((partner) => {
            let partner_organism = partner;
            return !partner_organism.is_reproducing && partner_organism.is_ready_to_reproduce;
        });
        for (let i = possible_partners.length - 1; i >= 0; i--) {
            const dx = this.position.x - possible_partners[i].position.x;
            const dy = this.position.y - possible_partners[i].position.y;
            let d2 = (dx * dx) + (dy * dy);
            if (d2 <= min_distance) {
                min_distance = d2;
                closest_index = i;
            }
        }
        return [min_distance, possible_partners, closest_index];
    }
    approach_partner(min_distance, close_organisms, closest_index) {
        const partner = close_organisms[closest_index];
        if (min_distance <= this.detection_radius * this.detection_radius && (partner.is_ready_to_reproduce)) {
            this.is_roaming = false;
            this.is_eating = false;
            if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
                return true;
            }
            else if (close_organisms.length != 0) {
                this.pursue(partner, true);
            }
        }
        return false;
    }
    n_points_cut(parent_a, parent_b, n_points) {
        let parents_indexes = Array.from({ length: parent_a.length - 1 }, (_, i) => i);
        let random_indexes = [];
        for (let i = 0; i < n_points; i++) {
            let random_chosen_index = Math.floor(Math.random() * parents_indexes.length);
            random_indexes.push(parents_indexes[random_chosen_index]);
            parents_indexes.splice(random_chosen_index, 1);
        }
        random_indexes.sort();
        return random_indexes;
    }
    get_random_parents(parent_a, parent_b) {
        if (Math.random() < 0.5) {
            return { first_parent: parent_a, second_parent: parent_b };
        }
        return { first_parent: parent_b, second_parent: parent_a };
    }
    crossover_dnas(parent_a, parent_b, n_points = 1) {
        const random_indexes = this.n_points_cut(parent_a, parent_b, n_points);
        const { first_parent, second_parent } = this.get_random_parents(parent_a, parent_b);
        const parent_order = Array.from({ length: n_points + 1 }, (_, i) => i % 2 === 0 ? first_parent : second_parent);
        const genome_aux = [];
        let last_index = 0;
        for (let i = 0; i <= n_points; i++) {
            const current_parent = parent_order[i];
            const end_at = random_indexes[i];
            let cut = [];
            if (i !== 0 && i !== n_points) {
                cut = current_parent.slice(last_index + 1, end_at + 1);
            }
            else if (i === n_points) {
                cut = current_parent.slice(last_index + 1, current_parent.length);
            }
            else {
                cut = current_parent.slice(last_index, end_at + 1);
            }
            genome_aux.push(...cut);
            last_index = end_at;
        }
        const child_genome = genome_aux;
        return new DNA(...child_genome);
    }
    is_dead() {
        return this.energy <= 0;
    }
    static remove(organism_ids) {
        const filtered = Organism.organisms.filter((organism) => !organism_ids.includes(organism.id));
        Organism.organisms = filtered;
        return filtered;
    }
    kill() {
        if (globals.pyodide) {
            globals.pyodide.runPython(`
        import json

        this_nn_id = json.loads('${JSON.stringify(this.neural_network_id)}')

        # Deletando a rede através do ID
        neural_network.NeuralNetwork.neural_networks.pop(f"{this_nn_id}")
      `);
        }
        Organism.organisms = Organism.organisms.filter((item) => item !== this);
    }
    checaId(id) {
        return id === this.id;
    }
    display(context) {
        context.beginPath();
        context.ellipse(this.position.x, this.position.y, this.radius * 0.7, this.radius * 1.1, this.speed.heading_radians() - Math.PI / 2, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.lineWidth = 2;
        context.strokeStyle = this.color;
        context.stroke();
        context.fill();
    }
}
Organism.organisms = [];
Organism.id = 0;
class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }
    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let width = this.boundary.width / 2;
        let height = this.boundary.height / 2;
        let northeast = new Rectangle(x + width, y - height, width, height);
        this.northeast = new QuadTree(northeast, this.capacity);
        let northwest = new Rectangle(x - width, y - height, width, height);
        this.northwest = new QuadTree(northwest, this.capacity);
        let southeast = new Rectangle(x + width, y + height, width, height);
        this.southeast = new QuadTree(southeast, this.capacity);
        let southwest = new Rectangle(x - width, y + height, width, height);
        this.southwest = new QuadTree(southwest, this.capacity);
        this.divided = true;
    }
    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }
        if (!this.divided) {
            this.subdivide();
            for (let p of this.points) {
                (this.northeast.insert(p) || this.northwest.insert(p) ||
                    this.southeast.insert(p) || this.southwest.insert(p));
            }
        }
        const inserted = this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point);
        if (inserted) {
            this.points.length = 0;
        }
        return inserted;
    }
    search(range, found) {
        if (!found) {
            found = [];
        }
        if (!range.intersects(this.boundary)) {
            return found;
        }
        for (let point of this.points) {
            if (range.contains(point) && !found.includes(point)) {
                found.push(point);
            }
        }
        if (this.divided) {
            this.northwest.search(range, found);
            this.northeast.search(range, found);
            this.southwest.search(range, found);
            this.southeast.search(range, found);
        }
        return found;
    }
    display(context) {
        context.beginPath();
        context.rect(this.boundary.x - this.boundary.width, this.boundary.y - this.boundary.height, this.boundary.width * 2, this.boundary.height * 2);
        context.stroke();
        if (this.divided) {
            this.northeast.display(context);
            this.northwest.display(context);
            this.southeast.display(context);
            this.southwest.display(context);
        }
    }
}
class VegetableQuadTree extends QuadTree {
    constructor(boundary, capacity) {
        super(boundary, capacity);
    }
    is_vegetable(point) {
        return !!(point === null || point === void 0 ? void 0 : point.vegetables);
    }
    search_elements(vision) {
        const found = super.search(vision);
        return found;
    }
}
class OrganismQuadTree extends QuadTree {
    constructor(boundary, capacity) {
        super(boundary, capacity);
    }
    search_elements(vision, self_id) {
        const found = super.search(vision);
        return found.filter(organism => {
            if (organism instanceof Organism) {
                return organism.id != self_id;
            }
        });
    }
}
function create_background(context) {
    context.clearRect(0, 0, globals.universe_width, globals.universe_height);
    context.beginPath();
    context.moveTo(-3, -4);
    context.lineTo(globals.universe_width + 3, -3);
    context.lineTo(globals.universe_width + 3, globals.universe_height + 3);
    context.lineTo(-3, globals.universe_height + 3);
    context.lineTo(-3, -3);
    context.strokeStyle = "white";
    context.stroke();
}
function is_close_to_target(organism, distance_closest_target) {
    const detection_radius_squared = organism.detection_radius ** 2;
    const eat_distance_squared = EAT_DISTANCE ** 2;
    return (distance_closest_target <=
        (detection_radius_squared < eat_distance_squared
            ? detection_radius_squared
            : eat_distance_squared));
}
function accelerate(value, organism) {
    if (value == 0) {
        return;
    }
    let speed_copy = organism.speed.copy();
    speed_copy = speed_copy.normalize().multiply(value);
    organism.speed = organism.speed.add(speed_copy);
}
function rotate(value, organism) {
    if (value == 0) {
        return;
    }
    organism.speed.rotate_degrees(value);
}
function desireToEat(value, organism) {
    const can_eat = organism.time_to_unlock_next_meal_miliseconds <= global_timer.total;
    if (value == 0 || !can_eat) {
        return;
    }
    organism.is_eating = true;
    if (organism.closest_target) {
        if (is_close_to_target(organism, organism.distance_closest_target)) {
            organism.eat(organism.closest_target);
        }
    }
    else {
        if (organism.energy < organism.max_energy * 0.1) {
            if (organism.closest_food) {
                if (is_close_to_target(organism, organism.distance_closest_food)) {
                    organism.eat(organism.closest_food);
                }
            }
            else if (organism.closest_organism) {
                if (is_close_to_target(organism, organism.distance_closest_organism)) {
                    organism.eat(organism.closest_organism);
                }
            }
        }
    }
    organism.is_eating = false;
}
const map_outputs_from_net = {
    Accelerate: accelerate,
    Rotate: rotate,
};
function animate(context) {
    if (!global_timer.is_paused && context && globals.pyodide) {
        const pyodide = globals.pyodide;
        requestAnimationFrame(() => animate(context));
        create_background(context);
        const canvasRectangle = new Rectangle(globals.universe_width / 2, globals.universe_height / 2, globals.universe_width / 2, globals.universe_height / 2);
        const qtreeVegetables = new VegetableQuadTree(canvasRectangle, 10);
        const qtreeOrganisms = new OrganismQuadTree(canvasRectangle, 10);
        set_luminosity();
        set_temperature();
        add_tick_step();
        Vegetable.vegetables.forEach((vegetable) => {
            vegetable.display(context);
            qtreeVegetables.insert(vegetable);
        });
        Organism.organisms.forEach((organism) => {
            qtreeOrganisms.insert(organism);
        });
        Organism.organisms.forEach((organism) => {
            if (organism.update(context) === 1) {
                organism.kill();
                return;
            }
            let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);
            const values = get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision);
            const valuesJSON = JSON.stringify(values);
            const network_id_JSON = JSON.stringify(organism.neural_network_id);
            pyodide.runPython(`
        import json

        # Desserializa 'values' para um dicionário
        input_values = json.loads('${valuesJSON}')
        network_id = json.loads('${network_id_JSON}')

        if(neural_network.NeuralNetwork.neural_networks.get(f"{network_id}")):
          output_nn = neural_network.NeuralNetwork.neural_networks.get(f"{network_id}").feed_forward(input_values)
      `);
            let output = pyodide.globals.get("output_nn").toJs();
            for (const [key, value] of output) {
                if (map_outputs_from_net[key]) {
                    map_outputs_from_net[key](value, organism, output);
                }
            }
            const desire_to_reproduce = output.get("DesireToReproduce");
            const desire_to_eat = output.get("DesireToEat");
            var can_reproduce = organism.time_to_unlock_next_reproduction_miliseconds <=
                global_timer.total;
            organism.is_ready_to_reproduce =
                desire_to_reproduce == 1 &&
                    organism.maturity == 1 &&
                    organism.energy > organism.max_energy * 0.2;
            if (can_reproduce && organism.is_ready_to_reproduce) {
                return organism.sexually_procreate(qtreeOrganisms, vision);
            }
            desireToEat(desire_to_eat, organism);
        });
    }
}
const AMOUNT_OF_TRACES = 10;
const trace_model = {
    x: [],
    y: [],
    mode: "lines+markers",
    visible: false,
    type: "scatter",
    name: "",
};
const labels = [
    {
        title: "População",
        yaxis: {
            title: "Número de organismos",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Velocidade média",
        yaxis: {
            title: "Velocidade",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Dieta",
        yaxis: {
            title: "Carnivoria",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Força",
        yaxis: {
            title: "Força",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Energia máxima",
        yaxis: {
            title: "Energia",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Gasto energético",
        yaxis: {
            title: "Energia",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Raio de detecção",
        yaxis: {
            title: "Raio",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Tempo de vida médio",
        yaxis: {
            title: "Milisegundos",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Maturidade sexual",
        yaxis: {
            title: "Maturidade",
            showline: true,
            rangemode: "tozero",
        },
    },
    {
        title: "Tamanho médio",
        yaxis: {
            title: "Raio",
            showline: true,
            rangemode: "tozero",
        },
    },
];
const hide_line = { visible: false };
const show_line = { visible: true };
const line_numbers = Array.from({ length: AMOUNT_OF_TRACES }).map((_, i) => i);
const layout = Object.assign(Object.assign({}, labels[0]), { xaxis: {
        title: "Tempo",
        showline: true,
        domain: [0],
        showgrid: true,
        rangemode: "tozero",
    }, legend: {
        orientation: "h",
        traceorder: "reversed",
        x: 0.05,
        y: -0.3,
    }, plot_bgcolor: "#222", paper_bgcolor: "#222", font: {
        color: "#ddd",
    } });
function reset_chart() {
    if (chart) {
        const traces = line_numbers.map(() => JSON.parse(JSON.stringify(trace_model)));
        Plotly.purge(chart);
        traces[0].visible = true;
        Plotly.newPlot(chart, traces, layout, { responsive: true });
        console.log(traces);
    }
}
reset_chart();
function get_show_line_function(lineIndexes, label) {
    const lines_to_hide = line_numbers.filter((num) => !lineIndexes.includes(num));
    return function () {
        if (!chart)
            return;
        Plotly.relayout(chart, label);
        Plotly.restyle(chart, show_line, lineIndexes);
        Plotly.restyle(chart, hide_line, lines_to_hide);
    };
}
const show_population_chart = get_show_line_function([0], labels[0]);
const show_speed_chart = get_show_line_function([1], labels[1]);
const show_diet_chart = get_show_line_function([2], labels[2]);
const show_force_chart = get_show_line_function([3], labels[3]);
const show_energy_chart = get_show_line_function([4], labels[4]);
const show_consumption_chart = get_show_line_function([5], labels[5]);
const show_detection_chart = get_show_line_function([6], labels[6]);
const show_lifetime_chart = get_show_line_function([7], labels[7]);
const show_maturity_chart = get_show_line_function([8], labels[8]);
const show_size_chart = get_show_line_function([9], labels[9]);
function fill_data_by_organism(organism, data) {
    const { sum } = data;
    sum.detection_radius += organism.detection_radius;
    sum.diet += organism.diet;
    sum.energy_consumption += organism.max_energy_consumption_rate;
    sum.energy += organism.max_energy;
    sum.force += organism.max_force;
    sum.lifetime += organism.lifetime_in_miliseconds;
    sum.maturity += organism.maturity;
    sum.radius += organism.radius;
    sum.speed += organism.max_speed;
}
function formatChartData(data_by_organism) {
    const { sum, time } = data_by_organism;
    const number_of_organisms = Organism.organisms.length;
    return {
        population: number_of_organisms,
        time,
        average: {
            detection_radius: sum.detection_radius / number_of_organisms,
            diet: sum.diet / number_of_organisms,
            energy_consumption: sum.energy_consumption / number_of_organisms,
            energy: sum.energy / number_of_organisms,
            force: sum.force / number_of_organisms,
            lifetime: sum.lifetime / number_of_organisms,
            maturity: sum.maturity / number_of_organisms,
            size: sum.radius / number_of_organisms,
            speed: sum.speed / number_of_organisms,
        },
    };
}
async function updateChart(data_by_organism) {
    if (!chart)
        return;
    const formatedData = formatChartData(data_by_organism);
    const x = line_numbers.map(() => [formatedData.time]);
    const data_per_line = [
        [formatedData.population],
        [formatedData.average.speed],
        [formatedData.average.diet],
        [formatedData.average.force],
        [formatedData.average.energy],
        [formatedData.average.energy_consumption],
        [formatedData.average.detection_radius],
        [formatedData.average.lifetime],
        [formatedData.average.maturity],
        [formatedData.average.size],
    ];
    Plotly.extendTraces(chart, {
        x,
        y: data_per_line,
    }, line_numbers);
}
function resize_chart(width, height) {
    if (chart) {
        Plotly.relayout(chart, { width, height });
    }
}
let chart_interval = null;
function start_chart_interval() {
    if (chart_interval)
        return;
    chart_interval = setInterval(() => {
        if (global_timer.is_paused)
            return;
        const data_by_organism = {
            sum: {
                detection_radius: 0,
                diet: 0,
                energy_consumption: 0,
                energy: 0,
                force: 0,
                lifetime: 0,
                maturity: 0,
                radius: 0,
                speed: 0,
            },
            time: global_timer.formatted_timer_for_chart,
            number_of_organisms: Organism.organisms.length,
        };
        Organism.organisms.forEach((organism) => {
            fill_data_by_organism(organism, data_by_organism);
        });
        updateChart(data_by_organism);
    }, 1000);
}
function create_context() {
    const canvas = document.querySelector("canvas");
    if (canvas) {
        canvas.width = innerWidth;
        canvas.height = innerHeight - 8;
        return { canvas, context: canvas.getContext("2d") };
    }
    return { canvas, context: null };
}
function get_new_x(parent, element, event_x) {
    const middleTabX = innerWidth - event_x - parent.clientWidth / 2;
    const minX = 5;
    const maxX = innerWidth - parent.clientWidth - 5;
    const title_size = element.clientWidth;
    if (event_x - title_size / 2 <= 0) {
        return maxX;
    }
    return middleTabX <= minX ? minX : middleTabX;
}
function get_new_y(parent, element, event_y) {
    const middleTabY = event_y - element.clientHeight / 2;
    const minY = 5;
    const maxY = innerHeight - parent.clientHeight - 5;
    const title_size = element.clientHeight;
    if (event_y - title_size / 2 <= 0) {
        return minY;
    }
    return middleTabY >= maxY ? maxY : middleTabY;
}
function element_drag(event) {
    event.preventDefault();
    const element = event.target;
    const parent = element === null || element === void 0 ? void 0 : element.parentElement;
    if (element && parent) {
        const x = get_new_x(parent, element, event.x);
        const y = get_new_y(parent, element, event.y);
        if (parent.style.left)
            parent.style.left = "";
        parent.style.right = x + "px";
        parent.style.top = y + "px";
    }
}
function stop_drag_element() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.onmouseleave = null;
}
function drag_screen_element(element) {
    element.onmousedown = (event) => {
        event.preventDefault();
        document.onmousemove = element_drag;
        document.onmouseup = stop_drag_element;
        element.addEventListener("mouseleave", stop_drag_element);
    };
}
function resize_parent(event, element_to_resize) {
    const minWidth = 300;
    if (element_to_resize) {
        const newWidth = element_to_resize.clientWidth + event.movementX;
        const newHeight = element_to_resize.clientHeight + event.movementY;
        const w = newWidth > minWidth ? newWidth : minWidth;
        element_to_resize.style.width = String(w).concat("px");
        element_to_resize.style.height = String(newHeight).concat("px");
    }
}
function stop_resizing() {
    document.onmouseup = null;
    document.onmousemove = null;
}
function _prevent_default_and_mouse_up(event) {
    event.preventDefault();
    document.onmouseup = stop_resizing;
}
function resize_screen_element(event, element_to_resize) {
    _prevent_default_and_mouse_up(event);
    document.onmousemove = (event) => resize_parent(event, element_to_resize);
}
function convert_to_number(value) {
    return Number(value.replace(/[^\d\.\,]/g, ""));
}
function resize_screen_element_and_chart(event, element_to_resize, child_number) {
    _prevent_default_and_mouse_up(event);
    document.onmousemove = (event) => {
        resize_parent(event, element_to_resize);
        const chart_parent = element_to_resize.children[child_number];
        const styles = getComputedStyle(chart_parent);
        const available_width = chart_parent.clientWidth -
            convert_to_number(styles.paddingLeft) -
            convert_to_number(styles.paddingRight);
        const height_without_padding = chart_parent.clientHeight -
            convert_to_number(styles.paddingTop) -
            convert_to_number(styles.paddingBottom);
        const siblings = [...chart_parent.children].filter((el) => el !== chart);
        const unavailable_height = siblings.reduce((sum, sibling) => (sum += sibling.clientHeight), 0);
        const available_height = height_without_padding - unavailable_height;
        if (chart_parent) {
            resize_chart(available_width, available_height);
        }
    };
}
function random_color() {
    return Math.floor(Math.random() * 256);
}
function generate_color() {
    const r = random_color();
    const g = random_color();
    const b = random_color();
    return `rgb(${r},${g},${b})`;
}
function generate_float(min, max) {
    const delta = max - min;
    const num = Math.random() * delta + min;
    return parseFloat(num.toFixed(4));
}
function hex_to_rgb(hex) {
    var _a;
    const colors = (_a = hex.match(/\w{2}/g)) === null || _a === void 0 ? void 0 : _a.map((color) => parseInt(color, 16));
    if ((colors === null || colors === void 0 ? void 0 : colors.length) === 3) {
        const [r, g, b] = colors;
        return `rgb(${r},${g},${b})`;
    }
    throw new Error(`Invalid hex: ${hex}`);
}
function format_color(color) {
    return parseInt(color).toString(16).padStart(2, "0");
}
function rgb_to_hex(rgb) {
    var _a;
    const colors = (_a = rgb.match(/\d{1,3}/gi)) === null || _a === void 0 ? void 0 : _a.map(format_color);
    if ((colors === null || colors === void 0 ? void 0 : colors.length) === 3) {
        const [r, g, b] = colors;
        return "#" + r + g + b;
    }
    throw new Error(`Invalid RGB: ${rgb}`);
}
const { organisms_amount, vegetables_amount, mutation_magnitude, mutation_probability, vegetables_rate, } = DEFAULT_INPUTS;
const default_list = [
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
function set_input_defaults() {
    default_list.forEach(({ input, label, value }) => {
        if (input)
            input.value = value;
        if (label)
            label.textContent = value;
    });
}
function generate_organism(x, y) {
    const initial_radius = generate_float(3, 8);
    const max_speed = generate_float(1, 2.2);
    const max_force = generate_float(0.01, 0.05);
    const color = generate_color();
    const initial_detection_radius = generate_float(40, 120);
    const ninhada_min = 1;
    const ninhada_max = ninhada_min + generate_integer(1, 3);
    const litter_interval = [ninhada_min, ninhada_max];
    const o_sex = Math.random() < 0.5 ? sex.female : sex.male;
    const diet = generate_float(0, 1);
    const metabolic_rate = generate_float(0.5, 3.0);
    const min_temp = generate_float(0, 5.0);
    const max_temp = min_temp + generate_float(25, 30);
    const min_max_temperature_tolerated = [min_temp, max_temp];
    const body_growth_rate = generate_float(0, 0.4);
    ;
    const lifespan = generate_integer(200, 300);
    const percentage_to_mature = generate_float(0.01, 0.03);
    var dna = new DNA(initial_radius, max_speed, max_force, color, initial_detection_radius, litter_interval, o_sex, diet, metabolic_rate, min_max_temperature_tolerated, body_growth_rate, lifespan, percentage_to_mature);
    let neural_network_id = null;
    if (globals.pyodide) {
        neural_network_id = create_neural_network(globals.pyodide);
    }
    new Organism(x, y, dna, neural_network_id);
}
function generate_vegetable(x, y) {
    const radius = generate_float(1, 2);
    new Vegetable(x, y, radius);
}
function random_position(size) {
    return Math.random() * (size - 50) + 25;
}
function create_entities(n_organisms, n_vegetables) {
    for (let i = 0; i < n_organisms; i++) {
        const x = random_position(globals.universe_width);
        const y = random_position(globals.universe_height);
        generate_organism(x, y);
    }
    for (let i = 0; i < n_vegetables; i++) {
        const x = random_position(globals.universe_width);
        const y = random_position(globals.universe_height);
        generate_vegetable(x, y);
    }
}
function find_nearby_element(qtree, vision, organism, is_eating_vegetable = false) {
    let min_distance = Infinity;
    let closest_index = -1;
    let closest_elements = [];
    if (is_eating_vegetable) {
        closest_elements = qtree.search_elements(vision);
    }
    else {
        closest_elements = qtree.search_elements(vision, organism.id);
    }
    for (let i = closest_elements.length - 1; i >= 0; i--) {
        let distance_x = organism.position.x - closest_elements[i].position.x;
        let distance_y = organism.position.y - closest_elements[i].position.y;
        let squared_distance = (distance_x * distance_x) + (distance_y * distance_y);
        if (squared_distance <= min_distance) {
            min_distance = squared_distance;
            closest_index = i;
        }
    }
    return [min_distance, closest_elements, closest_index];
}
function get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision) {
    var input_values = {};
    var index_closest_food = null;
    var index_closest_organism = null;
    var distance_closest_food = 0;
    var distance_closest_organism = 0;
    var distance_closest_target;
    var angle_closest_food = 0;
    var angle_closest_organism = 0;
    var angle_closest_target;
    var vegetable_distance_and_index = null;
    var vegetables_in_view = null;
    var organisms_in_view = null;
    var targets_in_view;
    var organism_distance_and_index = null;
    var num_of_food_in_view = 0;
    var num_of_organisms_in_view = 0;
    var num_of_targets_in_view = 0;
    if (["NumOfTargetsInView", "DistToClosestTarget", "AngleToClosestTarget"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
        vegetables_in_view = qtreeVegetables.search_elements(vision);
        organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);
        if (["DistToClosestTarget", "AngleToClosestTarget"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
            vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view);
            distance_closest_food = vegetable_distance_and_index[0];
            index_closest_food = vegetable_distance_and_index[1];
            angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food]);
            organism.closest_food = vegetables_in_view[index_closest_food];
            organism.angle_closest_food = angle_closest_food;
            organism.distance_closest_food = distance_closest_food;
            organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view);
            distance_closest_organism = organism_distance_and_index[0];
            index_closest_organism = organism_distance_and_index[1];
            angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism]);
            organism.angle_closest_organism = angle_closest_organism;
            organism.distance_closest_organism = distance_closest_organism;
            organism.closest_organism = organisms_in_view[index_closest_organism];
        }
    }
    else {
        if (["NumOfFoodInView", "DistToClosestFood", "AngleToClosestFood"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
            vegetables_in_view = qtreeVegetables.search_elements(vision);
            if (["DistToClosestFood", "AngleToClosestFood"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
                vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view);
                distance_closest_food = vegetable_distance_and_index[0];
                index_closest_food = vegetable_distance_and_index[1];
                angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food]);
                organism.closest_food = vegetables_in_view[index_closest_food];
                organism.angle_closest_food = angle_closest_food;
                organism.distance_closest_food = distance_closest_food;
            }
        }
        if (["NumOfOrganismsInView", "DistToClosestOrganism", "AngleToClosestOrganism"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
            organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);
            if (["DistToClosestOrganism", "AngleToClosestOrganism"].some(str => { var _a; return (_a = organism.input_neurons_list) === null || _a === void 0 ? void 0 : _a.includes(str); })) {
                organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view);
                distance_closest_organism = organism_distance_and_index[0];
                index_closest_organism = organism_distance_and_index[1];
                angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism]);
                organism.angle_closest_organism = angle_closest_organism;
                organism.distance_closest_organism = distance_closest_organism;
                organism.closest_organism = organisms_in_view[index_closest_organism];
            }
        }
    }
    if (organism.diet_variant >= organism.diet) {
        if (vegetables_in_view != null && index_closest_food != null) {
            organism.closest_target = vegetables_in_view[index_closest_food];
        }
        else {
            organism.closest_target = null;
        }
        distance_closest_target = distance_closest_food;
        organism.distance_closest_target = distance_closest_food;
        angle_closest_target = angle_closest_food;
        num_of_targets_in_view = num_of_food_in_view;
    }
    else {
        if (organisms_in_view != null && index_closest_organism != null) {
            organism.closest_target = organisms_in_view[index_closest_organism];
        }
        else {
            organism.closest_target = null;
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
        'TimeAlive': organism.get_time_alive_in_seconds(),
        'Speed': organism.speed.magnitude(),
        'Size': organism.radius,
        'Tick': globals.tick
    };
    return input_values;
}
function get_distance_and_index_of_closest_element(organism, closests_elements) {
    let min_distance = Infinity;
    let closest_index = -1;
    if (closests_elements.length !== 0) {
        for (let i = closests_elements.length - 1; i >= 0; i--) {
            let distance_x = organism.position.x - closests_elements[i].position.x;
            let distance_y = organism.position.y - closests_elements[i].position.y;
            let squared_distance = (distance_x * distance_x) + (distance_y * distance_y);
            if (squared_distance <= min_distance) {
                min_distance = squared_distance;
                closest_index = i;
            }
        }
    }
    if (min_distance == Infinity) {
        min_distance = 0;
    }
    let distance_and_index = [min_distance, closest_index];
    return distance_and_index;
}
function set_temperature() {
    const luminosity = globals.luminosity;
    let temperature = 5 + (25 * luminosity);
    const noiseChange = (Math.random() * 2 - 1) * 0.5;
    globals.noise += noiseChange;
    globals.noise = Math.max(Math.min(globals.noise, 5), -5);
    temperature += globals.noise;
    temperature = Math.max(Math.min(temperature, 35), 0);
    globals.temperature = temperature;
}
function set_luminosity() {
    const cycle = (2 * Math.PI * global_timer.total / 1000) / globals.luminosity_cycle_time;
    const sinusoidal_value = Math.sin(cycle);
    const luminosity = (sinusoidal_value + 1) / 2;
    globals.luminosity = luminosity;
}
function add_tick_step() {
    globals.tick_step_count = globals.tick_step_count + 1;
    if (globals.tick_step_count % globals.tick_period === 0) {
        var aux = globals.tick;
        globals.tick = globals.tick_aux;
        globals.tick_aux = aux;
        globals.tick_step_count = 0;
    }
}
const { canvas, context } = create_context();
if (!canvas || !context)
    throw new Error("Couldn't find canvas element");
var popover_id = 1;
var is_running = false;
var is_paused = false;
let vegetable_generation_interval;
function add_on_change_event_input(input, label, action) {
    input === null || input === void 0 ? void 0 : input.addEventListener("change", () => {
        const new_value = (input === null || input === void 0 ? void 0 : input.value) || "";
        action(new_value);
        if (label)
            label.textContent = new_value;
    });
}
document.addEventListener("DOMContentLoaded", (_) => {
    document.querySelectorAll(".tab-title").forEach(drag_screen_element);
    button_resize_chart === null || button_resize_chart === void 0 ? void 0 : button_resize_chart.addEventListener("mousedown", (event) => {
        if (tab_chart) {
            resize_screen_element_and_chart(event, tab_chart, 1);
        }
    });
    button_set_default === null || button_set_default === void 0 ? void 0 : button_set_default.addEventListener("click", set_input_defaults);
    button_start_simulation === null || button_start_simulation === void 0 ? void 0 : button_start_simulation.addEventListener("click", start_simulation);
    button_pause_simulation === null || button_pause_simulation === void 0 ? void 0 : button_pause_simulation.addEventListener("click", pausa);
    button_resume_simulation === null || button_resume_simulation === void 0 ? void 0 : button_resume_simulation.addEventListener("click", despausa);
    add_on_change_event_input(input_mutation_probability, label_mutation_probability, update_mutation_probability);
    add_on_change_event_input(input_mutation_magnitude, label_mutation_magnitude, update_mutation_magnitude);
    add_on_change_event_input(input_vegetable_rate, label_vegetable_rate, update_vegetables_apparition_interval);
    button_population_chart === null || button_population_chart === void 0 ? void 0 : button_population_chart.addEventListener("click", show_population_chart);
    button_speed_chart === null || button_speed_chart === void 0 ? void 0 : button_speed_chart.addEventListener("click", show_speed_chart);
    button_diet_chart === null || button_diet_chart === void 0 ? void 0 : button_diet_chart.addEventListener("click", show_diet_chart);
    button_force_chart === null || button_force_chart === void 0 ? void 0 : button_force_chart.addEventListener("click", show_force_chart);
    button_energy_chart === null || button_energy_chart === void 0 ? void 0 : button_energy_chart.addEventListener("click", show_energy_chart);
    button_consumption_chart === null || button_consumption_chart === void 0 ? void 0 : button_consumption_chart.addEventListener("click", show_consumption_chart);
    button_detection_chart === null || button_detection_chart === void 0 ? void 0 : button_detection_chart.addEventListener("click", show_detection_chart);
    button_lifetime_chart === null || button_lifetime_chart === void 0 ? void 0 : button_lifetime_chart.addEventListener("click", show_lifetime_chart);
    button_maturity_chart === null || button_maturity_chart === void 0 ? void 0 : button_maturity_chart.addEventListener("click", show_maturity_chart);
    button_size_chart === null || button_size_chart === void 0 ? void 0 : button_size_chart.addEventListener("click", show_size_chart);
});
function destroy_objects() {
    Organism.organisms.length = 0;
    Vegetable.vegetables.length = 0;
}
function criaVegetablesGradativo() {
    if (!global_timer.is_paused && Vegetable.vegetables.length < 3000) {
        const x = Math.random() * (globals.universe_width - 62) + 31;
        const y = Math.random() * (globals.universe_height - 62) + 31;
        const radius = Math.random() * 1.5 + 1;
        new Vegetable(x, y, radius);
    }
}
function update_vegetables_apparition_interval(vegetable_rate) {
    if (vegetable_rate == undefined || vegetable_rate == null) {
        return;
    }
    const rate = Number(vegetable_rate);
    if (rate == 0 && vegetable_generation_interval) {
        clearInterval(vegetable_generation_interval);
        vegetable_generation_interval = null;
        return;
    }
    const new_interval = 1000 / rate;
    if (new_interval <= 1000) {
        if (vegetable_generation_interval) {
            clearInterval(vegetable_generation_interval);
        }
        vegetable_generation_interval = setInterval(criaVegetablesGradativo, new_interval);
    }
}
function update_mutation_probability(value) {
    if (value) {
        globals.mutation_probability = Number(value) / 100;
    }
}
function update_mutation_magnitude(value) {
    if (value) {
        globals.mutation_magnitude = Number(value) / 100;
    }
}
function set_universe(canvas) {
    if (canvas) {
        globals.universe_width = canvas.width * globals.universe_size;
        globals.universe_height = canvas.height * globals.universe_size;
    }
}
function update_timer_display(time, formattedTime) {
    if (label_timer && formattedTime)
        label_timer.textContent = formattedTime;
}
async function start_simulation() {
    if ((button_start_simulation === null || button_start_simulation === void 0 ? void 0 : button_start_simulation.textContent) != "Restart") {
        set_btn_loading(button_start_simulation);
        const pyodide = await import_pyodide();
        unset_btn_loading(button_start_simulation);
        globals.pyodide = pyodide;
        start_chart_interval();
    }
    const n_organisms = parseInt((input_slider_organisms === null || input_slider_organisms === void 0 ? void 0 : input_slider_organisms.value) || "0") * globals.universe_size;
    const n_vegetables = parseInt((input_slider_vegetables === null || input_slider_vegetables === void 0 ? void 0 : input_slider_vegetables.value) || "0") * globals.universe_size;
    destroy_objects();
    set_universe(canvas);
    create_entities(n_organisms, n_vegetables);
    const isPaused = global_timer.is_paused;
    global_timer.pause();
    global_timer.reset();
    global_timer.play(update_timer_display);
    update_vegetables_apparition_interval(input_vegetable_rate === null || input_vegetable_rate === void 0 ? void 0 : input_vegetable_rate.value);
    update_mutation_probability(input_mutation_probability === null || input_mutation_probability === void 0 ? void 0 : input_mutation_probability.value);
    update_mutation_magnitude(input_mutation_magnitude === null || input_mutation_magnitude === void 0 ? void 0 : input_mutation_magnitude.value);
    group_extra_panel === null || group_extra_panel === void 0 ? void 0 : group_extra_panel.classList.remove("d-none");
    group_extra_buttons === null || group_extra_buttons === void 0 ? void 0 : group_extra_buttons.classList.remove("d-none");
    if (!is_running) {
        animate(context);
        if (button_start_simulation) {
            button_start_simulation.textContent = "Restart";
        }
    }
    else if (isPaused) {
        despausa();
        reset_chart();
    }
    else {
        reset_chart();
    }
    is_running = true;
}
function desenhaTudo(context) {
    Vegetable.vegetables.forEach((vegetable) => {
        vegetable.display(context);
    });
    Organism.organisms.forEach((organism) => {
        organism.display(context);
    });
}
var limitador_de_loop = 0;
var idAnimate;
function pausa() {
    global_timer.pause();
    button_pause_simulation === null || button_pause_simulation === void 0 ? void 0 : button_pause_simulation.classList.add("d-none");
    button_resume_simulation === null || button_resume_simulation === void 0 ? void 0 : button_resume_simulation.classList.remove("d-none");
}
function despausa() {
    global_timer.play();
    button_resume_simulation === null || button_resume_simulation === void 0 ? void 0 : button_resume_simulation.classList.add("d-none");
    button_pause_simulation === null || button_pause_simulation === void 0 ? void 0 : button_pause_simulation.classList.remove("d-none");
    reactivateFunctionsStoppedAfterPause();
}
function reactivateFunctionsStoppedAfterPause() {
    animate(context);
}
function set_btn_loading(btn) {
    if (btn) {
        btn.setAttribute("disabled", "true");
        const btn_content = btn.textContent || "";
        btn.innerHTML = `<span class="d-none">${btn_content}</span><div class="loader"></div>`;
    }
}
function unset_btn_loading(btn) {
    if (btn) {
        btn.removeAttribute("disabled");
        const btn_content = btn.textContent || "";
        btn.innerHTML = btn_content;
    }
}
async function import_pyodide() {
    console.log("Carregando Pyodide...");
    const pyodide = await loadPyodide();
    globals.pyodide = pyodide;
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install("pyodide-importer");
    pyodide.runPython(`
  from pyodide_importer import register_hook
  modules_url = "https://raw.githubusercontent.com/beans-simulation/beans-simulation/main/neural-network-poc/"
  register_hook(modules_url)

  import neural_network
  import js
  `);
    return pyodide;
}
function get_direction(element, target) {
    const distance_x = target.position.x - element.position.x;
    const distance_y = target.position.y - element.position.y;
    return new Vector(distance_x, distance_y);
}
function get_angle_to_closest_element(organism, closest_element) {
    if (closest_element == null) {
        return 0;
    }
    const direction = get_direction(organism, closest_element);
    const angle_signal = direction.x * organism.speed.y - direction.y * organism.speed.x;
    var angle = direction.get_angle_to_another_vector(organism.speed);
    if (angle_signal > 0) {
        angle = angle * (-1);
    }
    return angle;
}
function get_angle_signal_to_closest_element(organism, closest_element) {
    if (closest_element == null) {
        return 0;
    }
    const direction = get_direction(organism, closest_element);
    const angle_signal = direction.x * organism.speed.y - direction.y * organism.speed.x;
    return angle_signal;
}
function create_neural_network(pyodide) {
    pyodide.runPython(`
        nn = neural_network.create_network()
        network_id = nn.id
    `);
    return pyodide.globals.get('network_id');
}
//# sourceMappingURL=main.js.map