class Historico {
    constructor() {
        this.organisms = new Infos();
        this.segundos = [];
        this.taxa_vegetables = []; // Vegetables por segundo
    }

    clear() {
        this.organisms.clear();
        this.segundos.length = 0;
    }
}