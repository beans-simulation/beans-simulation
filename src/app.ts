import { global_timer, Organism, Vegetable } from "./models";
import {
  animate,
  create_context,
  create_entities,
  drag_screen_element,
  set_input_defaults,
} from "./utils";
import {
  button_pause_simulation,
  button_restart_simulation,
  button_resume_simulation,
  button_set_default,
  button_start_simulation,
  globals,
  group_extra_buttons,
  group_extra_panel,
  input_mutation_magnitude,
  input_mutation_probability,
  input_slider_organisms,
  input_slider_vegetables,
  input_vegetable_rate,
  label_mutation_magnitude,
  label_mutation_probability,
  label_timer,
  label_vegetable_rate,
} from "./resources";

const { canvas, context } = create_context();

if (!canvas || !context) throw new Error("Couldn't find canvas element");
// var universe_width = canvas.width * universe_size;
// var universe_height = canvas.height * universe_size;

// var percentual_energy_to_eat = 0.8; // porcentagem da energia máxima acima da qual eles não comerão

// var mudarGrafico = false;

// Variáveis para o gráfico (carnívoro)
// var popC;
// var velMedC;
// var forceMedC;
// var radiusMedC;
// var radiusDetMedC;
// var energMedC;
// var taxaEnergMedC;

// Variáveis para alterações nas mutações
// var probabilidade_mutacao = label_mutation_probability; // chances de cada gene (atributo) sofrer mutação

// var lado_direito_vazio = true;
// var lado_esquerdo_vazio = true;

// QuadTree
// const canvasRectangle = new Rectangle(
//   universe_width / 2,
//   universe_height / 2,
//   universe_width / 2,
//   universe_height / 2
// );

var popover_id = 1;

// Configuracoes dos organisms editados
// var conf_c;
// var conf_h;

var is_running = false;

// Variável para pausar e despausar o jogo
var is_paused = false;

// cria mais vegetables ao longo do tempo
// a função setInterval() permite que ele chame o loop a cada x milisegundos
let vegetable_generation_interval: NodeJS.Timeout | undefined;

function add_on_change_event_input(
  input: HTMLInputElement | null,
  label: HTMLElement | null,
  action: (value: string) => void
): void {
  input?.addEventListener("change", () => {
    const new_value = input?.value || "";
    action(new_value);
    if (label) label.textContent = new_value;
  });
}

document.addEventListener("DOMContentLoaded", (_) => {
  document.querySelectorAll(".tab-info").forEach(drag_screen_element);

  // botoes de controle da simulacao
  button_set_default?.addEventListener("click", set_input_defaults);
  button_start_simulation?.addEventListener("click", start_simulation);
  button_restart_simulation?.addEventListener("click", show_initial_panel);
  button_pause_simulation?.addEventListener("click", pausa);
  button_resume_simulation?.addEventListener("click", despausa);

  // slider inputs
  add_on_change_event_input(
    input_mutation_probability,
    label_mutation_probability,
    update_mutation_probability
  );
  add_on_change_event_input(
    input_mutation_magnitude,
    label_mutation_magnitude,
    update_mutation_magnitude
  );
  add_on_change_event_input(
    input_mutation_probability,
    label_mutation_probability,
    update_mutation_probability
  );
  add_on_change_event_input(
    input_vegetable_rate,
    label_vegetable_rate,
    update_vegetables_apparition_interval
  );
});

function destroy_objects() {
  Organism.organisms.length = 0;
  Vegetable.vegetables.length = 0;
  // update_vegetables_apparition_interval(1001);
}

function criaVegetablesGradativo() {
  // Não cria vegetables enquanto a simulação estiver pausada
  if (!global_timer.is_paused && Vegetable.vegetables.length < 3000) {
    // Limitador para não sobrecarregar a simulação
    const x = Math.random() * (globals.universe_width - 62) + 31;
    const y = Math.random() * (globals.universe_height - 62) + 31;
    const radius = Math.random() * 1.5 + 1;
    Vegetable.vegetables.push(new Vegetable(x, y, radius));
  }
}

function update_vegetables_apparition_interval(vegetable_rate?: string) {
  if (vegetable_rate) {
    const new_interval = 1000 / Number(vegetable_rate);
    if (new_interval <= 1000) {
      if (vegetable_generation_interval) {
        clearInterval(vegetable_generation_interval);
      }

      vegetable_generation_interval = setInterval(
        criaVegetablesGradativo,
        new_interval
      );
    }
  }
}

function update_mutation_probability(value?: string) {
  if (value) {
    globals.mutation_probability = Number(value) / 100;
  }
}

function update_mutation_magnitude(value?: string) {
  if (value) {
    globals.mutation_magnitude = Number(value) / 100;
  }
}

function set_universe(canvas: HTMLCanvasElement | null) {
  if (canvas) {
    globals.universe_width = canvas.width * globals.universe_size;
    globals.universe_height = canvas.height * globals.universe_size;
  }
}

function update_timer_display(time: number, formattedTime?: string) {
  if (label_timer && formattedTime) label_timer.textContent = formattedTime;
}

function start_simulation() {
  const n_organisms =
    parseInt(input_slider_organisms?.value || "0") * globals.universe_size;

  const n_vegetables =
    parseInt(input_slider_vegetables?.value || "0") * globals.universe_size;

  // is_before_play = false;
  destroy_objects();
  global_timer.play(update_timer_display);
  // history.clear(); //julia:checar se está sendo utilizado
  set_universe(canvas);
  create_entities(n_organisms, n_vegetables);

  // input_vegetable_rate = document.getElementById("input_vegetable_rate");
  update_vegetables_apparition_interval(input_vegetable_rate?.value);
  // input_mutation_probability = document.getElementById(
  //   "input_mutation_probability"
  // );
  update_mutation_probability(input_mutation_probability?.value);
  // input_mutation_magnitude = document.getElementById(
  //   "input_mutation_magnitude"
  // );
  update_mutation_magnitude(input_mutation_magnitude?.value);

  group_extra_panel?.classList.remove("d-none");
  group_extra_buttons?.classList.remove("d-none");
  // document.getElementById("initial_inputs").classList.add("d-none");
  // document.getElementById("divTamanhoUniverso").classList.add("d-none");
  // document.getElementById("extra_panel").classList.remove("d-none");
  // document.getElementById("initial_buttons").classList.add("d-none");
  // document.getElementById("extra_buttons").classList.remove("d-none");
  // document.getElementById("baixar-dados").classList.remove("d-none"); // FIND DADOS

  if (!is_running) {
    animate(context);
  }

  is_running = true;
}

function show_initial_panel() {
  destroy_objects();
  global_timer.pause();
  global_timer.reset();
  // is_before_play = true;
  // input_vegetable_rate = document.getElementById("input_vegetable_rate");
  update_vegetables_apparition_interval(input_vegetable_rate?.value);
  // input_mutation_probability = document.getElementById(
  //   "input_mutation_probability"
  // );

  update_mutation_probability(input_mutation_probability?.value);
  // input_mutation_magnitude = document.getElementById(
  //   "input_mutation_magnitude"
  // );

  update_mutation_magnitude(input_mutation_magnitude?.value);
  // document.getElementById("initial_inputs").classList.remove("d-none");
  // document.getElementById("initial_buttons").classList.remove("d-none");
  // document.getElementById("extra_buttons").classList.add("d-none");
  // document.getElementById("extra_panel").classList.add("d-none");
}

// ---------------------------------------------------------------------------------------
//                                  FUNÇÕES
// ---------------------------------------------------------------------------------------

// function verificaViesMutacoes(valor, iteracoes) {
//   var menor = 0;
//   var maior = 0;
//   var igual = 0;
//   var novoValor = 0;
//   for (var i = 0; i < iteracoes; i++) {
//     novoValor = newMutation(valor);
//     if (novoValor > valor) {
//       maior++;
//     } else if (novoValor < valor) {
//       menor++;
//     } else {
//       igual++;
//     }
//   }

//   console.log("Maior: " + (maior * 100) / iteracoes + "%");
//   console.log("Menor: " + (menor * 100) / iteracoes + "%");
//   console.log("Igual: " + (igual * 100) / iteracoes + "%");
//   console.log("Mutações: " + ((maior + menor) * 100) / iteracoes + "%");
// }

// function verificaViesMutacoesNinhada(ninhada_min, ninhada_max, iteracoes) {
//   var menor = 0;
//   var maior = 0;
//   var igual = 0;
//   var ninhada_media = (ninhada_min + ninhada_max) / 2;
//   for (var i = 0; i < iteracoes; i++) {
//     novoIntervalo = mutacaoNinhada(ninhada_min, ninhada_max);
//     nova_ninhada_media = (novoIntervalo[0] + novoIntervalo[1]) / 2;
//     if (nova_ninhada_media > ninhada_media) {
//       maior++;
//     } else if (nova_ninhada_media < ninhada_media) {
//       menor++;
//     } else {
//       igual++;
//     }
//   }

//   console.log("Maior: " + (maior * 100) / iteracoes + "%");
//   console.log("Menor: " + (menor * 100) / iteracoes + "%");
//   console.log("Igual: " + (igual * 100) / iteracoes + "%");
//   console.log("Mutações: " + ((maior + menor) * 100) / iteracoes + "%");
// }

// Função para não haver a necessidade de dar despausa() e pausa() quando é preciso redesenhar os elementos sem dar play em animate()
function desenhaTudo(context: CanvasRenderingContext2D) {
  Vegetable.vegetables.forEach((vegetable) => {
    vegetable.display(context);
  });
  Organism.organisms.forEach((organism) => {
    organism.display(context);
  });
}

// variáveis de auxílio para a implementação da divisão de tela
var limitador_de_loop = 0;

// function displayQuadTree(qtree) {
//   qtree.display();

//   let scope = new Rectangle(
//     Math.random() * universe_width,
//     Math.random() * universe_height,
//     170,
//     123
//   );
//   c.rect(scope.x - scope.w, scope.y - scope.h, scope.w * 2, scope.h * 2);
//   c.strokeStyle = "green";
//   c.lineWidth = 3;
//   c.stroke();

//   let points = qtree.procura(scope);
//   for (let p of points) {
//     c.beginPath();
//     c.arc(p.x, p.y, 1, 0, 2 * Math.PI);
//     c.strokeStyle = "red";
//     c.stroke();
//   }
// }

var idAnimate;

function pausa() {
  global_timer.pause();

  button_pause_simulation?.classList.add("d-none");
  button_resume_simulation?.classList.remove("d-none");
}

function despausa() {
  global_timer.play();

  button_resume_simulation?.classList.add("d-none");
  button_pause_simulation?.classList.remove("d-none");
}

// function acelera() {
//   animate(context);

//   // btnDesacelera.classList.remove("d-none");
// }

// TODO: TEM
function desacelera() {
  pausa();
  setTimeout(despausa, 10);
}
// estrutura geral da função que vai alimentara rede neural
function get_input_values_for_neuralnet() {
  var input_values: {};
  var distance_food: number;
  var angle_food: number;
  var distance_organism: number;
  var angle_organism: number;
  var vegetable_distance_and_angle: Array<number>;
  var organism_distance_and_angle: Array<number>;

  Organism.organisms.forEach((organism) => {
    vegetable_distance_and_angle = get_distance_and_angle_to_closest_vegetable(organism)
    distance_food = vegetable_distance_and_angle[0]
    angle_food = vegetable_distance_and_angle[1]

    organism_distance_and_angle = get_distance_and_angle_to_closest_organism(organism)
    distance_organism = organism_distance_and_angle[0]
    angle_organism = organism_distance_and_angle[1]

    input_values = {
      'EnergyLevel': organism.energy,
      'Temperature': get_temperature(),
      'Health': organism.health,
      'AngleToClosestFood': angle_food,
      'DistToClosestFood': distance_food,
      'NumOfFoodInView': get_amount_of_vegetable_in_view(organism),
      'AngleToClosestOrganism': angle_organism,
      'DistToClosestOrganism': distance_organism,
      'NumOfOrganismsInView': get_amount_of_organisms_in_view(organism),
      'Luminosity': get_luminosity(),
      'Maturity': organism.maturity,
      'TimeAlive': get_time_alive_in_seconds(organism)
    }
  });
}

function get_distance_and_angle_to_closest_vegetable(organism: Organism) {
  var distance = 56
  var angle = - 30;

  //TODO: Código para encontrar alimento mais próximo (só vegetal por enquanto)
  let distance_and_angle: [number, number] = [distance, angle];
  return distance_and_angle;
}

function get_amount_of_vegetable_in_view(organism: Organism) {
  var food: number = 3;
  // TODO: calcular a quantidade de alimentos (vegetais só?) no campo de visão
  // pode se basear na função atual de encontrar organismo, por exemplo a find_prey() para organismos,
  // que retona os organismos proximos, ou na função da evolve de encontrar alimento
  return food
}

function get_distance_and_angle_to_closest_organism(organism: Organism) {
  var distance = 172
  var angle = -77;

  //TODO: Código para encontrar o organismo mais próximo
  let distance_and_angle: [number, number] = [distance, angle];
  return distance_and_angle;
}

function get_amount_of_organisms_in_view(organism: Organism) {
  var amount: number = 0;
  // TODO: calcular a quantidade de alimentos (vegetais só?) no campo de visão
  // pode se basear na função atual de encontrar organismo, por exemplo a find_prey() para organismos,
  // que retona os organismos proximos, ou na função da evolve de encontrar alimento
  return amount
}

function get_temperature() {
  // Baseado na quantidade de elementos vivos, calcula a temperatura do ambiente
  var temperature: number = 16;
  // TODO: código para calcular temperatura
  return temperature
}

function get_luminosity() {
  // TODO: checar como calcular isso e construir o código
  return 0.56;
}

function get_time_alive_in_seconds(organism: Organism) {
  // TODO: checar se o valor está fazendo sentido
  return (global_timer.total - organism.birth_moment_in_milliseconds) / 1000;
}


// function animate() {
//   if (is_paused == false) {
//     idAnimate = requestAnimationFrame(animate);
//   }

//   c.clearRect(0, 0, universe_width, universe_height);
//   c.beginPath();
//   c.moveTo(-3, -4);
//   c.lineTo(universe_width + 3, -3);
//   c.lineTo(universe_width + 3, universe_height + 3);
//   c.lineTo(-3, universe_height + 3);
//   c.lineTo(-3, -3);
//   c.strokeStyle = "white";
//   c.stroke();

//   // Criando a Quadtree
//   let qtree = new QuadTree(retanguloCanvas, 10);

//   // limitador_de_loop = 0;

//   Vegetable.vegetables.forEach((vegetable) => {
//     vegetable.display();
//     qtree.insert_vegetable(vegetable); // Insere o vegetable na QuadTree
//   });

//   Organism.organisms.forEach((organism) => {
//     organism.create_space_delimitation(false); // telaDividida: false
//   });

//   Organism.organisms.forEach((organism) => {
//     qtree.insert_organism(organism); // Insere o organism na QuadTree
//   });

//   Organism.organisms.forEach((organism) => {
//     organism.update();
//     organism.roam();

//     // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
//     let vision = new Circle(
//       organism.position.x,
//       organism.position.y,
//       organism.detection_radius
//     );

//     // julia: essa chamada de função não está funcionando, vale checar se a função está correta, quando tiro o comentário ele começa a procreate infinitamente
//     // if(organism.energy <= organism.max_energy * percentual_energy_to_eat){ // FOME
//     //     organism.find_prey(qtree, vision);
//     // }
//   });
// }

// ----------------------------------------------------------------------------------------------
//                                         Frame rate
// ----------------------------------------------------------------------------------------------

// // The higher this value, the less the fps will reflect temporary variations
// // A value of 1 will only keep the last value
// var filterStrength = 20;
// var frameTime = 0, lastLoop = new Date, thisLoop;

// function gameLoop(){
//   // ...
//   var thisFrameTime = (thisLoop=new Date) - lastLoop;
//   frameTime+= (thisFrameTime - frameTime) / filterStrength;
//   lastLoop = thisLoop;
// }

// // Report the fps only every second, to only lightly affect measurements
// var fpsOut = document.getElementById('framerate');
// setInterval(function(){
//   fpsOut.innerHTML = parseFloat((1000/frameTime).toFixed(1)) + " fps";
// },500);

// // function calculaFrameRate(){
// //     var fps;
// //     var thisLoop = new Date();
// //     fps = 1000/(thisLoop - lastLoop);
// //     lastLoop = thisLoop;

// //     return fps;
// //     document.getElementById("framerate").innerHTML = fps;
// // }

// setInterval(() => {
//     var thisLoop = new Date();
//     var fps = 1000/(thisLoop - lastLoop);
//     lastLoop = thisLoop;

//     document.getElementById("framerate").innerHTML = fps;
// }, 1000);
