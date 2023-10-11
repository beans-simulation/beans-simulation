function loadWasmFile(url: string): { binary: Promise<any | null> } {
  const load = async () => {
    let binary: ArrayBuffer | null = null;
    try {
      const response = await fetch(url);
      binary = await response.arrayBuffer();
    } catch (ex: any) {
      console.error("Erro ao baixar o arquivo wasm: " + ex.message);
    }
    return binary;
  };
  return {
    binary: load(),
  };
}
