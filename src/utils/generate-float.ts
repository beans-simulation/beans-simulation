function generate_float(min: number, max: number) {
  const delta = max - min; // exemplo: 4000 e 6000. 6000 - 4000 = 2000
  const num = Math.random() * delta + min; // Math.random() * 2000 + 4000
  return parseFloat(num.toFixed(4));
}
