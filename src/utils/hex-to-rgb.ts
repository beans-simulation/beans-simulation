export function hex_to_rgb(hex: string) {
  const colors = hex.match(/\w{2}/g)?.map((color) => parseInt(color, 16));

  if (colors?.length === 3) {
    const [r, g, b] = colors;
    return `rgb(${r},${g},${b})`;
  }
  throw new Error(`Invalid hex: ${hex}`);
}
