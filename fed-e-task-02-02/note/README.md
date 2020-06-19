### 模块化开发与规范化标准

#### 任务一：模块化开发

##### 1、模块化演变过程
+ 第一阶段：引入script标签的形式（<script src='module-a.js'></script>），早期模块化完全依靠约定,缺点如下：
    + 污染全局作用域
    + 命名冲突问题
    + 无法管理模块依赖关系
+ 第二阶段：命名空间方式
    + 每个模块只暴露一个全局对象，所有模块都挂载到这个对象上
    + 减少了命名冲突的可能
    + 但是没有私有空间，模块成员可以在外部被访问或修改
    + 模块之间的依赖关系没有得到解决
+ 第三阶段：IIFE(使用立即执行函数表达式)
    + 使用立即执行函数包裹代码，要输出的遍历挂载到一个全局对象上
    + 变量拥有了私有空间，只有通过闭包修改和访问变量
    + 参数作为依赖声明去使用，使得每个模块的依赖关系变得明显

##### 2、模块化规范的出现
+ 1）CommonJs规范，同步模式加载模块
    + 一个文件就是一个模块
    + 每个模块都有单独的作用域
    + 通过module.exports导出成员
    + 通过require函数载入模块
+ 2）AMD规范，以require.js为代表
    + 定义一个模块：
    ```js
    define('module1', ['jquery', './module2'], function ($, module2) {
        return {
            start: function () {
                $('body').animate({ margin: '200px' })
                module2()
            }
        }
    })
    ```
    + 载入一个模块
    ```js
    require(['./module1'], function (module1) {
        module1.start()
    })
    ```
    + AMD使用起来相对复杂，模块js文件请求频繁
+ 3）淘宝推出的Sea.js + CMD(Common Module Definition)通用模块规范
    ```js
    // CMD 规范 （类似 CommonJS 规范）
    define(function (require, exports, module) {
         // 通过 require 引入依赖
        var $ = require('jquery')
        // 通过 exports 或者 module.exports 对外暴露成员
        module.exports = function () {
            console.log('module 2~')
            $('body').append('<p>module2</p>')
        }
    })
    ```

##### 3、ES Modules特性
+ 通过给 script 添加 type=module 的属性，就可以以ES Module 的标准执行其中的 js 代码
  ```js
  <script type='module'></script>
  ```
+ ES Module 自动采用严格模式
  ```js
  <script type='module'>
    console.log(this) //undefined
  </script>
  ```
+ 每个 ES Module 都是运行在单独的私有作用域中
  ```js
  <script type='module'>
    var foo = 100
    console.log(foo) // 100
  </script>
  <script type='module'>
    console.log(foo) // undefined
  </script>
  ```
+ ES Module 是通过 CORS 的方式请求外部 JS 模块的
  ```js
  <script type="module" src="https://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>  // 请求失败，这个资源所在服务器不支持CORS
  <script type="module" src="https://unpkg.com/jquery@3.4.1/dist/jquery.min.js"></script> // 请求成功，这个资源所在的服务器支持CORS
  ```
+ ES Module 的 script 标签会延迟执行脚本
  ```js
  <script type="module" src="demo.js"></script> // 这个脚本文件不会阻碍下边标签的渲染
  <p>需要显示的内容</p>
  ```

##### 4、ES Module与CommonJS交互
+ ES Module 中可以导入 CommonJS 模块
+ 不能再 CommonJS 模块中通过 require 载入 ES Module(node不支持，webpack支持)
+ CommonJS 始终只会导出一个默认对象
+ 注意 import 不是解构导出对象
+ ES Module 中没有 CommonJS 中的那些模块全局成员了
  + require, module, exports 可以通过 import 和 export来代替
  + __filename 和 __dirname 可以用如下方法来代替：
  ```js
    import { fileURLToPath } from 'url'
    import { dirname } from 'path'
    const __filename = fileURLToPath(import.meta.url)
    console.log(__filename)
    const __dirname = dirname(__filename)
    console.log(__dirname)
  ```
+ package.json 文件中添加 "type" : "module" 字段后则默认以 .js 结尾的文件会以 ES Module的形式运行，如果想以 CommonJS 的形式运行文件，文件需以 .cjs 结尾

##### 5、babel兼容方案
+ 安装依赖： npm i @babel/node @babel/core @babel/preset-env -D
+ babel 转化为 es5 的代码的方法
  + 1、npx babel-node index.js --presets=@babel/preset-env
  + 2、添加 .babelrc 文件，配置为 "presets" : ["@babel/preset-env"]
  + 3、npm i @babel/plugin-transform-modules-commonjs -D,添加 .babelrc 文件，配置为 "plugins" : ["@babel/plugin-transform-modules-commonjs"]


#### 任务二、webpack打包
##### 1、模块化打包工具由来：
+ 为什么会出现模块化打包：
  + ES Module 存在环境兼容问题
  + 模块文件过多，网络请求频繁
  + 所有的前端资源都需要模块化

##### 2、模块化打包工具概要
+ webpack 的组成成分
  + 模块打包器（Module bundler)
  + 模块加载器（Loader)
  + 代码拆分（code splitting)
  + 资源模块 （Asset Module)

##### 3、webpack快速上手、配置文件、工作模式、打包运行结果、资源模块加载、导入资源模块、文件资源加载器、URL加载器、自动清除输出目录插件、自动生成HTML插件、webpack-dev-server、webpack-dev-server 代理 API
+ 代码部分见./code/webpack/start-01
+ Data URLs(data:[<mediatype>][;base64],<data>): 示例（data:text/html;charset=UTF-8,<h1>html content</h1>）,组成部分如下
  + （data）: 协议
  + （[<mediatype>][;base64],）：媒体类型和编码
  + （<data>):文件内容

+ loader：
  + "css-loader": css解析loader，
  + "file-loader": 图片解析loader
  + "style-loader": style插入html
  + "url-loader": 解析为data URLs的形式
  + "babel-loader","@babel/core","@babel/preset-env": 解析为 es2015
  + "html-loader": 解析html

##### 4、常用加载器分类
+ 编译转换类
+ 文件操作类
+ 代码检查类

##### 5、加载资源的方式
+ 遵循 ES Modules 标准的 import 声明
+ 遵循 CommonJS 标准的 require 函数
+ 遵循 AMD 标准的 define 函数和 require 函数
+ 样式代码中的 @import 指令和 url 函数
+ HTML 代码中图片标签的 src 属性

##### 6、读取md文档的loader插件
+ 代码部分见./code/webpack/markdownLoader

##### 7、开发一个插件
+ 一个函数或者是一个包含apply方法的对象
+ 通过在生命周期的钩子中挂载函数实现扩展
+ 代码部分见./code/webpack/start-01

##### 8、devtool模式对比
+ 模式汇总：
  + 'eval'：模块代码放到eval函数中执行
	+ 'cheap-eval-source-map'：生成map文件，代码经过 loader 转化，但只能定位错误的行,
	+ 'cheap-module-eval-source-map'：生成map文件,代码为编写的源代码，但只能定位错误的行,
	+ 'eval-source-map'：生成map文件，并可定位错误的行和列,
	+ 'cheap-source-map'：生成map文件，没有eval函数,
	+ 'cheap-module-source-map'：,
	+ 'inline-cheap-source-map',
	+ 'inline-cheap-module-source-map',
	+ 'source-map',
	+ 'inline-source-map',
	+ 'hidden-source-map',
	+ 'nosources-source-map'：不暴露源代码，但显示错误的行和列
+ 代码部分见./code/webpack/devtool

##### 9、选择合适的 source map 模式
+ 开发模式下：cheap-module-eval-source-map,原因如下：
  + 代码每行不会超过80个字符，所以只需定位到行
  + 代码经过 Loader 转换过后的差异较大
  + 首次打包速度慢无所谓，重写打包相对快
+ 生产模式：none,原因如下
  + Source Map 会暴露源代码
  + 调试是开发阶段的事情

##### 10、HMR 介绍
+ HMR定义：热替换只将修改的模块实时替换至应用中，而不用刷新页面，webpack中最强大的功能之一，极大地提高了开发效率
+ 代码部分见./code/webpack/webpack-hmr

##### 11、DefinePlugin
+ 用处：为代码注入全局成员
+ 代码部分见./code/webpack/webpack-hmr

##### 12、Tree Shaking、Scope Hoisting
+ Tree Shaking: 用到什么模块就导出什么模块，没有用到的模块就不打包
+ Scope Hoisting:既提升了运行效率，又减少了代码的体积
+ 最新版的babel-loader不会将 esm 转化为 commonjs ,如果需要转化，代码如下
```js
{
  test: /\.js$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        // 如果 Babel 加载模块时已经转换了 ESM，则会导致 Tree Shaking 失效
        // ['@babel/preset-env', { modules: 'commonjs' }]
        // ['@babel/preset-env', { modules: false }]
        // 也可以使用默认配置，也就是 auto，这样 babel-loader 会自动关闭 ESM 转换
        ['@babel/preset-env', { modules: 'auto' }]
      ]
    }
  }
}
```
+ 代码部分见./code/webpack/tree-shaking
















#### 任务四、规范化标准

##### 1、规范化介绍
+ 为什么要有规范化标准
    + 软件开发需要多人协同
    + 不同开发者具有不同的编码习惯和喜好
    + 不同的喜好增加项目维护成本
    + 每个项目或者团队需要明确统一的标准
+ 实施规范化的方法
    + 编码前人为的标准约定
    + 通过工具实现lint
+ 常见的规范化实现方式
    + ESLint工具使用
    + 定制ESLint效验规则
    + ESLint对ts的支持
    + ESLint结合自动化工具或者Webpack
    + 基于ESLint的衍生工具
    + Stylelint工具的使用

##### 2、ESLint安装
+ 初始化项目
+ 安装ESLint模块为开发依赖
+ 通过cli命令验证安装结果

##### 3、配置文件解析
+ 

