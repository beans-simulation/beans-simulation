class Rectangle {
    /*
    O Rectangle é o quadrado que irá conter um ponto na quadtree.
    O algoritmo de subdivisão ocorre na quadtree, mas utiliza como base o Rectangle. Caso o mesmo contenha mais de n capacity de pontos, ele se subdivide
    (x, y) é a coordenada do seu centro.
    */
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    constructor(x: number, y: number, width: number, height: number){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Verifica se o retangulo contém o ponto passado como argumento
    contains(point: Point) {
        return (point.position.x >= this.x - this.width &&
            point.position.x <= this.x + this.width &&
            point.position.y >= this.y - this.height &&
            point.position.y <= this.y + this.height);
    }

    intersects(range: Rectangle){
        return !(range.x - range.width > this.x + this.width ||
            range.x + range.width < this.x - this.width ||
            range.y - range.height > this.y + this.height ||
            range.y + range.height < this.y - this.height);
    }
}