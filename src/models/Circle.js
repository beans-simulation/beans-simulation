class Circle{
    constructor(x,y,r){ 
        this.x = x;
        this.y = y;
        this.r = r;
    }

    // Checa se o point está contido dentro de seus limites (fronteiras)
    contains_point(point){
        let xPoint = point.position.x;
        let yPoint = point.position.y;

        return(
            Math.sqrt(Math.pow(xPoint - this.x, 2) + Math.pow(yPoint - this.y, 2)) <= this.r // Se a distância do point até o círculo for menor ou igual ao radius
        );
    }

    // Método para saber se os retângulos se interseptam
    intersept(scope){
        return !( // Se essa expressão for verdade, eles NÃO se interceptam
            scope.x - scope.w > this.x + this.w ||
            scope.x + scope.w < this.x - this.w ||
            scope.y - scope.h > this.y + this.h ||
            scope.y + scope.h < this.y - this.h
        );
    }
}