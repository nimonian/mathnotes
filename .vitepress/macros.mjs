// Shared LaTeX macros — available both in MathJax math ($...$ / $$...$$)
// and inside ```tikz fences (injected as \newcommand's).
//
// Keys are macro names without the backslash; values are MathJax-style
// definitions. Macros with arguments use ['definition', argCount],
// e.g. abs: ['\\left\\lvert #1 \\right\\rvert', 1].
export const macros = {
  // Number sets
  N: '\\mathbb{N}',
  Z: '\\mathbb{Z}',
  Q: '\\mathbb{Q}',
  R: '\\mathbb{R}',
  C: '\\mathbb{C}',

  // Analysis shorthands
  eps: '\\varepsilon',
  dd: '\\,\\mathrm{d}', // \int f(x) \dd x

  // Paired delimiters — auto-stretchy, no \left...\right needed
  abs: ['\\left\\lvert #1 \\right\\rvert', 1],
  norm: ['\\left\\lVert #1 \\right\\rVert', 1],
  floor: ['\\left\\lfloor #1 \\right\\rfloor', 1],
  ceil: ['\\left\\lceil #1 \\right\\rceil', 1],
  paren: ['\\left( #1 \\right)', 1],
  inner: ['\\left\\langle #1 \\right\\rangle', 1],
  set: ['\\left\\{\\, #1 \\,\\right\\}', 1],
  // Stretchy "such that" bar inside \set: \set{x \in \Q \given x^2 < 2}
  given: '\\,\\middle|\\,',
}

/** Render the macros as \newcommand lines for the TikZ/LaTeX pipeline. */
export function macrosAsLatex() {
  return Object.entries(macros)
    .map(([name, def]) => {
      const [body, nargs] = Array.isArray(def) ? def : [def, 0]
      const args = nargs > 0 ? `[${nargs}]` : ''
      return `\\newcommand{\\${name}}${args}{${body}}`
    })
    .join('\n')
}
