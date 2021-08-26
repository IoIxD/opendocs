(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.pell = {})));
}(this, (function (exports) { 'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
var formatBlock = 'formatBlock';
var addEventListener = function addEventListener(parent, type, listener) {
  return parent.addEventListener(type, listener);
};
var appendChild = function appendChild(parent, child) {
  return parent.appendChild(child);
};
var createElement = function createElement(tag) {
  return document.createElement(tag);
};
var queryCommandState = function queryCommandState(command) {
  return document.queryCommandState(command);
};
var queryCommandValue = function queryCommandValue(command) {
  return document.queryCommandValue(command);
};
var showSubMenu = function showSubMenu(id) {
  hideSubMenus();
  var relevant = document.querySelectorAll("*[parent='"+id+"']");
  relevant.forEach(function (id) {
    id.style.display = 'block';
  });
}
var hideSubMenus = function hideSubMenus() {
  var relevant = document.querySelectorAll(".pell-subbutton");
  relevant.forEach(function (id) {
    id.style.display = 'none';
  });
}

var exec = function exec(command) {
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  return document.execCommand(command, false, value);
};

var defaultActions = {
  bold: {
    icon: '<b>B</b>',
    title: 'Bold',
    state: () => queryCommandState('bold'),
    result: () => exec('bold')
  },
  italic: {
    icon: '<i>I</i>',
    title: 'Italic',
    state: () => queryCommandState('italic'),
    result: () => exec('italic')
  },
  underline: {
    icon: '<u>U</u>',
    title: 'Underline',
    state: () => queryCommandState('underline'),
    result: () => exec('underline')
  },
  strikethrough: {
    icon: '<strike>S</strike>',
    title: 'Strike-through',
    state: () => queryCommandState('strikeThrough'),
    result: () => exec('strikeThrough')
  },
  headings: {
    icon: '<b>H</b><sup>_</sup>',
    title: 'Headings',
    parent: true,
    result: function result() {
      return showSubMenu('headings');
    }
  },
  alignments: {
    icon: "<img src='../resources/font/align_left.svg'>",
    title: 'Text Alignment',
    parent: true,
    result: function result() {
      return showSubMenu('alignments');
    }
  },
  olist: {
    icon: '&#35;',
    title: 'Ordered List',
    result: () => exec('insertOrderedList')
  },
  ulist: {
    icon: '&#8226;',
    title: 'Unordered List',
    result: () => exec('insertUnorderedList')
  },
  line: {
    icon: '&#8213;',
    title: 'Horizontal Line',
    result: () => exec('insertHorizontalRule')
  },
  link: {
    icon: '&#128279;',
    title: 'Link',
    result: () => {
      const url = window.prompt('Enter the link URL')
      if (url) exec('createLink', url)
    }
  },
  image: {
    icon: '&#128247;',
    title: 'Image',
    result: () => {
      const url = window.prompt('Enter the image URL')
      if (url) exec('insertImage', url)
    }
  },
  heading1: {
    icon: '<b>H</b><sup>1</sup>',
    title: 'Heading 1',
    parent: 'headings',
    state: () => queryCommandState('h1'),
    result: () => exec(formatBlock, '<h1>')
  },
  heading2: {
    icon: '<b>H</b><sup>2</sup>',
    title: 'Heading 2',
    parent: 'headings',
    state: () => queryCommandState('h2'),
    result: () => exec(formatBlock, '<h2>')
  },
  heading3: {
    icon: '<b>H</b><sup>3</sup>',
    title: 'Heading 3',
    parent: 'headings',
    state: () => queryCommandState('h3'),
    result: () => exec(formatBlock, '<h3>')
  },
  heading4: {
    icon: '<b>H</b><sup>4</sup>',
    title: 'Heading 4',
    parent: 'headings',
    state: () => queryCommandState('h4'),
    result: () => exec(formatBlock, '<h4>')
  },
  heading5: {
    icon: '<b>H</b><sup>5</sup>',
    title: 'Heading 5',
    parent: 'headings',
    state: () => queryCommandState('h5'),
    result: () => exec(formatBlock, '<h5>')
  },
  alignleft: {
    icon: "<img src='../resources/font/align_left.svg'>",
    title: 'Align Left',
    parent: 'alignments',
    result: function() {
      exec(formatBlock, "<p>", "align=left");
      var el = window.getSelection().focusNode.parentNode;
      el.style.textAlign = 'left';
    }
  },
  aligncenter: {
    icon: "<img src='../resources/font/align_center.svg'>",
    title: 'Align Center',
    parent: 'alignments',
    result: function() {
      exec(formatBlock, "<p>", "align=left");
      var el = window.getSelection().focusNode.parentNode;
      el.style.textAlign = 'center';
    }
  },
  alignright: {
    icon: "<img style='transform: scale(-1, 1)' src='../resources/font/align_left.svg'>",
    title: 'Align Right',
    parent: 'alignments',
    result: function() {
      exec(formatBlock, "<p>", "align=left");
      var el = window.getSelection().focusNode.parentNode;
      el.style.textAlign = 'right';
    }
  }
};

var defaultClasses = {
  actionbar: 'pell-actionbar',
  button: 'pell-button',
  content: 'pell-content',
  selected: 'pell-button-selected'
};

var init = function init(settings) {
  var actions = settings.actions ? settings.actions.map(function (action) {
    if (typeof action === 'string') return defaultActions[action];else if (defaultActions[action.name]) return _extends({}, defaultActions[action.name], action);
    return action;
  }) : Object.keys(defaultActions).map(function (action) {
    return defaultActions[action];
  });

  var classes = _extends({}, defaultClasses, settings.classes);

  var defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'div';

  var actionbar = createElement('div');
  actionbar.className = classes.actionbar;
  appendChild(settings.element, actionbar);

  var content = settings.element.content = createElement('div');
  content.contentEditable = true;
  content.className = classes.content;
  content.oninput = function (_ref) {
    var firstChild = _ref.target.firstChild;

    if (firstChild && firstChild.nodeType === 3) exec(formatBlock, '<' + defaultParagraphSeparator + '>');else if (content.innerHTML === '<br>') content.innerHTML = '';
    settings.onChange(content.innerHTML);
  };
  content.onkeydown = function (event) {
    if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
      setTimeout(function () {
        return exec(formatBlock, '<' + defaultParagraphSeparator + '>');
      }, 0);
    }
  };
  appendChild(settings.element, content);

  actions.forEach(function (action) {
    var button = createElement('button');
    button.className = classes.button;
    button.innerHTML = action.icon;
    button.title = action.title;
    button.setAttribute('type', 'button');
    if(action.parent) {
      if(action.parent != true) {
        button.style.display = 'none';
        button.className += " pell-subbutton";
        button.setAttribute('parent', action.parent);
        button.onclick = function () {
          return action.result() && content.focus();
        };
      } else {
        button.onmouseover = function () {
          return action.result() && content.focus();
        };
      }
    } else {
      button.onclick = function () {
        return action.result() && content.focus();
      };
    }

    if (action.state) {
      var handler = function handler() {
        return button.classList[action.state() ? 'add' : 'remove'](classes.selected);
      };
      addEventListener(content, 'keyup', handler);
      addEventListener(content, 'mouseup', handler);
      addEventListener(button, 'click', handler);
    }

    appendChild(actionbar, button);
  });

  if (settings.styleWithCSS) exec('styleWithCSS');
  exec(defaultParagraphSeparatorString, defaultParagraphSeparator);

  return settings.element;
};

var pell = { exec: exec, init: init };

exports.exec = exec;
exports.init = init;
exports['default'] = pell;

Object.defineProperty(exports, '__esModule', { value: true });

})));
