const { canvas, context } = create_context();

if (!canvas || !context) throw new Error("Couldn't find canvas element");

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

var popover_id = 1;

// Configuracoes dos organisms editados
// var conf_c;
// var conf_h;

var is_running = false;

// Variável para pausar e despausar o jogo
var is_paused = false;

// cria mais vegetables ao longo do tempo
// a função setInterval() permite que ele chame o loop a cada x milisegundos
let vegetable_generation_interval: number;

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
}

function criaVegetablesGradativo() {
  // Não cria vegetables enquanto a simulação estiver pausada
  if (!global_timer.is_paused && Vegetable.vegetables.length < 3000) {
    // Limitador para não sobrecarregar a simulação
    const x = Math.random() * (globals.universe_width - 62) + 31;
    const y = Math.random() * (globals.universe_height - 62) + 31;
    const radius = Math.random() * 1.5 + 1;
    new Vegetable(x, y, radius);
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

async function start_simulation() {
  const n_organisms =
    parseInt(input_slider_organisms?.value || "0") * globals.universe_size;

  const n_vegetables =
    parseInt(input_slider_vegetables?.value || "0") * globals.universe_size;

  // is_before_play = false;
  destroy_objects();

  // history.clear(); //julia:checar se está sendo utilizado
  set_universe(canvas);
  create_entities(n_organisms, n_vegetables);

  const isPaused = global_timer.is_paused;
  global_timer.pause();
  global_timer.reset();
  global_timer.play(update_timer_display);

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
    set_btn_loading(button_start_simulation);
    const pyodide = await import_pyodide();
    main(pyodide);
    animate(context);
    unset_btn_loading(button_start_simulation);

    // mudar nome do botao play para restart se for a primeira vez rodando a simulacao
    if (button_start_simulation) {
      button_start_simulation.textContent = "Restart";
    }
  } else if (isPaused) {
    despausa();
  }

  is_running = true;
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

  // reiniciar processos que param com a pausa
  reactivateFunctionsStoppedAfterPause();
}

function reactivateFunctionsStoppedAfterPause() {
  if (globals.pyodide) {
    main(globals.pyodide);
  }
  animate(context);
}

// function acelera() {
//   animate(context);

//   // btnDesacelera.classList.remove("d-none");
// }

// function desacelera() {
//   pausa();
//   setTimeout(despausa, 10);
// }

function set_btn_loading(btn: HTMLElement | null) {
  if (btn) {
    btn.setAttribute("disabled", "true");
    const btn_content = btn.textContent || "";
    btn.innerHTML = `<span class="d-none">${btn_content}</span><div class="loader"></div>`;
  }
}

function unset_btn_loading(btn: HTMLElement | null) {
  if (btn) {
    btn.removeAttribute("disabled");
    const btn_content = btn.textContent || "";
    btn.innerHTML = btn_content;
  }
}
function accelerate(value: number, organism: Organism) {
  organism.accelerate(value)
}

function rotate(value: number, organism: Organism) {
  organism.rotate(value)
}

function desireToReproduce(value: number, organism: Organism) {
  // TODO: chamar a função reprodução
  console.log('Calling DesireToReproduce with value:', value);
}

function desireToEat(value: number, organism: Organism) {
  // TODO: chamar a função de comer organismo ou de comer alimento
  console.log('Calling desireToEat with value:', value);
}

// Define a mapping between keys and functions
const map_outputs_from_net: { [key: string]: (value: number, organism: Organism) => void } = {
  'Accelerate': accelerate,
  'Rotate': rotate,
  'DesireToReproduce': desireToReproduce,
  'DesireToEat': desireToEat,
};

function main(pyodide: Pyodide) {
  if (!global_timer.is_paused && pyodide) {
    requestAnimationFrame(() => main(pyodide));
    Organism.organisms.forEach((organism) => {
      const values = get_input_values_for_neuralnet(organism);
      // Serialize the values as JSON
      const valuesJSON = JSON.stringify(values);
      // console.log(values["AngleToClosestFood"])
      pyodide.runPython(`
        import json

        # Deserialize the JSON data
        values = json.loads('${valuesJSON}')
        nn = neural_network.create_network()

        output_nn = nn.feed_forward(values)
        # print("Output:", nn.feed_forward(values))
      `);
      let output = pyodide.globals.get('output_nn').toJs();
      console.log(output)

      // Chamando as funções com base no output da rede
      for (const [key, value] of output) {
        if (map_outputs_from_net[key]) {
          map_outputs_from_net[key](value,organism);
        }
      }  
      
    });
  }
}

async function import_pyodide() {
  console.log("Carregando Pyodide...");
  const pyodide = await loadPyodide();
  globals.pyodide = pyodide;
  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("pyodide-importer");
  // Rodar fora do loop, para carregar as bibliotecas
  pyodide.runPython(`
  from pyodide_importer import register_hook
  modules_url = "https://raw.githubusercontent.com/beans-simulation/beans-simulation/main/neural-network-poc/"
  register_hook(modules_url)

  import neural_network
  import js
  `);
  // var values = feed_neural_network()
  // pyodide.registerJsModule("input_values", values);
  return pyodide;
}
