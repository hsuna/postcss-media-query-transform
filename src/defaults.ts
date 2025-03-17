import type { UserDefinedOptions } from "./types";

export const defaultOptions: Required<UserDefinedOptions> = {
  mediaQuery: { query: "(min-width: 400px)", scale: 0.5 },
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ["font", "font-size", "line-height", "letter-spacing"],
  transformUnit: "px",
  exclude: [/node_modules/i],
  disabled: false,
};
