interface Pyodide {
  runPython(comando: string): string;
}

declare function loadPyodide(): Promise<Pyodide>;
