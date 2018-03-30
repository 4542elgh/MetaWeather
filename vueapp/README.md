# vueapp

> A Vue.js project for MetaWeather API.
#### Goal: Taking vue and bootstrap to the node server reduce the load and cpu compute power required from client device. 
#### Node will render content and inject css before sending the final result to the client which means client device treat the targeted response as a plain html. 
#### Link and style CDN will require client to wait for cdn response further delay the response content.

## Build Setup

``` bash
# install dependencies (include bootstrap-vue)
(sudo) npm install
webpack-dev-server need admin privilege

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report


```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

### Bootstrap Vue Docs
https://bootstrap-vue.js.org/docs/
#### Components tab have vue tag which utilize bootstrap-vue module

### Slideout.js
https://slideout.js.org/
#### Javascript sidebar animation, server renderer
