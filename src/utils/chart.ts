// Constantes
const AMOUNT_OF_TRACES = 10;

const trace_model: Partial<Plotly.ScatterData> = {
  x: [],
  y: [],
  mode: "lines+markers",
  visible: false,
  type: "scatter",
};

const labels: ChartLabel[] = [
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

// Montando o layout inicial ----------------------------
// quantidade de linhas (1 por gráfico)
const line_numbers = Array.from({ length: AMOUNT_OF_TRACES }).map((_, i) => i);

// layout principal com caracteristicas da primeira label
const layout: Partial<Plotly.Layout> = {
  ...labels[0],
  xaxis: {
    title: "Tempo",
    showline: true,
    domain: [0],
    showgrid: true,
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

function reset_chart() {
  if (chart) {
    const traces = line_numbers.map(() =>
      JSON.parse(JSON.stringify(trace_model))
    );

    Plotly.purge(chart);

    // mostrar linha do primeiro grafico
    traces[0].visible = true;
    Plotly.newPlot(chart, traces, layout);
    console.log(traces);
  }
}

reset_chart();

// Funcoes para mostrar e esconder linhas ----------------------------
function get_show_line_function(lineIndexes: number[], label: ChartLabel) {
  const lines_to_hide = line_numbers.filter(
    (num) => !lineIndexes.includes(num)
  );

  return function () {
    if (!chart) return;

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

function formatChartData(data_by_organism: ChartDataByOrganism): ChartData {
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

const format_time_for_chart = (formatted_time: string) => {
  return formatted_time;
};

async function updateChart(data_by_organism: ChartDataByOrganism) {
  if (!chart) return;

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

  Plotly.extendTraces(
    chart,
    {
      x,
      y: data_per_line,
    },
    line_numbers
  );
}
