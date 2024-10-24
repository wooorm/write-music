/* eslint-env browser */

/// <reference lib="dom" />

/**
 * @import {Nodes, Parents} from 'nlcst'
 */

import {ParseEnglish} from 'parse-english'
import ReactDom from 'react-dom/client'
import React from 'react'
import {visit} from 'unist-util-visit'

const $main = /** @type {HTMLElement} */ (document.querySelector('main'))
const $template = /** @type {HTMLTemplateElement} */ (
  document.querySelector('template')
)
const hues = createHues()
const parser = new ParseEnglish()

const root = ReactDom.createRoot($main)

root.render(React.createElement(Playground))

function Playground() {
  const [text, setText] = React.useState($template.innerHTML)
  const tree = parser.parse(text)

  return (
    <div>
      <section className="highlight">
        <h1>
          <code>write-music</code>
        </h1>
      </section>
      <div className="editor">
        <div className="draw">
          {all(tree)}
          {/* Trailing whitespace in a `textarea` is shown,
          but not in a `div` with `white-space: pre-wrap`;
          add a `br` to make the last newline explicit. */}
          {/\n[ \t]*$/.test(text) ? <br /> : undefined}
        </div>
        <textarea
          className="write"
          onChange={(event) => setText(event.target.value)}
          rows={text.split('\n').length + 1}
          spellCheck="false"
          value={text}
        />
      </div>
      <section className="highlight">
        <p>
          Based on a tip by{' '}
          <a href="https://www.garyprovost.com">Gary Provost</a> (“Vary sentence
          length”), and a{' '}
          <a href="https://www.helpscout.net/blog/damn-hard-writing/">
            visualisation by Gregory Ciotti
          </a>
          .
        </p>
        <p>P.S. You can edit the text above.</p>
      </section>
      <section className="credits">
        <p>
          <a href="https://github.com/wooorm/write-music">Fork this website</a>{' '}
          •{' '}
          <a href="https://github.com/wooorm/write-music/blob/main/license">
            MIT
          </a>{' '}
          • <a href="https://github.com/wooorm">@wooorm</a>
        </p>
      </section>
    </div>
  )
}

/**
 * @param {Parents} parent
 * @returns {Array<JSX.Element | string>}
 */
function all(parent) {
  /** @type {Array<JSX.Element | string>} */
  const results = []

  for (const child of parent.children) {
    const result = one(child)
    if (Array.isArray(result)) {
      results.push(...result)
    } else {
      results.push(result)
    }
  }

  return results
}

/**
 * @param {Nodes} node
 * @returns {Array<JSX.Element | string> | JSX.Element | string}
 */
function one(node) {
  const result = 'value' in node ? node.value : all(node)

  if (node.type === 'SentenceNode') {
    let words = 0

    visit(node, function (node) {
      if (node.type === 'WordNode') words++
    })

    const hue = words < hues.length ? hues[words] : hues[hues.length - 1]
    const backgroundColor = 'hsl(' + hue + 'deg 93% 70% / 50%)'

    return <span style={{backgroundColor}}>{result}</span>
  }

  return result
}

function createHues() {
  /* eslint-disable no-multi-assign */
  /** @type {Array<number>} */
  const colors = []
  colors[0] = colors[1] = colors[2] = 60
  colors[3] = colors[4] = 300
  colors[5] = colors[6] = 0
  colors[7] = colors[8] = colors[9] = colors[10] = colors[11] = colors[12] = 120
  /* eslint-enable no-multi-assign */
  colors.push(180)
  return colors
}
