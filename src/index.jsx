/// <reference lib="dom" />
/* eslint-env browser */

/**
 * @typedef {import('nlcst').Content} NlcstContent
 * @typedef {import('nlcst').Parent} NlcstParent
 * @typedef {import('nlcst').Root} NlcstRoot
 */

/**
 * @typedef {NlcstRoot | NlcstContent} NlcstNodes
 * @typedef {Extract<NlcstNodes, NlcstParent>} NlcstParents
 */

import React from 'react'
// eslint-disable-next-line n/file-extension-in-import
import ReactDom from 'react-dom/client'
import {ParseEnglish} from 'parse-english'
import {visit} from 'unist-util-visit'

const main = document.querySelectorAll('main')[0]
const parser = new ParseEnglish()
const hues = createHues()

const root = ReactDom.createRoot(main)
const sample = document.querySelectorAll('template')[0].innerHTML

root.render(React.createElement(Playground))

function Playground() {
  const [text, setText] = React.useState(sample)
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
          {one(tree)}
          {/* Trailing whitespace in a `textarea` is shown, but not in a `div`
          with `white-space: pre-wrap`.
          Add a `br` to make the last newline explicit. */}
          {/\n[ \t]*$/.test(text) ? <br /> : undefined}
        </div>
        <textarea
          spellCheck="true"
          className="write"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={text.split('\n').length + 1}
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
          <a href="https://github.com/wooorm/write-music/blob/src/license">
            MIT
          </a>{' '}
          • <a href="https://github.com/wooorm">@wooorm</a>
        </p>
      </section>
    </div>
  )
}

/**
 * @param {NlcstParents} node
 * @returns {Array<JSX.Element | string>}
 */
function all(node) {
  /** @type {Array<JSX.Element | string>} */
  const results = []
  let index = -1

  while (++index < node.children.length) {
    const result = one(node.children[index])

    if (Array.isArray(result)) {
      results.push(...result)
    } else {
      results.push(result)
    }
  }

  return results
}

/**
 * @param {NlcstNodes} node
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

    return (
      <span
        style={{
          backgroundColor: 'hsl(' + [hue, '93%', '70%', 0.5].join(', ') + ')'
        }}
      >
        {result}
      </span>
    )
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
