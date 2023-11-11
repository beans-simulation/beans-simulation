// Constantes
const AMOUNT_OF_TRACES = 5;

const trace_model: Partial<Plotly.ScatterData> = {
  x: [],
  y: [],
  mode: "lines+markers",
  visible: true,
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
const traces = line_numbers.map(() => JSON.parse(JSON.stringify(trace_model)));

// layout principal com caracteristicas da primeira label
const layout: Partial<Plotly.Layout> = {
  ...labels[0],
  xaxis: { title: "Timestamp", showline: true, domain: [0], showgrid: true },
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

if (chart) {
  // mostrar linha do primeiro grafico
  traces[0].visible = true;
  Plotly.newPlot(chart, traces, layout);
}

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

function updateData() {
  if (!chart) return;

  var now = new Date();
  var formattedTime = now.toISOString(); // Format datetime as string

  var newY = Organism.organisms.length;

  const x = line_numbers.map(() => [formattedTime]);

  Plotly.extendTraces(
    chart,
    {
      x,
      y: [[newY], [-newY], [newY / 2], [-newY / 2], [0]],
    },
    line_numbers
  );

  setTimeout(updateData, 1000);
}

updateData();
