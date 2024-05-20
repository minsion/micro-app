不同于其它路由模式通过search参数或history.state进行路由隔离，native模式是指放开路由隔离，主应用和子应用同时基于浏览器地址进行渲染，也都会直接修改浏览器地址。

它拥有更好的用户体验，但也更容易导致主应用和子应用的路由冲突，所以需要更加复杂的路由配置，要对主应用和子应用路由进行一些改造。

实际上主应用和子应用的路由即同时基于浏览器地址进行渲染，又相互独立，我们通过路由配置让两个独立的路由系统实现共存，具体原理参考[关于native模式的原理解析](/zh-cn/native-mode?id=关于native模式的原理解析)。

**约束限制：**native模式有以下限制
- 1、主应用是history路由，子应用可以是history或hash路由
- 2、主应用是hash路由，子应用也必须是hash路由

### 基础路径
基础路径即vue-router的[base](https://router.vuejs.org/zh/api/interfaces/RouterHistory.html#Properties-base)、react-router的[basename](https://reactrouter.com/en/main/router-components/browser-router#basename)，通常与应用托管在服务器的文件夹地址一致，但在微前端环境下子应用的基础路径要根据主应用的地址动态设置，指定子应用运行的路径范围。

由于主应用和子应用各有一套路由系统，为了防止冲突，主应用需要分配一个基础路径给子应用，子应用在这个路径下渲染，且不能超出这个路径的范围，实现主应用和子应用的并行渲染。

例如：如果子应用运行在主应用的 `/app/` 路径下，那么子应用的基础路径应设置为 `'/app/'`。

#### 使用方式：

主应用通过`baseroute`下发基础路径的值，子应用通过`window.__MICRO_APP_BASE_ROUTE__`获取此值并设置基础路径。

**注意：**
  - 1、如果主应用是history路由，子应用是hash路由，此时不需要设置基础路径，以下设置可以忽略。
  - 2、`baseroute`是子应用所在页面的绝对地址，获取方式：主应用跳转子应用所在页面，查看`location.pathname`的值并设置为`baseroute`。

#### 主应用

<!-- tabs:start -->

#### ** react16 **

**1、设置路由：**react-router版本为4.x或5.x
```js
// router.js
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import MyPage from './my-page'

export function App () {
  return (
    <BrowserRouter>
      <Switch>
        // 设置动态路由，/child/one、child/two，以及所有/child开头的路由都指向MyPage组件
        <Route path='/child'>
          <MyPage />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}
```

**2、嵌入子应用：**
```js
// my-page.js
export function MyPage () {
  return (
    <div>
      {/* 
        1、设置子应用基础路径baseroute为'/child' 
        2、如果主应用也有基础路径，则baseroute应设置为：主应用基础路径 + '/child' 
      */}
      <micro-app name='my-app' url='http://localhost:3000/' baseroute='/child'></micro-app>
    </div>
  )
}
```

#### ** react18 **

**1、设置路由：**react-router版本为6.x
```js
// router.js
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyPage from './my-page'

export function App () {
  return (
    <BrowserRouter>
      <Routes>
        // 设置动态路由，/child/one、child/two，以及所有/child开头的路由都指向MyPage组件
        <Route 
          path='/child/*' 
          element={<MyPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}
```

**2、嵌入子应用：**
```js
// my-page.js
export function MyPage () {
  return (
    <div>
      {/* 
        1、设置子应用基础路径baseroute为'/child' 
        2、如果主应用也有基础路径，则baseroute应设置为：主应用基础路径 + '/child' 
      */}
      <micro-app name='my-app' url='http://localhost:3000/' baseroute='/child'></micro-app>
    </div>
  )
}
```

#### ** vue2 **

**1、设置路由：**
```js
// router.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import MyPage from './my-page.vue'

Vue.use(VueRouter)

const routes = [
  {
    // 设置动态路由，/child/one、child/two，以及所有/child开头的路由都指向MyPage组件
    path: '/child/*',
    name: 'child',
    component: MyPage,
  },
  // 其它配置...
]

export default routes
```

**2、嵌入子应用：**
```html
// my-page.vue
<template>
  <!-- 
    1、设置子应用基础路径baseroute为'/child'
    2、如果主应用也有基础路径，则baseroute应设置为：主应用基础路径 + '/child' 
   -->
  <micro-app name='my-app' url='http://localhost:3000/' baseroute='/child'></micro-app>
</template>
```

#### ** vue3 **

**1、设置路由：**
```js
// router.js
import MyPage from './my-page.vue'

const routes = [
  {
    // 设置动态路由，/child/one、child/two，以及所有/child开头的路由都指向MyPage组件
    path: '/child/:page*',
    name: 'child',
    component: MyPage,
  },
  // 其它配置...
]

export default routes
```

**2、嵌入子应用：**
```html
// my-page.vue
<template>
  <!-- 
    1、设置子应用基础路径baseroute为'/child'
    2、如果主应用也有基础路径，则baseroute应设置为：主应用基础路径 + '/child' 
   -->
  <micro-app name='my-app' url='http://localhost:3000/' baseroute='/child'></micro-app>
</template>
```

<!-- tabs:end -->

#### 子应用

<!-- tabs:start -->


#### ** react16 **

**设置基础路径：**
```js
import { BrowserRouter, Switch, Route } from 'react-router-dom'

export default function App () {
  return (
    // 设置基础路径，window.__MICRO_APP_BASE_ROUTE__为主应用下发的baseroute，默认为空字符串
    <BrowserRouter basename={window.__MICRO_APP_BASE_ROUTE__ || '/'}>
      // ...
    </BrowserRouter>
  )
}
```

#### ** react18 **

**设置基础路径：**
```js
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App () {
  return (
    // 设置基础路径，window.__MICRO_APP_BASE_ROUTE__为主应用下发的baseroute，默认为空字符串
    <BrowserRouter basename={window.__MICRO_APP_BASE_ROUTE__ || '/'}>
      // ...
    </BrowserRouter>
  )
}
```


#### ** vue2 **

**设置基础路径：**
```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'

const router = new VueRouter({
  mode: 'history',
  // 设置基础路径，window.__MICRO_APP_BASE_ROUTE__为主应用下发的baseroute，默认为空字符串
  base: window.__MICRO_APP_BASE_ROUTE__ || '/',
  routes,
})
```

#### ** vue3 **

**设置基础路径：**
```js
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router'

const router = createRouter({
  // 设置基础路径，window.__MICRO_APP_BASE_ROUTE__为主应用下发的baseroute，默认为空字符串
  history: createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || '/'),
  routes,
})
```
<!-- tabs:end -->


#### 注意事项：
- 1、如果主应用是history路由，子应用是hash路由，不需要设置基础路径baseroute
- 2、如果子应用只有一个页面，没有使用`react-router`，`vue-router`之类，也不需要设置基础路径baseroute
- 3、`vue@2.x`在hash模式下无法通过base设置基础路径，需要创建一个空的路由页面，将其它路由作为它的children，具体设置如下：

```js
import RootApp from './root-app.vue'

const routes = [
    {
      path: window.__MICRO_APP_BASE_ROUTE__ || '/',
      component: RootApp,
      children: [
        // 其他的路由都写到这里
      ],
    },
]
```

`root-app.vue`内容如下：
```html
<template>
  <router-view />
</template>
```



### 关于native模式的原理解析
主应用和子应用的路由系统既相互独立又同时基于浏览器地址进行渲染。

相互独立：是指主应用和子应用是基于各自前端框架生成的路由系统，自身的路由变化不会直接影响对方，一方跳转到新的地址后，另外一方不会自动响应浏览器变化（除非刷新浏览器或者主动发送`PopStateEvent`事件）。

同时基于浏览器地址进行渲染：是指同一个浏览器地址，同时满足主应用和子应用的路由匹配，渲染自身页面。

**注意：**子应用基于浏览器地址进行渲染，而不是micro-app的url属性

##### 例1:

浏览器地址为：`http://localhost:3000/page1?id=1#hash`，此时pathname为`/page1`，search为`?id=1`，hash为`#hash`。

主应用匹配`/page1`并渲染对应的页面，路由参数为`id=1`，hash为`#hash`，子应用也是一样，浏览器地址会同时影响到主应用和子应用。

每个应用都有一套自己的路由系统，它们是可以共存的，不会冲突。

假设我们要渲染子应用的`page1`页面，参数为`id=1`，hash为`#hash`，那么正确的形式是：1、micro-app的url属性设置为`http://子应用域名/` 2、浏览器地址为`http://主应用域名/page1?id=1#hash`。

```html
<!-- ❌ 这里 /page1?id=1#hash 是错误的，应该添加到浏览器地址上 -->
<micro-app url='http://子应用域名/page1?id=1#hash'></micro-app>

<!-- ✔️ 这个url才是正确的 -->
<micro-app url='http://子应用域名/'></micro-app>
```
子应用加载完成后会根据浏览器的地址匹配并渲染对应的页面。


##### 例2:

场景：主应用是history路由，子应用也是history路由，我们要跳转主应用的`my-app`页面，`my-app`页面中嵌入子应用，我们要展现子应用的`page1`页面。

那么浏览器地址应该为：`http://主应用域名/my-page/page1`，我们在主应用中跳转的参数为：`router.push('/my-page/page1')`

原理：主应用匹配到`/my-page`路径并渲染`my-app`页面，因为`my-app`页面中嵌入了子应用，此时子应用开始加载并渲染，子应用在渲染时会匹配到`/my-page/page1`并渲染`page1`页面。

micro-app配置如下：
```html
<!-- 子应用通过baseroute设置基础路径/my-page -->
<micro-app url='http://子应用域名/index.html' baseroute='/my-page'></micro-app>
```


##### 例3:

场景：主应用是hash路由，子应用也是hash路由，我们要跳转主应用的`my-app`页面，`my-app`页面中嵌入子应用，我们要展现子应用的`page1`页面。

那么浏览器地址应该为：`http://主应用域名/#/my-page/page1`，我们在主应用中跳转的参数为：`router.push('/my-page/page1')`

原理：主应用匹配到`#/my-page`路径并渲染`my-app`页面，因为`my-app`页面中嵌入了子应用，此时子应用开始加载并渲染，子应用在渲染时会匹配到`#/my-page/page1`并渲染`page1`页面。

```html
<!-- 子应用通过baseroute设置基础路径/my-page -->
<micro-app url='http://子应用域名/index.html' baseroute='/my-page'></micro-app>
```

##### 例4:

场景：主应用是history路由，子应用是hash路由，我们要跳转主应用的`my-app`页面，页面中嵌入子应用，我们要展现子应用的`page1`页面。

那么浏览器地址应该为：`http://主应用域名/my-page/#/page1`，我们在主应用中跳转`my-app`页面的参数为：`router.push('/my-page/#/page1')`

原理：主应用匹配到`/my-page`路径并渲染`my-app`页面，因为`my-app`页面中嵌入了子应用，此时子应用开始加载并渲染，子应用在渲染时会匹配到`#/page1`并渲染`page1`页面。

micro-app配置如下：
```html
<!-- 此时不需要设置baseroute -->
<micro-app url='http://子应用域名/index.html'></micro-app>
```

> [!TIP]
> 如果你看到这里还是无法正确设置路由，不妨试试其它路由模式
