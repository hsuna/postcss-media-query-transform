import { getConfig } from "src/shared";

describe("config", () => {
  it("getConfig default", () => {
    expect(getConfig()).toMatchSnapshot();
  });

  it("getConfig with wild prop", () => {
    expect(
      getConfig({
        mediaQuery: [
          { query: "(min-width: 400px)", scale: 0.5 },
          { query: "(max-width: 200px)", scale: 2 },
        ],
        propList: ["*"],
      })
    ).toMatchSnapshot();
  });
});
