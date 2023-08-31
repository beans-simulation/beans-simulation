# Importando bibliotecas
import random
import math
from collections import deque
import time

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
    summed_input = sum(weighted_inputs)
    return math.sin(summed_input)

# -------------------------------------------------------------------------------
# ------------------------- VARIÁVEIS E LISTAS GLOBAIS --------------------------
# -------------------------------------------------------------------------------

# Valor que o neurônio de input "Constant" vai sempre retornar
CONSTANT_NEURON_VALUE = 1

# Taxas de mutação
ADD_NEURON_MUTATION_RATE = 0.5 # Taxa de mutação para adição de neurônios
REMOVE_NEURON_MUTATION_RATE = 0.2 # Taxa de mutação para remoção de neurônios
ADD_CONNECTION_MUTATION_RATE = 0.5 # Taxa de mutação para adição de conexões
REMOVE_CONNECTION_MUTATION_RATE = 0.2 # Taxa de mutação para remoção de conexões
CHANGE_WEIGHT_MUTATION_RATE = 0.5 # Taxa de mutação para mudança de pesos 

# Máximo que o peso de uma mutação pode mudar (de -MAX_WEIGHT_CHANGE até +MAX_WEIGHT_CHANGE)
MAX_WEIGHT_CHANGE = 0.1

# Número máximo de decimais que pesos e outputs podem ter.
MAX_DECIMAL_PLACES = 5

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
    ("Input", "Constant"),
    ("Input", "Luminosity"),
    ("Input", "Maturity"),
    ("Input", "TimeAlive"),

    # HIDDEN
    ("Hidden", "InvertSignal"),
    ("Hidden", "Absolute"),
    ("Hidden", "PiecewiseConstant"),
    ("Hidden", "Sin"),

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
    "Sin": sin
}

# -------------------------------------------------------------------------------
# ---------------------------------- CLASSES ------------------------------------
# -------------------------------------------------------------------------------
class Neuron:
    def __init__(self, id, neuron_type, name):
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
    def __init__(self, from_neuron, to_neuron, weight=1.0):
        self.from_neuron = from_neuron
        self.to_neuron = to_neuron
        self.weight = weight


class NeuralNetwork:
    def __init__(self):
        self.neurons = {}
        self.connections = []
        self.valid = True # Essa flag servirá para dizer se a rede é válida ou não, isso é, se passa por todas as regras de validação
        self.topological_order = [] # Guardará os neurônios em ordem topológica após qualquer alteração na topologia da rede

    # Função para calcular a ordem topológica da rede apenas 1x, e que será utilizada em todos os frames
    # dentro da função feed_forward()
    def update_topological_order(self):
        visited = set()
        topological_order = deque()

        def dfs(start_neuron):
            visited.add(start_neuron)
            for target_neuron in [connection.to_neuron for connection in self.connections if connection.from_neuron == start_neuron]:
                if target_neuron not in visited:
                    dfs(target_neuron)
            topological_order.appendleft(start_neuron)

        for neuron_id in self.neurons.keys():
            if neuron_id not in visited:
                dfs(neuron_id)
        
        self.topological_order = list(topological_order)


    # Função que passa os valores input por todas as camadas para calcular os valores de saída. 
    # ESSA É A FUNÇÃO QUE IRÁ RODAR A CADA FRAME!!!
    def feed_forward(self, input_values):
        # Inicializando os neurônios de input com valores fornecidos no dicionário input_values
        for neuron_id, neuron in self.neurons.items():
            if neuron.neuron_type == 'Input':
                neuron.output = input_values.get(neuron.name, 0) if neuron.name != "Constant" else CONSTANT_NEURON_VALUE
        
        # Usa a ordem topológica da rede pra calcular os outputs corretamente
        for neuron_id in self.topological_order:
            neuron = self.neurons[neuron_id]
            
            # Pula os neurônios de Input já que seus outputs são definidos fora da rede (no nosso contexto, são os sentidos do organismo)
            if neuron.neuron_type != 'Input':
                # Busca todas as conexões de entrada para este neurônio
                incoming_connections = [c for c in self.connections if c.to_neuron == neuron_id]
                weighted_inputs = [self.neurons[conn.from_neuron].output * conn.weight for conn in incoming_connections]
                
                # Usa a função do neurônio para calcular seu output
                neuron.compute_output(weighted_inputs)
                
        # Extrai e retorna os valores de output dos neurônios da última camada
        output_values = {neuron.name: neuron.output for _, neuron in self.neurons.items() if neuron.neuron_type == 'Output'}
        return output_values # É DAQUI QUE SAIRÃO OS VALORES PARA O COMPORTAMENTO DOS ORGANISMOS!!!

    
    def add_neuron(self):
        max_trials = 10  # Número máximo de tentativas para se adicionar uma conexão nova
        trials = 0

        # Tenta adicionar uma conexão válida até max_trials vezes ou até conseguir
        while trials < max_trials:
            # Primeiro pega os neurônios de input/output já existentes na rede
            existing_inputs = [neuron.name for _, neuron in self.neurons.items() if neuron.neuron_type == "Input"]
            existing_outputs = [neuron.name for _, neuron in self.neurons.items() if neuron.neuron_type == "Output"]
            
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
            new_id = max(self.neurons.keys(), default=-1) + 1  # Adiciona 1 ao key máximo
            new_neuron = Neuron(new_id, neuron_type, name)
            self.neurons[new_id] = new_neuron
            
            # Lida com as conexões do novo neurônio de acordo com o seu tipo
            if neuron_type == 'Hidden': # Precisam ter 2 conexões
                input_or_hidden_neurons = [n for n in self.neurons.values() if n.neuron_type in ['Input', 'Hidden'] and n.id != new_id]
                output_or_hidden_neurons = [n for n in self.neurons.values() if n.neuron_type in ['Output', 'Hidden'] and n.id != new_id]
                
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
                    self.connections.append(Connection(from_neuron.id, new_id))
                    self.connections.append(Connection(new_id, to_neuron.id))

                    
            else: # Se o neurônio for do tipo input ou output, só cria 1 conexão
                target_neurons = [n for n in self.neurons.values() if n.neuron_type in ['Hidden', 'Output']] if neuron_type == 'Input' else [n for n in self.neurons.values() if n.neuron_type in ['Input', 'Hidden']]
                
                # Caso não haja mais neurônio novo para se conectar
                if not target_neurons:
                    return
                
                chosen_target = random.choice(target_neurons)
                self.connections.append(Connection(new_id, chosen_target.id) if neuron_type == 'Input' else Connection(chosen_target.id, new_id))

            # Valida a rede neural depois que o neurônio foi adicionado
            if self.validate_network():
                break
            else: # Se algo deu errado
                del self.neurons[new_id]  # Remove o neurônio adicionado
                 # Remove as conexões ligadas ao neurônio adicionado
                self.connections = [c for c in self.connections if c.from_neuron != new_id and c.to_neuron != new_id]

            trials += 1

        if trials >= max_trials:
            print("O número máximo de tentativas foi alcançado, o neurônio não foi adicionado..")

        self.update_topological_order() # Atualiza a topologia da rede


    def remove_neuron(self):
        # Só continua se houver neurônios para remover
        if len(self.neurons) > 0:

            # Escolhe aleatoriamente um neurônio para remover
            neuron_to_remove = random.choice(list(self.neurons.values()))

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
            del self.neurons[neuron_to_remove.id]

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
            for _, neuron in self.neurons.items():
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
            for neuron in loose_neurons:
                del self.neurons[neuron.id]  # Remove do dicionário de neurônios
                self.connections = [connection for connection in self.connections if connection.from_neuron != neuron.id and connection.to_neuron != neuron.id]

            self.update_topological_order() # Atualiza a topologia da rede

    def add_connection(self):
        max_trials = 10  # Número máximo de tentativas para se adicionar uma conexão nova
        trials = 0

        # Só continua se houver neurônios para se conectar
        if len(self.neurons) > 1:

            # Tenta adicionar uma conexão válida até max_trials vezes ou até conseguir
            while trials < max_trials:
                # Seleciona dois neurônios aleatórios para se conectarem
                from_neuron = random.choice([n for n in self.neurons.values() if n.neuron_type != "Output"])
                to_neuron = random.choice([n for n in self.neurons.values() if n.neuron_type != "Input" and n.id != from_neuron.id])

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

        # Escolhe uma mutação aleatória para mudar o peso
        connection_to_change = random.choice(self.connections)

        # Altera o peso da conexão
        delta = random.uniform(-MAX_WEIGHT_CHANGE, MAX_WEIGHT_CHANGE)
        connection_to_change.weight = round(connection_to_change.weight + delta, MAX_DECIMAL_PLACES)


    # Função responsável por qualquer tipo de mutação
    def mutate(self):
        # Realiza as mutações
        if random.random() < ADD_NEURON_MUTATION_RATE:
            self.add_neuron()
        if random.random() < ADD_CONNECTION_MUTATION_RATE:
            self.add_connection()
        if random.random() < CHANGE_WEIGHT_MUTATION_RATE:
            self.change_weight()
        if random.random() < REMOVE_NEURON_MUTATION_RATE:
            self.remove_neuron()
        if random.random() < REMOVE_CONNECTION_MUTATION_RATE:
            self.remove_connection()
        
        # Valida a rede após a mutação
        self.valid = self.validate_network()
        if not self.valid:
            # Se a rede ficar inválida após a mutação, ela será resetada
            self.neurons = []
            self.connections = []


    # Função para validar a rede neural e checar se ela está seguindo as regras
    def validate_network(self):
        connection_pairs = {(connection.from_neuron, connection.to_neuron) for connection in self.connections}
        
        # Checa se há conexões duplicadas
        if len(connection_pairs) != len(self.connections):
            print("Validação Falha: Há conexões duplicadas.")
            return False

        # Checa se as conexões fazem sentido com os tipos de neurônios
        for neuron in self.neurons.values():
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
        for start_neuron in self.neurons.values():
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


    # Método para retornar informações da rede neural, como seus neurônios e suas conexões
    def print_network_info(self):
        input_neurons = [neuron.name for neuron in self.neurons.values() if neuron.neuron_type == 'Input']
        hidden_neurons = [neuron.name for neuron in self.neurons.values() if neuron.neuron_type == 'Hidden']
        output_neurons = [neuron.name for neuron in self.neurons.values() if neuron.neuron_type == 'Output']
        
        print(f"\nNeurônios Input: {input_neurons}")
        print(f"Neurônios Hidden: {hidden_neurons}")
        print(f"Neurônios Output: {output_neurons}\n")
        print("Conexões:")
        for connection in self.connections:
            from_neuron = next(neuron for neuron in self.neurons.values() if neuron.id == connection.from_neuron)
            to_neuron = next(neuron for neuron in self.neurons.values() if neuron.id == connection.to_neuron)
            print("{:>25}({})     ------>   {:>18}({}) |  W={}".format(from_neuron.name, from_neuron.id, to_neuron.name, to_neuron.id, connection.weight))



# -------------------------------------------------------------------------------
# ---------------------------------- TESTAGEM -----------------------------------
# -------------------------------------------------------------------------------

# Criando uma estrutura básica de rede neural para um organismo capaz de andar em direção a um alimento
basic_network = NeuralNetwork()

# A estrutura básica é essa:
"""
INPUT                             HIDDEN                       OUTPUT
Constant --------------------------------------------------> Accelerate

AngleToClosestFood ----------> PiecewiseConstant ----------> Rotate
"""
# Adicionando os neurônios na rede
basic_network.neurons = {
    0: Neuron(0, 'Input', 'AngleToClosestFood'),
    1: Neuron(1, 'Input', 'Constant'),
    2: Neuron(2, 'Input', 'Health'),
    3: Neuron(3, 'Input', 'TimeAlive'),
    4: Neuron(4, 'Hidden', 'PiecewiseConstant'),
    5: Neuron(5, 'Hidden', 'Sin'),
    6: Neuron(6, 'Hidden', 'Absolute'),
    7: Neuron(7, 'Output', 'Accelerate'),
    8: Neuron(8, 'Output', 'Rotate'),
    9: Neuron(9, 'Output', 'DesireToEat'),
}

# Criando as conexões entre os neurônios
basic_network.connections = [
    Connection(0, 4, 1.0),  # AngleToClosestFood --> PiecewiseConstant
    Connection(4, 8 , 1.0), # PiecewiseConstant --> Rotate
    Connection(1, 7, 1.0),   # Constant --> Accelerate
    Connection(2, 5, 1.0),   # Health --> Sin
    Connection(5, 9, 1.0),   # Sin --> DesireToEat
    Connection(3, 6, 1.0),   # TimeAlive --> Absolute
    Connection(6, 8, 1.0)   # Absolute --> Rotate
]

# Atualizando a ordem topológica da rede
basic_network.update_topological_order()

# Criando os valores de input manualmente. Na simulação, esses valores virão dos sentidos do organismo
# A maioria desses neurônios não está presente nessa rede, mas caso a mutação introduza esses neurônios,
# deixaremos esses valores aqui para que a rede mutada possa computar os outputs 
input_values = { # ESSES VALORES SÃO ARBITRÁRIOS AQUI
    'EnergyLevel': 25, 
    'Temperature': 16,
    'Health': 85,
    'AngleToClosestFood': -30, # A rede inicial só precisa desse valor, já que não possui os outros neurônios
    'DistToClosestFood': 56,
    'NumOfFoodInView': 3,
    'AngleToClosestOrganism': -77,
    'DistToClosestOrganism': 172,
    'NumOfOrganismsInView': 0,
    'Luminosity': 0.56,
    'Maturity': 0.83,
    'TimeAlive': 104
}


print("\n--------------------------- Rede Inicial ---------------------------")

# Imprimindo na tela informações gerais da rede
basic_network.print_network_info()

# Aqui é para ver quais os valores de saída da rede. São eles que definirão o comportamento do organismo!!
print("Valores de output:", basic_network.feed_forward(input_values))


print("\n------------------------- Rede Após mutação -------------------------")

# Realizando a mutação
for i in range(1, 5):
    basic_network.mutate()

basic_network.print_network_info()


print("\nValores de output:", basic_network.feed_forward(input_values))


# Testando rapidez do método feed_forward (que será chamado 1x por frame por organismo)

# number_of_creatures = 2000
# frames_per_second = 24

# print(f"\nRodando o método feed_forward {number_of_creatures * frames_per_second} vezes ({number_of_creatures} organismos a {frames_per_second} frames por segundo)")

# start_time = time.time()
# for i in range(1, frames_per_second):
#     for o in range(1, number_of_creatures):
#         basic_network.feed_forward(input_values)

# end_time = time.time()

# test_duration = end_time - start_time

# print(f"\nDuração: {test_duration} segundos")
