class OrganismQuadTree extends QuadTree {
    constructor(boundary: Rectangle, capacity: number){
        super(boundary, capacity);        
    }

    search_elements(vision: Circle, self_id?: number){
        const found = super.search(vision);

        return found.filter(organism => {
            if(organism instanceof Organism){
                return organism.id != self_id
            }
        });
    } 
}