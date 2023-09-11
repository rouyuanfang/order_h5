import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "babel-polyfill";

/* yarn add es6-promise -D */
// import Es6Promise from 'es6-promise'
// Es6Promise.polyfill()

import "./icons";
import "./permission.js";

import "@/assets/scss/index.scss";

import Vant from "vant";
import "vant/lib/index.css";
Vue.use(Vant);

import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

// import VConsole from "vconsole";
// if (["test", "development"].includes(process.env.VUE_APP_MODE)) {
//   Vue.use(new VConsole());
// }

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
