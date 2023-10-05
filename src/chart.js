// Função para retornar o ultimo elemento de um array sem retira-lo de la
Array.prototype.last = function () {
  return this[this.length - 1];
};

var cnt = 0;
var segundoRepetido = -1;
const chart = document.getElementById("chart");
const chartSecundario = document.getElementById("chartSecundario");

let history = new ChartHistory();
let historicoE = new ChartHistory();
let historicoD = new ChartHistory();

function resetChart() {
  Plotly.purge(chart);
}

function removeChartTitle() {
  $(chart).html("");
  $(chartSecundario).html("");
}

function insertNextDataChart() {
  // Não deixa inserir dados para segundos repetidos
  if (total_of_seconds == segundoRepetido) {
    return;
  }
  segundoRepetido = total_of_seconds;
  // Salva os valores atuais no(s) history(s) ---------------------------------------------
  //  Carnivoros
  history.carnivoros.population.push(popC.sem_div);
  history.carnivoros.speed.push(velMedC.sem_div);
  history.carnivoros.agility.push(forceMedC.sem_div);
  history.carnivoros.radius.push(radiusMedC.sem_div);
  history.carnivoros.detection.push(radiusDetMedC.sem_div);
  history.carnivoros.energy.push(energMedC.sem_div);
  history.carnivoros.energy_expenditure.push(taxaEnergMedC.sem_div);
  history.carnivoros.avg_litter_size.push(ninhadaMediaC.sem_div);

  //  Segundos
  history.seconds.push(total_of_seconds);

  // Outras infos para a análise de dados
  history.vegetables_per_seconds.push(input_vegetable_rate.value);

  // ------------------------------------------------------------------------------------------
  // Mesma variável de tempo para todos
  let arraySeconds = [total_of_seconds];

  // Identificar qual o gráfico atual
  let valores;

  switch (chartType) {
    case 1:
      valores = [history.carnivoros.population.last()];
      break;
    case 2:
      valores = [history.carnivoros.speed.last()];
      break;
    case 3:
      valores = [history.carnivoros.agility.last()];
      break;
    case 4:
      valores = [history.carnivoros.radius.last()];
      break;
    case 5:
      valores = [history.carnivoros.detection.last()];
      break;
    case 6:
      valores = [history.carnivoros.energy.last()];
      break;
    case 7:
      valores = [history.carnivoros.energy_expenditure.last()];
      break;
    case 8:
      valores = [history.carnivoros.avg_litter_size.last()];
  }

  Plotly.extendTraces(chart, { y: valores, x: arraySeconds }, [0, 1]);
  cnt++;
  if (cnt > 500) {
    Plotly.relayout("chart", {
      xaxis: {
        range: [cnt - 500, cnt],
      },
    });
  }
}

function changeChart(type) {
  if (type == chartType || type < 1 || type > 8) {
    return;
  }
  resetChart();
  removeChartTitle();
  buildChart(type);
  insertChartTitle();
  chartType = type;
}

function buildChart(type) {
  // ÍNDICE DE QUAL DADO PEGARÁ DO ARRAY DE DADOS (em relação ao carnívoro)
  //let indice = 1;               // Valores do gráfico 1 para servir de inicializador
  let title = "População";
  let yTitle = "N° Indivíduos"; //Título do eixo y
  let data = [];

  // Puxar o historico do novo tipo de grafico -----------------------------------------------------
  switch (type) {
    case 1: // População
      title = "População";
      yTitle = "Carnívoros";
      data = [history.carnivoros.population];
      break;
    case 2: // Velocidade
      //indice = 3;
      title = "Velocidade";
      yTitle = "Velocidade média";
      data = [history.carnivoros.speed];
      break;
    case 3: // Força
      //indice = 5;
      title = "Agilidade";
      yTitle = "Agilidade Média";
      data = [history.carnivoros.agility];
      break;
    case 4: // Raio
      //indice = 7;
      title = "Raio";
      yTitle = "Raio médio";
      data = [history.carnivoros.radius];
      break;
    case 5: // Raio detection
      //indice = 9;
      title = "Alcance de detecção";
      yTitle = "Raio de detecção médio";
      data = [history.carnivoros.detection];
      break;
    case 6: // Energia
      //indice = 11;
      title = "Energia";
      yTitle = "Nível de energy médio";
      data = [history.carnivoros.energy];
      break;
    case 7: // Taxa de energy
      //indice = 13;
      title = "Gasto de energy";
      yTitle = "Taxa de energy média";
      data = [history.carnivoros.energy_expenditure];
      break;
    case 8: // Tamanho médio da ninhada
      //indice = 15;
      title = "Ninhada média";
      yTitle = "Tamanho médio da ninhada";
      data = [history.carnivoros.avg_litter_size];
  }
  // -----------------------------------------------------------------------------------------------

  // INSERE TODO O HISTÓRICO DE DADOS NO GRÁFICO
  let carnivoros = {
    x: history.seconds,
    y: data[0],
    type: "scatter",
    mode: "lines",
    name: "Carnívoros",
    line: { color: "red", shape: "spline" },
  };

  let dataConfig = [carnivoros];

  var layout = {
    title: title,

    xaxis: {
      showline: true,
      domain: [0],
      title: "Segundos",
      showgrid: true,
    },
    yaxis: {
      showline: true,
      title: yTitle,
      rangemode: "tozero",
    },
    legend: {
      orientation: "h",
      traceorder: "reversed",
      x: 0.05,
      y: -0.3,
    },
    plot_bgcolor: "#222",
    paper_bgcolor: "#222",
    font: {
      color: "#ddd",
    },
  };

  Plotly.newPlot("chart", dataConfig, layout);
}
