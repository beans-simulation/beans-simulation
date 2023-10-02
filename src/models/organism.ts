import {
  Drawable,
  organism_status,
  organism_status_type,
  sex_type,
  globals,
} from "../resources";
import { Circle, DNA, global_timer, QuadTree, Vector } from ".";
import { generate_float, generate_integer } from "../utils";

const EAT_DISTANCE = 5;

export class Organism implements Drawable {
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
  public fixed_max_energy: number;
  public food_eaten = 0;
  public id: number;
  public initial_detection_radius: number;
  public initial_radius: number;
  public is_eating = false;
  public is_roaming = false; //vagar sem direção
  public is_running_away = false;
  public lifetime_in_miliseconds = generate_float(200, 300)*100; // tempo de vida do organism
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
  //   private _status: organism_status_type;

  constructor(x: number, y: number, dna: DNA, parent_id?: number) {
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
    // NINHADAS

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
  private create_child(offspring_dna: DNA) {
    this.procreation_count++;

    const offspring = new Organism(
      this.position.x,
      this.position.y,
      offspring_dna
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
    return this.create_child(offspring_dna);
  }

  sexually_procreate(partner: Organism) {
    const offspring_dna = this.combine_dnas(partner);
    return this.create_child(offspring_dna);
  }

  // Método para atualizar o estado do organism
  update(context: CanvasRenderingContext2D) {
    this.consumed_energy_rate =
     Math.pow(this.radius, 2) * Math.pow(this.speed.magnitude(), 2) * 0.0002; // Atualiza de acordo com a velocidade atual
    const achieved_age_limit =
      (global_timer.total - this.birth_moment_in_milliseconds) > this.lifetime_in_miliseconds;

    // Taxa de diminuição de energy
    if (this.energy > 0 && !achieved_age_limit) {
      this.energy -= this.consumed_energy_rate + this.minimal_consumption;

      // a reprodução está atrelada a alimentação, se nao comer, nao consegue reproduzir
      if (Math.random() < (0.0005 * this.food_eaten) / 10) {
        // Número baixo pois testa a cada frame. Quando mais comeu, maiores as chances
        // Remover reproducao assexuada
        if (Math.random() <= this.procreation_probability) {
          // this.procreate();
          // NINHADA

          this.litter_size = generate_integer(
            this.litter_interval[0],
            this.litter_interval[1] + 1
          );
          for (var i = 0; i < this.litter_size; i++) {
            if (Math.random() < 0.2) {
              // Para espaçar os nascimentos
              this.assexually_procreate();
            }
          }
        }
      }
    } else {
      this.kill();
    }

    //Delimitação de bordas
    this.avoid_space_limits();

    //Delimitação de bordas
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
  }

  increase_size() {
    const max_radius = this.initial_radius * 1.5;
    if (this.radius < max_radius) {
      this.radius *= 1.05;
      this.detection_radius *= 1.03;
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

  create_space_delimitation(){
    this.create_canvas_space_delimitation();
    this.avoid_space_limits();
  }
  // Método para impedir a passagem dos organisms para fora da tela
  create_canvas_space_delimitation(){
    if(this.position.x + 2*this.radius > globals.universe_width) // borda direita
      this.speed.x = this.speed.x * -1; //inverte a velocidade x se ultrapassa a borda do canvas
    if(this.position.x - this.radius < 0) // borda esquerda
      this.speed.x = this.speed.x * -1;
    if(this.position.y + this.radius > globals.universe_height) // borda baixo
      this.speed.y = this.speed.y* -1;
    if(this.position.y < 0) // borda cima
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

  // hunt(qtree: QuadTree) {
  //   this.change_status(organism_status.hunting);
  //   const closer_organism = this.find_prey(qtree);

  //   if (closer_organism) {
  //     const distance = closer_organism.position.distance(this.position);

  //     if (distance <= this.detection_radius) {
  //       closer_organism.change_status(organism_status.running_away);

  //       if (distance < EAT_DISTANCE*EAT_DISTANCE) {
  //         this.eat_organism(closer_organism);
  //       } else {
  //         this.pursue(closer_organism);
  //       }
  //     }
  //   }
  // }

  // private find_prey(qtree: QuadTree): Organism | null {
  //   // Insere em close_organisms uma lista de organisms que estão na sua QuadTree
  //   const detection_circle = new Circle(
  //     this.position.x,
  //     this.position.y,
  //     this.detection_radius
  //   );
  //   const close_organisms = qtree.find_prey_element(detection_circle); // find_prey_element() retorna uma lista de organisms

  //   let closer: Organism | null = null;
  //   if (close_organisms.length) {
  //     let min_distance = Infinity;

  //     for (const organism of close_organisms) {
  //       const distance = organism.position.distance(this.position);

  //       if (distance <= EAT_DISTANCE) return organism;

  //       if (distance < min_distance) {
  //         min_distance = distance;
  //         closer = organism;
  //       }
  //     }
  //   }
  //   return closer;
  // }

  // eat_organism(organism: Organism) {
  //   this.food_eaten++;
  //   // Absorção de energy ao comer o organismo
  //   // Se a energy que ele adquirá do organismo (10% da energy total da presa)
  //   // for menor que o quanto falta para encher a barra de energy, ela será somada integralmente (os 10%)
  //   const energyFromPrey = organism.max_energy * 0.1;
  //   const newEnergyExceedsLimit =
  //     this.energy + energyFromPrey > this.max_energy;

  //   this.energy = newEnergyExceedsLimit
  //     ? this.max_energy
  //     : this.energy + energyFromPrey;

  //   organism.kill(); // O herbívoro comido morre (é retirado da lista de herbívoros)
  //   this.increase_size();
  // }


  find_close_organisms(qtree: QuadTree, vision: Circle): [number, Organism[], number] {
    let min_distance = Infinity;
    let closer_index = -1;

    let close_organisms = qtree.find_prey_element(vision, this.id);

    for (let i = close_organisms.length - 1; i >= 0; i--) {
        let d2 =
            Math.pow(this.position.x - close_organisms[i].position.x, 2) +
            Math.pow(this.position.y - close_organisms[i].position.y, 2);

        if (d2 <= min_distance) {
            min_distance = d2;
            closer_index = i;
        }
    }
    return [min_distance, close_organisms, closer_index];
  }

  detect_predator(qtree: QuadTree, vision: Circle) {
    this.is_running_away = false;

    let [min_distance, close_organisms, closer_index] = this.find_close_organisms(qtree, vision);

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
        if (close_organisms.length !== 0) {
            this.run_away(close_organisms[closer_index]);
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


    let redirectionMagnitude = Math.sqrt(redirection.x ** 2 + redirection.y ** 2);

    if (redirectionMagnitude > this.max_force) {
        redirection.x = (redirection.x / redirectionMagnitude) * this.max_force;
        redirection.y = (redirection.y / redirectionMagnitude) * this.max_force;
    }

    this.apply_force(new Vector(redirection.x, redirection.y));
  }

  hunt(qtree: QuadTree, vision: Circle) {
    this.is_eating = false;

    let [min_distance, close_organisms, closer_index] = this.find_close_organisms(qtree, vision);

    if (min_distance <= Math.pow(this.detection_radius, 2)) {
        this.is_eating = true;
        this.is_roaming = false;

        if (min_distance <= EAT_DISTANCE*EAT_DISTANCE) {
            this.eat_organism(close_organisms[closer_index]);
        } else if (close_organisms.length !== 0) {
            this.pursue(close_organisms[closer_index]);
        }
    }
  }

  eat_organism(organism: Organism) {
    if (this.max_energy - this.energy >= organism.max_energy * 0.1) {
        this.energy += organism.max_energy * 0.1;
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

  // Método que fará o organism vaguear por aí quando não está is_running_away ou perseguindo
  roam() {
    // if(!this.is_running_away && !this.is_eating){
    this.change_status(organism_status.roaming);
    // A ideia é criar uma pequena força a cada frame logo à frente do organism, a uma d dele.
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

    // if (this.is_eating || this.is_running_away) {
    //   // Diminui a força de vagueio quando vai comer ou fugir para dar prioridade a estas tarefas
    //   roaming_force.multiply(0.03);
    // }
    this.apply_force(roaming_force.multiply(0.2));
    // }
  }

  // Método que calcula a força de redirecionamento em direção a um alvo
  // REDIRECIONAMENTO = VELOCIDADE DESEJADA - VELOCIDADE
  pursue(target: Organism) {
    target.is_running_away = true;
    // O vector da velocidade desejada é o vector de posição do alvo menos o da própria posição
    const desired_speed = target.position.subtract_new(this.position); // Um vector apontando da localização dele para o alvo
    // Amplia a velocidade desejada para a velocidade máxima
    desired_speed.set_magnitude(this.max_speed);

    // Redirecionamento = velocidade desejada - velocidade
    const redirection = desired_speed.subtract_new(this.speed);
    redirection.limit(this.max_force); // Limita o redirectionamento para a força máxima

    // Soma a força de redirecionamento à aceleração
    this.apply_force(redirection);
  }

  // Método de comportamento reprodutivo sexuado para procurar parceiros próximos
  find_close_partners() {}

  // Método de comportamento reprodutivo sexuado para se aproximar do partner encontrado
  approach_partner() {
    // CHAMAR AQUI DENTRO O MÉTODO combine_dnas()
  }

  private random_parent(partner: Organism) {
    return Math.random() < 0.5 ? this : partner;
  }

  // Método de comportamento reprodutivo sexuado para randomicamente escolher genes do pai e da mãe
  combine_dnas(partner: Organism): DNA {
    const radius_source = this.random_parent(partner);
    const speed_source = this.random_parent(partner);
    const force_source = this.random_parent(partner);
    const color_source = this.random_parent(partner);
    const detection_radius_source = this.random_parent(partner);
    const litter_source = this.random_parent(partner);
    const sex_source = this.random_parent(partner);

    return new DNA(
      radius_source.dna.initial_radius,
      speed_source.dna.max_speed,
      force_source.dna.max_force,
      color_source.dna.color,
      detection_radius_source.dna.initial_detection_radius,
      litter_source.dna.litter_interval,
      sex_source.dna.sex
    );
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
    const index = Organism.organisms.indexOf(this);
    delete Organism.organisms[index];
    // is not deleting the organism from the list
    // console.log(Organism.organisms.length);
    // console.log(Organism.organisms[index]);
  }

  checaId(id: number) {
    return id === this.id;
  }

  display(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.other_color;
    context.strokeStyle = this.color;
    context.lineWidth = 5;
    context.stroke();
    context.fill();
  }
}
