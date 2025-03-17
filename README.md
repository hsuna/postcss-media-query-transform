# postcss-media-query-transform

A plugin for [PostCSS](https://github.com/ai/postcss) that generates px or rpx units from rem units.

- Rewrite with `typescript` and well tested.
- TransformUnit Support `px` and `rpx` and `rem`!

> You should use `postcss@8.x`

## Install

```shell
npm i -D postcss-media-query-transform
yarn add -D postcss-media-query-transform
pnpm i -D postcss-media-query-transform
```

## Usage

### Use with postcss.config.js

```js
// postcss.config.js
module.exports = {
  plugins: [
    // for example
    // require('autoprefixer'),
    require("postcss-media-query-transform")({
      mediaQuery: { query: "(min-width: 400px)", scale: 0.5 },
      propList: ["*"],
      transformUnit: "px",
    }),
  ],
};
```

## Input/Output

_With the default settings, only font related properties are targeted._

```scss
// input
h1 {
  margin: 0 0 20px;
  font-size: 2rpx;
  line-height: 1.2;
  letter-spacing: 0.0625px;
}

// output
h1 {
  margin: 0 0 20px;
  font-size: 2rpx;
  line-height: 1.2;
  letter-spacing: 0.0625px;
}

@media (min-width: 400px) {
  h1 {
    letter-spacing: 0.03125px;
  }
}
```

## Options

Type: `Object | Null`
Default:

```js
const defaultOptions = {
  mediaQuery: { query: "(min-width: 400px)", scale: 0.5 },
  unitPrecision: 5,
  selectorBlackList: [],
  propList: ["font", "font-size", "line-height", "letter-spacing"],
  transformUnit: "px",
  exclude: [/node_modules/i],
  disabled: false,
};
```

### mediaQuery

Type: `MediaQueryScale` or `MediaQueryScale[]`

The media query string to be transformed，and scale value.

## unitPrecision

Type: `number`

The decimal precision px units are allowed to use, floored (rounding down on half).

## propList

Type: `(string | RegExp)[]`

The properties that can change from rem to px.

## selectorBlackList

Type: `(string | RegExp)[]`

The selectors to ignore and leave as rem.

## exclude

Type: `(string | RegExp)[] | ((filePath: string) => boolean)`

The file path to ignore and leave as px.

## transformUnit

Type: `'px' | 'rpx' | 'rem'`

The transform output unit.

## disabled

Type: `boolean`

If disable this plugin.

### A message about ignoring properties

Currently, the easiest way to have a single property ignored is to use a capital in the px unit declaration.

```scss
// `Px` or `PX` is ignored by `postcss-rem-to-pixel` but still accepted by browsers
.ignore {
  border: 1px solid; // ignored
  border-width: 2px; // ignored
}
```

Thanks to the author of `postcss-rem-to-pixel` and `postcss-pxtorem`.
