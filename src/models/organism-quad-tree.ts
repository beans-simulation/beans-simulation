class OrganismQuadTree extends QuadTree {
    constructor(boundary: Rectangle, capacity: number){
        super(boundary, capacity);
    }

    private is_organism(point: any): point is Organism {
        if(point?.birth_moment_in_milliseconds !== undefined){
            return true
        }
        return false
    }

    search_elements(vision: Circle, self_id?: number){
        const found = super.search(vision);
        return found.filter(organism => {
            if(this.is_organism(organism)){
                return organism.id !== self_id
            }
            return false;
        })
    }
}
