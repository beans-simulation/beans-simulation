import { Organism, Vegetable } from "../models";

export function remove_from_global_list(list: (Organism | Vegetable)[], element: Organism | Vegetable): void{
     // more performatic than reording the list with .slice(), without letting a blank space on the list
    list = list.filter((item) => item !== element);
    console.log(list);
    console.log("removed from list");
  }
