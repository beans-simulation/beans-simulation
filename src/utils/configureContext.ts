interface ConfigureContextResult {
  canvas: HTMLCanvasElement | null;
  context: GPUCanvasContext | null;
  device: GPUDevice;
}

//@todo: show error modal instead of throwing error when gpu is not supported
const configureContext = async (): Promise<ConfigureContextResult> => {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported on this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No appropriate GPUAdapter found.");
  }

  // recursos de hardware mais potentes podem ser definidos no requestDevice
  const device = await adapter.requestDevice();

  const canvas = document.querySelector("canvas");

  if (canvas) {
    const context = canvas.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    if (context) {
      context.configure({
        device: device,
        format: canvasFormat,
      });
    }
    return { canvas, context, device };
  }
  return { canvas, context: null, device };
};

export { configureContext };
