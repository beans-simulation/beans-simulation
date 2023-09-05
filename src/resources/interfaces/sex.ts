const sex = {
  female: "XX",
  male: "XY",
} as const;

type sex_keys = keyof typeof sex;
type sex_type = (typeof sex)[sex_keys];

export { sex, type sex_type };
