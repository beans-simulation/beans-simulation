function get_direction(element: Point, target: Point){
    const distance_x: number = target.position.x - element.position.x;
    const distance_y: number = target.position.y - element.position.y;
    return new Vector(distance_x, distance_y)
}
function get_angle_to_closest_element(organism: Organism, closest_element: Point){
    if(closest_element == null){
        return 0
    }
    const direction = get_direction(organism, closest_element)
    const angle_signal = direction.x * organism.speed.y - direction.y * organism.speed.x // talvez o problema do sinal esteja aqui
    var angle = direction.get_angle_to_another_vector(organism.speed)
    if(angle_signal>0){
        angle = angle*(-1) //adiciona sinal negativo
    }
    return angle
}
function get_angle_signal_to_closest_element(organism: Organism, closest_element: Point){
    if(closest_element == null){
        return 0
    }
    const direction = get_direction(organism, closest_element)
    const angle_signal = direction.x * organism.speed.y - direction.y * organism.speed.x
    return angle_signal
}
