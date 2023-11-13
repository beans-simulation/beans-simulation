function drag_mouse_down(event: MouseEvent) {
  event.preventDefault();
  // when mouse move inside component
  document.onmousemove = element_drag;
  // when user releases mouse button
  document.onmouseup = stop_drag_element;
  // when mouse go outside of title
  document.onmouseleave = stop_drag_element;
}

function get_new_x(
  minX: number,
  maxX: number,
  middleTabX: number,
  eventX: number
) {
  const title_size = 300;
  if (eventX - title_size / 2 <= 0) {
    return maxX;
  }
  return middleTabX <= minX ? minX : middleTabX;
}

function get_new_y(
  minY: number,
  maxY: number,
  middleTabY: number,
  event_y: number
) {
  const title_size = 60;

  if (event_y - title_size / 2 <= 0) {
    return minY;
  }

  return middleTabY >= maxY ? maxY : middleTabY;
}

function element_drag(event: MouseEvent) {
  event.preventDefault();
  const element = event.target as HTMLDivElement | null;
  const parent = element?.parentElement;
  const tab = element?.closest(".tab-title");

  if (element && parent && tab) {
    const middleTabX = innerWidth - event.x - parent.clientWidth / 2;
    const middleTabY = event.y - tab.clientHeight / 2;

    const minX = 5;
    const maxX = innerWidth - parent.clientWidth - 5;

    const minY = 5;
    const maxY = innerHeight - parent.clientHeight - 5;

    const x = get_new_x(minX, maxX, middleTabX, event.x);
    const y = get_new_y(minY, maxY, middleTabY, event.y);

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
}

function drag_screen_element(element: Element) {
  (element as HTMLDivElement).onmousedown = drag_mouse_down;
}
