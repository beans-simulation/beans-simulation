import math
import random

class Vetor:
    """
    A class for creating vectors.
    """

    def __init__(self, x, y):
        """
        Initialize the vector with x and y components.

        Args:
            x (float): The x component of the vector.
            y (float): The y component of the vector.
        """
        self.x = x
        self.y = y

    def set(self, x, y):
        """
        Reset the x and y values of the vector to the specified values.

        Args:
            x (float): The new x value.
            y (float): The new y value.
        """
        self.x = x
        self.y = y

    def magSq(self):
        """
        Calculate the squared magnitude of the vector.

        Returns:
            float: The squared magnitude of the vector.
        """
        return self.x * self.x + self.y * self.y

    def mag(self):
        """
        Calculate the magnitude of the vector.

        Returns:
            float: The magnitude of the vector.
        """
        return math.sqrt(self.magSq())

    def add(self, v):
        """
        Add the components of another vector to this vector.

        Args:
            v (Vetor): The vector to be added.

        Returns:
            Vetor: The updated vector after addition.
        """
        self.x += v.x
        self.y += v.y
        return self

    def sub(self, v):
        """
        Subtract the components of another vector from this vector.

        Args:
            v (Vetor): The vector to be subtracted.

        Returns:
            Vetor: The updated vector after subtraction.
        """
        self.x -= v.x
        self.y -= v.y
        return self

    def subNew(self, v):
        """
        Subtract the components of another vector from this vector and return a new vector.

        Args:
            v (Vetor): The vector to be subtracted.

        Returns:
            Vetor: A new vector resulting from the subtraction.
        """
        x = self.x - v.x
        y = self.y - v.y
        return Vetor(x, y)

    def div(self, n):
        """
        Divide the vector by a specified value.

        Args:
            n (float): The divisor value.

        Returns:
            Vetor: The updated vector after division.
        """
        self.x /= n
        self.y /= n
        return self

    def mul(self, n):
        """
        Multiply the vector by a specified value.

        Args:
            n (float): The multiplier value.

        Returns:
            Vetor: The updated vector after multiplication.
        """
        self.x *= n
        self.y *= n
        return self

    def normalize(self):
        """
        Normalize the vector (change its magnitude to 1).

        Returns:
            Vetor: The normalized vector.
        """
        return self.div(self.mag())

    def setMag(self, n):
        """
        Set the magnitude of the vector to a specified value.

        Args:
            n (float): The new magnitude value.

        Returns:
            Vetor: The vector with the specified magnitude.
        """
        return self.normalize().mul(n)

    def dist(self, v):
        """
        Calculate the distance between this vector and another vector.

        Args:
            v (Vetor): The other vector.

        Returns:
            float: The distance between the two vectors.
        """
        d = v.copy().sub(self)
        return d.mag()

    def limit(self, l):
        """
        Limit the magnitude of the vector to a specified value.

        Args:
            l (float): The limit value.

        Returns:
            Vetor: The updated vector after limiting its magnitude.
        """
        mSq = self.magSq()
        if mSq > l * l:
            self.div(math.sqrt(mSq))
            self.mul(l)
        return self

    def headingRads(self):
        """
        Calculate the direction angle of the vector in radians.

        Returns:
            float: The direction angle in radians.
        """
        return math.atan2(self.y, self.x)

    def headingDegs(self):
        """
        Calculate the direction angle of the vector in degrees.

        Returns:
            float: The direction angle in degrees.
        """
        r = math.atan2(self.y, self.x)
        h = (r * 180.0) / math.pi
        return h

    def rotateRads(self, a):
        """
        Rotate the vector by a specified angle in radians.

        Args:
            a (float): The angle to rotate by in radians.

        Returns:
            Vetor: The updated vector after rotation.
        """
        newHead = self.headingRads() + a
        mag = self.mag()
        self.x = math.cos(newHead) * mag
        self.y = math.sin(newHead) * mag
        return self

    def rotateDegs(self, a):
        """
        Rotate the vector by a specified angle in degrees.

        Args:
            a (float): The angle to rotate by in degrees.

        Returns:
            Vetor: The updated vector after rotation.
        """
        a = (a * math.pi) / 180.0
        newHead = self.headingRads() + a
        mag = self.mag()
        self.x = math.cos(newHead) * mag
        self.y = math.sin(newHead) * mag
        return self

    def angleBetweenDegs(self, x, y):
        """
        Calculate the angle between two vectors in degrees.

        Args:
            x (Vetor): The first vector.
            y (Vetor): The second vector.

        Returns:
            float: The angle between the two vectors in degrees.
        """
        r = self.angleBetweenRads(x, y)
        d = (r * 180) / math.pi
        return d

    def equals(self, x, y):
        """
        Check if two vectors are equal.

        Args:
            x (float or Vetor): The x component or another vector.
            y (float or Vetor): The y component or another vector.

        Returns:
            bool: True if the vectors are equal, False otherwise.
        """
        a, b = 0, 0
        if isinstance(x, Vetor):
            a = x.x or 0
            b = x.y or 0
        else:
            a = x or 0
            b = y or 0
        return self.x == a and self.y == b

    def copy(self):
        """
        Create a copy of this vector.

        Returns:
            Vetor: A new vector with the same components.
        """
        return Vetor(self.x, self.y)

