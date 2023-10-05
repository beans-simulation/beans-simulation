const color_operation = {
  addition: "add",
  subtraction: "sub",
} as const;

type color_operation_keys = keyof typeof color_operation;
type color_operation_type = (typeof color_operation)[color_operation_keys];