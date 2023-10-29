function drag_mouse_down(event: MouseEvent) {
  event.preventDefault();
  // when mouse move inside component
  document.onmousemove = element_drag;
  // when user releases mouse button
  document.onmouseup = stop_drag_element;
}

function element_drag(event: MouseEvent) {
  event.preventDefault();
  const element = event.target as HTMLDivElement | null;
  const parent = element?.parentElement;

  if (element && parent) {
    const middleTabX = innerWidth - event.x - parent.clientWidth / 2;
    const middleTabY = event.y - element.clientHeight / 2;

    const minX = 5;
    const maxY = innerHeight - parent.scrollHeight;

    const x = middleTabX <= minX ? minX : middleTabX;
    const y = middleTabY >= maxY ? maxY : middleTabY;

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
  // se for uma tab
  if (element.classList.contains("tab-info")) {
    // inserir o evento de arrastar na div de titulo (primeiro filho dentro da tab)
    (element.children[0] as HTMLDivElement).onmousedown = drag_mouse_down;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    (element as HTMLDivElement).onmousedown = drag_mouse_down;
  }
}
