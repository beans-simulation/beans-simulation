function create_neural_network(pyodide:Pyodide): number{
    pyodide.runPython(`
        nn = neural_network.create_network()
        network_id = nn.id
    `);
    return pyodide.globals.get('network_id')
}
