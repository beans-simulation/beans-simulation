function resize_parent(event: MouseEvent, element_to_resize: HTMLElement) {
  const minWidth = 300;

  if (element_to_resize) {
    const newWidth = element_to_resize.clientWidth + event.movementX;
    const newHeight = element_to_resize.clientHeight + event.movementY;

    const w = newWidth > minWidth ? newWidth : minWidth;

    element_to_resize.style.width = String(w).concat("px");
    element_to_resize.style.height = String(newHeight).concat("px");
  }
}

function stop_resizing() {
  document.onmouseup = null;
  document.onmousemove = null;
}

function _prevent_default_and_mouse_up(event: MouseEvent) {
  event.preventDefault();
  // when user releases mouse button
  document.onmouseup = stop_resizing;
}

function resize_screen_element(
  event: MouseEvent,
  element_to_resize: HTMLElement
) {
  _prevent_default_and_mouse_up(event);
  // when mouse move inside component
  document.onmousemove = (event) => resize_parent(event, element_to_resize);
}

function convert_to_number(value: string): number {
  return Number(value.replace(/[^\d\.\,]/g, ""));
}

function resize_screen_element_and_chart(
  event: MouseEvent,
  element_to_resize: HTMLElement,
  child_number: number
) {
  _prevent_default_and_mouse_up(event);

  // when mouse move inside component
  document.onmousemove = (event) => {
    resize_parent(event, element_to_resize);

    const chart_parent = element_to_resize.children[child_number];

    const styles = getComputedStyle(chart_parent);
    const available_width =
      chart_parent.clientWidth -
      convert_to_number(styles.paddingLeft) -
      convert_to_number(styles.paddingRight);

    const height_without_padding =
      chart_parent.clientHeight -
      convert_to_number(styles.paddingTop) -
      convert_to_number(styles.paddingBottom);

    const siblings = [...chart_parent.children].filter((el) => el !== chart);
    const unavailable_height = siblings.reduce(
      (sum, sibling) => (sum += sibling.clientHeight),
      0
    );
    const available_height = height_without_padding - unavailable_height;

    if (chart_parent) {
      resize_chart(available_width, available_height);
    }
  };
}
