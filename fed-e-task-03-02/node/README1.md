## 0、准备工作
  + 1、从GitHub上面下载vue的源码（https://github.com/vuejs/vue）
  + 2、了解下Flow,Flow 是 facebook 出品的 JavaScript 静态类型检查工具。Vue.js 的源码利用了 Flow 做了静态类型检查
  + 3、vue.js 源码目录设计,vue.js的源码都在 src 目录下(\vue-dev\src)
    src
    ├── compiler # 编译相关
    ├── core # 核心代码
    ├── platforms # 不同平台的支持
    ├── server # 服务端渲染
    ├── sfc # .vue 文件解析
    ├── shared # 共享代码
    + core 目录：包含了 Vue.js 的核心代码，包括内置组件、全局 API 封装，Vue 实例化、观察者、虚拟 DOM、工具函数等等。这里的代码可谓是 Vue.js 的灵魂
    + platform目录：Vue.js 是一个跨平台的 MVVM 框架，它可以跑在 web 上，也可以配合 weex 跑在 natvie 客户端上。platform 是 Vue.js 的入口，2 个目录代表 2 个主要入口，分别打包成运行在 web 上和 weex 上的 Vue.js。比如现在比较火热的mpvue框架其实就是在这个目录下面多了一个小程序的运行平台相关内容。
    + ![avatar](../images/mpvue.png)
    + vue2.0的生命周期分为4主要个过程:
      + 4.1 create:创建---实例化Vue(new Vue) 时，会先进行create。
      + 4.2 mount:挂载---根据el, template, render方法等属性，会生成DOM，并添加到对应位置。
      + 4.3 update:更新---当数据发生变化后，更新DOM。
      + 4.4 destory:销毁---销毁时执行

## 1、new Vue()发生了什么
  + 在 vue 的生命周期上第一个就是 new Vue() 创建一个 vue 实例出来，对应到源码在 /vue-dev/srv/core/instance/index.js
  ```js
  import { initMixin } from './init'
  import { stateMixin } from './state'
  import { renderMixin } from './render'
  import { eventsMixin } from './events'
  import { lifecycleMixin } from './lifecycle'
  import { warn } from '../util/index'

  /*Vue的构造函数,options是我们在new Vue({}) 传递进来的一个对象*/
  function Vue (options) {
      /*进行了Vue函数调用的安全监测*/
      /*Vue的构造函数只能通过new Vue()来调用*/
      /*不能通过 Vue()调用, 这样调用 this指向window*/
      if (!(this instanceof Vue)) {
          /*封装了warn函数,  用于报错提示信息等*/
          warn('Vue is a constructor and should be called with the `new` keyword');
      }
      /* 调用原型上的_init方法, 进行初始化  */
      this._init(options);
  }

  initMixin(Vue)
  stateMixin(Vue)
  eventsMixin(Vue)
  lifecycleMixin(Vue)
  renderMixin(Vue)

  export default Vue
  ```
  + 可以通过 index.js 中的代码看到，其实就是一个 function，在 es5 中实现 class 的方式，在 function vue 中还加入了 if 判断，表示 vue 必须通过 new 关键字进行实例化。这里有个疑问就是为什么 vue 中没有使用 es6 的 class 方式进行定义？通过看下面的方法可以得到解答。

  + function vue 下定义了许多 Mixin 这种方法，并且把 vue 类当做参数传递进去，下面来进入 initMixin(Vue) 下，来自 import { initMixin } from './init'，代码如下：
  ```js
    var uid$3 = 0; /* 用于统计 Vue 构造函数被 new 多少次*/
    /* initMixin 主要是对 options 选项的合并和规范*/
    function initMixin (Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            /* 统计 Vue 被 new 了多少次*/
            vm._uid = uid$3++;
            var startTag, endTag;
            /* istanbul ignore if */
            if (config.performance && mark) {
                startTag = "vue-perf-start:" + (vm._uid);
                endTag = "vue-perf-end:" + (vm._uid);
                mark(startTag);
            }
            /*设置了一个标识, 避免被 vm 实例加入响应式系统 */
            vm._isVue = true;
            /*合并选项*/
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options);
            } else {
                /*选项合并的入口代码*/
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }
            /* istanbul ignore else */
            {
                initProxy(vm); /*初始化Proxy, 检测ES6的Proxy函数是否支持等*/
            }
            // expose real self
            vm._self = vm;
            initLifecycle(vm);  /* 初始时生命周期*/
            initEvents(vm); /* 初始化事件*/
            initRender(vm);  /* 渲染页面 */
            callHook(vm, 'beforeCreate');   /*生命周期钩子函数beforeCreate被的调用*/
            initInjections(vm); // resolve injections before data/props
            initState(vm);    /*初始化状态 props data computed watch methods*/
            initProvide(vm); // resolve provide after data/props
            callHook(vm, 'created');   /*生命周期钩子函数created被的调用*/

            /* istanbul ignore if */
            if (config.performance && mark) {
                vm._name = formatComponentName(vm, false);
                mark(endTag);
                measure(("vue " + (vm._name) + " init"), startTag, endTag);
            }
            /*如果配置了el选项, 去挂载*/
            if (vm.$options.el) {
                vm.$mount(vm.$options.el);
            }
        };
    }
  ```
  + 可以看到 initMixin 方法就是往 vue 的原型上挂载了一个 _init 方法，其他的 Mixin 也是同理，都是往 vue 的原型上挂载各种方法，而最开始创建 vue 类时通过 es5 function 的方式创建也是为了后面可以更加灵活操作，可以将方法写入到各个 js 文件，不用一次写在一个文件下面，更加方便代码后期的维护，这个也是选择 es5 创建的原因。
  + 当调用 new Vue 的时候，事实上就调用的 Vue 原型上的 _init 方法
  + _init 函数的流程:
    + 最重要的事情 mergeOptions() 函数, 进行选项的合并和规范化
    + 初始化页面, 初始化事件, 渲染页面, 初始化 data、props、computed、watcher 等等

## 2、mergeOptions 选项合并策略
  + mergeOptions的主要作用:
    + 对 options 进行规范
    + options 的合并, 默认策略和自定义策略
  + 合并策略目的:围绕着组件和子类来进行限制的
    ```js
    const vm= new Vue({
        el:"#app",
        data:{
            test:"这是一个测试"
        }
    })
    ```
  + 当在控制台打印 vm.$options 可以看到多了几个属性
  + ![avatar](../images/vmOptions.jpg)
  + Vue.js 在初始化的时候，有些默认的配置，initGlobalAPI 函数为 Vue.options 进行了一些初始化的默认配置
    ```js
    function initGlobalAPI(Vue) {
        ...
        Vue.options = Object.create(null);
        /*对资源assets的默认初始化*/
        ASSET_TYPES.forEach(function (type) {
            Vue.options[type + 's'] = Object.create(null);
        });

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue;

        extend(Vue.options.components, builtInComponents);
        ...
    }
    ```
  + 在上一节 vm._init 函数中，调用了 mergeOptions 函数，进行选项的合并
    ```js
    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            ...
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options);
            } else {
                /*
                * 在这个调用了mergeOptions函数
                * 获取resolveConstructorOptions(vm.constructor)返回值
                */
                vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm)
            }
            ...
        };
    }
    ```
  + 接下来看 mergeOptions 函数的实现：
    ```js
    /* 用于把 parent, child 进行合并 */
    function mergeOptions(parent, child, vm) {
      /*检测 options 里,组件的名字命名规范*/
        {
            checkComponents(child);
        }
        /* child 也可以是是一个函数*/
        if (typeof child === 'function') {
            child = child.options;
        }
        /*规范化 Props */
        normalizeProps(child, vm);
        /*规范化 Inject */
        normalizeInject(child, vm);
        /*规范化 Directives */
        normalizeDirectives(child);

        // Apply extends and mixins on the child options,
        // but only if it is a raw options object that isn't
        // the result of another mergeOptions call.
        // Only merged options has the _base property.
        if (!child._base) {
            if (child.extends) {
                /*递归调用把 extends 合并到 parent 上*/
                parent = mergeOptions(parent, child.extends, vm);
            }
            if (child.mixins) {
                /*递归调用把 mixins 合并到 parent 上*/
                for (var i = 0, l = child.mixins.length; i < l; i++) {
                    parent = mergeOptions(parent, child.mixins[i], vm);
                }
            }
        }
        /*最终合并完成要返回的 $options, vm.$options 对象*/
        var options = {};
        var key;
        for (key in parent) {  /*先判断 parent 上是否存在 key*/
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) { /*判断 parent 以后,在判断 child 是上否有 key */
                mergeField(key);
            }
        }
        /* 合并字段 */
        function mergeField(key) {
            /*根据不同的 */
            var strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }
        /*返回最终合并完成的 options, 会赋值给 Vue.$options */
        return options
    }
    ```
  + 通过分析 mergeOptions 函数，主要做了以下几件事情：
    + 检查组件的命名是否规范
    + 规范化 Props，Inject，Directives
    + Vue 选项的合并
  + mergeOptions 的第三个参数 vm，用于区分是根实例还是子组件。在上面的代码中，传递了 vn 的参数
  + mergeOptions 在另一个函数中也被调用了，在 Vue.extend() 这个函数中，没有传递 vm 参数

  ##### 检查组件的命名是否规范 checkComponents(child)
  ```js
  function checkComponents(options) {
    for (var key in options.components) {
        validateComponentName(key);
    }
  }
  ```
  + 将 child 传递进来，进行遍历，获取到每个 key。将每个 key 作为参数传递给 vaildateComponentName(key)
  ```js
  function validateComponentName(name) {
      if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + unicodeLetters + "]*$")).test(name)) {
          warn(
              'Invalid component name: "' + name + '". Component names ' +
              'should conform to valid custom element name in html5 specification.'
          );
      }
      if (isBuiltInTag(name) || config.isReservedTag(name)) {
          warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + name
          );
      }
  }
  ```
  + isBuiltInTag 函数，不能是 slot，component 等 Vue 的内置组件的名字
  ```js
  var isBuiltInTag = makeMap('slot, component', true)
  ```
  + isReservedTag 函数，组件的名字不能为 html 标签的名字和 svg 标签的名字
  ```js
  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  }
  ```
  + 从 validateComponentName 分析得出组件的命名规范应该满足一下的要求:
    + /^[a-zA-Z][-.0-9_/.test(name) 为 true
    + isBuiltInTag(name) 或者 config.isReservedTag(name) 为 false
  +  #### Vue 选项的合并  
    ```js
    /*最终合并完成要返回的 $options, vm.$options 对象*/
        var options = {};
        var key;
        /*对 parent 进行遍历*/
        for (key in parent) {
            mergeField(key);
        }
        /*对 child 进行遍历*/
        for (key in child) {
            /* hasOwn 多了一层的判断, 如果 child 的 key, 已经在上面 parent 进行了 mergeField */
            /*就不在进行遍历, 避免重复调用*/
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }
        /*对 parent, child 的 key 字段进行和合并,采取了不同的策略*/
        function mergeField(key) {
            var strat = strats[key] || defaultStrat;
            /*把 strat(parent[key], child[key], vm, key) 函数的返回值给对应的 options[key] */
            options[key] = strat(parent[key], child[key], vm, key);
        }
        return options
    }
    ```
  + 上面的代码，最终返回一个 options，先对 parent 进行遍历，在对 child 进行遍历，在遍历 child 时，多了一层限制，对于相同的 key，如果 parent 已经 mergeField，child 就不在进行遍历
  + mergeField 函数：
    + 先去检测 starts[key]，对该 key 是否有自定义的合并策略，如果有就直接使用，像 el, watch, data 等都进行自定义的合并策略
    + 如果没有自定义策略，就使用默认的策略合并
  + 对于 starts[key] 函数，什么是 starts?
  ```js
  /**
  * Option overwriting strategies are functions that handle
  * how to merge a parent option value and a child option
  * value into the final value.
  */
  var strats = config.optionMergeStrategies;
  ```
  + config.optionMergeStrategies 是一个合并选项的策略对象，这个对象下包含很多函数，这些函数就可以认为是合并特定选项的策略 el, data, watch 等进行了合并的限制
  + 在看看 defaultStart 函数的实现， childVal === undefined 直接使用 parentVal
  ```js
  var defaultStrat = function (parentVal, childVal) {
      return childVal === undefined? parentVal : childVal
  };
  ```



## 3、选项 data 的合并策略
  + 在 vue.js 源码中，选项 el, data, watch, props 等都有合并策略
  + 在这一节中，只分析 data 的合并策略
  ```js
    /*对parent, child的key字段进行和合并,采取了不同的策略*/
    function mergeField(key) {
        var strat = strats[key] || defaultStrat;
        /*把 strat(parent[key], child[key], vm, key)函数的返回值给对应的options[key]*/
        options[key] = strat(parent[key], child[key], vm, key);
    }
  ```
  + 在上一节中，start( parent[key], child[key], vm, key ) 函数的返回值，赋值给 options[key]
  + 可以先记住一个结论：
    + 无论是 vm 根实例，还是子组件中选项里的 data，最终都是函数
    + 那么 data 是一个函数，何时被调用：加入到响应式系统或者数据初始化的时候，会被调用
  + 接下来，分析选项 data 的合并过程，下面试 start.data 的自定义策略
  ```js
  var strats = config.optionMergeStrategies;
  strats.data = function ( parentVal, childVal, vm ) {
          /*检测 vm, 区分 vm 根实例,还是子类(组件)*/
          if (!vm) {
              /*处理组件的信息, vm 的子类,选项的 data 就必须是 function */
              if (childVal && typeof childVal !== 'function') {
                  warn( /*发出报错的信息*/
                      'The "data" option should be a function ' +
                      'that returns a per-instance value in component ' +
                      'definitions.',
                      vm
                  );
                  return parentVal
              }
              /*运行到这里:传递 vm, 说明是子类,组件*/
              return mergeDataOrFn(parentVal, childVal)
          }
          /*运行到这里:传递vm, 说明是实例*/
          return mergeDataOrFn(parentVal, childVal, vm)
      };
  ```
  + 在整个 Vue 源码选项合并过程中，区分子类，还是根实例，通过判断参数是否传递了 vm
    + 在子类中，子类 data 不是一个函数，则发出报错的信息，返回父组件的 parentVal，如果是一个函数 直接调用 mergeDataOrFn 函数，进行数据合并，不传入 vm
  + mergeDataOrFn 函数的源码如下：
  ```js
  function mergeDataOrFn( parentVal, childVal,vm) {
      if (!vm) { /*子类*/
          // in a Vue.extend merge, both should be functions
          /* 通过 Vue.extend 的子类,  父子的 data 都应该是一个函数*/
          if (!childVal) {
              return parentVal
          }
          if (!parentVal) {
              return childVal
          }
          /* childVal, parentVal 都没有传递, 运行到此结束 */
          // when parentVal & childVal are both present,
          // we need to return a function that returns the
          // merged result of both functions... no need to
          // check if parentVal is a function here because
          // it has to be a function to pass previous merges.
          /*能够运行到这里, childVal, parentVal 都会有值,才进行合并*/
          return function mergedDataFn() {
              /*将 childVal, parentVal 通过 call 来调用, 把返回值纯对象当做参数传递给 mergeData() 函数*/
              return mergeData(
                  typeof childVal === 'function' ? childVal.call(this, this) : childVal,
                  typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
              )
          }
      } else { /* vm 根实例*/
          return function mergedInstanceDataFn() {
              // instance merge
              var instanceData = typeof childVal === 'function'
                  ? childVal.call(vm, vm)
                  : childVal;
              var defaultData = typeof parentVal === 'function'
                  ? parentVal.call(vm, vm)
                  : parentVal;
              if (instanceData) {
                  return mergeData(instanceData, defaultData)
              } else {
                  return defaultData
              }
          }
      }
  }
  ```
  + 在 mergeDataOrFn 代码中，有这样的一段代码
  ```js
  if (!childVal) {
      return parentVal
  }
  if (!parentVal) {
      return childVal
  }
  ```
    + 如果 childVal 没有值，那么就直接返回 parentVal
    + 如果 childVal 有值，而 parentVal 没有值，就返回 childVal
    + 两者都没有值，下面的代码根本就不会执行。两者都有值的情况下才进行下面的代码
  + 在 childVal，parentVal 都有值的情况下，最终把 mergedDataFn() 函数返回，没有进行合并
  + **无论子组件还是根实例，最终都调用 mergeData 进行终极合并，瞬间产生了两个问题**
    + 1. 为什么会返回一个 mergeData 函数
      + 通过函数返回一个对象，对象属于引用类型，在内存不是同一份，保证了每个组件的数据的独立性，可以避免组件之间的相互影响
    + 2. mergeData 为什么不在初始化的时候就合并好，而是在调用的时候进行合并
      + inject 和 props 这两个选项的初始化是先于 data 选项的，这样就保证了能够使用 props 初始化 data 中的数据
  + 接下来，再看看最终的 mergeData 终极合并的函数
    ```js
    /* 此时的 to, form 是纯对象*/
    function mergeData(to, from) {
        /* form 没有值, 直接返回 to */
        if (!from) {
            return to
        }
        var key, toVal, fromVal;
        /*获取 from 的 key 的集合*/
        var keys = hasSymbol
            ? Reflect.ownKeys(from)
            : Object.keys(from);
        /*对 form 的 keys 进行遍历*/
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            // in case the object is already observed...
            /*响应式对象都将有 __ob__ 属性*/
            if (key === '__ob__') {
                continue
            }
            toVal = to[key];
            fromVal = from[key];
            /* from 对象中的 key 不存在 to 对象中，则使用 set 函数为 to 对象设置 key 及相应的值*/
            if (!hasOwn(to, key)) {
                set(to, key, fromVal);
            /* from 对象中的 key 也在 to 对象中，且这两个属性的值都是纯对象则递归进行深度合并*/
            } else if (toVal !== fromVal && isPlainObject(toVal) &&
                        isPlainObject(fromVal)) {
                mergeData(toVal, fromVal);
            }
        }
        return to
    }
    ```
  + 总结合并过程处理了两种情况：
    + from 对象中的 key 不存在 to 对象中，则使用 set 函数为 to 对象设置对应的 key 及对应的值
    + from 对象中的 key 也在 to 对象中，且这两个属性的值都是处对象则递归进行深度合并





## 4、生命周期钩子函数，资源 assets 选项合并策略
  + **生命周期钩子函数的合并策略**
  + 在 Vue.js 中的生命周期钩子：
    ```js
    var LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed',
        'activated',
        'deactivated',
        'errorCaptured',
        'serverPrefetch'
    ];
    ```
  + 接下来看，每个生命周期的钩子的合并策略
    ```js
    LIFECYCLE_HOOKS.forEach(function (hook) {
      strats[hook] = mergeHook;
    });
    ```
  + 通过 forEach() 函数，为 stars 策略对象扩展对应的 hook，mergeHook 是一个函数，所有生命周期钩子选项策略函数都是：mergeHook 函数
  + mergeHook 函数被调用是在：Vue.js 初始化过程中 mergeOptions 中被调用的，检测到配置了这个生命周期选项的钩子
  + mergeHook 函数实现具体如下：
    ```js
    function mergeHook( parentVal, childVal) {
        /*检测 childVal 是否有值*/
        var res = childVal
            ? parentVal  /*在 childVal 有值的的情况下, 在检测 parentVal 是否有值 */
                ? parentVal.concat(childVal)  /*两者都有值, 直接进行合并*/
                : Array.isArray(childVal)  /* childVal 有值, parentVal 没有值,判断 childVal 是否是数组 */
                    ? childVal    /*是数组,直接返回*/
                    : [childVal]  /*不是数组, 把 childVal 包装成一个数组*/
            : parentVal; /*如果 childVal 没有值,则直接把 parentVal 赋值给 res */
        return res
            ? dedupeHooks(res)
            : res
    }
    ```
  + 第一眼看山去，这个函数挺复杂，实际上是由三组三目运算符组成。最终的目的就是把父子组件中的同名的钩子函数包装成一个数组，在触发该钩子函数时，依次去调用数组里面的钩子函数。
  + 例如生命周期钩子 created()，将会生成如下代码：
    ```js
    let Parent = Vue.extend({
      created: function () {
        console.log('parent')
      }
    })
    let Child = new Parent({
      created: function () {
        console.log('child')
      }
    })
    /*打印*/
    console.log(Child.$options)
    ```
  + 可以看到 created 选项，把父子组件的 created 合并成了一个数组，目的就是在触发 created 时，依次调用
  + 阅读 mergeHook 函数，发现一段有趣的代码：Array.isArray(childVal)，原来生命周期钩子函数还可以这样写：
    ```js
    const vm = new Vue({
        el: "#app",
        created:[
            function () {
                console.log("1")
            },
            function () {
                console.log("2")
            },
            function () {
                console.log("3")
            }
        ],
        ...
    })
    ```
  + **资源 assets 选项自定义策略**
  + 最早接触 Vue 的时候，什么是资源一直很蒙，后来才明白，在 Vue 中的资源是指：component, directive, filter 为什么说这些教资源呢？哈哈，原因很简单，因为让第三方进行配置
  + Vue 中的资源：
    ```js
    var ASSET_TYPES = [
        'component',
        'directive',
        'filter'
    ];
    ASSET_TYPES.forEach(function (type) {
          strats[type + 's'] = mergeAssets;
    });
    ```
  + ASSET_TYPES 数组进行 forEach 编译，在 ASSET_TYPES 数组中的每个 key 后面加上 s，为什么没有直接加 s 呢？
    + ASSET_TYPES 里的资源在 Vue 源码的很多地方都可以用到，例如 component 内置组件等
  + 接下来看看 mergeAssets 的实现，和 mergeHook 的实现原理差不多
    ```js
    function mergeAssets( parentVal, childVal, vm, key ) {
        /*创建 res 对象, 原型指向 parentVal, 如果 parentVal 不存在就是 null */
        var res = Object.create(parentVal || null);
        if (childVal) {
            assertObjectType(key, childVal, vm);
            /*把 childVal 的属性扩展到res上*/
            return extend(res, childVal)
        } else {
            return res
        }
    }
    ```
  + 从上面的代码可以分析出：资源的合并是采用原型链的形式进行关联的，创建 res 对象，把原型指向 parentVal，最终把 childVal 的属性扩展到 res 上。
  + 至此明白了一件事情：
    ```js
    <KeepAlive></KeepAlive>,
    <transition></transition>,
    <transition-group></transition-group>
    ```
  + 我们从来没自定义过该组件，在每个组件中都有可能使用，他们定义在组建的原型链的最顶层，原型链的最顶层是：Vue.options.components，components 是一个对象，里面定义了内置组件
    ```js
    Vue.options = {
      components: {
        KeepAlive,
        Transition,
        TransitionGroup
      },
      directives: Object.create(null),
      directives:{
        model,
        show
      },
      filters: Object.create(null),
      _base: Vue
    }
    ```
  + 通过第三方使用的组件也将会被注册在 Vue.options.components 里面，所有的子组件都可以进行使用
  + **选项 watch 的合并策略**
  + strats.watch 函数是在处理 watch 选项进行策略合并的函数，以下是源码实现：
    ```js
    strats.watch = function ( parentVal, childVal, vm, key) {
            // work around Firefox's Object.prototype.watch...
            /* Firefox 浏览器兼容处理*/
            if (parentVal === nativeWatch) {
                parentVal = undefined;
            }
            if (childVal === nativeWatch) {
                childVal = undefined;
            }
            /* istanbul ignore if */
            /* childVal 不存在,  直接返回一个对象, 原型指向 parentVal */
            if (!childVal) {
                return Object.create(parentVal || null)
            }
            {
                assertObjectType(key, childVal, vm);
            }
            /*此时 childVal 存在, 如果 parentVal 不存在, 直接返回 childVal */
            if (!parentVal) {
                return childVal 
            }
            /*代码运行到此, parentVal, childVal 都存在*/
            var ret = {}; /*定义一个对象,最后合并后,直接返回*/
            extend(ret, parentVal);  /*把 parentVal 的属性,合并到 ret 上 */
            for (var key$1 in childVal) {  /*遍历 childVal */
                var parent = ret[key$1];  /*获取 key 对应的 parentVal 的值*/
                var child = childVal[key$1];/*获取 key 对应的 child 的值*/
                /*如果 parent 不是数组, 包装成一个数组*/
                if (parent && !Array.isArray(parent)) {
                    parent = [parent];
                }
                ret[key$1] = parent
                    ? parent.concat(child) /*进行合并*/
                    /*判断 child 是否数组, 不是数组包装成数组*/
                    : Array.isArray(child) ? child : [child];
            }
            return ret
        };
    ```
  + 首先是做了 Firefox 兼容的处理
  + 判断 childVal，parentVal 都是否存在
    ```js
    /* childVal 不存在,  直接返回一个对象, 原型指向 parentVal */
    if (!childVal) {
        return Object.create(parentVal || null)
    }
    {
        assertObjectType(key, childVal, vm);
    }
    /*此时 childVal 存在, 如果 parentVal 不存在, 直接返回 childVal */
    if (!parentVal) {
        return childVal
    }
    ```
  + 上面代码 childVal，parentVal 有一个不存在，代码运行到此结束
  + 如果 childVal，parentVal 都存在，继续下面的代码运行 watch 的合并
    ```js
    /*代码运行到此, parentVal,childVal 都存在*/
    var ret = {}; /*定义一个对象,最后合并后,直接返回*/
    extend(ret, parentVal);  /*把parentVal的属性,合并到 ret上 */
    for (var key$1 in childVal) {  /*遍历childVal */
        var parent = ret[key$1];  /*获取key对应的parentVal的值*/
        var child = childVal[key$1];/*获取key对应的child的值*/
        /*如果parent,不是数组, 包装成一个数组*/
        if (parent && !Array.isArray(parent)) {
            parent = [parent];
        }
        ret[key$1] = parent
            /*如果parent存在, 此时是一个数组, 与child进行合并*/
            ? parent.concat(child) /*进行合并*/
            /*判断child是否数组, 不是数组包装成数组*/
            : Array.isArray(child) ? child : [child];
    }
    return ret
    ```
  + 最终如果父子选项 watch 监听存在相同的字段，那么他们会被合并到一个数组里面，数据的变化进行统一的遍历，不相同的字段会单独处理


## 5、Vue.js 选项合并和规范化 ———— props directives 规范 &props methods inject computed 合并策略
  + props 规范化
    + 在平时开发中，props 传递属性可以动态传递和静态传递
      ```js
      /*静态检测*/
      props:["message"]
      /*动态检测*/
      props:{
          message:{
              type:String
              default:"Vue"
          }
      }
      ```
    + 初始化过程，在 mergeOptions 函数里面，可以看到对 props 的规范检测，进行统一的规范化处理
    ```js
    normalizeProps(child, vm)
    ```
    + 接下来分析源码实现
    ```js
    /**
    * Ensure all props option syntax are normalized into the
    * Object-based format.
    */
    function normalizeProps(options, vm) {
        var props = options.props;
        /*没有 props 直接返回*/
        if (!props) {
            return
        }
        var res = {};
        var i, val, name;
        if (Array.isArray(props)) {
            i = props.length;
            while (i--) {
                val = props[i];
                if (typeof val === 'string') {
                    name = camelize(val);
                    res[name] = {type: null};
                } else {
                    warn('props must be strings when using array syntax.');
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key];
                name = camelize(key);
                res[name] = isPlainObject(val)
                    ? val
                    : {type: val};
            }
        } else {
            warn(
                "Invalid value for option \"props\": expected an Array or an Object, " +
                "but got " + (toRawType(props)) + ".",
                vm
            );
        }
        options.props = res;
    }
    ```
    + normalizeProps 这个函数的作用是：将 props 规范到对象。在这个函数中主要做了以下几件事情：
      + 没有传递 props，就直接返回
      + 对 props 是数组类型的处理
      + props 是原生的对象的处理
      + 如果传递的既不是数组也不是对象，发出报错警告
      + 1、props 是数组
        ```js
        /*要最终处理完返回的对象*/
        var res = {};
        var i, val, name;
        /* 检测是否是一个数组 */
        if (Array.isArray(props)) {
            /*获取 props 长度*/
            i = props.length;
            while (i--) {
                val = props[i];
                /*在 props 是数组的情况下, 判断每个值是否是字符串 */
                if (typeof val === 'string') {
                    /*将中横线 -  变为驼峰字符*/
                    name = camelize(val);
                    /* 将该项转换为对象, type 为 null */
                    res[name] = {type: null};
                } else {
                    /*在数组的情况下只能是字符串*/
                    warn('props must be strings when using array syntax.');
                }
            }
        }
        ```
        + 在 props 是数组的情况下，数组里面的每一项只能是字符串。最终将数据数组里面的每一项字符串转为对象。例如：
        ```js
        props: ['message']
        ```
        + 转换后：
        ```js
        props:{
          messsage:{
              type:null  /*可以看做是任意类型*/
          }
        }
        ```
      + 2、props 是对象：
        ```js
        if (isPlainObject(props)) {
          for (var key in props) {
              val = props[key]; /*获取到 key 对应的 val */
                /*将中横线 - 转为了驼峰*/
              name = camelize(key);
              /*检测是 val 是否是原生的对象, 是, 就直接把 val 赋值给 res[name] */
              res[name] = isPlainObject(val)
                  ? val
                  : {type: val};
          }
        }
        ```
        + 最终将 props 统一为对象
        + camelize 函数的作用是把带有中横线 props 命名转为驼峰命名
        ```js
        var camelizeRE = /-(\w)/g;
        var camelize = cached(function (str) {
            return str.replace(camelizeRE, function (_, c) {
                return c ? c.toUpperCase() : '';
            })
        });
        ```
        + 看下官网的示例代码：
        ```js
        Vue.component('blog-post', {
            // 在 JavaScript 中是 camelCase 的
            props: ['postTitle'],
            template: '<h3>{{ postTitle }}</h3>'
        })

        <!-- 在 HTML 中是 kebab-case 的 -->
        <blog-post post-title="hello!"></blog-post>
        ```
        + 在 HTML 中 post-title 可以带中横线（推荐这种写法，符合 HTML 属性规范），在 props 规范化中，将中横线替换掉，变成驼峰的方式







  + directives 规范化
    + 在我们定义指令的时候，可以有不同的写法
    ```js
    let p = Vue.extend({
      directive:{
          test1:{  /*钩子函数*/
              bind:function () {
                  console.log("v-test1")
              }
          },
          test2:function () {  /*简写*/
              console.log("v-test1")
          }
      }
    })
    ```
    + 在 mergeOptions 中，会调用 normalizeDirectives(child) 将不同的写法进行统一的规范化
    + 接下来在源码中是如何规范的
    ```js
    /**
    * Normalize raw function directives into object format.
    */
    function normalizeDirectives(options) {
        var dirs = options.directives;
        if (dirs) {
            for (var key in dirs) {
                var def$$1 = dirs[key];
                if (typeof def$$1 === 'function') {
                    dirs[key] = {bind: def$$1, update: def$$1};
                }
            }
        }
    }
    ```
    + 从上面可以看出，指令的简写方式，最终会转为对象形式存在。作为 bind 和 update 的函数


  + props methods inject computed 合并策略
    + 源码的实现
    ```js
    strats.props =
        strats.methods =
            strats.inject =
                strats.computed = function (
                    parentVal,
                    childVal,
                    vm,
                    key
                ) {
                    if (childVal && "development" !== 'production') {
                        assertObjectType(key, childVal, vm);
                    }
                    /*检测 parentVal 是否存在, 不存在,直接把 childVal 返回, 不用合并*/
                    if (!parentVal) {
                        return childVal
                    }
                    var ret = Object.create(null);
                    /*把 parentVal 的属相混入 ret 中*/
                    extend(ret, parentVal);
                    /*如果 childVal 存在, 把 childVal 混入到 ret 中*/
                    if (childVal) {
                        extend(ret, childVal);
                    }
                    return ret
                }
    ```
    + 可以看出上面的代码：先把 parentVal 混入到 ret 中，在把 childVal 混入到 ret 中。如果键值一样，就直接覆盖
## 6、Vue.js 初始化过程 ———— initProxy ——渲染函数的作用与代理  
  + 在 vm._init() 函数的初始化过程中调用了 initProxy 函数，以下是 initProxy 函数的源码
  ```js
  initProxy = function initProxy(vm) {
    /* hasProxy 判断当前环境是否支持 es 提供的 Proxy */
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      /*不同条件返回不同的 handlers, getHandler 或者h asHandler */
      var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
      /* 代理 vm 实例 */
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
  ```
  + initProxy 函数的主要目的：通过 vm._renderProxy 代理 vm 实例，根据不同的条件，生成 Proxy 的 handlers 拦截行为 vm._renderProxy 在 render 函数被调用的时候，当做参数被传递进入
  ```js
  vnode = render.call(vm._renderProxy, vm.$createElement)
  ```
  + render 使用 call 调用，上下文为 vm._renderProxy，这部分会在后面的小节讲到
  + 先看看 hasProxy 的实现：
  ```js
  /* hasProxy 的实现*/
  var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy);

  /* isNative 的实现 */
  function isNative(Ctor) {
      return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }
  ```
  + hasProxy 主要的作用就是检测 es6 的 Proxy 是否支持。如果支持 Proxy，通过 isNative 检测是否是 native code 提供的 Proxy，这样检测的目的是：我们自己定义的变量 Proxy 会返回 false
  + 通过 isNative 函数，可以学习到如何检测一个函数是自己定义的还是 native code
  + 接下来分析后面的代码，在 native code 下的 Proxy:
  ```js
  if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
  }
  ```
  + options.render && options.render._withStripped 从这两项是否配置, 来获取 Proxy 的拦截行为 handlers.
    + options.render 配置渲染函数
    + options.render._withStripped 是在测试环境下会配置此项，结合 webpack 才会出现
  + options.render && options.render._withStripped 都支持会返回 getHandler，否则返回 hasHandler
  + **hasHandler**
  ```js
  var hasHandler = {
      /* target 要代理的对象, key 在外部操作时访问的属性*/
      has: function has(target, key) {
          /* key in target 返回 true 或者 false */
          var has = key in target;
          /*在模板引擎里面,有一些属性 vm 没有进行代理, 但是也能使用, 像 Number,Object 等*/
          var isAllowed = allowedGlobals(key) ||
              (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
          /*在上面的 has 和 isAllowed 为 false 的情况下*/
          if (!has && !isAllowed) {
              if (key in target.$data) {
                  warnReservedPrefix(target, key);
              }
              /* warnNonPresent 函数, 当访问属性,没有存在 vm 实例上, 会报错提示*/
              else {
                  warnNonPresent(target, key);
              }
          }
          /* has 或者 isAllowed */
          return has || !isAllowed
      }
  };
  ```
  + hasHandler 只配置了 hash 钩子，当进行 propKey in proxy 的时候 in 操作符 或者 with() 操作时，会触发 hash 钩子函数
  + hasHandler 在查找 key 时，从三个方向进行查找：
    + 代理的 target 对象，通过 in 操作符
    + 全局对象 API allowedGlobals 函数
    + 查找是否是渲染函数的内置方法，第一个字符以 _ 开始 typeof key === 'string' && key.charAt(0) === '_'
  + hasHandler 首先去检测 vm 实例上是否有该属性，下面的代码是 vm 实例上可以查看到 test
  ```js
  new Vue({
    el:"#app",
    template:"<div>{{test}}</div>",
    data:{
        test
    }
  })
  ```
  + 如果在 vm 实例上没有找到，然后再去判断下是否是一些全局的对象，例如 Number 等，Number 是语言本身所提供的， 在模板中也可以使用
  ```js
  new Vue({
    el:"#app",
    /*Number属于语言提供的全局API*/
    template:"<div> {{ Number(test) +1 }}</div>",
    data:{
        test
    }
  })
  ```
  + 在模板里使用一些全局的 API, 而全局 API 是 allowedGlobals(key) 函数帮我们收集的
  ```js
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  /* makeMap 函数, str 参数是接受的字符串, expectsLowerCase 参数是否需要小写*/
  function makeMap(str, expectsLowerCase ) {
    /* 创建一个对象 */
    var map = Object.create(null);
    /*将字符串分割成数组*/
    var list = str.split(',');
    /*对数组进行遍历*/
    for (var i = 0; i < list.length; i++) {
        /*将每个 key 对应的值设置为 true */
        map[list[i]] = true;
    }
    /*最终返回, 根据参数设置是否是需要转换大小写*/
    return expectsLowerCase
        ? function (val) {
            return map[val.toLowerCase()];
        }
        : function (val) {
            return map[val];
        }
  }
  ```
  + makeMap 函数的主要作用就是把这些全局的 API 转成以下的形式：
  ```js
  {
      Infinity:true,
      undefined:true
  }
  ```
  + **getHandler**
  + options.render && options.render._withStripped 都支持会返回 getHandler
  + 当 key 在 target 时，会触发 get 钩子函数
  ```js
  var getHandler = {
    get: function get(target, key) {
        /* key 是字符串, 并且 key 不在 target 上*/
        if (typeof key === 'string' && !(key in target)) {
            if (key in target.$data) {
                warnReservedPrefix(target, key);
            }
            else {
                /* key 没有在实例上定义*/
                warnNonPresent(target, key);
            }
        }
        /* 直接返回 key 对应的 value */
        return target[key]
    }
  };
  ```
  + warnNonPresent 函数：
  ```js
  const warnNonPresent = (target, key) => {
      warn(
          `Property or method "${key}" is not defined on the instance but ` +
          'referenced during render. Make sure that this property is reactive, ' +
          'either in the data option, or for class-based components, by ' +
          'initializing the property. ' +
          'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
          target
      )
  }
  ```
  + warnNonPresent 会发出警告信息，当使用的 key 没有在 vm 实例的 data 中定义
  ```js
  new Vue({
    el:"#app",
    template:"<div> {{ a }}</div>",
    data:{
        message:"hello vue"
    }
  })
  ```
  + 使用了 a 在 data 中没有定义，会触发 warnNonPresent 函数，打印报错信息

## 7、Vue.js 初始化过程 ———— initLifecycle
+ 先看个简单的小例子
```js
const compA = {
    template: "<div>我是compA</div>"
}
const vm = new Vue({
    el: "#app",
    components: {
        "comp-a": compA
    }
})
console.log(vm)
```
+ 在控制打印 vm 时，可以看到这两个属性：$parent，$children
+ ![](../images/initLifecycle.jpg)






