function resize_parent(event: MouseEvent, element_to_resize_id: string) {
  const element = document.getElementById(element_to_resize_id);

  const minWidth = 300;

  if (element) {
    const newWidth = element.clientWidth + event.movementX;
    const newHeight = element.clientHeight + event.movementY;

    const w = newWidth > minWidth ? newWidth : minWidth;

    element.style.width = String(w).concat("px");
    element.style.height = String(newHeight).concat("px");
  }
}

function stop_resizing() {
  document.onmouseup = null;
  document.onmousemove = null;
}

function resize_screen_element(
  event: MouseEvent,
  element_to_resize_id: string
) {
  event.preventDefault();
  // when mouse move inside component
  document.onmousemove = (event) => resize_parent(event, element_to_resize_id);
  // when user releases mouse button
  document.onmouseup = stop_resizing;
}
