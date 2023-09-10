class Organism{
    static organisms = [];
    static id = 0;

    constructor(x, y, dna, parent = null){
        this.id = Organism.id++;        
        this.position = new Vector(x, y);
        if(parent){
            this.parent = parent;
        }
        this.children = [];
        this.sexual_maturity = 0;

        this.initial_radius = dna.initial_radius;
        this.max_speed = dna.max_speed;
        this.max_strength = dna.max_strength;
        this.color = dna.color;
        this.initial_detection_radius = dna.initial_detection_radius;
        this.litter_interval = dna.litter_interval; //ninhada
        this.sex = dna.sex;
        


        // DNA -> Objeto para separar apenas os atributos passados para os descendentes
        this.dna = new DNA(
            this.initial_radius,
            this.max_speed,
            this.max_strength,
            this.color,
            this.initial_detection_radius,
            this.litter_interval,
            this.sex
        )

        this.radius = this.initial_radius;
        this.speed = new Vector(0.0001, 0.0001);
        this.acceleration = new Vector(0, 0);
        var rgb = this.color.substring(4, this.color.length - 1).split(",");
        this.other_color = "rgba(" + Math.floor(parseInt(rgb[0]) * 0.4) + "," + Math.floor(parseInt(rgb[1]) * 0.4) + "," + Math.floor(parseInt(rgb[2]) * 0.4) + ")";
        
        this.detection_radius = this.initial_detection_radius;
        this.max_energy = Math.pow(this.radius, 2) * 6;
        this.fixed_max_energy = Math.pow(this.initial_radius * 1.5, 2) * 6; // Usada para obter valores não-variáveis no gráfico


        if(parent){
            this.energy = (this.max_energy * (0.75 + Math.random() / 4)) / (parent.litter_size) * 0.6; // Começa com uma parcela da energy máxima
        } else{
            this.energy = this.max_energy * 0.75
        }
        this.energy_consumption_rate;
        this.minimal_consumption = 0.0032 * Math.pow(Math.pow(this.radius, 2), 0.75); // Seguindo a lei de Kleiber para a taxa metabólica dos seres vivos
        this.max_energy_consumption_rate = this.minimal_consumption + (Math.pow(this.initial_radius * 1.5, 2) * Math.pow(this.max_speed, 2)) * 0.00012;;
        this.procreation_probability = 0.5;
        this.status;
        this.food_eaten = 0;
        this.procreation_count = 0;
        this.birth_moment_in_seconds = total_of_seconds; // "segundo" é a variável global
        this.lifetime = parseInt(generate_number_per_interval(200, 300)); // tempo de vida do organism
        this.lived_time_in_secord = 0;
        this.litter_size;


        // Variáveis de status
        this.is_eating = false;
        this.is_running_away = false;
        this.is_roaming = false; //vagar sem direção

        // Variável que delimita a distância da borda a partir da qual os organisms começarão a fazer a curva para não bater nas bordas 
        this.d = 20; 

        // variáveis usadas para o método roam() de vagar
        this.d_circle = 2;
        this.circle_radius = 1;
        this.roaming_angle = Math.random() * 360;

        Organism.organisms.push(this);
    }
  
    // Método de reprodução (com mutações)
    procreate(){
        this.procreation_count++;

        var offspring_dna = this.dna.mutar()
        var offspring = new Organism(
            this.position.x, this.position.y, offspring_dna
        );

        this.children.push(offspring);
        
        return offspring;
    }
    sexually_procreate(partner){
        this.procreation_count++;

        var offspring_dna = this.combine_dnas(partner);
        var offspring = new Organism(
            this.position.x, this.position.y, offspring_dna
        )

        this.children.push(offspring);

        return offspring;
    }



    // Método para atualizar o estado do organism
    update(){
        this.lived_time_in_secord = total_of_seconds - this.birth_moment_in_seconds;
        this.consumed_energy_rate = (Math.pow(this.radius, 2) * Math.pow(this.speed.magnitude(), 2)) * 0.0002; // Atualiza de acordo com a velocidade atual
        // Taxa de diminuição de energy
        if(this.energy > 0){
            this.energy -= (this.consumed_energy_rate + this.minimal_consumption);

            if(Math.random() < (0.0005 * this.food_eaten)/10){ // Número baixo pois testa a cada frame. Quando mais comeu, maiores as chances
                if(Math.random() <= this.procreation_probability){
                    // NINHADA
                    this.litter_size = generateInteger(this.litter_interval[0], this.litter_interval[1] + 1);
                    for(var i = 0; i < this.litter_size; i++){
                        if(Math.random() < 0.2){ // Para espaçar os nascimentos
                            this.procreate();
                        }
                    }
                }
            }
        } else{
            this.kill(); 
        }
        
        if(this.lived_time_in_secord >= this.lifetime){ // se se passar mais tempo desde o nascimento que o tempo de vida do organism
            this.kill();
        }

        //Delimitação de bordas
        this.create_space_delimitation(false);
        
    
        // Atualização da velocidade (soma vector velocidade com o vector aceleração)
        this.speed.add(this.acceleration);
        // Limita velocidade
        this.speed.limit(this.max_speed);

        // console.log("ângulo speed: ", this.speed.headingDegs());

        // Se existir um proxy, inserir por lá para que seja possível monitorar a mudança de position
        if(this.proxy) {
            this.proxy.add(this.speed)
        } else {
            // A velocidade altera a posição (assim como a aceleração altera a velocidade)
            this.position.add(this.speed);
        }
        // Reseta a aceleração para 0 a cada ciclo
        this.acceleration.multiply(0);

        this.display();
    }

    increase_size(){
        if(this.radius<(this.initial_radius*1.5)){
            this.radius += 0.05*this.radius;
            this.detection_radius += 0.03*this.detection_radius;
        }
        this.max_energy = Math.pow(this.radius, 2) * 6
    }

    // Método para criar bordas que delimitarão o espaço do organism
    create_space_delimitation(){ 
        this.create_canvas_space_delimitation();
        this.avoid_space_limits();
    }

    // Método para impedir a passagem dos organisms para fora da tela
    create_canvas_space_delimitation(){
        if(this.position.x + 2*this.radius > universe_width) // borda direita
            this.speed.x = this.speed.x * -1; //inverte a velocidade x se ultrapassa a borda do canvas
        if(this.position.x - this.radius < 0) // borda esquerda
            this.speed.x = this.speed.x * -1;
        if(this.position.y + this.radius > universe_height) // borda baixo
            this.speed.y = this.speed.y* -1;
        if(this.position.y < 0) // borda cima
            this.speed.y = this.speed.y * -1;   
    }

    // Método para aplicar força ao organism que o impeça de continuar a seguir por uma trajetória para fora da tela
    avoid_space_limits(){
        var desired_speed = null; // Esta velocidade será o vector que dirá para onde o organism deve ir para não sair da borda
        this.is_close_to_space_limit = false;

        // Borda esquerda
        if(this.position.x - this.radius < this.d){ 
            desired_speed = new Vector(this.max_speed, this.speed.y); // Faz sua velocidade ser máxima na direção x (para a direita)
            this.is_close_to_space_limit = true;
        } 
        // Borda direita
        else if(this.position.x + this.radius > universe_width - this.d){
            desired_speed = new Vector(-this.max_speed, this.speed.y); // Faz sua velocidade ser máxima na direção -x (para a esquerda)
            this.is_close_to_space_limit = true;
        }
        // Borda de cima
        if(this.position.y - this.radius < this.d){
            desired_speed = new Vector(this.speed.x, this.max_speed); // Faz sua velocidade ser máxima na direção y (para a baixo)
            this.is_close_to_space_limit = true;
        }
        // Borda de baixo
        else if(this.position.y + this.radius> universe_height - this.d){
            desired_speed = new Vector(this.speed.x, -this.max_speed); // Faz sua velocidade ser máxima na direção -y (para a cima)
            this.is_close_to_space_limit = true;
        }
        if(desired_speed != null){ // Caso qualquer uma das condições anteriores tenha sido satisfeita
            desired_speed.normalize(); // Normaliza (transforma para ter tamanho 1) o vector desired_speed
            desired_speed.multiply(this.max_speed); // Multiplica o vector (que agora tem tamanho 1) pela velocidade máxima
            var redirection = desired_speed.subtract(this.speed); // Cria um vector de força que redirecionará o organism
            redirection.limit(this.max_strength * 100); // Limita essa força com uma folga maior para dar chances dela ser maior que as outras forças atuantes nele
            this.apply_force(redirection); // Aplica esta força no organism e a deixa levemente mais forte para ganhar prioridade em relação a outras forças
        }
    }


    // Método para aplicar a força que fará o organism virar na direção do alvo mais próximo de modo natural
    apply_force(force){
        // Adiciona a força à aceleração, o que a faz aumentar
        // Podemos considerar a massa no cálculo também: A = F / M (não implementado)
        this.acceleration.add(force);
    }

    find_prey(qtree, vision){
        this.status = "looking_for_prey"
        this.is_eating = false;
        // Var min_distance: qual a menor distância (a recorde) de um organism até agora
        var min_distance = Infinity; // Inicialmente, setaremos essa distância como sendo infinita
        var closer_index = -1; // Qual o índice na lista de organisms do organism mais perto até agora

        // Insere em close_organisms uma lista de organisms que estão na sua QuadTree 
        let close_organisms = qtree.find_prey_element(vision,this.id); // find_prey_element() retorna uma lista de organisms

        // Loop que analisa cada organism na lista de organisms
        for(var i = close_organisms.length - 1; i >= 0; i--){
            // Distância d entre este organismo e o atual organism sendo analisado na lista (lista_organisms[i])
            // var d = this.position.dist(lista_organisms[i].position);

            var d2 = Math.pow(this.position.x - close_organisms[i].position.x, 2) + Math.pow(this.position.y - close_organisms[i].position.y, 2);
            
            if (d2 <= min_distance){ // Caso a distância seja menor que a distância min_distance,
                min_distance = d2; // min_distance passa a ter o valor de d
                closer_index = i; // e o atual indivíduo passa a ser o closer_index 
            }
            
        }
        // Momento em que ele vai comer!
        if(min_distance <= Math.pow(this.detection_radius, 2)){
            this.is_eating = true;
            this.is_roaming = false;
            this.status = "hunting"

            // close_organisms[closer_index].is_running_away = true;
            // close_organisms[closer_index].is_eating = false;
            // close_organisms[closer_index].is_roaming = false;
            // close_organisms[closer_index].status = "is_running_away";

            if(min_distance <= 25){ // como min_distance é a distância ao quadrado, elevamos 5 ao quadrado (5^2 = 25) para comparar
                this.eat_organism(close_organisms[closer_index]);
                
            } else if(close_organisms.length != 0){
                this.persue(close_organisms[closer_index]);
            }
        }
    }
    
    eat_organism(organism){
        // Absorção de energy ao comer o herbívoro
        // Se a energy que ele adquirá do herbívoro (10% da energy total do herbívoro)
        // for menor que o quanto falta para encher a barra de energy, ela será somada integralmente (os 10%)
        if(this.max_energy - this.energy >= organism.max_energy * 0.1){
            this.energy += organism.max_energy * 0.1; // O carnívoro, ao comer o herbívoro, ganha 10% da energy deste
        } else{
            this.energy = this.max_energy; // Limitanto a energy para não ultrapassar sua energy máxima
        }
        if(this.energy > this.max_energy){
            this.energy = this.max_energy;
        }
        organism.kill() // O organismo comido morre (é retirado da lista de organismos)
        this.increase_size();
        this.food_eaten++;
    }


    // Método que fará o organism vaguear por aí quando não está is_running_away ou perseguindo
    roam(){
        // if(!this.is_running_away && !this.is_eating){
            this.is_roaming = true;
            this.status = "is_roaming";
            // A ideia é criar uma pequena força a cada frame logo à frente do organism, a uma d dele.
            // Desenharemos um círculo à frente do organism, e o vector da força de deslocamento partirá do centro
            // do círculo e terá o tamanho de seu radius. Assim, quanto maior o círculo, maior a força.
            // A fim de sabermos qual é a frente do organism, utilizaremos o vector velocidade para nos auxiliar, 
            // já que ele está sempre apontando na direção do movimento do organism.

            // CRIANDO O CÍRCULO
            var circle_center = new Vector(0, 0); // Criamos um vector que representará a distância do organism ao centro do círculo
            circle_center = this.speed.copy(); // Isso é para que o círculo esteja exatamente à frente do organism (como explicado um pouco acima)
            circle_center.normalize(); // Normalizamos o vector, ou seja, seu tamanho agora é 1 (e não mais o tamanho do vector velocidade, como era na linha acima)
            circle_center.multiply(this.d_circle); // A variável d_circle é uma constante definida globalmente, e guarda o valor da distância do centro do círculo
            
            // CRIANDO A FORÇA DE DESLOCAMENTO
            var movement = new Vector(0, -1);
            movement.multiply(this.circle_radius); // A força terá o tamanho do radius do círculo
            // Mudando a direção da força randomicamente
            movement.rotate_degs (this.roaming_angle); // Rotaciona a força em angulo_vagueio (variável definida no construtor)
            // Mudando ligeiramente o valor de angulo_vagueio para que ele mude pouco a pouco a cada frame
            this.roaming_angle += Math.random() * 30 - 15; // Muda num valor entre -15 e 15
            
            // CRIANDO A FORÇA DE VAGUEIO
            // A força de vagueio pode ser pensada como um vector que sai da posição do organism e vai até um point
            // na circunferência do círculo que criamos
            // Agora que os vectors do centro do círculo e da força de deslocamento foram criados, basta somá-los
            // para criar a força de vagueio
            var roaming_force = new Vector(0, 0);
            roaming_force = circle_center.add(movement);
            
            if(this.is_eating || this.is_running_away){ // Diminui a força de vagueio quando vai comer ou fugir para dar prioridade a estas tarefas
                roaming_force.multiply(0.03);
            }
            this.apply_force(roaming_force.multiply(0.2));
        // }
    }

    // Método que calcula a força de redirecionamento em direção a um alvo
    // REDIRECIONAMENTO = VELOCIDADE DESEJADA - VELOCIDADE
    persue(alvo){
        alvo.is_running_away = true;
        // O vector da velocidade desejada é o vector de posição do alvo menos o da própria posição
        var desired_speed = alvo.position.subtract_new(this.position); // Um vector apontando da localização dele para o alvo
        // Amplia a velocidade desejada para a velocidade máxima
        desired_speed.set_magnitude(this.max_speed);

        // Redirecionamento = velocidade desejada - velocidade
        var redirection = desired_speed.subtract_new(this.speed);
        redirection.limit(this.max_strength); // Limita o redirection para a força máxima

        // Soma a força de redirecionamento à aceleração
        this.apply_force(redirection);
    }

    // Método de comportamento reprodutivo sexuado para procurar parceiros próximos 
    find_close_partners(){

    }

    // Método de comportamento reprodutivo sexuado para se aproximar do partner encontrado 
    approach_partner(){
        // CHAMAR AQUI DENTRO O MÉTODO combine_dnas()
    }

    // Método de comportamento reprodutivo sexuado para randomicamente escolher genes do parent e da mãe
    combine_dnas(partner){
        var offspring_dna = [];

        // Raio inicial
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.initial_radius)
        } else{
            offspring_dna.push(partner.dna.initial_radius)
        }

        // Velocidade máxima
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.max_speed)
        } else{
            offspring_dna.push(partner.dna.max_speed)
        }

        // Força máxima
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.max_strength)
        } else{
            offspring_dna.push(partner.dna.max_strength)
        }

        // Cor
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.color)
        } else{
            offspring_dna.push(partner.dna.color)
        }

        // Raio detecção inicial
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.initial_detection_radius)
        } else{
            offspring_dna.push(partner.dna.initial_detection_radius)
        }

        // Intervalo ninhada
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.litter_interval)
        } else{
            offspring_dna.push(partner.dna.litter_interval)
        }

        // Sexo
        if(Math.random() < 0.5){
            offspring_dna.push(this.dna.sex)
        } else{
            offspring_dna.push(partner.dna.sex)
        }

        var offspring_dna = new DNA(offspring_dna[0], offspring_dna[1], offspring_dna[2], offspring_dna[3], 
            offspring_dna[4], offspring_dna[5], offspring_dna[6])
        
        return offspring_dna;
    }

    is_dead(){
        return this.energy <= 0;
    }
    
    remove(list) {
        var what, a = arguments, L = a.length, indice;
        while (L > 1 && list.length) {
            what = a[--L];
            while ((indice = list.indexOf(what)) !== -1) {
                list.splice(indice, 1);
            }
        }
        return list;
    }
    kill(){
        Organism.organisms = this.remove(Organism.organisms, this);
    }

    checaId(id){
        return (id == this.id);
    }

    display(){
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);        
        c.fillStyle = this.other_color;
        c.strokeStyle = this.color;
        c.lineWidth = 5;
        c.stroke();
        c.fill();
    }

}