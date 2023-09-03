// classe para a construção de vectors
class Vector{                         
    constructor(x, y){
      this.x = x;                               
      this.y = y;
    }
    
    // reseta os valores x e y do vector para os valores especificados
    set(x,y) {
        this.x = x;                            
        this.y = y;
    };
    
    // retorna o tamanho do vector ao quadrado
    magnitude_squared() {               
        var x = this.x, y = this.y;
        return x * x + y * y;
    };

    // retorna o tamanho do vector
    magnitude(){                   
        return Math.sqrt(this.magnitude_squared());
    };

    // soma o vector atual com um novo especificado e retorna o próprio vector (atualizado), e não um novo
    add(v) {               
        this.x += v.x;
        this.y += v.y;
        return this;
    };

    // subtracttrai um vector especificado do atual e retorna o próprio vector (atualizado), e não um novo
    subtract(v) {                
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };

    // subtracttrai um vector especificado do atual e retorna um novo
    subtract_new(v) {                
      var x = this.x - v.x;
      var y = this.y - v.y;
      return new Vector(x, y);
    };

    // retorna este vector após divideidí-lo por um valor especificado
    // serve para diminuir o tamanho de um vector. Assim, se n for dois, o vector terá a metade do tamanho
    divide(n) {                 
        this.x /= n;                           
        this.y /= n;
        return this;
    };

    // retorna este vector após multiplytiplicá-lo por um valor especificado
    // serve para aumentar o tamanho de um vector. Assim, se n for dois, o vector terá o dobro do tamanho
    multiply(n) {               
        this.x *= n;                      
        this.y *= n;
        return this;
    };

    // muda o tamanho de um vector pra 1 (isso se chama normalizar um vector)
    normalize() {             
        // divideide o próprio vector pelo vector retornado em magnitude(), ou seja, divideide ele mesmo pelo seu tamanho,
        // resultando em 1 
        return this.divide(this.magnitude());        
    };

    // muda o tamanho do vector para um valor especificado
    set_magnitude(n) {                
        // normaliza (muda o tamanho para 1) e então multiplytiplica por n
        return this.normalize().multiply(n);      
    };

    // retorna a distância entre dois points (definidos por x e y de um vector v)
    distance(v) {                 
        var d = v.copy().subtract(this);          
        return d.magnitude();
    };

    // limita o tamanho do vector para um valor limite (usamos esse método para limitar a velocidade, por exemplo)
    limit(l) {               
        var mSq = this.magnitude_squared();                 
        if(mSq > l*l) {                       
            this.divide(Math.sqrt(mSq));
            this.multiply(l);
        }
        return this;
    };

    // retorna a direção pra qual o vector está apondando (em radianos)
    heading_rads() {           
        var h = Math.atan2(this.y, this.x);
        return h;
    };

    // retorna a direção pra qual o vector está apondando (em graus)
    heading_degs() {          
        var r = Math.atan2(this.y, this.x);
        var h = (r * 180.0) / Math.PI;
        return h;
    };

    // rotaciona o vector em 'a' radianos
    // podemos usar isso para que o desenho do bichinho rotacione pra estar sempre alinhado a seu movimento
    rotate_rads(a) {          
        var newHead = this.heading_rads() + a;   
        var magnitude = this.magnitude();
        this.x = Math.cos(newHead) * magnitude;
        this.y = Math.sin(newHead) * magnitude;
        return this;
    };

    // rotaciona o vector em 'a' graus
    rotate_degs(a) {     
        a = (a * Math.PI)/180.0;           
        var newHead = this.heading_rads() + a;   
        var magnitude = this.magnitude();
        this.x = Math.cos(newHead) * magnitude;
        this.y = Math.sin(newHead) * magnitude;
        return this;
    };

    // retorna o ângulo entre dois vectors (em radianos)  -->  /\
    angle_between_degs(x,y) {  
        var r = this.angleBetweenRads(x,y);
        var d = (r * 180)/Math.PI;
        return d;
    }

    // checa se dois vectors são idênticos e retorna um booleano
    equals(x, y) {          
        var a, b;                    
        if (x instanceof Vector) {       
            a = x.x || 0;
            b = x.y || 0;
        } else {
            a = x || 0;
            b = y || 0;
        }

        return this.x === a && this.y === b;
    };

    // retorna uma cópia deste vector
    copy(){
        return new Vector(this.x,this.y);   
    }                                        

}