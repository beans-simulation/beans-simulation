interface PyImport {
  install(name: string): void;
}

interface Pyodide {
  runPython(comando: string): string;
  registerJsModule(key: string, value: any): void;
  loadPackage(name: string): void;
  pyimport(name: string): PyImport;
}

declare function loadPyodide(options?: { indexURL?: string }): Promise<Pyodide>;
