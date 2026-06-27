import type { CSSProperties } from "react";

type CssVariableName = `--${string}`;
type CssVariableValue = string | number;

export type CssVariableProperties = CSSProperties &
  Record<CssVariableName, CssVariableValue>;

export function defineCssVars(
  vars: Record<CssVariableName, CssVariableValue>,
): CssVariableProperties {
  return vars as CssVariableProperties;
}
