class QuadTree {
    public boundary: Rectangle;
    public capacity: number;
    public divided: boolean;
    public northeast!: QuadTree;
    public northwest!: QuadTree;
    public southeast!: QuadTree;
    public southwest!: QuadTree;

    public points: Point[];

    constructor(boundary: Rectangle, capacity: number){
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    // subdividir os quadrantes
    subdivide() {
        let x = this.boundary.x;
        let y = this.boundary.y;
        let width = this.boundary.width/2;
        let height = this.boundary.height/2;

        let northeast = new Rectangle(x+width, y-height, width, height);
        this.northeast = new QuadTree(northeast, this.capacity);
        let northwest = new Rectangle(x-width, y-height, width, height);
        this.northwest = new QuadTree(northwest, this.capacity);
        let southeast = new Rectangle(x+width, y+height, width, height);
        this.southeast = new QuadTree(southeast, this.capacity);
        let southwest = new Rectangle(x-width, y+height, width, height);
        this.southwest = new QuadTree(southwest, this.capacity);

        this.divided = true;
    }

    // insert point
    insert(point: Point): boolean {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();

            for(let p of this.points){
                (this.northeast.insert(p) || this.northwest.insert(p) ||
                this.southeast.insert(p) || this.southwest.insert(p))
            }
        }

        const inserted: boolean = this.northeast.insert(point)||
            this.northwest.insert(point)  ||
            this.southeast.insert(point)||
            this.southwest.insert(point)
        if(inserted) {
            this.points.length = 0
        }
        return inserted
    }

    // busca
    protected search(range: Rectangle | Circle, found?: Point[]) {
        if(!found){
            found = [];
        }

        // SE a range nem interceptar a boundary respectiva, nem processa nada, retorna vazio
        if(!range.intersects(this.boundary)){
            return found;
        }

        for (let point of this.points){
            if(range.contains(point) && !found.includes(point)){
                found.push(point);
            }
        }
        // SE esse Rectangle estiver dividido, é necessario checar seus outros quatro quadrantes
        if (this.divided) {
            this.northwest.search(range, found);
            this.northeast.search(range, found);
            this.southwest.search(range, found);
            this.southeast.search(range, found);
        }

        return found;
    }

    display(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.rect(
          this.boundary.x - this.boundary.width,
          this.boundary.y - this.boundary.height,
          this.boundary.width * 2,
          this.boundary.height * 2
        );
        context.stroke();
        if (this.divided) {
          this.northeast.display(context);
          this.northwest.display(context);
          this.southeast.display(context);
          this.southwest.display(context);
        }
      }

}
