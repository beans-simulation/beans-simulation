class Rectangle{
    constructor(x,y,w,h){ // o w e o h são a distância do CENTRO até a borda do retângulo!
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    // Checa se o point está contido dentro de seus limites (fronteiras)
    contains_point(point){
        return(
            point.position.x >= this.x - this.w &&
            point.position.x <= this.x + this.w &&
            point.position.y >= this.y - this.h &&
            point.position.y <= this.y + this.h
        );
    }


    // Método para saber se os retângulos se interseptam
    does_intercept_rectangle(scope){
        return !( // Se essa expressão for verdade, eles NÃO se interceptam
            scope.x - scope.w > this.x + this.w ||
            scope.x + scope.w < this.x - this.w ||
            scope.y - scope.h > this.y + this.h ||
            scope.y + scope.h < this.y - this.h
        );
    }

    // Método para saber se o retângulo intersepta um círculo
    does_intercept_circle(circle){
        // temporary variables to set edges for testing
        let testX = circle.x;
        let testY = circle.y;

        // which edge is closest?
        if (circle.x < this.x - this.w){
            testX = this.x - this.w;
        } else if (circle.x > this.x + this.w){
            testX = this.x + this.w; 
        }

        if (circle.y < this.y - this.h){
            testY = this.y - this.h;
        } else if (circle.y > this.y + this.h){
            testY = this.y + this.h;
        }

        // get distance from closest edges
        let distX = circle.x - testX;
        let distY = circle.y - testY;
        let distance = Math.sqrt((distX*distX) + (distY*distY));

        // if the distance is less than the radius, collision!
        if (distance <= circle.r) {
            return true;
        }
        return false;
        // return !( // Se essa expressão for verdade, eles NÃO se interceptam
        //     ( // O centro do círculo se encontra fora do retângulo
        //         circle.x  > this.x + this.w ||
        //         circle.x < this.x - this.w ||
        //         circle.y > this.y + this.h ||
        //         circle.y < this.y - this.h
        //     ) && ( 
        //         // Nenhum dos vértices do retângulo se encontra dentro do círculo
        //         // Vértice noroeste
        //         Math.sqrt(Math.pow((this.x - this.w) - (circle.x), 2) + Math.pow((this.y - this.h) - (circle.y), 2)) > circle.r &&
        //         // Vértice nordeste
        //         Math.sqrt(Math.pow((this.x + this.w) - (circle.x), 2) + Math.pow((this.y - this.h) - (circle.y), 2)) > circle.r &&
        //         // Vértice sudeste
        //         Math.sqrt(Math.pow((this.x + this.w) - (circle.x), 2) + Math.pow((this.y + this.h) - (circle.y), 2)) > circle.r &&
        //         // Vértice sudoeste
        //         Math.sqrt(Math.pow((this.x - this.w) - (circle.x), 2) + Math.pow((this.y + this.h) - (circle.y), 2)) > circle.r
        //     )
        // );
    }
}