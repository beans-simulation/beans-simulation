const organism_status = {
  eating: "eating",
  hunting: "hunting",
  roaming: "roaming",
  running_away: "running_away",
} as const;

type organism_status_keys = keyof typeof organism_status;
type organism_status_type = (typeof organism_status)[organism_status_keys];

export { organism_status, type organism_status_type };
