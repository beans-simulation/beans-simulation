import math

def gaussian_neuron(x, mean=0, variance=1):
    return math.exp(-((x - mean) ** 2) / (2 * variance))


print(gaussian_neuron(0))