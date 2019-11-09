var doc = require('global/document')
var win = require('global/window')
var createElement = require('virtual-dom/create-element')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var h = require('virtual-dom/h')
var unified = require('unified')
var english = require('retext-english')
var visit = require('unist-util-visit')
var debounce = require('debounce')

var processor = unified().use(english)
var hue = hues()
var main = doc.querySelectorAll('main')[0]
var tree = render(doc.querySelectorAll('template')[0].innerHTML)
var dom = main.appendChild(createElement(tree))

function onchange(ev) {
  var next = render(ev.target.value)
  dom = patch(dom, diff(tree, next))
  tree = next
}

function resize() {
  dom.lastChild.rows = rows(dom.firstChild)
}

function render(text) {
  var tree = processor.runSync(processor.parse(text))
  var change = debounce(onchange, 4)
  var key = 0

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
    var children = node.children
    var length = children.length
    var index = -1
    var results = []

    while (++index < length) {
      results = results.concat(one(children[index]))
    }

    return results
  }

  function one(node) {
    var result = 'value' in node ? node.value : all(node)
    var styles = style(node)

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
    var tail = nodes[nodes.length - 1]

    if (typeof tail === 'string' && tail.charAt(tail.length - 1) === '\n') {
      nodes.push(h('br', {key: 'break'}))
    }

    return nodes
  }
}

function style(node) {
  var result = {}

  if (node.type === 'SentenceNode') {
    result.backgroundColor = color(count(node))
    return result
  }
}

function count(node) {
  var value = 0

  visit(node, 'WordNode', add)

  return value

  function add() {
    value++
  }
}

function color(count) {
  var val = count < hue.length ? hue[count] : hue[hue.length - 1]
  return 'hsl(' + [val, '93%', '70%', 0.5].join(', ') + ')'
}

function hues() {
  /* eslint-disable no-multi-assign */
  var colors = []
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
        parseInt(win.getComputedStyle(node).lineHeight, 10)
    ) + 1
  )
}
