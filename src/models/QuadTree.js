class QuadTree{
    constructor(limite, capacidade){
        this.limite = limite; // Atributo do tipo Retângulo
        this.capacidade = capacidade; // A partir de quantos pontos (neste caso, seres vivos) o retângulo se subdivide
        this.pontos = [];
        this.vegetables = [];
        this.organisms = [];
        this.dividida = false;
    }
    
    // Subdivide a QuadTree em 4 retângulos filhos
    subdivide(){
        let x = this.limite.x;
        let y = this.limite.y;
        let w = this.limite.w;
        let h = this.limite.h;

        let ne = new Retangulo(x + w/2, y - h/2, w/2, h/2);
        this.nordeste = new QuadTree(ne, this.capacidade);

        let no = new Retangulo(x - w/2, y - h/2, w/2, h/2);
        this.noroeste = new QuadTree(no, this.capacidade);

        let se = new Retangulo(x + w/2, y + h/2, w/2, h/2);
        this.sudeste = new QuadTree(se, this.capacidade);

        let so = new Retangulo(x - w/2, y + h/2, w/2, h/2);
        this.sudoeste = new QuadTree(so, this.capacidade);

        this.dividida = true;

    }

    inserirPonto(ponto){

        if(!this.limite.contemPonto(ponto)){ // Checa se o ponto está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }

        if(this.pontos.length < this.capacidade){
            this.pontos.push(ponto);
            return true;
        } else{ // Se a capacidade máxima tiver sido atingida
            if(!this.dividida){ // A QuadTree não irá se subdividir caso já o tenha feito
                this.subdivide();
            }

            // Não checamos a localização do ponto pois ele será checado no começo de cada chamada desses métodos
            if(this.nordeste.inserirPonto(ponto)){
                return true;
            } else if(this.noroeste.inserirPonto(ponto)){
                return true;
            } else if(this.sudeste.inserirPonto(ponto)){
                return true;
            } else if(this.sudoeste.inserirPonto(ponto)){
                return true;
            };            
        }
    }

    inserirVegetable(vegetable){
        if(!this.limite.contemPonto(vegetable)){ // Checa se o vegetable está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }

        if(this.vegetables.length < this.capacidade){ // Se ainda couber vegetables dentro dela
            this.vegetables.push(vegetable); // Insere o vegetable em sua lista
            // console.log("vegetables ", this.vegetables);
            return true;
        } else{ // Se a capacidade máxima de seres vivos tiver sido atingida            
            if(!this.dividida){ // A QuadTree não irá se subdividir caso já o tenha feito
                // console.log("inserirVegetables", this.vegetables);
                this.subdivide();
                // console.log("SUBDIVIDIU - A", this.capacidade);
            }

            // Não checamos a localização do vegetable pois ela será checada no começo de cada chamada desses métodos
            if(this.nordeste.inserirVegetable(vegetable)){
                return true;
            } else if(this.noroeste.inserirVegetable(vegetable)){
                return true;
            } else if(this.sudeste.inserirVegetable(vegetable)){
                return true;
            } else if(this.sudoeste.inserirVegetable(vegetable)){
                return true;
            };            
        }
    }


    insertOrganism(organism){
        if(!this.limite.contemPonto(organism)){ // Checa se o organism está contido dentro dos limites (fronteiras) do retângulo raiz
            return false;
        }
        
        if(this.organisms.length < this.capacidade){ // Se ainda couber organisms dentro dela
            // console.log("DANDO PUSH");
            this.organisms.push(organism); // Insere o organism em sua lista
            // console.log("organisms ", this.organisms);
            return true;
        } else{ // Se a capacidade máxima de seres vivos tiver sido atingida    
            if(!this.dividida){ // A QuadTree não irá se subdividir caso já o tenha feito
                // console.log("insertOrganisms", this.organisms);
                this.subdivide();
                // console.log("SUBDIVIDIU - C", this.capacidade);
            }
            
            // Não checamos a localização do organism pois ela será checada no começo de cada chamada desses métodos
            if(this.nordeste.insertOrganism(organism)){
                return true;
            } else if(this.noroeste.insertOrganism(organism)){
                return true;
            } else if(this.sudeste.insertOrganism(organism)){
                return true;
            } else if(this.sudoeste.insertOrganism(organism)){
                return true;
            };            
        }
    }

    procuraPontos(alcance, encontrados){ // alcance é do tipo Retangulo
        if(!encontrados){
            encontrados = [];
        }
        if(!this.limite.intersepta(alcance)){ // Se NÃO se interceptam, não executa o código
            return;
        } else{ // Se eles se interceptam
            for(let p of this.pontos){ // Para os pontos dessa QuadTree
                if(alcance.contemPonto(p)){ // Se o ponto pertencer ao retângulo "alcance"
                    encontrados.push(p);
                }
            }

            if(this.dividida){ // Se a QuadTree tiver QuadTrees filhas
                this.noroeste.procuraPontos(alcance, encontrados); 
                this.nordeste.procuraPontos(alcance, encontrados); 
                this.sudoeste.procuraPontos(alcance, encontrados); 
                this.sudeste.procuraPontos(alcance, encontrados);
            }

            return encontrados;
        }
    }

    procuraVegetables(circulo, encontrados){
        if(!encontrados){
            encontrados = [];
        }
        if(!this.limite.interseptaC(circulo)){ // Se NÃO se interceptam, não executa o código
            return encontrados;
        } else{ // Se eles se interceptam
            for(let a of this.vegetables){ // Para os vegetables dessa QuadTree
                if(circulo.contemPonto(a)){ // Se o vegetable pertencer ao círculo
                    encontrados.push(a);
                }
            }

            if(this.dividida){ // Se a QuadTree tiver QuadTrees filhas
                this.noroeste.procuraVegetables(circulo, encontrados); 
                this.nordeste.procuraVegetables(circulo, encontrados); 
                this.sudoeste.procuraVegetables(circulo, encontrados); 
                this.sudeste.procuraVegetables(circulo, encontrados);
            }

            return encontrados;
        }
    }

    findPreyOrganisms(circulo, encontrados){
        if(!encontrados){
            encontrados = [];
        }
        if(!this.limite.interseptaC(circulo)){ // Se NÃO se interceptam, não executa o código
            return encontrados;
        } else{ // Se eles se interceptam
            for(let o of this.organisms){ // Para os organismos dessa QuadTree
                if(circulo.contemPonto(o)){ // Se o organismo pertencer ao círculo
                    encontrados.push(o);
                }
            }

            if(this.dividida){ // Se a QuadTree tiver QuadTrees filhas
                this.noroeste.findPreyOrganisms(circulo, encontrados); 
                this.nordeste.findPreyOrganisms(circulo, encontrados); 
                this.sudoeste.findPreyOrganisms(circulo, encontrados); 
                this.sudeste.findPreyOrganisms(circulo, encontrados);
            }

            return encontrados;
        }
    }


    // procura predador
    // procuraCarnivoros(circulo, encontrados){
    //     if(!encontrados){
    //         encontrados = [];
    //     }
    //     if(!this.limite.interseptaC(circulo)){ // Se NÃO se interceptam, não executa o código
    //         return encontrados;
    //     } else{ // Se eles se interceptam
    //         // console.log("procuraCarnivoros", this.organisms);
    //         for(let c of this.organisms){ // Para os organisms dessa QuadTree 
    //             if(circulo.contemPonto(c)){ // Se o organism pertencer ao círculo
    //                 encontrados.push(c);
    //             }
    //         }

    //         if(this.dividida){ // Se a QuadTree tiver QuadTrees filhas
    //             this.noroeste.procuraCarnivoros(circulo, encontrados); 
    //             this.nordeste.procuraCarnivoros(circulo, encontrados); 
    //             this.sudoeste.procuraCarnivoros(circulo, encontrados); 
    //             this.sudeste.procuraCarnivoros(circulo, encontrados);
    //         }

    //         return encontrados;
    //     }
    // }

    desenha(){
        // c.lineWidth = 1;
        c.beginPath();
        c.rect(this.limite.x - this.limite.w, this.limite.y - this.limite.h, this.limite.w*2, this.limite.h*2);
        c.stroke();
        if(this.dividida){
            this.nordeste.desenha();
            this.noroeste.desenha();
            this.sudeste.desenha();
            this.sudoeste.desenha();
        }
    
    }

    
}