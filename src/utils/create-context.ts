interface ICreateContext {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
}

export function create_context(): ICreateContext {
  const canvas = document.querySelector("canvas");

  if (canvas) {
    canvas.width = innerWidth;
    canvas.height = innerHeight - 8;

    return { canvas, context: canvas.getContext("2d") };
  }
  return { canvas, context: null };
}
