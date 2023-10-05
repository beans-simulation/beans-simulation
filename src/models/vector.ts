// classe para a construção de vectors
class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // reseta os valores x e y do vector para os valores especificados
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // retorna o tamanho do vector ao quadrado
  magnitude_squared() {
    const x = this.x;
    const y = this.y;
    return x * x + y * y;
  }

  // retorna o tamanho do vector
  magnitude() {
    return Math.sqrt(this.magnitude_squared());
  }

  // soma o vector atual com um novo especificado e retorna o próprio vector (atualizado), e não um novo
  add(vector: Vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  // subtracttrai um vector especificado do atual e retorna o próprio vector (atualizado), e não um novo
  subtract(vector: Vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  // subtracttrai um vector especificado do atual e retorna um novo
  subtract_new(vector: Vector) {
    const x = this.x - vector.x;
    const y = this.y - vector.y;
    return new Vector(x, y);
  }

  // retorna este vector após dividí-lo por um valor especificado
  // serve para diminuir o tamanho de um vector. Assim, se n for dois, o vector terá a metade do tamanho
  divide(divider: number) {
    this.x /= divider;
    this.y /= divider;
    return this;
  }

  // retorna este vector após multiplytiplicá-lo por um valor especificado
  // serve para aumentar o tamanho de um vector. Assim, se n for dois, o vector terá o dobro do tamanho
  multiply(multiplier: number) {
    this.x *= multiplier;
    this.y *= multiplier;
    return this;
  }

  // muda o tamanho de um vector pra 1 (isso se chama normalizar um vector)
  normalize() {
    // divide o próprio vector pelo vector retornado em magnitude(), ou seja, divide ele mesmo pelo seu tamanho,
    // resultando em 1
    return this.divide(this.magnitude());
  }

  // muda o tamanho do vector para um valor especificado
  set_magnitude(multiplier: number) {
    // normaliza (muda o tamanho para 1) e então multiplica por n
    return this.normalize().multiply(multiplier);
  }

  // retorna a distância entre dois points (definidos por x e y de um vector v)
  distance(vector: Vector) {
    return vector.subtract_new(this).magnitude();
  }

  // limita o tamanho do vector para um valor limite (usamos esse método para limitar a velocidade, por exemplo)
  limit(limit: number) {
    const mSq = this.magnitude_squared();
    if (mSq > limit * limit) {
      this.divide(Math.sqrt(mSq));
      this.multiply(limit);
    }
    return this;
  }

  // retorna a direção pra qual o vector está apontando (em radianos)
  heading_radians() {
    return Math.atan2(this.y, this.x);
  }

  // retorna a direção pra qual o vector está apondando (em graus)
  heading_degrees() {
    const radians = this.heading_radians();
    return (radians * 180.0) / Math.PI;
  }

  // rotaciona o vector em 'a' radianos
  // podemos usar isso para que o desenho do bichinho rotacione pra estar sempre alinhado a seu movimento
  rotate_radians(angle_radians: number) {
    const newHead = this.heading_radians() + angle_radians;
    const magnitude = this.magnitude();
    this.x = Math.cos(newHead) * magnitude;
    this.y = Math.sin(newHead) * magnitude;
    return this;
  }

  // rotaciona o vector em 'a' graus
  rotate_degrees(angle_degrees: number) {
    const angle_radians = (angle_degrees * Math.PI) / 180;
    return this.rotate_radians(angle_radians);
  }

  // retorna o ângulo entre dois vectors (em radianos)  -->  /\
  //   angle_between_radians(x, y) {
  //     var r = this.angleBetweenRads(x, y);
  //     var d = (r * 180) / Math.PI;
  //     return d;
  //   }

  // checa se dois vectors são idênticos e retorna um booleano
  equals(vector: Vector) {
    return this.x === vector.x && this.y === vector.y;
  }
  equalsNumber(a: number, b: number) {
    return this.x === a && this.y === b;
  }

  // retorna uma cópia deste vector
  copy() {
    return new Vector(this.x, this.y);
  }
}
