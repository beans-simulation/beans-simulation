class Circle {
    /*
    O Circle é o circulo de visão de cada organismo que irá fazer a busca
    (x, y) é a coordenada do seu centro.
    */
    public x: number;
    public y: number;
    public radius: number;
    public radiusSquared: number;

    constructor(x: number, y: number, radius: number){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.radiusSquared = this.radius * this.radius;
    }

    // Verifica se o circulo contém o ponto passado como argumento
    contains(point: Point){
        // Para verificar se um ponto está dentro de um circulo, é necessário fazer:
        // Checar a distancia euclidiana entre o ponto e o centro do circulo é menor ou igual ao raio do circulo.
        // "A soma dos catetos é igual ao quadrado da hipotenusa"
        return (Math.pow((point.x - this.x),2) + Math.pow((point.y - this.y), 2) <= this.radiusSquared)
    }

    intersects(range: Rectangle){
        
        let x_dist = Math.abs(range.x - this.x); // linha entre o ponto x do circulo e o ponto x do range
        let y_dist = Math.abs(range.y - this.y); 

        var radius = this.radius;

        var width = range.width;
        var height = range.height;

        // edges é o quadrado dos catetos 
        // x_dist - width é representação do ponto das extremidades
        var edges = Math.pow((x_dist - width), 2) + Math.pow((y_dist - height), 2);

        if(x_dist > radius + width || y_dist > radius + height){ // condição para não intersecção
            return false;
        }
        else if ( x_dist <= width || y_dist<= height){ // intersecção dentro do circulo
            return true;
        }

        // intersecção acontecendo no limite do circulo
        return edges <= this.radiusSquared;
    }
}