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
