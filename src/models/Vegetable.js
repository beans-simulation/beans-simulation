class Vegetable{
    static vegetables = [];
    static id = 0;

    constructor(x, y, raio){
        this.posicao = new Vetor(x, y);
        this.raio = raio;
        // a energia do pedaço de vegetable é proporcinal à sua área
        this.energia_vegetable = Math.floor(Math.PI * Math.pow(this.raio, 2)) * 15;

        Vegetable.vegetables.push(this);

        // ID
        this.id = Vegetable.id++;
    }

    display(){
        c.beginPath();
        c.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI * 2);
        c.fillStyle = "rgb(115, 158, 115)";
        c.fill();
    }


    checaId(id){
        return (id == this.id);
    }
}