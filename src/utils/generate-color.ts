function random_color() {
  return Math.floor(Math.random() * 256);
}

function generate_color() {
  const r = random_color();
  const g = random_color();
  const b = random_color();
  return `rgb(${r},${g},${b})`;
}
