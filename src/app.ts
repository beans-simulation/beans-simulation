import { configureContext } from "./utils";

const app = async () => {
  const { canvas, context, device } = await configureContext();

  // the dream starts here!
};

app();

export { app };
