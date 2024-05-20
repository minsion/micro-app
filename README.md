
# 📖Introduction
micro-app is a micro front-end framework launched by JD Retail. It renders based on webcomponent-like and realizes the micro front-end from component thinking, it aiming to reduce the difficulty of getting started and improve work efficiency. 

It is the lowest cost framework for accessing micro front-end, and provides a series of perfect functions such as JS sandbox, style isolation, element isolation, preloading, resource address completion, plugin system, data communication and so on.

micro-app has no restrictions on the front-end framework, and any framework can be used as a base application to embed any type of micro application of the framework.

# How to use
## Base application
**1、Install**
```bash
yarn add @micro-zoe/micro-app
```

**2、import at the entrance**
```js
// main.js
import microApp from '@micro-zoe/micro-app'

microApp.start()
```

**3、Use components in page**
```html
<!-- my-page.vue -->
<template>
  <!-- 👇 name is the app name, url is the app address -->
  <micro-app name='my-app' url='http://localhost:3000/'></micro-app>
</template>
```

## Sub application
**Set cross-domain support in the headers of webpack-dev-server**
```js
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
},
```

### development
1、Clone
```
git clone https://github.com/minsion/micro-app.git
```

2、Install dependencies
```
yarn bootstrap
```

3、Run project
```
yarn start
```
