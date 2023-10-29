interface PyImport {
  install(name: string): void;
}
interface PyodideGlobals {
  get(key: string): any;
}

interface Pyodide {
  runPython(comando: string): string;
  registerJsModule(key: string, value: any): void;
  loadPackage(name: string): void;
  pyimport(name: string): PyImport;
  globals: PyodideGlobals; 

}

declare function loadPyodide(options?: { indexURL?: string }): Promise<Pyodide>;
