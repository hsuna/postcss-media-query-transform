import type { Input, PluginCreator } from "postcss";

export interface MediaQueryScale {
  query: string;
  scale: number | ((input: Input) => number);
}

export interface UserDefinedOptions {
  mediaQuery?: MediaQueryScale | MediaQueryScale[];
  unitPrecision?: number;
  selectorBlackList?: (string | RegExp)[];
  propList?: (string | RegExp)[];
  transformUnit?: "px" | "rpx" | "rem";
  insert?: "before" | "after";
  exclude?: (string | RegExp)[] | ((filePath: string) => boolean);
  disabled?: boolean;
}

export type PostcssMediaQueryTransform = PluginCreator<UserDefinedOptions>;
