import doc from 'global/document.js'
import win from 'global/window.js'
import createElement from 'virtual-dom/create-element.js'
import diff from 'virtual-dom/diff.js'
import patch from 'virtual-dom/patch.js'
import h from 'virtual-dom/h.js'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import {visit} from 'unist-util-visit'
import debounce from 'debounce'

const processor = unified().use(retextEnglish)
const hue = hues()
const main = doc.querySelectorAll('main')[0]
let tree = render(doc.querySelectorAll('template')[0].innerHTML)
let dom = main.appendChild(createElement(tree))

function onchange(ev) {
  const next = render(ev.target.value)
  dom = patch(dom, diff(tree, next))
  tree = next
}

function resize() {
  dom.lastChild.rows = rows(dom.firstChild)
}

function render(text) {
  const tree = processor.runSync(processor.parse(text))
  const change = debounce(onchange, 4)
  let key = 0

  setTimeout(resize, 4)

  return h('div', [
    h('section.highlight', [h('h1', {key: 'title'}, 'write music')]),
    h('div', {key: 'editor', className: 'editor'}, [
      h('div', {key: 'draw', className: 'draw'}, pad(all(tree))),
      h('textarea', {
        key: 'area',
        value: text,
        oninput: change,
        onpaste: change,
        onkeyup: change,
        onmouseup: change
      })
    ]),
    h('section.highlight', [
      h('p', {key: 'byline'}, [
        'Based on a tip by ',
        h('a', {href: 'https://www.garyprovost.com'}, 'Gary Provost'),
        ' (“Vary sentence length”), and a ',
        h(
          'a',
          {href: 'https://www.helpscout.net/blog/damn-hard-writing/'},
          'visualisation by Gregory Ciotti'
        ),
        '.'
      ]),
      h('p', {key: 'ps'}, ['P.S. You can edit the text above.'])
    ]),
    h('section.credits', {key: 'credits'}, [
      h('p', [
        h(
          'a',
          {href: 'https://github.com/wooorm/write-music'},
          'Fork this website'
        ),
        ' • ',
        h(
          'a',
          {href: 'https://github.com/wooorm/write-music/blob/src/license'},
          'MIT'
        ),
        ' • ',
        h('a', {href: 'https://wooorm.com'}, '@wooorm')
      ])
    ])
  ])

  function all(node) {
    const children = node.children
    const length = children.length
    let index = -1
    let results = []

    while (++index < length) {
      results = results.concat(one(children[index]))
    }

    return results
  }

  function one(node) {
    let result = 'value' in node ? node.value : all(node)
    const styles = style(node)

    if (styles) {
      key++
      result = h('span', {key: 's-' + key, style: styles}, result)
    }

    return result
  }

  // Trailing white-space in a `textarea` is shown, but not in a `div` with
  // `white-space: pre-wrap`.
  // Add a `br` to make the last newline explicit.
  function pad(nodes) {
    const tail = nodes[nodes.length - 1]

    if (typeof tail === 'string' && tail.charAt(tail.length - 1) === '\n') {
      nodes.push(h('br', {key: 'break'}))
    }

    return nodes
  }
}

function style(node) {
  const result = {}

  if (node.type === 'SentenceNode') {
    result.backgroundColor = color(count(node))
    return result
  }
}

function count(node) {
  let value = 0

  visit(node, 'WordNode', add)

  return value

  function add() {
    value++
  }
}

function color(count) {
  const value = count < hue.length ? hue[count] : hue[hue.length - 1]
  return 'hsl(' + [value, '93%', '70%', 0.5].join(', ') + ')'
}

function hues() {
  /* eslint-disable no-multi-assign */
  const colors = []
  colors[0] = colors[1] = colors[2] = 60
  colors[3] = colors[4] = 300
  colors[5] = colors[6] = 0
  colors[7] = colors[8] = colors[9] = colors[10] = colors[11] = colors[12] = 120
  /* eslint-enable no-multi-assign */
  colors.push(180)
  return colors
}

function rows(node) {
  if (!node) {
    return
  }

  return (
    Math.ceil(
      node.getBoundingClientRect().height /
        Number.parseInt(win.getComputedStyle(node).lineHeight, 10)
    ) + 1
  )
}
