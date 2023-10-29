const trace: Partial<Plotly.ScatterData> = {
    x: [],
    y: [],
    mode: 'lines+markers',
    type: 'scatter'
  };
  
  const layout: Partial<Plotly.Layout> = {
    title: 'Número de organismos',
    xaxis: {  title: 'Timestamp',
              showline: true,
              domain: [0], 
              showgrid: true
    },
    yaxis: {  title: 'Total de Organismos',
              showline: true,
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
  };
  
  const plotlyDiv = document.getElementById('plotly-graph')!;

  Plotly.newPlot(plotlyDiv, [trace], layout);
  
  function updateData() {
    var now = new Date();
    var formattedTime = now.toISOString(); // Format datetime as string
  
    var newY = Organism.organisms.length;
  
    Plotly.extendTraces(plotlyDiv, { x: [[formattedTime]], y: [[newY]] }, [0]);
  
    setTimeout(updateData, 1000);
  }
  
  updateData();
  
  
  