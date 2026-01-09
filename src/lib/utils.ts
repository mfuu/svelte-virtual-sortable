export function cssStringify(styleSheet: Partial<CSSStyleDeclaration>) {
  return Object.keys(styleSheet)
    .map((k) => `${k}: ${styleSheet[k]}`)
    .join(';');
}
