# 实现双向绑定MVVM

### 双向绑定三种方法
1. 发布者 - 订阅者
2. 脏值检查 angular.js
3. 数据劫持

**发布者 - 订阅者** [参考](http://www.html-js.com/article/Study-of-twoway-data-binding-JavaScript-talk-about-JavaScript-every-day)

**脏值检查**
通过对比数据是否有变更来决定是否更新视图，最简单的方式就是通过setInterval定时轮询来检测数据变动，angular只会在指定的事件触发时才会执行脏值检测，大致如下：
- DOM事件，譬如用户输入文本，点击按钮等。( ng-click )
- XHR响应事件 ( $http )
- 浏览器Location变更事件 ( $location )
- Timer事件( $timeout , $interval )
- 执行 $digest() 或 $apply()

**数据劫持**
vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过```Object.defineProperty()```来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。


## 思路整理

1. 实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
2. 实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
3. 实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图
4. mvvm入口函数，整合以上三者

![屏幕快照 2019-03-25 下午3.30.54.png](https://github.com/DMQ/mvvm/raw/master/img/2.png)

### Observer实现

```
<!-- 监听数据变化 -->
const data = {name: '小明'};

observe(data);
data.name = '小花' // 监听到值改变 '小明' ===> ‘小花’


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
    observe(value); // 遍历子属性
    Object.defineProperty(data, key, {
      configurable: false, // 属性描述符不能再改变
      enumerable: true, // 可枚举
      get: function() {
        return value;
      },
      set: function(newValue) {
        console.log(`监听到值变化 ${value} ===> ${newValue}`);
        value = newValue;
      }
    })
  }
}

let data = {name: '1'};
observe(data);
data.name = 2;
```
这样我们已经监听到了每个属性的变化了，下一步就是实现通知订阅者的功能，这里我们做一个消息订阅器，这个订阅器中维护一个数组用于存放当前所有订阅者，然后就是在劫持set时触发notify用于通知订阅者去更新

### Watcher实现

Watcher订阅者作为Observer和Compile之间通信的桥梁，主要做的事情是: 
1. 在自身实例化时往属性订阅器(dep)里面添加自己 
2. 自身必须有一个update()方法 
3. 待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。

### Compile实现

compile主要做的事情是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图，如图所示：
![](https://github.com/DMQ/mvvm/raw/master/img/3.png)

