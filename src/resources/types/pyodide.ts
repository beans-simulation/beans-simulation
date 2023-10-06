interface Pyodide {
  runPython(comando: string): string;
}

declare function loadPyodide(options?: { indexURL?: string }): Promise<Pyodide>;
