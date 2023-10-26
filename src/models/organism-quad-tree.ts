class OrganismQuadTree extends QuadTree {
    constructor(boundary: Rectangle, capacity: number){
        super(boundary, capacity);        
    }
    
    private is_organism(point: any): point is Organism {
        let a = !!point?.dna;
        return !!point?.dna;
    }

    search_elements(vision: Circle, self_id?: number){
        const found = super.search(vision);
        if(found.length > 1){

            console.log('found:', found);
        }
        return found.filter(organism => {
            if(this.is_organism(organism)){
                organism.id !== self_id
                debugger;
            }
        });
        
        // Não funciona
        // .filter(organism => {
        //     if(this.is_organism(organism)){
        //         organism.id !== self_id
        //     }
        //     // return [];
        // })
    } 
}