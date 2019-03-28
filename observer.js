function observe(data) {
  if (!data || typeof data !== 'object') {
    return;
  }
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let value = data[key];
      console.log(key, value);
      defineReactive(data, key, value);
    }
  }
  function defineReactive(data, key, value) {
    let dep = new Dep();
    observe(value); // 遍历子属性
    Object.defineProperty(data, key, {
      configurable: false, // 属性描述符不能再改变
      enumerable: true, // 可枚举
      get: function() {
        console.log(Dep, dep);
        Dep.target && dep.depend();
        return value;
      },
      set: function(newValue) {
        if(value === newValue) return;
        // console.log(`监听到值变化 ${value} ===> ${newValue}`);
        value = newValue;
        dep.notify();
      }
    })
  }
}


function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },
  notify: function() {
    console.log('notify', this.subs);
    this.subs.forEach(element => {
      element.update();
    });
  },
  depend: function() {
    // 由于需要在闭包内添加watcher，所以可以在Dep定义一个全局target属性，暂存watcher, 添加完移除
    Dep.target.addDep(this);
  }
}

let data = {name: '1'};
observe(data);
data.name = 2;

Dep.target = null;