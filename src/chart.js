// Função para retornar o ultimo elemento de um array sem retira-lo de la
Array.prototype.last = function() {
  return this[this.length - 1];
}

var cnt = 0;
var segundoRepetido = -1;
const chart = document.getElementById("chart")
const chartSecundario = document.getElementById("chartSecundario")

let historico = new Historico();
let historicoE = new Historico();
let historicoD = new Historico();


function resetChart() {
  Plotly.purge(chart);
}

function removeChartTitle() {
  $(chart).html("")
  $(chartSecundario).html("")
}

function insertNextDataChart() {
  // Não deixa inserir dados para segundos repetidos
  if(segundos_totais == segundoRepetido) {
    return;
  }
  segundoRepetido = segundos_totais;
  // Salva os valores atuais no(s) historico(s) ---------------------------------------------
    //  Carnivoros
    historico.carnivoros.populacao.push(popC.sem_div)
    historico.carnivoros.velocidade.push(velMedC.sem_div)
    historico.carnivoros.agilidade.push(forcaMedC.sem_div)
    historico.carnivoros.raio.push(raioMedC.sem_div)
    historico.carnivoros.deteccao.push(raioDetMedC.sem_div)
    historico.carnivoros.energia.push(energMedC.sem_div)
    historico.carnivoros.gasto.push(taxaEnergMedC.sem_div)
    historico.carnivoros.tamanho_medio_ninhada.push(ninhadaMediaC.sem_div)

    //  Segundos
    historico.segundos.push(segundos_totais)

    // Outras infos para a análise de dados
    historico.taxa_alimentos.push(inputTaxaAlimentos.value)

  // ------------------------------------------------------------------------------------------
  // Mesma variável de tempo para todos
  let arraySeconds = [segundos_totais];

  // Identificar qual o gráfico atual
  let valores;

  switch(chartType) {
    case 1:
      valores = [historico.carnivoros.populacao.last()];
      break;
    case 2:
      valores = [historico.carnivoros.velocidade.last()];
      break;
    case 3:
      valores = [historico.carnivoros.agilidade.last()];
      break;
    case 4:
      valores = [historico.carnivoros.raio.last()];
      break;
    case 5:
      valores = [historico.carnivoros.deteccao.last()];
      break;
    case 6:
      valores = [historico.carnivoros.energia.last()];
      break;
    case 7:
      valores = [historico.carnivoros.gasto.last()];
      break;
    case 8:
      valores = [historico.carnivoros.tamanho_medio_ninhada.last()];
  }

  Plotly.extendTraces(chart,{y: valores, x: arraySeconds}, [0,1]);
  cnt++;
    if(cnt >500) {
        Plotly.relayout('chart',{
            xaxis: {
                range: [cnt-500,cnt]
            }
        });
    }

}

function changeChart(type) {
  if(type == chartType || type < 1 || type > 8) {
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
      data = [historico.carnivoros.populacao];
      break;
    case 2: // Velocidade
      //indice = 3;
      title = "Velocidade";
      yTitle = "Velocidade média";
      data = [historico.carnivoros.velocidade];
      break;
    case 3: // Força
      //indice = 5;
      title = "Agilidade";
      yTitle = "Agilidade Média";
      data = [historico.carnivoros.agilidade];
      break;
    case 4: // Raio
      //indice = 7;
      title = "Raio";
      yTitle = "Raio médio";
      data = [historico.carnivoros.raio];
      break;
    case 5: // Raio deteccao
      //indice = 9;
      title = "Alcance de detecção";
      yTitle = "Raio de detecção médio";
      data = [historico.carnivoros.deteccao];
      break;
    case 6: // Energia
      //indice = 11;
      title = "Energia";
      yTitle = "Nível de energia médio";
      data = [historico.carnivoros.energia];
      break;
    case 7: // Taxa de energia
      //indice = 13;
      title = "Gasto de energia";
      yTitle = "Taxa de energia média";
      data = [historico.carnivoros.gasto];
      break;
    case 8: // Tamanho médio da ninhada
      //indice = 15;
      title = "Ninhada média";
      yTitle = "Tamanho médio da ninhada";
      data = [historico.carnivoros.tamanho_medio_ninhada];
  }
  // -----------------------------------------------------------------------------------------------

  // INSERE TODO O HISTÓRICO DE DADOS NO GRÁFICO
  let carnivoros = {
    x: historico.segundos,
    y: data[0],
    type: 'scatter',
    mode: 'lines',
    name: 'Carnívoros',
    line: { color: 'red', shape: 'spline'}
  };

  let dataConfig = [carnivoros];

  var layout = {
  title: title,

  xaxis: {
      showline: true,
      domain: [0],
      title: "Segundos",
      showgrid: true
  },
  yaxis: { 
      showline: true, 
      title: yTitle, 
      rangemode: "tozero" 
  },
  legend: {
      orientation: 'h',
          traceorder: 'reversed',
      x: 0.05,
      y: -.3
  },
  plot_bgcolor:"#222",
  paper_bgcolor:"#222",
  font: {
      color: '#ddd'
  }
}

  Plotly.newPlot('chart', dataConfig, layout);

}

