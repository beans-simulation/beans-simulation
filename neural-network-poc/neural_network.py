# Importando bibliotecas
import math
from collections import deque, defaultdict
import time
import string
import random
from random import randint
import json

# -------------------------------------------------------------------------------
# ---------------------------------- FUNÇÕES ------------------------------------
# -------------------------------------------------------------------------------

# Funções para cada tipo de neurônio da camada oculta
def PiecewiseConstant(weighted_inputs):
    summed_input = sum(weighted_inputs)
    if summed_input < 0:
        return -10
    if summed_input > 0:
        return 10
    else:
        return 0

def invert_signal(weighted_inputs):
    return -sum(weighted_inputs)

def absolute(weighted_inputs):
    return abs(sum(weighted_inputs))

def sin(weighted_inputs):
    return math.sin(sum(weighted_inputs))

def cos(weighted_inputs):
    return math.cos(sum(weighted_inputs))

def step_activation(weighted_inputs):
    return 0 if sum(weighted_inputs) <= 0.5 else 1


# Funções auxiliares
def generate_random_string(length):
    characters = string.ascii_letters + string.digits  # Dígitos e letras ASCII (maiúsculas e minúsculas)
    random_string = ''.join(random.choices(characters, k=length))
    return random_string

def create_new_id(neuron_name):
    return (neuron_name + "-" + generate_random_string(NUM_RANDOM_CHARACTERS_NEURONS_ID))


def reconstruct_neural_network_from_dna(dna):
    nn = NeuralNetwork()
    neurons_names_and_id = [] # [[nome1, id1], [nome2, id2], ...]
    connections = []

    for gene in dna:
        from_neuron_name = gene['from_neuron_name']
        to_neuron_name = gene['to_neuron_name']

        from_neuron_id = gene['from_neuron_id']
        to_neuron_id = gene['to_neuron_id']

        neurons_names_and_id.append([from_neuron_name, from_neuron_id])
        neurons_names_and_id.append([to_neuron_name, to_neuron_id])


    # Removendo duplicados de neurons_names_and_id
    unique_values = set(tuple(name_id) for name_id in neurons_names_and_id)
    neurons_names_and_id = [list(name_id) for name_id in unique_values]

    # Criando lista final de neurônios que vão fazer parte da rede neural
    neurons_to_add = []

    for neuron_name_id in neurons_names_and_id:
            neuron_type = [ntype for ntype, nname in possible_neurons if nname == neuron_name_id[0]][0]
            neurons_to_add.append(Neuron(neuron_type, neuron_name_id[0], neuron_name_id[1]))

    nn.neurons = neurons_to_add

    # Agora conectando os neurônios
    for gene in dna:
        from_neuron_id = gene['from_neuron_id']
        to_neuron_id = gene['to_neuron_id']
        weight = gene['weight']
        active_state = gene['active_state']

        connections.append(Connection(from_neuron_id, to_neuron_id, weight, active_state))

    nn.connections = connections

    # Criando novos IDs dos neurônios para que não fiquem iguais aos do DNA-pai
    nn.create_new_ids()

    nn.update_neuron_by_id()
    nn.update_topological_order()

    return nn


def update_neural_network(nn):
    nn.update_topological_order()
    nn.construct_dna()


def print_dna(dna):
    print(json.dumps(dna, indent=4, sort_keys=False))


def breed_neural_networks(nn1, nn2):
    dna1 = nn1.dna
    dna2 = nn2.dna

    # 1 - Primeiro, juntamos os dois DNAs em uma lista única
    unified_dna = dna1 + dna2

    # 2 - Depois, removemos os genes duplicados
    # Identificando os connection_id únicos juntos com o neural_network_id
    connection_ids = defaultdict(set)
    for d in unified_dna:
        connection_ids[d['connection_id']].add(d['neural_network_id'])

    # Para cada connection_id com mais de um neural_network_id, selecionaremos aleatoriamente um neural_network_id para manter.
    to_keep = {}
    for conn_id, nn_ids in connection_ids.items():
        if len(nn_ids) > 1:
            to_keep[conn_id] = random.choice(list(nn_ids))

    # Filtrando o DNA
    unified_dna = [
        d for d in unified_dna if to_keep.get(d['connection_id'], d['neural_network_id']) == d['neural_network_id']
    ]

    # 3 - Agora ordenaremos o DNA de acordo com as conexões
    unified_dna = sorted(unified_dna, key=lambda x: x['connection_id'])

    # 4 - Alinhando os genes de cada rede mãe com os da lista unificada
    # Criando duas listas vazias com o tamanho da lista unificada
    genes_1 = [None] * len(unified_dna)
    genes_2 = [None] * len(unified_dna)

    # Construindo dicionários de consulta rápida para verificar a presença dos genes em cada rede mãe
    genes_1_dict = {gene['connection_id']: gene for gene in dna1}
    genes_2_dict = {gene['connection_id']: gene for gene in dna2}

    # Preenchendo as listas com os genes correspondentes ou None
    for i, unified_gene in enumerate(unified_dna):
        connection_id = unified_gene['connection_id']
        
        gene_1 = genes_1_dict.get(connection_id)
        gene_2 = genes_2_dict.get(connection_id)

        genes_1[i] = gene_1 if gene_1 else None
        genes_2[i] = gene_2 if gene_2 else None
  
 
    max_trials = 10  # Número máximo de tentativas para criar uma rede funcional
    trials = 0

    # Tenta adicionar uma conexão válida até max_trials vezes ou até conseguir
    while trials < max_trials:

        # 5 - Gerando o DNA da rede filha
        # Escolhendo aleatoriamente entre os genes das redes 1 e 2
        dna_filho = []

        for gene_1, gene_2 in zip(genes_1, genes_2):
            dna_filho.append(random.choice([gene_1, gene_2]))

        # Retirando os espaços nulos do DNA
        dna_filho = [gene for gene in dna_filho if gene is not None]

        # 6 - Recriando a rede filha a partir do DNA dela
        rede_filha = reconstruct_neural_network_from_dna(dna_filho)

        # 7 - Limpando a rede caso tenha sobrado neurônios soltos
        rede_filha.remove_loose_neurons()

        # Valida a rede neural depois que o neurônio foi adicionado
        if rede_filha.validate_network():
            break
        
        trials += 1

    if trials >= max_trials:
        print("O número máximo de tentativas para criar a rede neural do organismo filho foi alcançado, e ela pôde ser criada...")

    # 8 - Realizando a mutação
    rede_filha.mutate()

    update_neural_network(rede_filha)

    return rede_filha
 



# -------------------------------------------------------------------------------
# ------------------------- VARIÁVEIS E LISTAS GLOBAIS --------------------------
# -------------------------------------------------------------------------------

# Valor que o neurônio de input "Constant" vai sempre retornar
CONSTANT_NEURON_VALUE = 1

# MUtação
ADD_NEURON_MUTATION_RATE = 0.7 # Taxa de mutação para adição de neurônios
REMOVE_NEURON_MUTATION_RATE = 0.1 # Taxa de mutação para remoção de neurônios
ADD_CONNECTION_MUTATION_RATE = 0.5 # Taxa de mutação para adição de conexões
REMOVE_CONNECTION_MUTATION_RATE = 0.1 # Taxa de mutação para remoção de conexões
CHANGE_WEIGHT_MUTATION_RATE = 0.5 # Taxa de mutação para mudança de pesos
CHANGE_ACTIVE_STATE_MUTATION_RATE = 0.1 # Taxa de mutação para mudança do estado de ativação de conexões
# Máximo que o peso de uma mutação pode mudar (de -MAX_WEIGHT_CHANGE até +MAX_WEIGHT_CHANGE)
MAX_WEIGHT_CHANGE = 0.1

# Outras regras
MAX_DECIMAL_PLACES = 5 # Número máximo de decimais que pesos e outputs podem ter
NUM_RANDOM_CHARACTERS_NEURONS_ID = 5 # Número de caracteres aleatórios no ID dos neurônios

# Lista de neurônios que um organismo pode vir a ter.
# A lista contém tuplas no seguinte formato: (type, name), indicando o tipo do neurônio e o seu nome
possible_neurons = [
    # INPUT
    ("Input", "Temperature"),
    ("Input", "EnergyLevel"),
    ("Input", "Health"),
    ("Input", "AngleToClosestFood"),
    ("Input", "DistToClosestFood"),
    ("Input", "NumOfFoodInView"),
    ("Input", "AngleToClosestOrganism"),
    ("Input", "DistToClosestOrganism"),
    ("Input", "NumOfOrganismsInView"),
    ("Input", "AngleToClosestTarget"),
    ("Input", "DistToClosestTarget"),
    ("Input", "NumOfTargetsInView"),
    ("Input", "Constant"),
    ("Input", "Luminosity"),
    ("Input", "Maturity"),
    ("Input", "TimeAlive"),

    # HIDDEN
    ("Hidden", "InvertSignal"),
    ("Hidden", "Absolute"),
    ("Hidden", "PiecewiseConstant"),
    ("Hidden", "Sin"),
    ("Hidden", "Cos"),

    # OUTPUT
    ("Output", "Accelerate"),
    ("Output", "Rotate"),
    ("Output", "DesireToReproduce"),
    ("Output", "DesireToEat")
]

# Mapeando neurônios a funções para que cada neurônio da camada oculta saiba que função utilizar
neuron_functions = { # (nome_do_neuronio, nome_da_funcao)
    "PiecewiseConstant": PiecewiseConstant,
    "InvertSignal": invert_signal,
    "Absolute": absolute,
    "Sin": sin,
    "Cos": cos,
    "DesireToEat": step_activation,
    "DesireToReproduce": step_activation
}

# -------------------------------------------------------------------------------
# ---------------------------------- CLASSES ------------------------------------
# -------------------------------------------------------------------------------
class Neuron:
    def __init__(self, neuron_type, name, id=None):
        if id is None:
            self.id = name + generate_random_string(NUM_RANDOM_CHARACTERS_NEURONS_ID)
        else:
            self.id = id
        self.neuron_type = neuron_type # (Input/Hidden/Output)
        self.name = name # Deve estar na lista "possible_neurons"
        self.activation_function = None
        self.output = None

    # Pega todos os inputs (já multiplicados pelos pesos) e calcula o output
    def compute_output(self, weighted_inputs):
        func = neuron_functions.get(self.name, None) # Procura por uma função associada ao nome do neurônio
        if func: # Se o neurônio tiver uma função associada a ele (na lista "neuron_functions"), passa o valor pela função
            self.output = round(func(weighted_inputs), MAX_DECIMAL_PLACES)
        else: # Caso o neurônio não tenha  uma função associada a ele, simplesmente retorna a soma de seus inputs
            self.output = round(sum(weighted_inputs), MAX_DECIMAL_PLACES)


class Connection:
    def __init__(self, from_neuron, to_neuron, weight=1.0, activated=True):
        self.from_neuron = from_neuron
        self.to_neuron = to_neuron
        self.weight = weight
        self.activated = activated


class NeuralNetwork:
    neural_networks = {}
    global_id = 0
    def __init__(self):
        self.neurons = []
        self.connections = []
        self.valid = True # Essa flag servirá para dizer se a rede é válida ou não, isso é, se passa por todas as regras de validação
        self.topological_order = [] # Guardará os neurônios em ordem topológica após qualquer alteração na topologia da rede
        self.dna = [] # Guardará um gene (dicionário) para cada conexão
        self.neuron_by_id = {} # Guardará um dicionário dos ids dos neurônios dessa rede
        self.id = NeuralNetwork.global_id
        self.register_network()

    def register_network(self):
        NeuralNetwork.global_id = NeuralNetwork.global_id + 1
        NeuralNetwork.neural_networks[f"{self.id}"] = self

    # Função para atualizar a lista de ids dos neurônios dessa rede
    def update_neuron_by_id(self):
        self.neuron_by_id = {neuron.id: neuron for neuron in self.neurons}


    # Função auxiliar para update_topological_order()
    def dfs_topological_sort(self, neuron, visited, stack):
        visited.add(neuron)

        # Pega os neurônios conectados ao neurônio atual
        connected_neurons = [connection.to_neuron for connection in self.connections if connection.from_neuron == neuron.id]

        for next_neuron_id in connected_neurons:
            next_neuron = self.neuron_by_id.get(next_neuron_id) # Pega o objeto Neuron com base no ID
            if next_neuron and next_neuron not in visited:
                self.dfs_topological_sort(next_neuron, visited, stack) # Recursividade

        stack.append(neuron)

    # Função para calcular a ordem topológica da rede apenas 1x, e que será utilizada em todos os frames
    # dentro da função feed_forward()
    def update_topological_order(self):
        visited = set()
        stack = []

        # Atualiza o dicionário de IDs da rede
        self.update_neuron_by_id()

        for neuron in self.neurons:
            if neuron not in visited:
                self.dfs_topological_sort(neuron, visited, stack)

        self.topological_order = list(reversed(stack))



    # Função que passa os valores input por todas as camadas para calcular os valores de saída.
    # ESSA É A FUNÇÃO QUE IRÁ RODAR A CADA FRAME!!!
    def feed_forward(self, input_values):

        # Inicializando os neurônios de input com valores fornecidos no dicionário input_values
        for neuron in self.neurons:
            if neuron.neuron_type == 'Input':
                neuron.output = input_values.get(neuron.name, 0) if neuron.name != "Constant" else CONSTANT_NEURON_VALUE


        # Usa a ordem topológica da rede pra calcular os outputs corretamente
        for neuron in self.topological_order:
            # Pula os neurônios de Input já que seus outputs são definidos fora da rede (no nosso contexto, são os sentidos do organismo)
            if neuron.neuron_type != 'Input':
                # Busca todas as conexões de entrada para este neurônio
                incoming_connections = [c for c in self.connections if c.to_neuron == neuron.id]
                # print(f"DEBUG -> from_neuron.name = {[self.neuron_by_id[c.from_neuron].name if c.activated else 0 for c in incoming_connections]}")
                # print(f"DEBUG -> outputs = {[self.neuron_by_id[c.from_neuron].output if c.activated else 0 for c in incoming_connections]}")
                weighted_inputs = [self.neuron_by_id[c.from_neuron].output * c.weight if c.activated else 0 for c in incoming_connections]

                # Usa a função do neurônio para calcular seu output
                neuron.compute_output(weighted_inputs)

        # Extrai e retorna os valores de output dos neurônios da última camada
        output_values = {neuron.name: neuron.output for neuron in self.neurons if neuron.neuron_type == 'Output'}
        return output_values # É DAQUI QUE SAIRÃO OS VALORES PARA O COMPORTAMENTO DOS ORGANISMOS!!!


    def add_neuron(self):
        max_trials = 10  # Número máximo de tentativas para se adicionar uma conexão nova
        trials = 0

        # Tenta adicionar uma conexão válida até max_trials vezes ou até conseguir
        while trials < max_trials:
            # Primeiro pega os neurônios de input/output já existentes na rede
            existing_inputs = [neuron.name for neuron in self.neurons if neuron.neuron_type == "Input"]
            existing_outputs = [neuron.name for neuron in self.neurons if neuron.neuron_type == "Output"]

            # Retira da lista possible_neurons os neurônio input/output já existentes para evitar duplicação
            available_neurons = [n for n in possible_neurons if not (
                (n[0] == "Input" and n[1] in existing_inputs) or
                (n[0] == "Output" and n[1] in existing_outputs))]

            # Caso não haja mais neurônio novo para se adicionar
            if not available_neurons:
                return

            # Escolhe aleatoriamente um neurônio da lista
            neuron_type, name = random.choice(available_neurons)

            # Cria e adiciona o neurônio novo
            new_neuron = Neuron(neuron_type, name)
            self.neurons.append(new_neuron)

            # Lida com as conexões do novo neurônio de acordo com o seu tipo
            if neuron_type == 'Hidden': # Precisam ter 2 conexões
                input_or_hidden_neurons = [n for n in self.neurons if n.neuron_type in ['Input', 'Hidden'] and n.id != new_neuron.id]
                output_or_hidden_neurons = [n for n in self.neurons if n.neuron_type in ['Output', 'Hidden'] and n.id != new_neuron.id]

                # Se existe algum neurônio para se conectar
                if input_or_hidden_neurons and output_or_hidden_neurons:
                    from_neuron = random.choice(input_or_hidden_neurons)
                    to_neuron = random.choice(output_or_hidden_neurons)

                    # Remove a conexão existente entre os neurônios escolhidos (caso haja)
                    # Ex.: A----------B     =>    A----  ----B     =>    A-----C-----B
                    existing_connection = next((connection for connection in self.connections if connection.from_neuron == from_neuron.id and connection.to_neuron == to_neuron.id), None)
                    if existing_connection:
                        self.connections.remove(existing_connection)

                    # Adiciona as novas conexões
                    self.connections.append(Connection(from_neuron.id, new_neuron.id))
                    self.connections.append(Connection(new_neuron.id, to_neuron.id))


            else: # Se o neurônio for do tipo input ou output, só cria 1 conexão
                target_neurons = [n for n in self.neurons if n.neuron_type in ['Hidden', 'Output']] if neuron_type == 'Input' else [n for n in self.neurons if n.neuron_type in ['Input', 'Hidden']]

                # Caso não haja mais neurônio novo para se conectar
                if not target_neurons:
                    return

                chosen_target = random.choice(target_neurons)
                self.connections.append(Connection(new_neuron.id, chosen_target.id) if neuron_type == 'Input' else Connection(chosen_target.id, new_neuron.id))

            # Valida a rede neural depois que o neurônio foi adicionado
            if self.validate_network():
                break
            else: # Se algo deu errado
                self.neurons = [neuron for neuron in self.neurons if neuron.id != new_neuron.id] # Remove o neurônio adicionado
                 # Remove as conexões ligadas ao neurônio adicionado
                self.connections = [c for c in self.connections if c.from_neuron != new_neuron.id and c.to_neuron != new_neuron.id]

            trials += 1

        if trials >= max_trials:
            print("O número máximo de tentativas foi alcançado, o neurônio não foi adicionado..")

        self.update_topological_order() # Atualiza a topologia da rede


    def remove_neuron(self):
        # Só continua se houver neurônios para remover
        if len(self.neurons) > 0:

            # Escolhe aleatoriamente um neurônio para remover
            neuron_to_remove = random.choice(list(self.neurons))

            # Se o neurônio escolhido para remoção é da camada oculta, os neurônios
            # aos quais ele estava conectado precisam se conectar
            # Ex.: A-----C-----B     =>    A----  ----B     =>    A----------B
            if neuron_to_remove.neuron_type == "Hidden":
                # Pega o ID do neurônio que se ligava a ele na entrada
                incoming_neuron_ids = [connection.from_neuron for connection in self.connections if connection.to_neuron == neuron_to_remove.id]
                # Pega o ID do neurônio que se ligava a ele na saída
                outgoing_neuron_ids = [connection.to_neuron for connection in self.connections if connection.from_neuron == neuron_to_remove.id]

                for i in incoming_neuron_ids:
                    for o in outgoing_neuron_ids:
                        # Adiciona a nova conexão direta entre os neurônios que ficaram soltos
                        self.connections.append(Connection(i, o))

            # Remove o neurônio do dicionário de neurônios
            self.neurons = [neuron for neuron in self.neurons if neuron.id != neuron_to_remove.id]


            # Atualiza as conexões da rede
            self.connections = [connection for connection in self.connections if connection.from_neuron != neuron_to_remove.id and connection.to_neuron != neuron_to_remove.id]

            # Remove quaisquer neurônios soltos em cadeia
            # Ex.: A---B---C---D  =>  ---B---C---D  =>  ---C---D  =>  ---D  =>
            self.remove_loose_neurons()

            self.update_topological_order() # Atualiza a topologia da rede

    # Remove os neurônios soltos em cadeia após a remoção de um neurônio ou de uma conexão
    def remove_loose_neurons(self):
        # Loop para identificar e remover qualquer neurônio solto
        while True:
            loose_neurons = []
            for neuron in self.neurons:
                # Pega a conexão de entrada do neurônio
                incoming = [connection for connection in self.connections if connection.to_neuron == neuron.id]
                # Pega a conexão de saída do neurônio
                outgoing = [connection for connection in self.connections if connection.from_neuron == neuron.id]

                # Neurônios input precisam ter conexão de saída, ocultos precisam ter de entrada e de saída, e de output precisam ter de entrada
                if (neuron.neuron_type == "Input" and not outgoing) or \
                    (neuron.neuron_type == "Hidden" and (not incoming or not outgoing)) or \
                    (neuron.neuron_type == "Output" and not incoming):
                    loose_neurons.append(neuron)

            if not loose_neurons:
                break

            # Remove todos os neurônios soltos que encontrou nessa iteração
            for neuron_to_remove in loose_neurons:
                self.neurons = [neuron for neuron in self.neurons if neuron.id != neuron_to_remove.id]
                self.connections = [connection for connection in self.connections if connection.from_neuron != neuron_to_remove.id and connection.to_neuron != neuron_to_remove.id]

            self.update_topological_order() # Atualiza a topologia da rede

    def add_connection(self):
        max_trials = 10  # Número máximo de tentativas para se adicionar uma conexão nova
        trials = 0

        # Só continua se houver neurônios para se conectar
        if len(self.neurons) > 1:

            # Tenta adicionar uma conexão válida até max_trials vezes ou até conseguir
            while trials < max_trials:
                # Seleciona dois neurônios aleatórios para se conectarem
                from_neuron = random.choice([n for n in self.neurons if n.neuron_type != "Output"])
                to_neuron = random.choice([n for n in self.neurons if n.neuron_type != "Input" and n.id != from_neuron.id])

                if not from_neuron or not to_neuron:
                    print("Não há neurônios disponíveis para fazer a conexão.")
                    return

                # Checa se já há existe conexão entre os neurônios escolhidos. Se sim, tenta outra vez
                if any(connection.from_neuron == from_neuron.id and connection.to_neuron == to_neuron.id for connection in self.connections):
                    trials += 1
                    continue

                # Adiciona a nova conexão
                new_connection = Connection(from_neuron.id, to_neuron.id, round(random.uniform(-1, 1), MAX_DECIMAL_PLACES))
                self.connections.append(new_connection)

                # Checa se a rede continua válida após ter feito a adição
                if self.validate_network():
                    break
                else:
                    self.connections.remove(new_connection)
                    trials += 1

            # Se já tentou max_trials vezes, não adiciona a conexão
            if trials >= max_trials:
                print("O número máximo de tentativas foi alcançado, a conexão não foi adicionada.")

            # Atualiza a topologia da rede
            self.update_topological_order()


    def remove_connection(self):
        # Só continua se houver conexões para remover
        if len(self.connections) > 0:
            # Escolhe aleatoriamente uma conexão para remover
            connection_to_remove = random.choice(self.connections)

            # Remove a conexão escolhida
            self.connections.remove(connection_to_remove)

            # Remove quaisquer neurônios soltos em cadeia
            self.remove_loose_neurons()

            # Atualiza a topologia da rede
            self.update_topological_order()


    def change_weight(self):
        # Só continua se houver conexões para alterar
        if len(self.connections) == 0:
            return

        # Escolhe uma conexão aleatória para mudar o peso
        connection_to_change = random.choice(self.connections)

        # Altera o peso da conexão
        delta = random.uniform(-MAX_WEIGHT_CHANGE, MAX_WEIGHT_CHANGE)
        connection_to_change.weight = round(connection_to_change.weight + delta, MAX_DECIMAL_PLACES)


    def change_active_state(self):
        # Só continua se houver conexões para alterar
        if len(self.connections) == 0:
            return

        # Escolhe uma conexão aleatória para mudar o estado de ativação
        connection_to_change = random.choice(self.connections)

        # Altera o estado de ativação da conexão (True -> False // False -> True)
        connection_to_change.activated = not connection_to_change.activated


    # Função responsável por qualquer tipo de mutação
    def mutate(self, add_neuron_probability=ADD_NEURON_MUTATION_RATE, add_connection_probability=ADD_CONNECTION_MUTATION_RATE, change_weight_probability=CHANGE_WEIGHT_MUTATION_RATE, change_active_state_probability=CHANGE_ACTIVE_STATE_MUTATION_RATE, remove_neuron_probability=REMOVE_NEURON_MUTATION_RATE, remove_connection_probability=REMOVE_CONNECTION_MUTATION_RATE):
        # Realiza as mutações
        if random.random() < add_neuron_probability:
            self.add_neuron()
        if random.random() < add_connection_probability:
            self.add_connection()
        if random.random() < change_weight_probability:
            self.change_weight()
        if random.random() < change_active_state_probability:
            self.change_active_state()
        if random.random() < remove_neuron_probability:
            self.remove_neuron()
        if random.random() < remove_connection_probability:
            self.remove_connection()

        # Valida a rede após a mutação
        self.valid = self.validate_network()
        if not self.valid:
            # Se a rede ficar inválida após a mutação, ela será resetada
            self.neurons = []
            self.connections = []

        # Atualiza a topologia da rede
        self.update_topological_order()

        # Atualiza o dna da rede
        self.construct_dna()


    # Função para validar a rede neural e checar se ela está seguindo as regras
    def validate_network(self):
        connection_pairs = {(connection.from_neuron, connection.to_neuron) for connection in self.connections}

        # Checa se há conexões duplicadas
        if len(connection_pairs) != len(self.connections):
            print("Validação Falha: Há conexões duplicadas.")
            return False

        # Checa se as conexões fazem sentido com os tipos de neurônios
        for neuron in self.neurons:
            incoming = [connection for connection in self.connections if connection.to_neuron == neuron.id]
            outgoing = [connection for connection in self.connections if connection.from_neuron == neuron.id]

            # Se o neurônio de Input não possui conexão de saída
            if neuron.neuron_type == "Input" and not outgoing:
                print(f"Validação Falha: O neurônio de Input {neuron.name}, ID {neuron.id}, não possui conexões de saída.")
                return False
            # Se o neurônio da camada oculta não possui duas conexões (uma de entrada e outra de saída)
            if neuron.neuron_type == "Hidden" and (not incoming or not outgoing):
                print(f"Validação Falha: O neurônio Hidden {neuron.name}, ID {neuron.id}, possui conexões faltantes.")
                return False
            # Se o neurônio de Output não possui conexão de entrada
            if neuron.neuron_type == "Output" and not incoming:
                print(f"Validação Falha: O neurônio de Output {neuron.name}, ID {neuron.id}, não possui conexões de entrada")
                return False

        # Checa se há neurônios ou conexões na rede
        if not self.neurons or not self.connections:
            print("Validação Falha: Não há neurônios nem conexões na rede.")
            return False

        # Checa por loops de conexão (Ex.: A->B, B->C, C->A)
        for start_neuron in self.neurons:
            visited = set() # Para acompanhar quais neurônios já visitamos

            # Armazena tuplas em que cada tupla armazena o ID do neurônio e um iterador de todos os seus neurônios-filho
            stack = [(start_neuron.id, iter([connection.to_neuron for connection in self.connections if connection.from_neuron == start_neuron.id]))]

            # Enquanto ainda houver neurônios que não visitamos, continua a procurar
            while stack:
                # Pega o último neurônio e seu iterador de filhos do stack
                parent, children = stack[-1]

                # Marca o neurônio atual como visitado
                visited.add(parent)

                for child in children:
                    # Se o neurônio filho for o mesmo do neurônio inicial, um loop foi detectado
                    if child == start_neuron.id:
                        print("Validação Falha: Loop Detectado.")
                        return False
                    if child not in visited:
                        break
                else:
                    # Se todos os filhos do neurônio foram visitados, retira ele do stack
                    stack.pop()
                    continue

                # Adiciona o próximo neurônio e seus filhos ao stack
                stack.append((child, iter([connection.to_neuron for connection in self.connections if connection.from_neuron == child])))

        return True


    # Essa função
    def construct_dna(self):
        # Só continua se houver conexões
        if len(self.connections) == 0:
            return

        dna = []
        for c in self.connections:
            exclusive_connection_id = str(c.from_neuron) + "-" + str(c.to_neuron)

            from_neuron = self.neuron_by_id.get(c.from_neuron)
            to_neuron = self.neuron_by_id.get(c.to_neuron)

            connection_id = from_neuron.name + "-" + to_neuron.name

            gene = {
                'neural_network_id': self.id,
                'from_neuron_id': from_neuron.id,
                'from_neuron_name': from_neuron.name,
                'to_neuron_id': to_neuron.id,
                'to_neuron_name': to_neuron.name,
                'weight': c.weight,
                'active_state': c.activated,
                'connection_id': connection_id,
                'exclusive_connection_id': exclusive_connection_id
            }

            dna.append(gene)

        self.dna = dna



    def create_new_ids(self):
        if len(self.neurons) < 2:
            return

        for neuron in self.neurons:
            old_id = neuron.id

            # Atualizando o id do neurônio
            new_id = create_new_id(neuron.name)
            neuron.id = new_id

            # Atualizando o id do neurônio na lista de conexões
            for conn in self.connections:

                if conn.from_neuron == old_id:
                    conn.from_neuron = new_id

                if conn.to_neuron == old_id:
                    conn.to_neuron = new_id


    # Método para retornar informações da rede neural, como seus neurônios e suas conexões
    def print_network_info(self):
        input_neurons = [neuron.name for neuron in self.neurons if neuron.neuron_type == 'Input']
        hidden_neurons = [neuron.name for neuron in self.neurons if neuron.neuron_type == 'Hidden']
        output_neurons = [neuron.name for neuron in self.neurons if neuron.neuron_type == 'Output']

        print(f"\nNeurônios Input: {input_neurons}")
        print(f"Neurônios Hidden: {hidden_neurons}")
        print(f"Neurônios Output: {output_neurons}\n")
        print("Conexões:")
        for connection in self.connections:
            from_neuron = next(neuron for neuron in self.neurons if neuron.id == connection.from_neuron)
            to_neuron = next(neuron for neuron in self.neurons if neuron.id == connection.to_neuron)
            print("{:>25}    ------>   {:>18}|  W={}  |  Activated={}".format(from_neuron.name, to_neuron.name, connection.weight, connection.activated))



# -------------------------------------------------------------------------------
# ---------------------------------- TESTAGEM -----------------------------------
# -------------------------------------------------------------------------------

def create_network():
     # Criando uma estrutura básica de rede neural para um organismo capaz de andar em direção a um alimento
    basic_network = NeuralNetwork()

    # A estrutura básica é essa:
    """
    INPUT                             HIDDEN                       OUTPUT
    Constant --------------------------------------------------> Accelerate

    AngleToClosestTarget ----------> PiecewiseConstant ----------> Rotate

    Maturity --------------------------------------------------> DesireToRepdoduce

    EnergyLevel ---------------------> Cos --------------------> DesireToEat
    """
    # Adicionando os neurônios na rede
    basic_network.neurons = [
        Neuron('Input', 'AngleToClosestTarget', 0),
        Neuron('Input', 'Constant', 1),
        Neuron('Input', 'Maturity', 2),
        Neuron('Input', 'EnergyLevel', 3),
        Neuron('Hidden', 'PiecewiseConstant', 4),
        Neuron('Hidden', 'Cos', 5),
        Neuron('Output', 'Accelerate', 6),
        Neuron('Output', 'Rotate', 7),
        Neuron('Output', 'DesireToReproduce', 8),
        Neuron('Output', 'DesireToEat', 9)
    ]

    # Criando as conexões entre os neurônios
    basic_network.connections = [
        Connection(0, 4, round(random.random(), MAX_DECIMAL_PLACES)),  # AngleToClosestTarget --> PiecewiseConstant
        Connection(4, 7, round(random.random(), MAX_DECIMAL_PLACES)), # PiecewiseConstant --> Rotate
        Connection(1, 6, round(random.random(), MAX_DECIMAL_PLACES)),   # Constant --> Accelerate
        Connection(2, 8, round(random.random(), MAX_DECIMAL_PLACES)),   # Maturity --> DesireToReproduce
        Connection(3, 5, round(random.random(), MAX_DECIMAL_PLACES)),   # EnergyLevel --> Cos
        Connection(5, 9, round(random.random(), MAX_DECIMAL_PLACES)),   # Cos --> DesireToEat
    ]

    # Para a primeira geração de redes neurais, as mutações serão apenas construtivas (e não destrutivas) 
    # para que todas as redes possuam a estrutura básica inicial
    add_neuron_probability = 0.5
    add_connection_probability = 0.5
    change_weight_probability = 0.5
    change_active_state_probability = 0
    remove_neuron_probability = 0
    remove_connection_probability = 0

    for _ in range(0, 3):
        basic_network.mutate(add_neuron_probability, add_connection_probability, change_weight_probability, change_active_state_probability, remove_neuron_probability, remove_connection_probability)

    # Atualizando a ordem topológica da rede e construindo o seu DNA
    update_neural_network(basic_network)

    return basic_network





# # Testando a reprodução sexuada
# nn1 = create_network()
# nn2 = create_network()

# # Mudando um pouco mais as redes
# for i in range(0, 3):
#     nn1.mutate()
#     nn2.mutate()

# print("\n--------------------------- Rede Pai ---------------------------")

# nn1.print_network_info()
# # print_dna(nn1.dna)

# print("\n--------------------------- Rede Mãe ---------------------------")

# nn2.print_network_info()
# # print_dna(nn2.dna)

# # Cruzando as redes
# print("\n--------------------------- Rede Filha ---------------------------")

# nn_filha = breed_neural_networks(nn1, nn2)
# nn_filha.print_network_info()
# # print_dna(nn_filha.dna)
# print(nn_filha.id)


# Teste da função de criar redes da primeira geração

# input_values_test = {
#     'EnergyLevel': 45,
#     'Temperature': 70,
#     'Health': 8,
#     'AngleToClosestFood': 5,
#     'DistToClosestFood': 68,
#     'NumOfFoodInView': 90,
#     'AngleToClosestOrganism': 66,
#     'DistToClosestOrganism': 12,
#     'NumOfOrganismsInView': 4,
#     'AngleToClosestTarget': 66,
#     'DistToClosestTarget': 12,
#     'NumOfTargetsInView': 4,
#     'Luminosity': 0.5,
#     'Maturity': 5,
#     'TimeAlive': 234
# }

# for i in range(0, 3):
#     print(f"\n\n-------------- REDE {i} --------------\n")
#     nn = create_network()
#     nn.print_network_info()

#     print(nn.feed_forward(input_values_test))
