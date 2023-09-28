export function generate_integer(min: number, max: number) {
  const minimum = Math.ceil(min);
  const delta = Math.floor(max) - minimum;
  return Math.floor(Math.random() * delta) + minimum;
}
