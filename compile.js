

function Compile(el, vm) {
  this.$vm = this.vm;
  this.$el = this.isElementNode(el) ? el: document.querySelector(el);
  if(this.$el) {
    this.$fragment = node2Fragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }

}

Compile.prototype = {
  init: function() {
    this.compileElement(this.$fragment);
  },
  node2Fragment: function(el) {
    let fragment = document.createDocumentFragment, child;
    while(child = el.firstChild) {
      fragment.appendChild(child);
    }
    return fragment;
  },
  compileElement: function(el) {
    let childNodes = el.childNodes;
    var reg = /\{\{(.*)\}\}/;

    [].slice.call(childNodes).forEach((node) => {
      var text = node.textContent;
      if(this.isElementNode(node)) {
        this.compile(node);
      } else if(this.isTextNode(node)) {
        this.compileText(node, RegExp.$1);
      }

      if(node.childNodes && node.childNodes.length) {
        this.compileElement(node);
      }
    });
  },
  compile: function(node) {
    let nodeAttrs = node.attributes;
    [].slice.call(nodeAttrs).forEach((attr) => {

    })
  },
  compileText: function(node, exp) {
      compileUtil.text(node, this.$vm, exp);
  },

  isDirective: function(attr) {
      return attr.indexOf('v-') == 0;
  },

  isEventDirective: function(dir) {
      return dir.indexOf('on') === 0;
  },

  isElementNode: function(node) {
      return node.nodeType == 1;
  },

  isTextNode: function(node) {
      return node.nodeType == 3;
  }
}

var compileUtil = {
  text: function(node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },

  html: function(node, vm, exp) {
      this.bind(node, vm, exp, 'html');
  },

  model: function(node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    var me = this,
        val = this._getVMVal(vm, exp);
    node.addEventListener('input', function(e) {
        var newValue = e.target.value;
        if (val === newValue) {
            return;
        }

        me._setVMVal(vm, exp, newValue);
        val = newValue;
    });
  },

  class: function(node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },

  bind: function(node, vm, exp, dir) {
    var updaterFn = updater[dir + 'Updater'];

    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    new Watcher(vm, exp, function(value, oldValue) {
        updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件处理
  eventHandler: function(node, vm, exp, dir) {
    var eventType = dir.split(':')[1],
        fn = vm.$options.methods && vm.$options.methods[exp];

    if (eventType && fn) {
        node.addEventListener(eventType, fn.bind(vm), false);
    }
  },

  _getVMVal: function(vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function(k) {
        val = val[k];
    });
    return val;
  },

  _setVMVal: function(vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function(k, i) {
        // 非最后一个key，更新val的值
        if (i < exp.length - 1) {
            val = val[k];
        } else {
            val[k] = value;
        }
    });
  }

}