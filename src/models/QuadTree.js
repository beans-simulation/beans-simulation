class QuadTree{
    constructor(rectangle, supported_amout_of_point){
        this.rectangle = rectangle; // Atributo do tipo Retângulo
        this.supported_amout_of_point = supported_amout_of_point; // A partir de quantos points (neste caso, seres vivos) o retângulo se subdivide
        this.points = [];
        this.vegetables = [];
        this.organisms = [];
        this.is_divided = false;
    }
    
    // Subdivide a QuadTree em 4 retângulos children
    subdivide(){
        let x = this.rectangle.x;
        let y = this.rectangle.y;
        let w = this.rectangle.w;
        let h = this.rectangle.h;

        let ne = new Rectangle(x + w/2, y - h/2, w/2, h/2);
        this.northeast = new QuadTree(ne, this.supported_amout_of_point); //nordeste

        let nw = new Rectangle(x - w/2, y - h/2, w/2, h/2);
        this.northwest = new QuadTree(nw, this.supported_amout_of_point); //noroeste

        let se = new Rectangle(x + w/2, y + h/2, w/2, h/2);
        this.southeast = new QuadTree(se, this.supported_amout_of_point); //sudeste

        let sw = new Rectangle(x - w/2, y + h/2, w/2, h/2);
        this.southwest = new QuadTree(sw, this.supported_amout_of_point); //sudoeste

        this.is_divided = true;

    }

    insert_point(point){
        if(!this.rectangle.contains_point(point)){ // Checa se o point está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }

        if(this.points.length < this.supported_amout_of_point){
            this.points.push(point);
            return true;
        } else{ // Se a supported_amout_of_point máxima tiver sido atingida
            if(!this.is_divided){ // A QuadTree não irá se subdividir caso já o tenha feito
                this.subdivide();
            }

            // Não checamos a localização do point pois ele será checado nw começo de cada chamada desses métodos
            if(this.northeast.insert_point(point)){
                return true;
            } else if(this.northwest.insert_point(point)){
                return true;
            } else if(this.southeast.insert_point(point)){
                return true;
            } else if(this.southwest.insert_point(point)){
                return true;
            };            
        }
    }

    insert_vegetable(vegetable){
        if(!this.rectangle.contains_point(vegetable)){ // Checa se o vegetable está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }

        if(this.vegetables.length < this.supported_amout_of_point){ // Se ainda couber vegetables dentro dela
            this.vegetables.push(vegetable); // Insere o vegetable em sua lista
            // console.log("vegetables ", this.vegetables);
            return true;
        } else{ // Se a supported_amout_of_point máxima de seres vivos tiver sido atingida            
            if(!this.is_divided){ // A QuadTree não irá se subdividir caso já o tenha feito
                // console.log("inserirVegetables", this.vegetables);
                this.subdivide();
                // console.log("SUBDIVIDIU - A", this.supported_amout_of_point);
            }

            // Não checamos a localização do vegetable pois ela será checada nw começo de cada chamada desses métodos
            if(this.northeast.insert_vegetable(vegetable)){
                return true;
            } else if(this.northwest.insert_vegetable(vegetable)){
                return true;
            } else if(this.southeast.insert_vegetable(vegetable)){
                return true;
            } else if(this.southwest.insert_vegetable(vegetable)){
                return true;
            };            
        }
    }


    insert_organism(organism){
        if(!this.rectangle.contains_point(organism)){ // Checa se o organism está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }
        
        if(this.organisms.length < this.supported_amout_of_point){ // Se ainda couber organisms dentro dela
            // console.log("DANDO PUSH");
            this.organisms.push(organism); // Insere o organism em sua lista
            // console.log("organisms ", this.organisms);
            return true;
        } else{ // Se a supported_amout_of_point máxima de seres vivos tiver sido atingida    
            if(!this.is_divided){ // A QuadTree não irá se subdividir caso já o tenha feito
                // console.log("insertOrganisms", this.organisms);
                this.subdivide();
                // console.log("SUBDIVIDIU - C", this.supported_amout_of_point);
            }
            
            // Não checamos a localização do organism pois ela será checada no começo de cada chamada desses métodos
            if(this.northeast.insert_organism(organism)){
                return true;
            } else if(this.northwest.insert_organism(organism)){
                return true;
            } else if(this.southeast.insert_organism(organism)){
                return true;
            } else if(this.southwest.insert_organism(organism)){
                return true;
            };            
        }
    }

    search_points(scope, located){ // scope é do tipo Rectangle
        if(!located){
            located = [];
        }
        if(!this.rectangle.intersept(scope)){ // Se NÃO se interceptam, não executa o código
            return;
        } else{ // Se eles se interceptam
            for(let p of this.points){ // Para os points dessa QuadTree
                if(scope.contains_point(p)){ // Se o point pertencer ao retângulo "scope"
                    located.push(p);
                }
            }

            if(this.is_divided){ // Se a QuadTree tiver QuadTrees filhas
                this.northwest.search_points(scope, located); 
                this.northeast.search_points(scope, located); 
                this.southwest.search_points(scope, located); 
                this.southeast.search_points(scope, located);
            }

            return located;
        }
    }

    search_vegetables(circle, located){
        if(!located){
            located = [];
        }
        if(!this.rectangle.does_intercept_circle(circle)){ // Se NÃO se interceptam, não executa o código
            return located;
        } else{ // Se eles se interceptam
            for(let a of this.vegetables){ // Para os vegetables dessa QuadTree
                if(circle.contains_point(a)){ // Se o vegetable pertencer ao círculo
                    located.push(a);
                }
            }

            if(this.is_divided){ // Se a QuadTree tiver QuadTrees filhas
                this.northwest.search_vegetables(circle, located); 
                this.northeast.search_vegetables(circle, located); 
                this.southwest.search_vegetables(circle, located); 
                this.southeast.search_vegetables(circle, located);
            }

            return located;
        }
    }

    find_prey_element(circle,predator_id,located){
        if(!located){
            located = [];
        }
        if(!this.rectangle.does_intercept_circle(circle)){ // Se NÃO se interceptam, não executa o código
            return located;
        } else{ // Se eles se interceptam
            let possible_prey_organisms = this.organisms.filter(item => item.id !== predator_id);
            for(let o of this.organisms){ // Para os organismos dessa QuadTree
                if((o.id != predator_id) && circle.contains_point(o)){ // Se o organismo pertencer ao círculo e não for o predador
                    located.push(o);
                }
            }

            if(this.is_divided){ // Se a QuadTree tiver QuadTrees filhas
                this.northwest.find_prey_element(circle,predator_id, located); 
                this.northeast.find_prey_element(circle, predator_id, located); 
                this.southwest.find_prey_element(circle, predator_id, located); 
                this.southeast.find_prey_element(circle, predator_id, located);
            }

            return located;
        }
    }


    // função para a procura de predador
    find_predator_element(circle, located){
        if(!located){
            located = [];
        }
        if(!this.rectangle.does_intercept_circle(circle)){ // Se NÃO se interceptam, não executa o código
            return located;
        } else{ // Se eles se interceptam
            // console.log("find_predator_element", this.organisms);
            for(let c of this.organisms){ // Para os organisms dessa QuadTree 
                if(circle.contains_point(c)){ // Se o organism pertencer ao círculo
                    located.push(c);
                }
            }

            if(this.is_divided){ // Se a QuadTree tiver QuadTrees filhas
                this.northwest.find_predator_element(circle, located); 
                this.northeast.find_predator_element(circle, located); 
                this.southwest.find_predator_element(circle, located); 
                this.southeast.find_predator_element(circle, located);
            }

            return located;
        }
    }

    display(){
        // c.lineWidth = 1;
        c.beginPath();
        c.rect(this.rectangle.x - this.rectangle.w, this.rectangle.y - this.rectangle.h, this.rectangle.w*2, this.rectangle.h*2);
        c.stroke();
        if(this.is_divided){
            this.northeast.display();
            this.northwest.display();
            this.southeast.display();
            this.southwest.display();
        }
    
    }

    
}