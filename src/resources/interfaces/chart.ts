type ChartLabel = Pick<Plotly.Layout, "title" | "yaxis">;

interface ChartDataByOrganism {
  sum: {
    detection_radius: number;
    diet: number;
    energy_consumption: number;
    energy: number;
    force: number;
    lifetime: number;
    maturity: number;
    radius: number;
    speed: number;
  };
  time: string;
  number_of_organisms: number;
}
interface ChartData {
  population: number;
  time: string;
  average: {
    detection_radius: number;
    diet: number;
    energy_consumption: number;
    energy: number;
    force: number;
    lifetime: number;
    maturity: number;
    size: number;
    speed: number;
  };
}
