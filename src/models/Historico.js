class Historico {
    constructor() {
        this.herbivoros = new Infos();
        this.organisms = new Infos();
        this.segundos = [];
        this.taxa_alimentos = []; // Alimentos por segundo
    }

    clear() {
        this.herbivoros.clear();
        this.organisms.clear();
        this.segundos.length = 0;
    }
}