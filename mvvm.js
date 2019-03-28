function Vue(data, el, exp) {
  this.$option = data || {};
  this.data = this.$option;
  Object.keys(this.data).forEach((key) => {
    this.proxy(key);
  });
  observe(data);
  el.innerHTML = this.data[exp]; // 初始化模板数据的值
  new Watcher(this, exp, function (value) {
    el.innerHTML = value;
  });
  return this;
}

Vue.prototype = {
  proxy: function(key) {
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get: function() {
        return this.data[key];
      },
      set: function(value) {
        this.data[key] = value;
      }
    })
  }
}

var ele = document.querySelector('#name');
  var vue = new Vue({
    name: 'hello world'
  }, ele, 'name');
  setInterval(function () {
    vue.name = 'chuchur ' + new Date() * 1
  }, 1000);