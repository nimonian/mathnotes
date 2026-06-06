import { defineConfig } from 'vitepress'
import container from 'markdown-it-container'
import { tikzPlugin } from './tikz.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BOOKS_DIR = fileURLToPath(new URL('../books', import.meta.url))

// Math environments available as custom containers, e.g.
//   ::: theorem Pythagoras' Theorem
//   ...
//   :::
// renders a block headed "Theorem (Pythagoras' Theorem)".
// The title is optional and may contain inline math.
const MATH_ENVS = [
  { name: 'definition', label: 'Definition' },
  { name: 'lemma', label: 'Lemma' },
  { name: 'proposition', label: 'Proposition' },
  { name: 'theorem', label: 'Theorem' },
  { name: 'corollary', label: 'Corollary' },
]

function mathEnvPlugin(md) {
  for (const { name, label } of MATH_ENVS) {
    md.use(container, name, {
      render(tokens, idx) {
        const token = tokens[idx]
        if (token.nesting === 1) {
          const title = token.info.trim().slice(name.length).trim()
          const heading = title
            ? `${label} <span class="math-env-name">(${md.renderInline(title)})</span>`
            : label
          return `<div class="math-env math-env-${name}"><p class="math-env-title">${heading}</p>\n`
        }
        return '</div>\n'
      },
    })
  }
}

/**
 * Pull a page title from frontmatter `title:` or the first `# ` heading,
 * falling back to a prettified filename.
 */
function pageTitle(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8')

  const fm = src.match(/^---\s*\n([\s\S]*?)\n---/)
  if (fm) {
    const title = fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (title) return title[1]
  }

  const h1 = src.match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()

  return path
    .basename(filePath, '.md')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Scan books/<slug>/ and build one sidebar per book:
 * the book's index.md first, then its chapters in filename order.
 */
function buildSidebars() {
  if (!fs.existsSync(BOOKS_DIR)) return {}

  const sidebars = {}

  for (const slug of fs.readdirSync(BOOKS_DIR).sort()) {
    const bookDir = path.join(BOOKS_DIR, slug)
    if (!fs.statSync(bookDir).isDirectory()) continue

    const indexFile = path.join(bookDir, 'index.md')
    const bookTitle = fs.existsSync(indexFile) ? pageTitle(indexFile) : slug

    const chapters = fs
      .readdirSync(bookDir)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort()
      .map(f => ({
        text: pageTitle(path.join(bookDir, f)),
        link: `/books/${slug}/${f.replace(/\.md$/, '')}`,
      }))

    sidebars[`/books/${slug}/`] = [
      {
        text: bookTitle,
        items: [
          { text: 'Overview', link: `/books/${slug}/` },
          ...chapters,
        ],
      },
    ]
  }

  return sidebars
}

export default defineConfig({
  // Site is served from https://nimonian.github.io/mathnotes/
  base: '/mathnotes/',

  title: 'Math Notes',
  description: 'Notes and exercise solutions for math textbooks',

  markdown: {
    math: true,
    config(md) {
      mathEnvPlugin(md)
      tikzPlugin(md)
    },
  },

  themeConfig: {
    nav: [
      { text: 'Books', link: '/' },
    ],

    sidebar: buildSidebars(),

    // Show h2 (Notes / Exercises) and h3 (each exercise) in the
    // on-page outline on the right.
    outline: { level: [2, 3], label: 'On this page' },

    search: {
      provider: 'local',
    },
  },
})
