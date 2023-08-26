import random
from vector import Vector

class Organism:
    def __init__(self):
        self.id = self._generate_id()
        self.initial_radius = 1 
        self.detection_radius = 1 
        self.max_speed = 1
        self.max_energy = 1
        self.acceleration = 1
        self.vel = Vector(0.0001, 0.0001)


        # status attributes
        self.is_eating = False
        self.is_roaming = False
        self.is_running_away = False



    def _generate_id():
        # we can check in this function if the id is unique
        return random.randint(1,5)

    def roam(self): #vagueia
        self.is_roaming = True

        # Creating the circle
        centro_circulo = self.vel.copy()
        centro_circulo.normalize()
        centro_circulo.mul(self.d_circulo)

        # Creating the displacement force
        deslocamento = Vetor(0, -1)
        deslocamento.mul(self.raio_circulo)
        deslocamento.rotateDegs(self.angulo_vagueio)
        self.angulo_vagueio += random.uniform(-15, 15)

        # Creating the wandering force
        forca_vagueio = centro_circulo.add(deslocamento)

        if self.comendo or self.fugindo:
            forca_vagueio.mul(0.03)
        
        self.aplicaForca(forca_vagueio.mul(0.2))
        # }
}




