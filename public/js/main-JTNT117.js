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
    }
}
const globals = new GlobalPreferences();
const button_pause_simulation = document.getElementById("button_pause_simulation");
const button_resume_simulation = document.getElementById("button_resume_simulation");
const button_set_default = document.getElementById("button_set_default");
const button_start_simulation = document.getElementById("button_start_simulation");
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
    constructor(initial_radius, max_speed, max_force, color, initial_detection_radius, litter_interval, sex, diet) {
        this.initial_radius = initial_radius;
        this.max_speed = max_speed;
        this.max_force = max_force;
        this.color = color;
        this.initial_detection_radius = initial_detection_radius;
        this.litter_interval = litter_interval;
        this.sex = sex;
        this.diet = diet;
        this.genome = [
            this.initial_radius,
            this.max_speed,
            this.max_force,
            color,
            initial_detection_radius,
            litter_interval,
            sex,
            diet
        ];
    }
    get_genome() {
        return this.genome;
    }
    get_positive_mutation(value) {
        const new_value = this.new_mutation(value);
        return new_value >= 0 ? new_value : 0;
    }
    get_offspring_detection_radius(initial_radius) {
        const value = this.new_mutation(this.initial_detection_radius);
        return value < initial_radius ? initial_radius : value;
    }
    variate_litter(min, max) {
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
    get_litter_mutation() {
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
    new_mutation(value) {
        if (Math.random() < globals.mutation_probability) {
            const multiplier = this.get_new_mutation_multiplier();
            const variation = value * globals.mutation_magnitude * multiplier;
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
        const offspring_initial_radius = this.get_positive_mutation(this.initial_radius);
        const offspring_max_speed = this.get_positive_mutation(this.max_speed);
        var offspring_max_force = this.new_mutation(this.max_force);
        var offspring_color = this.get_color_mutation();
        const offspring_initial_detection_radius = this.get_offspring_detection_radius(offspring_initial_radius);
        const offspring_litter_interval = this.get_litter_mutation();
        return new DNA(offspring_initial_radius, offspring_max_speed, offspring_max_force, offspring_color, offspring_initial_detection_radius, offspring_litter_interval, this.sex, this.diet);
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
        this.energy = Math.floor(Math.PI * Math.pow(this.radius, 2)) * 15;
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
        this.is_ready_to_reproduce = false;
        this.lifetime_in_miliseconds = generate_integer(200, 300) * 1000;
        this.litter_size = 0;
        this.procreation_count = 0;
        this.procreation_probability = 0.5;
        this.roaming_angle = Math.random() * 360;
        this.sexual_maturity = 0;
        this.speed = new Vector(0.0001, 0.0001);
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
        this.diet_variant = generate_float(0, 1);
        this.radius = this.initial_radius;
        this.minimal_consumption =
            0.0032 * Math.pow(Math.pow(this.radius, 2), 0.75);
        this.max_energy_consumption_rate =
            this.minimal_consumption +
                Math.pow(this.initial_radius * 1.5, 2) *
                    Math.pow(this.max_speed, 2) *
                    0.00012;
        this.status = organism_status.roaming;
        this.dna = dna;
        this.other_color = this.get_other_color(this.color);
        this.detection_radius = this.initial_detection_radius;
        this.max_energy = Math.pow(this.radius, 2) * 6;
        this.fixed_max_energy = Math.pow(this.initial_radius * 1.5, 2) * 6;
        this.birth_moment_in_milliseconds = global_timer.total;
        this.time_to_maturity_in_seconds = this.lifetime_in_miliseconds * 0.05 / 1000;
        this.neural_network_id = neural_network_id;
        if (parent_id) {
            this.energy =
                this.max_energy *
                    (0.75 + Math.random() / 4) *
                    0.6;
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
    create_child(offspring_dna) {
        this.procreation_count++;
        let neural_network_id = null;
        const offspring = new Organism(this.position.x, this.position.y, offspring_dna, neural_network_id);
        this.childrenIds ? this.childrenIds.push(offspring.id) : [offspring.id];
        return offspring;
    }
    change_status(status) {
        if (this.status !== status) {
            this.status = status;
        }
    }
    assexually_procreate() {
        const offspring_dna = this.dna.mutate();
        return this.create_child(offspring_dna);
    }
    sexually_procreate(qtree, vision) {
        this.is_ready_to_reproduce = true;
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
                        const child = this.create_child(offspring_dna_mutated);
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

                print("REDES DOS PAIS!!!!!")
                this_nn.print_network_info()
                partner_nn.print_network_info()

                # Criando a rede filha
                child_nn = neural_network.breed_neural_networks(this_nn, partner_nn)
                print("REDES FILHA!!!!!")
                child_nn.print_network_info()

                child_nn_id = child_nn.id

              `);
                            child.neural_network_id = globals.pyodide.globals.get('child_nn_id');
                        }
                    }
                }
                this.energy = (this.energy / 2);
                this.is_reproducing = false;
                this.is_ready_to_reproduce = false;
                partner.energy = (partner.energy / 2);
                partner.is_reproducing = false;
                partner.is_ready_to_reproduce = false;
            }
        }
    }
    get_time_alive_in_seconds() {
        return (global_timer.total - this.birth_moment_in_milliseconds) / 1000;
    }
    update(context) {
        this.consumed_energy_rate =
            Math.pow(this.radius, 2) * Math.pow(this.speed.magnitude(), 2) * 0.0002;
        const achieved_age_limit = global_timer.total - this.birth_moment_in_milliseconds >
            this.lifetime_in_miliseconds;
        const time_alive = this.get_time_alive_in_seconds();
        if (this.energy > 0 && !achieved_age_limit) {
            this.energy -= this.consumed_energy_rate + this.minimal_consumption;
            if (Math.random() < (0.0005 * this.food_eaten) / 10) {
                if (Math.random() <= this.procreation_probability) {
                    if (this.maturity == 1) {
                        this.litter_size = generate_integer(this.litter_interval[0], this.litter_interval[1] + 1);
                        for (var i = 0; i < this.litter_size; i++) {
                            if (Math.random() < 0.2) {
                            }
                        }
                    }
                }
            }
        }
        else {
            this.kill();
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
    }
    increase_size() {
        const max_radius = this.initial_radius * 1.5;
        if (this.radius < max_radius) {
            this.radius *= 1.05;
            this.detection_radius *= 1.03;
        }
        this.max_energy = Math.pow(this.radius, 2) * 6;
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
    accelerate(value) {
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
        if (min_distance <= Math.pow(this.detection_radius, 2)) {
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
        if (min_distance <= Math.pow(this.detection_radius, 2)) {
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
        if (min_distance <= Math.pow(this.detection_radius, 2)) {
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
        element.kill();
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
        if (min_distance <= Math.pow(this.detection_radius, 2)) {
            this.is_roaming = false;
            this.is_eating = false;
            if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
                return true;
            }
            else if (close_organisms.length != 0) {
                this.pursue(close_organisms[closest_index], true);
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
    return distance_closest_target <= (detection_radius_squared < eat_distance_squared ? detection_radius_squared : eat_distance_squared);
}
function accelerate(value, organism) {
}
function rotate(value, organism, output) {
    organism.is_rotating = true;
    organism.speed.rotate_degrees(value);
    organism.is_rotating = false;
}
function desireToReproduce(value, organism) {
}
function desireToEat(value, organism) {
    if (value == 0) {
        return;
    }
    organism.is_eating = true;
    if (organism.closest_target) {
        if (is_close_to_target(organism, organism.distance_closest_target)) {
            organism.eat(organism.closest_target);
        }
    }
    else {
        if (organism.energy < (organism.max_energy * 0.1)) {
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
    'Accelerate': accelerate,
    'Rotate': rotate,
    'DesireToReproduce': desireToReproduce,
    'DesireToEat': desireToEat,
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
        Vegetable.vegetables.forEach((vegetable) => {
            vegetable.display(context);
            qtreeVegetables.insert(vegetable);
        });
        Organism.organisms.forEach((organism) => {
            qtreeOrganisms.insert(organism);
        });
        Organism.organisms.forEach((organism) => {
            organism.update(context);
            let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);
            if (organism.maturity > 0.6) {
                organism.sexually_procreate(qtreeOrganisms, vision);
            }
            const values = get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision);
            const valuesJSON = JSON.stringify(values);
            const network_id_JSON = JSON.stringify(organism.neural_network_id);
            pyodide.runPython(`
        import json

        # Desserializa 'values' para um dicionário
        input_values = json.loads('${valuesJSON}')
        network_id = json.loads('${network_id_JSON}')

        output_nn = neural_network.NeuralNetwork.neural_networks.get(f"{network_id}").feed_forward(input_values)
      `);
            let output = pyodide.globals.get('output_nn').toJs();
            for (const [key, value] of output) {
                if (map_outputs_from_net[key]) {
                    map_outputs_from_net[key](value, organism, output);
                }
            }
            organism.roam();
        });
    }
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
function drag_mouse_down(event) {
    event.preventDefault();
    document.onmousemove = element_drag;
    document.onmouseup = stop_drag_element;
}
function element_drag(event) {
    event.preventDefault();
    const element = event.target;
    const parent = element === null || element === void 0 ? void 0 : element.parentElement;
    if (parent) {
        const middleTabX = innerWidth - event.x - parent.clientWidth / 2;
        const middleTabY = event.y - element.clientHeight / 2;
        const minX = 5;
        const maxY = innerHeight - parent.scrollHeight;
        const x = middleTabX <= minX ? minX : middleTabX;
        const y = middleTabY >= maxY ? maxY : middleTabY;
        parent.style.right = x + "px";
        parent.style.top = y + "px";
    }
}
function stop_drag_element() {
    document.onmouseup = null;
    document.onmousemove = null;
}
function drag_screen_element(element) {
    if (element.classList.contains("tab-info")) {
        element.children[0].onmousedown = drag_mouse_down;
    }
    else {
        element.onmousedown = drag_mouse_down;
    }
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
    const ninhada_min = generate_integer(1, 1);
    const ninhada_max = ninhada_min + generate_integer(1, 8);
    const litter_interval = [ninhada_min, ninhada_max];
    const o_sex = Math.random() < 0.5 ? sex.female : sex.male;
    const diet = generate_float(0, 1);
    var dna = new DNA(initial_radius, max_speed, max_force, color, initial_detection_radius, litter_interval, o_sex, diet);
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
        let d2 = Math.pow(organism.position.x - closest_elements[i].position.x, 2) +
            Math.pow(organism.position.y - closest_elements[i].position.y, 2);
        if (d2 <= min_distance) {
            min_distance = d2;
            closest_index = i;
        }
    }
    return [min_distance, closest_elements, closest_index];
}
function get_input_values_for_neuralnet(organism, qtreeOrganisms, qtreeVegetables, vision) {
    var input_values = {};
    var index_closest_food;
    var index_closest_organism;
    var distance_closest_food;
    var distance_closest_organism;
    var distance_closest_target;
    var angle_closest_food;
    var angle_closest_organism;
    var angle_closest_target;
    var vegetable_distance_and_index;
    var vegetables_in_view;
    var organisms_in_view;
    var targets_in_view;
    var organism_distance_and_index;
    vegetables_in_view = qtreeVegetables.search_elements(vision);
    vegetable_distance_and_index = get_distance_and_index_of_closest_element(organism, vegetables_in_view);
    distance_closest_food = vegetable_distance_and_index[0];
    index_closest_food = vegetable_distance_and_index[1];
    angle_closest_food = get_angle_to_closest_element(organism, vegetables_in_view[index_closest_food]);
    organism.angle_closest_food = angle_closest_food;
    organism.distance_closest_food = distance_closest_food;
    organism.closest_food = vegetables_in_view[index_closest_food];
    organisms_in_view = qtreeOrganisms.search_elements(vision, organism.id);
    organism_distance_and_index = get_distance_and_index_of_closest_element(organism, organisms_in_view);
    distance_closest_organism = organism_distance_and_index[0];
    index_closest_organism = organism_distance_and_index[1];
    angle_closest_organism = get_angle_to_closest_element(organism, organisms_in_view[index_closest_organism]);
    organism.angle_closest_organism = angle_closest_organism;
    organism.distance_closest_organism = distance_closest_organism;
    organism.closest_organism = organisms_in_view[index_closest_organism];
    if (organism.diet_variant >= organism.diet) {
        organism.closest_target = vegetables_in_view[index_closest_food];
        distance_closest_target = distance_closest_food;
        organism.distance_closest_target = distance_closest_food;
        angle_closest_target = angle_closest_food;
        targets_in_view = vegetables_in_view;
    }
    else {
        organism.closest_target = organisms_in_view[index_closest_organism];
        distance_closest_target = distance_closest_organism;
        organism.distance_closest_target = distance_closest_organism;
        angle_closest_target = angle_closest_organism;
        targets_in_view = organisms_in_view;
    }
    input_values = {
        'EnergyLevel': organism.energy,
        'Temperature': globals.temperature,
        'Health': organism.health,
        'AngleToClosestFood': angle_closest_food,
        'DistToClosestFood': distance_closest_food,
        'NumOfFoodInView': vegetables_in_view.length,
        'AngleToClosestOrganism': angle_closest_organism,
        'DistToClosestOrganism': distance_closest_organism,
        'NumOfOrganismsInView': organisms_in_view.length,
        'AngleToClosestTarget': angle_closest_target,
        'DistToClosestTarget': distance_closest_target,
        'NumOfTargetsInView': targets_in_view.length,
        'Luminosity': globals.luminosity,
        'Maturity': organism.maturity,
        'TimeAlive': organism.get_time_alive_in_seconds()
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
    const sinusoidal_value = Math.sin(cycle + Math.PI / 2);
    const luminosity = (sinusoidal_value + 1) / 2;
    globals.luminosity = luminosity;
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
    document.querySelectorAll(".tab-info").forEach(drag_screen_element);
    button_set_default === null || button_set_default === void 0 ? void 0 : button_set_default.addEventListener("click", set_input_defaults);
    button_start_simulation === null || button_start_simulation === void 0 ? void 0 : button_start_simulation.addEventListener("click", start_simulation);
    button_pause_simulation === null || button_pause_simulation === void 0 ? void 0 : button_pause_simulation.addEventListener("click", pausa);
    button_resume_simulation === null || button_resume_simulation === void 0 ? void 0 : button_resume_simulation.addEventListener("click", despausa);
    add_on_change_event_input(input_mutation_probability, label_mutation_probability, update_mutation_probability);
    add_on_change_event_input(input_mutation_magnitude, label_mutation_magnitude, update_mutation_magnitude);
    add_on_change_event_input(input_mutation_probability, label_mutation_probability, update_mutation_probability);
    add_on_change_event_input(input_vegetable_rate, label_vegetable_rate, update_vegetables_apparition_interval);
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
    if (vegetable_rate) {
        const new_interval = 1000 / Number(vegetable_rate);
        if (new_interval <= 1000) {
            if (vegetable_generation_interval) {
                clearInterval(vegetable_generation_interval);
            }
            vegetable_generation_interval = setInterval(criaVegetablesGradativo, new_interval);
        }
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
  modules_url = "https://raw.githubusercontent.com/beans-simulation/beans-simulation/feature/pgt-124/neural-network-poc/"
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