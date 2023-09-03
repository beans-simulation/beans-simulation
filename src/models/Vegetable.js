class Vegetable{
    static vegetables = [];
    static id = 0;

    constructor(x, y, radius){
        this.position = new Vector(x, y);
        this.radius = radius;
        // a energia do pedaço de vegetable é proporcinal à sua área
        this.vegetable_energy = Math.floor(Math.PI * Math.pow(this.radius, 2)) * 15;

        Vegetable.vegetables.push(this);

        // ID
        this.id = Vegetable.id++;
    }

    display(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = "rgb(115, 158, 115)";
        c.fill();
    }


    checaId(id){
        return (id == this.id);
    }
}