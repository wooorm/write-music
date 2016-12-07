var doc = require('global/document');
var react = require('react');
var dom = require('react-dom');
var unified = require('unified');
var english = require('retext-english');
var visit = require('unist-util-visit');

var h = react.createElement;
var processor = unified().use(english);
var hue = hues();

dom.render(
  h(react.createClass({
    getInitialState: getInitialState,
    onChange: onChange,
    onScroll: onScroll,
    render: render
  })),
  doc.getElementById('root')
);

function getInitialState() {
  return {text: doc.getElementsByTagName('template')[0].innerHTML};
}

function onChange(ev) {
  this.setState({text: ev.target.value});
}

function onScroll(ev) {
  this.refs.draw.scrollTop = ev.target.scrollTop;
}

function render() {
  var text = this.state.text;
  var tree = processor.run(processor.parse(text));
  var key = 0;

  return h('div', {className: 'editor'}, [
    h('div', {key: 'draw', className: 'draw', ref: 'draw'}, pad(all(tree))),
    h('textarea', {key: 'area', value: text, onChange: this.onChange, onScroll: this.onScroll})
  ]);

  function all(node) {
    var children = node.children;
    var length = children.length;
    var index = -1;
    var results = [];

    while (++index < length) {
      results = results.concat(one(children[index]));
    }

    return results;
  }

  function one(node) {
    var result = 'value' in node ? node.value : all(node);
    var styles = style(node);

    if (styles) {
      key++;
      result = h('span', {key: 's-' + key, style: styles}, result);
    }

    return result;
  }

  /* Trailing white-space in a `textarea` is shown, but not in a `div`
   * with `white-space: pre-wrap`. Add a `br` to make the last newline
   * explicit. */
  function pad(nodes) {
    var tail = nodes[nodes.length - 1];

    if (typeof tail === 'string' && tail.charAt(tail.length - 1) === '\n') {
      nodes.push(h('br', {key: 'break'}));
    }

    return nodes;
  }
}

function style(node) {
  var result = {};

  if (node.type === 'SentenceNode') {
    result.backgroundColor = color(count(node));
    return result;
  }
}

function count(node) {
  var value = 0;

  visit(node, 'WordNode', add);

  return value;

  function add() {
    value++;
  }
}

function color(count) {
  var val = count < hue.length ? hue[count] : hue[hue.length - 1];
  return 'hsl(' + [val, '93%', '85%'].join(', ') + ')';
}

function hues() {
  var colors = [];
  colors[0] = colors[1] = colors[2] = 60;
  colors[3] = colors[4] = 300;
  colors[5] = colors[6] = 0;
  colors[7] = colors[8] = colors[9] = colors[10] = colors[11] = colors[12] = 120;
  colors.push(180);
  return colors;
}
