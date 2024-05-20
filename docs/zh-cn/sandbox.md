### 沙箱介绍
沙箱通过自定义的window、document拦截子应用的JS操作，实现一个相对独立的运行空间，避免全局变量污染，让每个子应用都拥有一个相对纯净的运行环境。

`micro-app`有两种沙箱模式：with沙箱和iframe沙箱，它们覆盖不同的使用场景且可以随意切换，默认情况下使用with沙箱，如果无法正常运行可以切换到iframe沙箱，比如[vite](/zh-cn/framework/vite)。

### 注意事项

#### 1、子应用如何获取到真实window、document
子应用通过：`window.rawWindow`、`window.rawDocument` 可以获取真实的window、document

#### 2、子应用抛出错误信息：xxx 未定义
**包括：**
- `xxx is not defined`
- `xxx is not a function`
- `Cannot read properties of undefined`

**常见场景：**
  - 1、webpack DllPlugin 拆分的独立文件
  - 2、通过script引入的第三方js文件

**原因：**

在沙箱环境中，顶层变量不会泄漏为全局变量。

例如：在正常情况下，通过 var name 或 function name () {} 定义的顶层变量会泄漏为全局变量，通过window.name或name就可以全局访问，但是在沙箱环境下这些顶层变量无法泄漏为全局变量，window.name或name的值为undefined，导致出现问题。

**解决方式**：

##### 方式一：修改子应用webpack dll配置

子应用webpack dll配置文件中[output.library.type](https://webpack.docschina.org/configuration/output/#outputlibrarytype)设置为`window`，这种方式适合DllPlugin拆分的独立文件。
```js
// webpack.dll.config.js
module.exports = {
  // ...
  output: {
    library: {
      type: 'window',
    },
  },
}
```

##### 方式二：手动修改

将 var name 或 function name () {} 修改为 window.name = xx

##### 方式三：通过插件系统修改子应用代码

通过插件系统，将 var name 或 function name () {} 修改为 window.name = xx，不同项目的代码形式并不统一，根据实际情况调整。

```js
microApp.start({
  plugins: {
    modules: {
      应用名称: [{
        loader(code, url) {
          if (url === 'xxx.js') {
            // 根据实际情况调整
            code = code.replace('var xxx=', 'window.xxx=')
          }
          return code
        }
      }]
    }
  }
})
```

#### 3、子应用使用`Module Federation`模块联邦时报错
原因同上述[注意事项2](/zh-cn/sandbox)相同，都是由于在沙箱环境中，顶层变量不会泄漏为全局变量导致的。

**解决方式：**将`ModuleFederationPlugin`插件中`library.type`设置为`window`。

```js
new ModuleFederationPlugin({
  // ...
  name: "app1",
  library: { 
    type: "window", 
    name: "app1",
  },
})
```

#### 4、子应用`DllPlugin`拆分的文件加载失败

**原因：**参考上述[注意事项2](/zh-cn/sandbox)，在沙箱环境中，顶层变量不会泄漏为全局变量导致的。

**解决方式：**修改子应用webpack dll配置

子应用webpack dll配置文件中[output.library.type](https://webpack.docschina.org/configuration/output/#outputlibrarytype)设置为`window`。
```js
// webpack.dll.config.js
module.exports = {
  // ...
  output: {
    library: {
      type: 'window',
    },
  },
}
```


#### 5、基座如何对子应用 document 的一些属性进行自定义代理扩展

**场景：**

微前端模式下，通常由基座负责设置站点标题，不希望受到子应用的干扰。   
但是因为 microApp 对 documet 的代理处理过程，并没有处理 document.title，所以子应用中可能通过 `document.title = 'xxx'` 意外改变了基座的站点标题。   

**解决方式**：

*通过 customProxyDocumentProps 对 document 的属性进行自定义代理扩展*

通过给title设置一个空函数，来忽略 document.title 执行
```js
microApp.start({
  customProxyDocumentProps: new Map([
    ['title', (value) => {}]
  ]),
})
```
