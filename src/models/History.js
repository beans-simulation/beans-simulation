class History {
    constructor() {
        this.organisms = new Info();
        this.seconds = [];
        this.vegetables_per_seconds = [];
    }

    clear() {
        this.organisms.clear();
        this.seconds.length = 0;
    }
}