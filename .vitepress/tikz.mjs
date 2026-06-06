import { spawnSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Compiled SVGs are cached here, keyed on a hash of (preamble + source),
// so editing one diagram never recompiles the others.
const CACHE_DIR = fileURLToPath(new URL('./cache/tikz', import.meta.url))

// Shared preamble for every diagram — \usetikzlibrary lines etc. live here.
const PREAMBLE_FILE = fileURLToPath(new URL('./tikz-preamble.tex', import.meta.url))

function readPreamble() {
  return fs.existsSync(PREAMBLE_FILE)
    ? fs.readFileSync(PREAMBLE_FILE, 'utf-8')
    : ''
}

/** Pull the first error ("! ...") out of a LaTeX log. */
function extractLatexError(logFile, proc) {
  let log = ''
  try {
    log = fs.readFileSync(logFile, 'utf-8')
  } catch {
    log = (proc.stdout || '') + (proc.stderr || '')
  }
  const start = log.indexOf('\n!')
  const excerpt = start !== -1 ? log.slice(start + 1) : log.slice(-1500)
  return excerpt.slice(0, 1500).trimEnd()
}

/**
 * Compile a TikZ fence to SVG via latex + dvisvgm.
 * Returns { svg } on success or { error } on failure.
 */
function compileTikz(source) {
  const preamble = readPreamble()
  const hash = crypto
    .createHash('sha256')
    .update(preamble)
    .update('\0')
    .update(source)
    .digest('hex')
    .slice(0, 16)

  const cached = path.join(CACHE_DIR, `${hash}.svg`)
  if (fs.existsSync(cached)) {
    return { svg: fs.readFileSync(cached, 'utf-8') }
  }

  // Allow fences with either a bare picture body or a full tikzpicture env.
  const body = /\\begin\{tikzpicture\}/.test(source)
    ? source
    : `\\begin{tikzpicture}\n${source}\n\\end{tikzpicture}`

  const doc = [
    '\\documentclass[tikz]{standalone}',
    preamble,
    '\\begin{document}',
    body,
    '\\end{document}',
    '',
  ].join('\n')

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `tikz-${hash}-`))
  try {
    fs.writeFileSync(path.join(tmp, 'diagram.tex'), doc)

    const latex = spawnSync(
      'latex',
      ['-interaction=nonstopmode', '-halt-on-error', '-no-shell-escape', 'diagram.tex'],
      { cwd: tmp, encoding: 'utf-8', timeout: 60_000 },
    )
    if (latex.status !== 0) {
      return { error: extractLatexError(path.join(tmp, 'diagram.log'), latex) }
    }

    // --currentcolor maps black to currentColor so diagrams follow the
    // page text colour (i.e. dark mode works for free).
    const dvisvgm = spawnSync(
      'dvisvgm',
      ['--no-fonts', '--currentcolor', '--exact-bbox', '-o', 'diagram.svg', 'diagram.dvi'],
      { cwd: tmp, encoding: 'utf-8', timeout: 60_000 },
    )
    if (dvisvgm.status !== 0) {
      return { error: `dvisvgm failed:\n${dvisvgm.stderr}` }
    }

    let svg = fs.readFileSync(path.join(tmp, 'diagram.svg'), 'utf-8')
    svg = svg
      .replace(/<\?xml[\s\S]*?\?>\s*/, '')
      .replace(/<!--[\s\S]*?-->\s*/g, '')

    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cached, svg)
    return { svg }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}

/** markdown-it plugin: render ```tikz fences as inline SVG. */
export function tikzPlugin(md) {
  const defaultFence = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() !== 'tikz') {
      return defaultFence(tokens, idx, options, env, self)
    }

    const result = compileTikz(token.content)

    if (result.error) {
      // Fail the production build rather than deploying a broken diagram;
      // in dev, show the LaTeX error in place of the figure.
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`TikZ compilation failed in ${env.path}:\n${result.error}`)
      }
      return (
        `<div class="tikz-error"><p class="tikz-error-title">TikZ compilation failed</p>` +
        `<pre>${md.utils.escapeHtml(result.error)}</pre></div>\n`
      )
    }

    return `<figure class="tikz">${result.svg}</figure>\n`
  }
}
