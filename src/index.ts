import { atRule, type AtRule, Rule } from "postcss";
import { createUnitRegex } from "./regex";
import {
  blacklistedSelector,
  createExcludeMatcher,
  createPropListMatcher,
  createUnitReplace,
  declarationExists,
  getConfig,
  postcssPlugin,
} from "./shared";
import type { PostcssMediaQueryTransform, UserDefinedOptions } from "./types";

export * from "./types";
const plugin: PostcssMediaQueryTransform = (
  options: UserDefinedOptions = {}
) => {
  const {
    disabled,
    exclude,
    insert,
    mediaQuery,
    propList,
    selectorBlackList,
    transformUnit,
    unitPrecision,
  } = getConfig(options);
  if (disabled || !mediaQuery) {
    return {
      postcssPlugin,
    };
  }

  const satisfyPropList = createPropListMatcher(propList);
  const excludeFn = createExcludeMatcher(exclude);

  return {
    postcssPlugin,
    OnceExit(css) {
      const source = css.source;
      const input = source!.input;
      const filePath = input.file as string;
      const isExcludeFile = excludeFn(filePath);
      if (isExcludeFile) {
        return;
      }

      const mediaQueryList = Array.isArray(mediaQuery)
        ? mediaQuery
        : [mediaQuery];

      const mediaQueryRules = mediaQueryList.map((mediaQuery) => {
        return {
          rule: atRule({
            name: "media",
            params: mediaQuery.query,
          }),
          pxReplace: createUnitReplace(
            typeof mediaQuery.scale === "function"
              ? mediaQuery.scale(input)
              : mediaQuery.scale,
            unitPrecision,
            transformUnit
          ),
        };
      });

      css.walkRules((rule) => {
        if (rule.parent?.type === "atrule") {
          // 如果规则的父级是一个规则，则跳过
          // 例如：@media screen and (min-width: 400px) {}
          // @keyframes fadeIn {}
          // @webkit-keyframes fadeIn {}
          return;
        }

        mediaQueryRules.map(({ rule: mediaQueryRule, pxReplace }) => {
          // 克隆规则
          const clonedRule = rule.clone();

          // 遍历克隆规则中的所有声明
          clonedRule.walkDecls((decl) => {
            const rule = decl.parent as Rule;
            if (
              !decl.value.includes(transformUnit) ||
              !satisfyPropList(decl.prop) ||
              blacklistedSelector(selectorBlackList, rule.selector)
            ) {
              // 如果不在规则内，直接移除这条声明
              decl.remove();
              return;
            }

            const value = decl.value.replace(
              createUnitRegex(transformUnit),
              pxReplace
            );

            if (declarationExists(rule, decl.prop, value)) {
              // 如果不在规则内，直接移除这条声明
              decl.remove();
              return;
            }

            // 如果调整后的值与原始值不同，则更新值
            if (value !== decl.value) {
              decl.value = value;
            } else {
              // 如果调整后的值与原始值相同，则移除这条声明
              decl.remove();
            }
          });

          // 如果克隆规则中还有剩余的声明，则将其添加到媒体查询中
          if (clonedRule.nodes?.length) {
            mediaQueryRule.append(clonedRule);
          }
        });
      });

      css.walkAtRules((atRule) => {
        if (atRule.name.includes("keyframes")) {
          mediaQueryRules.map(({ rule: mediaQueryRule, pxReplace }) => {
            // 克隆规则
            const clonedAtRule = atRule.clone();

            let needAppend = false;

            clonedAtRule.walkDecls((decl) => {
              const rule = decl.parent as Rule;
              if (
                !decl.value.includes(transformUnit) ||
                !satisfyPropList(decl.prop) ||
                blacklistedSelector(selectorBlackList, rule.selector)
              ) {
                return;
              }

              const value = decl.value.replace(
                createUnitRegex(transformUnit),
                pxReplace
              );

              if (declarationExists(rule, decl.prop, value)) {
                return;
              }

              // 如果调整后的值与原始值不同，则更新值
              if (value !== decl.value) {
                needAppend = true;
                decl.value = value;
              }
            });

            // 如果克隆规则中还有剩余的声明，则将其添加到媒体查询中
            if (needAppend) {
              mediaQueryRule.append(clonedAtRule);
            }
          });
        }
      });

      const mediaQueryNodes = mediaQueryRules
        .filter(({ rule }) => rule.nodes?.length)
        .map(({ rule }) => rule);
      if (insert === "before") {
        css.prepend(...mediaQueryNodes); // 添加到根节点的最前面，避免覆盖其他规则，确保其他媒介查询优先于他
      } else {
        css.append(...mediaQueryNodes); // 添加到根节点的最前面，避免覆盖其他规则，确保其他媒介查询优先于他
      }
    },
  };
};

plugin.postcss = true;

export default plugin;
