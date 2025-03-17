import mqTransform from "src/index";
import postcss from "postcss";

describe("mqTransform", () => {
  it("should work on the readme example", () => {
    const input =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625px; }";
    const output =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625px; }@media (min-width: 400px) {h1 { letter-spacing: 0.03125px; } }";
    const processed = postcss(mqTransform()).process(input).css;

    expect(processed).toBe(output);
  });

  it("should not work when disabled", () => {
    const input =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625px; }";
    const output = input;

    const processed = postcss(
      mqTransform({
        disabled: true,
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it("should handle < 1 values and values without a leading 0", () => {
    const rules = ".rule { margin: 0.5px .03125rpx -0.0125rem -.2em }";
    const expected =
      ".rule { margin: 0.5px .03125rpx -0.0125rem -.2em }@media (min-width: 400px) {.rule { margin: 0.25px .03125rpx -0.0125rem -.2em } }";
    const options = {
      propList: ["margin"],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should remain unitless if 0", () => {
    const expected = ".rule { font-size: 0rem; font-size: 0; }";
    const processed = postcss(mqTransform()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("should unit be rpx", () => {
    const input =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625rem; }";
    const output =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625rem; }@media (min-width: 400px) {h1 { font-size: 1rpx; } }";
    const processed = postcss(
      mqTransform({
        transformUnit: "rpx",
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });

  it("should work when keyframes", () => {
    const options = {
      propList: ["*"],
    };
    const rules =
      "@keyframes rule { 0% { transform: translateX(0); } 25% { transform: translateX(-10px); } 50% { transform: translateX(10px); } 75% { transform: translateX(-10px); } 100% { transform: translateX(0); } }";
    const expected =
      "@keyframes rule { 0% { transform: translateX(0); } 25% { transform: translateX(-10px); } 50% { transform: translateX(10px); } 75% { transform: translateX(-10px); } 100% { transform: translateX(0); } } @media (min-width: 400px) {@keyframes rule { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } } }";
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not work when media", () => {
    const expected =
      "@media (min-width: 420px) {h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625rem; } }";
    const processed = postcss(
      mqTransform({
        transformUnit: "rpx",
      })
    ).process(expected).css;

    expect(processed).toBe(expected);
  });

  it("multiple media queries work", () => {
    const input =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625px; }";
    const output =
      "h1 { margin: 0 0 20px; font-size: 2rpx; line-height: 1.2; letter-spacing: 0.0625px; }@media (min-width: 400px) {h1 { letter-spacing: 0.03125px; } }@media (max-width: 200px) {h1 { letter-spacing: 0.125px; } }";
    const processed = postcss(
      mqTransform({
        mediaQuery: [
          { query: "(min-width: 400px)", scale: 0.5 },
          { query: "(max-width: 200px)", scale: 2 },
        ],
      })
    ).process(input).css;

    expect(processed).toBe(output);
  });
});

describe("value parsing", () => {
  it("should not replace values in double quotes or single quotes", () => {
    const options = {
      propList: ["*"],
    };
    const rules =
      ".rule { content: '1rem'; font-family: \"1rem\"; font-size: 16px; }";
    const expected =
      ".rule { content: '1rem'; font-family: \"1rem\"; font-size: 16px; }@media (min-width: 400px) {.rule { font-size: 8px; } }";
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values in `url()`", () => {
    const options = {
      propList: ["*"],
    };
    const rules = ".rule { background: url(1px.jpg); font-size: 16px; }";
    const expected =
      ".rule { background: url(1px.jpg); font-size: 16px; }@media (min-width: 400px) {.rule { font-size: 8px; } }";
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should not replace values with an uppercase P or PX", () => {
    const options = {
      propList: ["*"],
    };
    const rules =
      ".rule { margin: 0.75px calc(100% - 14PX); height: calc(100% - 1.25px); font-size: 12Px; line-height: 1px; }";
    const expected =
      ".rule { margin: 0.75px calc(100% - 14PX); height: calc(100% - 1.25px); font-size: 12Px; line-height: 1px; }@media (min-width: 400px) {.rule { margin: 0.375px calc(100% - 14PX); height: calc(100% - 0.625px); line-height: 0.5px; } }";
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("unitPrecision", () => {
  it("should replace using a decimal of 2 places", () => {
    const rules = ".rule { font-size: 0.534375px }";
    const expected =
      ".rule { font-size: 0.534375px }@media (min-width: 400px) {.rule { font-size: 0.27px } }";
    const options = {
      unitPrecision: 2,
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("propList", () => {
  it("should only replace properties in the prop list", () => {
    const rules =
      ".rule { font-size: 16px; margin: 16px; margin-left: 8px; padding: 8px; padding-right: 16px }";
    const expected =
      ".rule { font-size: 16px; margin: 16px; margin-left: 8px; padding: 8px; padding-right: 16px }@media (min-width: 400px) {.rule { font-size: 8px; margin: 8px; padding: 4px; padding-right: 8px } }";
    const options = {
      propList: ["font", /^margin$/, "pad"],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should only replace properties in the prop list with wildcard", () => {
    const rules =
      ".rule { font-size: 16px; margin: 16px; margin-left: 8px; padding: 8px; padding-right: 16px }";
    const expected =
      ".rule { font-size: 16px; margin: 16px; margin-left: 8px; padding: 8px; padding-right: 16px }@media (min-width: 400px) {.rule { margin: 8px } }";
    const options = {
      propList: [/^margin$/],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should replace all properties when white list is wildcard", () => {
    const rules = ".rule { margin: 16px; font-size: 16px }";
    const expected =
      ".rule { margin: 16px; font-size: 16px }@media (min-width: 400px) {.rule { margin: 8px; font-size: 8px } }";
    const options = {
      propList: ["*"],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});

describe("selectorBlackList", () => {
  it("should ignore selectors in the selector black list", () => {
    const rules = ".rule { font-size: 16px } .rule2 { font-size: 16px }";
    const expected =
      ".rule { font-size: 16px } .rule2 { font-size: 16px } @media (min-width: 400px) {.rule { font-size: 8px } }";
    const options = {
      selectorBlackList: [".rule2"],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should ignore every selector with `body$`", () => {
    const rules =
      "body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }";
    const expected =
      "body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; } @media (min-width: 400px) {body { font-size: 8px; } .simple-class { font-size: 8px; } }";
    const options = {
      selectorBlackList: ["body$"],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it("should only ignore exactly `body`", () => {
    const rules =
      "body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }";
    const expected =
      "body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; } @media (min-width: 400px) { .class-body { font-size: 8px; } .simple-class { font-size: 8px; } }";
    const options = {
      selectorBlackList: [/^body$/],
    };
    const processed = postcss(mqTransform(options)).process(rules).css;

    expect(processed).toBe(expected);
  });
});
