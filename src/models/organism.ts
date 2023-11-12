const EAT_DISTANCE = 5;

class Organism extends Point implements Drawable {
  static organisms: Organism[] = [];
  static id = 0;

  public acceleration = new Vector(0, 0);
  public birth_moment_in_milliseconds: number; // = total_of_seconds; // "segundo" é a variável global
  // variável que delimita a distância da borda a partir da qual os organisms começarão a fazer a curva para não bater nas bordas
  public border_distance_until_make_curves = 20;
  public childrenIds?: number[];
  public circle_radius = 1;
  public color: string;
  private consumed_energy_rate = 0;
  public detection_radius: number;
  public distance_make_circle = 2;
  public dna: DNA;
  public energy: number;
  public health: number = 85;
  public maturity: number = 0;
  public fixed_max_energy: number;
  public food_eaten = 0;
  public id: number;
  public initial_detection_radius: number;
  public initial_radius: number;
  public is_eating = false;
  public is_reproducing = false;
  public is_roaming = false; //vagar sem direção
  public is_rotating = false;
  public is_running_away = false;
  public is_ready_to_reproduce = false;
  public is_organism_dead = 0;
  public lifetime_in_miliseconds: number; // tempo de vida do organism
  public litter_interval: number[]; //ninhada
  public litter_size = 0;
  public max_energy_consumption_rate: number;
  public max_energy: number;
  public max_speed: number;
  public max_force: number;
  public minimal_consumption: number; // Seguindo a lei de Kleiber para a taxa metabólica dos seres vivos
  public other_color: string;
  public parent_id?: number;
  public position: Vector;
  public procreation_count = 0;
  public procreation_probability = 0.5;
  public radius: number;
  public roaming_angle = Math.random() * 360;
  public sex: sex_type;
  public sexual_maturity = 0;
  public speed = new Vector(0.0001, 0.0001);
  private status: organism_status_type;
  private time_to_maturity_in_seconds: number;
  public neural_network_id: number | null;
  public index_closest_food: number = -1;
  public distance_closest_food: number = -1;
  public angle_target_food: number = -1;
  public closest_target: Point | null = null;
  public distance_closest_target: number = -1;
  public angle_target_signal: number = 0;
  public angle_closest_food: number = 0;
  public closest_food: Point | null = null;
  public angle_closest_organism: number = 0;
  public distance_closest_organism: number = 0;
  public closest_organism: Point | null = null;
  public diet: number;
  public diet_variant: number;
  public metabolic_rate: number;
  public min_max_temperature_tolerated: number[];
  public body_growth_rate: number;
  public lifespan: number;
  public percentage_to_mature: number;
  public input_neurons_list: string[] | null;
  //   private _status: organism_status_type;

  constructor(x: number, y: number, dna: DNA, neural_network_id: number | null, parent_id?: number) {
    super(x, y);
    this.id = Organism.id++;
    this.position = new Vector(x, y);
    if (parent_id) {
      this.parent_id = parent_id;
    }
    this.initial_radius = dna.initial_radius;
    this.max_speed = dna.max_speed;
    this.max_force = dna.max_force;
    this.color = dna.color;
    this.initial_detection_radius = dna.initial_detection_radius;
    this.litter_interval = dna.litter_interval; //ninhada
    this.sex = dna.sex;
    this.diet = dna.diet;
    this.metabolic_rate =  dna.metabolic_rate;
    this.min_max_temperature_tolerated = dna.min_max_temperature_tolerated;
    this.body_growth_rate = dna.body_growth_rate;
    this.lifespan = dna.lifespan;
    this.percentage_to_mature = dna.percentage_to_mature;
    this.lifetime_in_miliseconds = this.lifespan * 1000;
    
    this.diet_variant = generate_float(0,1); // utilizado para gerar aletoriedade na dieta do organismo
    this.radius = this.initial_radius;
    this.minimal_consumption =
      0.0032 * Math.pow(Math.pow(this.radius, 2), 0.75); // Seguindo a lei de Kleiber para a taxa metabólica dos seres vivos
    this.max_energy_consumption_rate =
      this.minimal_consumption +
      Math.pow(this.initial_radius * 1.5, 2) *
        Math.pow(this.max_speed, 2) *
        0.00012;
    this.status = organism_status.roaming;

    this.dna = dna;
    this.other_color = this.get_other_color(this.color);
    this.detection_radius = this.initial_detection_radius;
    this.max_energy = Math.pow(this.radius, 2) * 6;
    this.fixed_max_energy = Math.pow(this.initial_radius * 1.5, 2) * 6; // Usada para obter valores não-variáveis no gráfico
    this.birth_moment_in_milliseconds = global_timer.total;
    this.time_to_maturity_in_seconds = this.lifetime_in_miliseconds* this.percentage_to_mature/1000; 
    this.neural_network_id = neural_network_id;
    this.input_neurons_list = [];

    // Pegando os neurônios do organismo com base no ID da rede
    if (globals.pyodide){
      globals.pyodide.runPython(`
        import json

        this_nn_id = json.loads('${JSON.stringify(this.neural_network_id)}')

        # Pegando a redes através do ID
        this_nn = neural_network.NeuralNetwork.neural_networks.get(f"{this_nn_id}")
        input_neurons = [neuron.name for neuron in this_nn.neurons if neuron.neuron_type == "Input"]

      `);

      this.input_neurons_list = globals.pyodide.globals.get('input_neurons');
    }
    

    // this.energy = this.max_energy * 0.75
    if (parent_id) {
      this.energy =
        this.max_energy *
        (0.75 + Math.random() / 4) * // / parent.litter_size
        0.6; // Começa com uma parcela da energy máxima
    } else {
      this.energy = this.max_energy * 0.75;
    }

    Organism.organisms.push(this);
  }

  private get_other_color(color: string): string {
    const multiplied_colors = color
      .match(/\d+/)
      ?.map((c) => Math.floor(parseInt(c) * 0.4));
    return `rgba(${multiplied_colors?.join(",")})`;
  }

  // Método de reprodução (com mutações)
  private create_child(offspring_dna: DNA, neural_network_id: number | null) {
    this.procreation_count++;

    const offspring = new Organism(
      this.position.x,
      this.position.y,
      offspring_dna,
      neural_network_id
    );

    this.childrenIds ? this.childrenIds.push(offspring.id) : [offspring.id];

    return offspring;
  }

  private change_status(status: organism_status_type): void {
    if (this.status !== status) {
      this.status = status;
    }
  }

  assexually_procreate() {
    const offspring_dna = this.dna.mutate();
    return this.create_child(offspring_dna, null);
  }

  sexually_procreate(qtree: OrganismQuadTree, vision: Circle) {
    this.is_ready_to_reproduce = true;
    // Pega o genoma do organismo atual
    let current_organism_genome = this.dna.get_genome();
    // Procura parceiros e o parceiro mais proximo
    let [min_distance, possible_partners, closest_index] = this.find_close_partners(qtree, vision);
    // Se houver parceiros...
    if (possible_partners.length > 0){
      let partner = possible_partners[closest_index] as Organism; // Tranforma em tipo Organism
      let partner_genome = partner.dna.get_genome(); // Pega o genoma do parceiro

      // Se a aproximação for bem-sucedida e o parceiro ainda estiver pronto...
      if (this.approach_partner(min_distance, possible_partners, closest_index) ){ //&& partner.is_ready_to_reproduce
        this.is_reproducing = true;
        partner.is_reproducing = true;
        // NINHADA
        this.litter_size = generate_integer(
          this.litter_interval[0],
          this.litter_interval[1] + 1
        );
        for (var i = 0; i < this.litter_size; i++) {
          if (Math.random() < 1) {
            let offspring_dna = this.crossover_dnas(current_organism_genome, partner_genome);
            const offspring_dna_mutated = offspring_dna.mutate();
            

            // REPRODUÇÃO DAS REDES
            const this_nn_id = this.neural_network_id;
            const partner_nn_id = partner.neural_network_id;

            const this_nn_id_JSON = JSON.stringify(this_nn_id);
            const partner_nn_id_JSON = JSON.stringify(partner_nn_id);

            if (globals.pyodide){
              globals.pyodide.runPython(`
                import json

                this_nn_id = json.loads('${this_nn_id_JSON}')
                partner_nn_id = json.loads('${partner_nn_id_JSON}')

                # Pegando as redes através de seus IDs
                this_nn = neural_network.NeuralNetwork.neural_networks.get(f"{this_nn_id}")
                partner_nn = neural_network.NeuralNetwork.neural_networks.get(f"{partner_nn_id}")

                # Criando a rede filha
                child_nn = neural_network.breed_neural_networks(this_nn, partner_nn)

                child_nn_id = child_nn.id

              `);

              this.create_child(offspring_dna_mutated, globals.pyodide.globals.get('child_nn_id'));
            }
          }
        }

        this.energy = (this.energy/2); // Mudar a logica?
        this.is_reproducing = false;
        this.is_ready_to_reproduce = false;
        partner.energy = (partner.energy/2);
        partner.is_reproducing = false;
        partner.is_ready_to_reproduce = false;

      }
    }
  }

  get_time_alive_in_seconds() {
    // TODO: checar se o valor está fazendo sentido
    return (global_timer.total - this.birth_moment_in_milliseconds) / 1000;
  }

  // Método para atualizar o estado do organism
  update(context: CanvasRenderingContext2D) {
    this.consumed_energy_rate =
      Math.pow(this.radius, 2) * Math.pow(this.speed.magnitude(), 2) * 0.0002; // Atualiza de acordo com a velocidade atual
    const achieved_age_limit =
      global_timer.total - this.birth_moment_in_milliseconds >
      this.lifetime_in_miliseconds;
    const time_alive = this.get_time_alive_in_seconds();

    // Taxa de diminuição de energy
    if (this.energy > 0 && !achieved_age_limit && this.min_max_temperature_tolerated[0] <= globals.temperature && this.min_max_temperature_tolerated[1] >= globals.temperature) {
      this.energy -= this.consumed_energy_rate + this.minimal_consumption * this.metabolic_rate;

      // TODO:  -------------- REVER SE ESSA PARTE DO CÓDIGO É NECESSÁRIA ------------------
      // a reprodução está atrelada a alimentação, se nao comer, nao consegue reproduzir
      // if (Math.random() < (0.0005 * this.food_eaten) / 10) {
      //   // Número baixo pois testa a cada frame. Quando mais comeu, maiores as chances
      //   // Remover reproducao assexuada
      //   if (Math.random() <= this.procreation_probability) {
      //     // NINHADA
      //     if(this.maturity == 1){
      //       this.litter_size = generate_integer(
      //         this.litter_interval[0],
      //         this.litter_interval[1] + 1
      //       );
      //       for (var i = 0; i < this.litter_size; i++) {
      //         if (Math.random() < 0.2) {
      //           // Para espaçar os nascimentos
      //           // this.assexually_procreate();
      //         }
      //       }
      //     }

      //   }
      // }
    } else {
      return 1
      // this.kill();
    }

    // Alteração do atributo de health
    // TODO: elaborar lógica para alterar saúde (health) do organismo
    this.health = 85

    // Delimitação de bordas
    this.avoid_space_limits();

    if (this.maturity < 1) {
      // Calcula o valor da maturidade
      const maturity = time_alive / this.time_to_maturity_in_seconds;

      // o valor tem que estar entre zero e 1
      if (maturity > 1) {
        this.maturity = 1;
      } else if (maturity < 0) {
        this.maturity = 0;
      } else {
        this.maturity = maturity;
      }
    }


    // Delimitação de bordas
    this.create_space_delimitation();
    // Atualização da velocidade (soma vector velocidade com o vector aceleração)
    this.speed.add(this.acceleration);
    // Limita velocidade
    this.speed.limit(this.max_speed);

    // A velocidade altera a posição (assim como a aceleração altera a velocidade)
    this.position.add(this.speed);

    // Reseta a aceleração para 0 a cada ciclo
    this.acceleration.multiply(0);
    this.display(context);

    return 0
  }

  increase_size() {
    const max_radius = this.initial_radius * 1.5;
    if (this.radius < max_radius) {
      this.radius = this.radius + this.radius * this.body_growth_rate;
      // this.detection_radius *= 1.03;
    }
    this.max_energy = Math.pow(this.radius, 2) * 6;
  }

  private get nearRightBorder() {
    return (
      this.position.x + this.radius >
      globals.universe_width - this.border_distance_until_make_curves
    );
  }
  private get nearLeftBorder() {
    return (
      this.position.x - this.radius < this.border_distance_until_make_curves
    );
  }
  private get nearBottom() {
    return (
      this.position.y + this.radius >
      globals.universe_height - this.border_distance_until_make_curves
    );
  }
  private get nearTop() {
    return (
      this.position.y - this.radius < this.border_distance_until_make_curves
    );
  }

  private get_desired_speed_to_avoid_borders(): Vector | null {
    if (this.nearLeftBorder) {
      this.speed.x = this.speed.x * -1;
      return new Vector(this.max_speed, this.speed.y); // Faz sua velocidade ser máxima na direção x (para a direita)
    }

    if (this.nearRightBorder) {
      this.speed.x = this.speed.x * -1;
      return new Vector(-this.max_speed, this.speed.y); // Faz sua velocidade ser máxima na direção -x (para a esquerda)
    }

    if (this.nearTop) {
      this.speed.y = this.speed.y * -1;
      return new Vector(this.speed.x, this.max_speed); // Faz sua velocidade ser máxima na direção y (para a baixo)
    }

    if (this.nearBottom) {
      this.speed.y = this.speed.y * -1;
      return new Vector(this.speed.x, -this.max_speed); // Faz sua velocidade ser máxima na direção -y (para a cima)
    }

    return null;
  }

  accelerate(value: number){
    // TOOD: implemetar função aceleração com base no valor de output da rede
  }


  create_space_delimitation() {
    this.create_canvas_space_delimitation();
    this.avoid_space_limits();
  }
  // Método para impedir a passagem dos organisms para fora da tela
  create_canvas_space_delimitation() {
    if (this.position.x + 2 * this.radius > globals.universe_width)
      // borda direita
      this.speed.x = this.speed.x * -1; //inverte a velocidade x se ultrapassa a borda do canvas
    if (this.position.x - this.radius < 0)
      // borda esquerda
      this.speed.x = this.speed.x * -1;
    if (this.position.y + this.radius > globals.universe_height)
      // borda baixo
      this.speed.y = this.speed.y * -1;
    if (this.position.y < 0)
      // borda cima
      this.speed.y = this.speed.y * -1;
  }

  // Método para aplicar força ao organism que o impeça de continuar a seguir por uma trajetória para fora da tela
  avoid_space_limits() {
    const desired_speed = this.get_desired_speed_to_avoid_borders(); // Esta velocidade será o vector que dirá para onde o organism deve ir para não sair da borda

    if (desired_speed) {
      // Caso qualquer uma das condições anteriores tenha sido satisfeita
      desired_speed
        .normalize() // Normaliza (transforma para ter tamanho 1) o vector desired_speed
        .multiply(this.max_speed); // Multiplica o vector (que agora tem tamanho 1) pela velocidade máxima

      const redirection = desired_speed
        .subtract_new(this.speed) // Cria um vector de força que redirecionará o organism
        .limit(this.max_force * 100); // Limita essa força com uma folga maior para dar chances dela ser maior que as outras forças atuantes nele

      this.apply_force(redirection); // Aplica esta força no organism e a deixa levemente mais forte para ganhar prioridade em relação a outras forças
    }
  }

  // Método para aplicar a força que fará o organism virar na direção do alvo mais próximo de modo natural
  apply_force(force: Vector) {
    // Adiciona a força à aceleração, o que a faz aumentar
    // Podemos considerar a massa no cálculo também: A = F / M (não implementado)
    this.acceleration.add(force);
  }


  detect_predator(qtree: OrganismQuadTree, vision: Circle) {
    this.is_running_away = false;

    let [min_distance, close_organisms, closest_index] = find_nearby_element(
      qtree,
      vision,
      this
    );

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
      if (close_organisms.length !== 0) {
        this.run_away(close_organisms[closest_index] as Organism);
      }
    }
  }

  run_away(target: Organism) {
    let desired_speed = {
      x: target.position.x - this.position.x,
      y: target.position.y - this.position.y,
    };

    desired_speed.x = -desired_speed.x;
    desired_speed.y = -desired_speed.y;

    let magnitude = Math.sqrt(desired_speed.x ** 2 + desired_speed.y ** 2);

    desired_speed.x = (desired_speed.x / magnitude) * this.max_speed;
    desired_speed.y = (desired_speed.y / magnitude) * this.max_speed;

    let redirection = {
      x: desired_speed.x - this.speed.x,
      y: desired_speed.y - this.speed.y,
    };

    let redirectionMagnitude = Math.sqrt(
      redirection.x ** 2 + redirection.y ** 2
    );

    if (redirectionMagnitude > this.max_force) {
      redirection.x = (redirection.x / redirectionMagnitude) * this.max_force;
      redirection.y = (redirection.y / redirectionMagnitude) * this.max_force;
    }

    this.apply_force(new Vector(redirection.x, redirection.y));
  }

  search_for_vegetable(qtree: VegetableQuadTree, vision: Circle): void {
    this.is_ready_to_reproduce = false;
    this.is_eating = false;
    const is_searching_vegetable = true;

    let [min_distance, nearby_vegetables, closest_index] = find_nearby_element(
      qtree,
      vision,
      this,
      is_searching_vegetable
    );

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
      this.is_eating = true;
      this.is_roaming = false;
      if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
        this.eat_vegetable(nearby_vegetables[closest_index] as Vegetable);
      } else if (nearby_vegetables.length !== 0) {
        this.pursue(nearby_vegetables[closest_index]);
      }
    }
  }

  eat_vegetable(vegetable: Vegetable): void {
    this.food_eaten++;
    if (this.max_energy - this.energy >= vegetable.energy * 0.1) {
      this.energy += vegetable.energy * 0.1;
    } else {
      this.energy = this.max_energy;
    }

    if (this.energy > this.max_energy) {
      this.energy = this.max_energy;
    }

    Vegetable.vegetables = Vegetable.vegetables.filter(
      (item) => item !== vegetable
    );
    this.increase_size();
  }

  hunt(qtree: OrganismQuadTree, vision: Circle) {
    this.is_eating = false;

    let [min_distance, close_organisms, closest_index] = find_nearby_element(
      qtree,
      vision,
      this
    );

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
      this.is_eating = true;
      this.is_roaming = false;

      if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
        this.eat_organism(close_organisms[closest_index] as Organism);
      } else if (close_organisms.length != 0) {
        this.pursue(close_organisms[closest_index]);
      }
    }
  }

  eat_organism(organism: Organism) {
    if (this.max_energy - this.energy >= organism.max_energy * 0.1) {
      this.energy += organism.max_energy * 0.2;
    } else {
      this.energy = this.max_energy;
    }
    if (this.energy > this.max_energy) {
      this.energy = this.max_energy;
    }
    organism.kill();
    this.increase_size();
    this.food_eaten++;
  }

  eat(element: Organism | Vegetable){
    if (this.max_energy - this.energy >= element.energy * 0.1) {
      this.energy += element.energy * 0.1;
    } else {
      this.energy = this.max_energy;
    }

    if (this.energy > this.max_energy) {
      this.energy = this.max_energy;
    }
    element.kill();

    this.increase_size();
    this.food_eaten++;
    this.diet_variant = generate_float(0,1);
  }

  // Método que fará o organism vaguear por aí quando não está is_running_away ou perseguindo
  roam() {
    this.change_status(organism_status.roaming);
    this.is_roaming = true;    // A ideia é criar uma pequena força a cada frame logo à frente do organism, a uma d dele.
    // Desenharemos um círculo à frente do organism, e o vector da força de deslocamento partirá do centro
    // do círculo e terá o tamanho de seu radius. Assim, quanto maior o círculo, maior a força.
    // A fim de sabermos qual é a frente do organism, utilizaremos o vector velocidade para nos auxiliar,
    // já que ele está sempre apontando na direção do movimento do organism.

    // CRIANDO O CÍRCULO
    const circle_center = this.speed
      .copy() // Isso é para que o círculo esteja exatamente à frente do organism (como explicado um pouco acima)
      .normalize() // Normalizamos o vector, ou seja, seu tamanho agora é 1 (e não mais o tamanho do vector velocidade, como era na linha acima)
      .multiply(this.distance_make_circle); // A variável d_circle é uma constante definida globalmente, e guarda o valor da distância do centro do círculo

    // CRIANDO A FORÇA DE DESLOCAMENTO
    const movement = new Vector(0, -1)
      .multiply(this.circle_radius) // A força terá o tamanho do radius do círculo
      // Mudando a direção da força randomicamente
      .rotate_degrees(this.roaming_angle); // Rotaciona a força em angulo_vagueio (variável definida no construtor)
    // Mudando ligeiramente o valor de angulo_vagueio para que ele mude pouco a pouco a cada frame
    this.roaming_angle += Math.random() * 30 - 15; // Muda num valor entre -15 e 15

    // CRIANDO A FORÇA DE VAGUEIO
    // A força de vagueio pode ser pensada como um vector que sai da posição do organism e vai até um point
    // na circunferência do círculo que criamos
    // Agora que os vectors do centro do círculo e da força de deslocamento foram criados, basta somá-los
    // para criar a força de vagueio
    const roaming_force = circle_center.add(movement);

    if (this.is_eating || this.is_running_away || this.is_ready_to_reproduce || this.is_reproducing || this.is_rotating) {
      // Diminui a força de vagueio quando vai comer ou fugir para dar prioridade a estas tarefas
      roaming_force.multiply(0.03);
    }
    this.apply_force(roaming_force.multiply(0.2));
  }

  // Método que calcula a força de redirecionamento em direção a um alvo
  // REDIRECIONAMENTO = VELOCIDADE DESEJADA - VELOCIDADE
  pursue(target: Organism | Vegetable, to_reproduce: boolean = false) {
    if (target instanceof Organism && !to_reproduce) {
      target.is_running_away = true;
    }
    // O vector da velocidade desejada é o vector de posição do alvo menos o da própria posição
    let desired_speed = target.position.subtract_new(this.position); // Um vector apontando da localização dele para o alvo
    // Amplia a velocidade desejada para a velocidade máxima
    desired_speed.set_magnitude(this.max_speed);

    // Redirecionamento = velocidade desejada - velocidade
    let redirection = desired_speed.subtract_new(this.speed);
    redirection.limit(this.max_force); // Limita o redirectionamento para a força máxima

    // Soma a força de redirecionamento à aceleração
    this.apply_force(redirection);
  }

  // Método de comportamento reprodutivo sexuado para procurar parceiros próximos
  find_close_partners(qtree: OrganismQuadTree, vision: Circle): [number, Point[], number] {
    this.is_eating = false;

    let min_distance = Infinity;
    let closest_index = -1;
    let possible_partners: any[] = qtree.search_elements(vision, this.id);
    possible_partners = possible_partners.filter((partner) => {
      let partner_organism = partner as Organism;
      return !partner_organism.is_reproducing && partner_organism.is_ready_to_reproduce
    });

    for (let i = possible_partners.length - 1; i >= 0; i--) {
      const dx = this.position.x - possible_partners[i].position.x;
      const dy = this.position.y - possible_partners[i].position.y;
      let d2 = (dx * dx) + (dy * dy);
      if (d2 <= min_distance) {
        min_distance = d2;
        closest_index = i;
      }
    }
    return [min_distance, possible_partners, closest_index];
  }

  // Método de comportamento reprodutivo sexuado para se aproximar do partner encontrado
  approach_partner(min_distance: number, close_organisms: Point[], closest_index: number) {
    /*
    Se aproxima do parceiro e faz o crossover
    */

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
      this.is_roaming = false;
      this.is_eating = false;

      if (min_distance <= EAT_DISTANCE * EAT_DISTANCE) {
        return true
      } else if (close_organisms.length != 0) {
        this.pursue((close_organisms[closest_index] as Organism), true);
      }
    }
    return false
  }

  private n_points_cut(parent_a: any[], parent_b: any[], n_points: number): number[] {
    let parents_indexes = Array.from({ length: parent_a.length -1}, (_, i) => i);
    let random_indexes: number[] = [];

    for (let i = 0; i < n_points; i++) {
      /*
        Sorteia um index para ser cada ponto de corte.
        Após o sorteio, exclui o mesmo para não ser sorteado novamente.
        Faz isso n_points vezes e adiciona na lista de random_indexes que será posteriormente utilizada de base para o crossover.
      */

      let random_chosen_index = Math.floor(Math.random() * parents_indexes.length);
      random_indexes.push(parents_indexes[random_chosen_index]);
      parents_indexes.splice(random_chosen_index, 1);
    }
    random_indexes.sort();

    return random_indexes;
  }

  private get_random_parents(parent_a: any[], parent_b: any[]) {
    if (Math.random() < 0.5) {
      return { first_parent: parent_a, second_parent: parent_b };
    }
    return { first_parent: parent_b, second_parent: parent_a };
  }

  crossover_dnas(parent_a: any[], parent_b: any[], n_points: number = 1): DNA {
    // [!] O numero maximo de pontos é len(genes_pai)-1

    const random_indexes = this.n_points_cut(parent_a, parent_b, n_points);

    const { first_parent, second_parent } = this.get_random_parents(
      parent_a,
      parent_b
    );
    const parent_order = Array.from({ length: n_points + 1 }, (_, i) =>
      i % 2 === 0 ? first_parent : second_parent
    );

    const genome_aux: any[] = [];
    let last_index = 0;
    for (let i = 0; i <= n_points; i++) {
      const current_parent = parent_order[i];

      const end_at: number | undefined = random_indexes[i];
      let cut: any[] = []
      if(i!==0 && i !==n_points){
          cut = current_parent.slice(last_index+1, end_at+1);
        } else if (i===n_points){
            cut = current_parent.slice(last_index+1, current_parent.length);
      }
      else {
          cut = current_parent.slice(last_index, end_at+1);
      }

      genome_aux.push(...cut);
      last_index = end_at;
    }

    const child_genome = genome_aux as ConstructorParameters<typeof DNA>;
    return new DNA(...child_genome);
  }

  is_dead(): boolean {
    return this.energy <= 0;
  }

  public static remove(organism_ids: number[]) {
    const filtered = Organism.organisms.filter(
      (organism) => !organism_ids.includes(organism.id)
    );
    Organism.organisms = filtered;
    return filtered;
  }

  kill() {
    if (globals.pyodide){
      globals.pyodide.runPython(`
        import json

        this_nn_id = json.loads('${JSON.stringify(this.neural_network_id)}')

        # Deletando a rede através do ID
        print('${this.id}', ' died')
        neural_network.NeuralNetwork.neural_networks.pop(f"{this_nn_id}")
      `);
    }
    Organism.organisms = Organism.organisms.filter((item) => item !== this);
  }

  checaId(id: number) {
    return id === this.id;
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.ellipse(this.position.x, this.position.y, this.radius * 0.7, this.radius * 1.1, this.speed.heading_radians() - Math.PI/2, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.lineWidth = 2;
    context.strokeStyle = this.color
    context.stroke();
    context.fill();
  }
}
