function drag_mouse_down(event: MouseEvent) {
  event.preventDefault();
  // get the mouse cursor position at startup:
  document.onmouseup = close_drag_element;
  // call a function whenever the cursor moves:
  document.onmousemove = element_drag;
}

function element_drag(event: MouseEvent) {
  event.preventDefault();
  const element = event.target as HTMLDivElement | null;

  if (element) {
    // calculate the new cursor position:
    const x = event.clientX;
    const y = event.clientY;

    // set the element's new position:
    element.style.left = element.offsetLeft - x + "px";
    element.style.top = element.offsetTop - y + "px";
  }
}

function close_drag_element() {
  // stop moving when mouse button is released:
  document.onmouseup = null;
  document.onmousemove = null;
}

export function drag_screen_element(element: Element) {
  // se for uma tab
  if (element.classList.contains("tab-info")) {
    // inserir o evento de arrastar na div de titulo (primeiro filho dentro da tab)
    (element.children[0] as HTMLDivElement).onmousedown = drag_mouse_down;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    (element as HTMLDivElement).onmousedown = drag_mouse_down;
  }
}
