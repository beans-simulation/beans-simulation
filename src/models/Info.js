class Info {
    constructor(){
        this.population = [];
        this.speed = [];
        this.agility = [];
        this.radius = [];
        this.detection = [];
        this.energy = [];
        this.energy_expenditure = [];
        this.avg_litter_size = [];
    }

    clear() {
        this.population.length = []
        this.speed.length = []
        this.agility.length = []
        this.radius.length = []
        this.detection.length = []
        this.energy.length = []
        this.energy_expenditure.length = []
        this.avg_litter_size.length = [];
    }
}