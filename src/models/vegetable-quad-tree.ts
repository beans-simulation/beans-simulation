class VegetableQuadTree extends QuadTree {
    constructor(boundary: Rectangle, capacity: number){
        super(boundary, capacity);
    }

    private is_vegetable(point: any): point is Vegetable {
        return !!point?.vegetables;
    }

    search_elements(vision: Circle){
        const found = super.search(vision);
        return found;
    }
}
