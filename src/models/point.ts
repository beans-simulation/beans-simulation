class Point {
    public x: number;
    public y: number;
    public position: Vector;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.position = new Vector(x, y)
    }
}