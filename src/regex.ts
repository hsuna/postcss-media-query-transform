// excluding regex trick: http://www.rexegg.com/regex-best-trick.html
export const createUnitRegex = (unit: string) =>
  new RegExp(
    `"[^"]+"|'[^']+'|url\\([^)]+\\)|var\\([^)]+\\)|(\\d+(?:\\.\\d+)?|\\.\\d+)${unit}`,
    "g"
  );
