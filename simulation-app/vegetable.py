import random


class Vegetable:
    def __init__(self):
        self.id = self._generate_id()

    def _generate_id():
        # we can check in this function if the id is unique
        return random.randint(1,5)

    def get_id(self):
        return self.id
