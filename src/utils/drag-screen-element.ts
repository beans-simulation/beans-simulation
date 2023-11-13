function get_new_x(parent: HTMLElement, element: HTMLElement, event_x: number) {
  const middleTabX = innerWidth - event_x - parent.clientWidth / 2;

  const minX = 5;
  const maxX = innerWidth - parent.clientWidth - 5;

  const title_size = element.clientWidth;
  if (event_x - title_size / 2 <= 0) {
    return maxX;
  }
  return middleTabX <= minX ? minX : middleTabX;
}

function get_new_y(parent: HTMLElement, element: HTMLElement, event_y: number) {
  const middleTabY = event_y - element.clientHeight / 2;

  const minY = 5;
  const maxY = innerHeight - parent.clientHeight - 5;

  const title_size = element.clientHeight;

  if (event_y - title_size / 2 <= 0) {
    return minY;
  }

  return middleTabY >= maxY ? maxY : middleTabY;
}

function element_drag(event: MouseEvent) {
  event.preventDefault();
  const element = event.target as HTMLDivElement | null;
  const parent = element?.parentElement;

  if (element && parent) {
    const x = get_new_x(parent, element, event.x);
    const y = get_new_y(parent, element, event.y);

    // controlar a posicao atraves do right e top
    if (parent.style.left) parent.style.left = "";

    // set the element's new position:
    parent.style.right = x + "px";
    parent.style.top = y + "px";
  }
}

function stop_drag_element() {
  document.onmouseup = null;
  document.onmousemove = null;
  document.onmouseleave = null;
}

function drag_screen_element(element: Element) {
  (element as HTMLDivElement).onmousedown = (event) => {
    event.preventDefault();
    // when mouse move inside component
    document.onmousemove = element_drag;
    // when user releases mouse button
    document.onmouseup = stop_drag_element;
    // when mouse go outside of title
    element.addEventListener("mouseleave", stop_drag_element);
  };
}
