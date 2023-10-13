function format_color(color: string) {
  return parseInt(color).toString(16).padStart(2, "0");
}

function rgb_to_hex(rgb: string) {
  const colors = rgb.match(/\d{1,3}/gi)?.map(format_color);

  if (colors?.length === 3) {
    const [r, g, b] = colors;
    return "#" + r + g + b;
  }
  throw new Error(`Invalid RGB: ${rgb}`);
}
