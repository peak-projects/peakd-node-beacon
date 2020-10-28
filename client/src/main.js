import Vue from "vue";
import VueRouter from "vue-router";
import VueTypedJs from 'vue-typed-js';
import axios from 'axios';

// styles
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/styles/tailwind.css";

// mouting point for the whole app
import App from "@/App.vue";
import Index from "@/views/Index.vue";

// routes
const routes = [
  {
    path: "/",
    component: Index,
  },
  {
    path: "*",
    redirect: "/"
  },
];

// app config
Vue.config.productionTip = false;

Vue.use(VueRouter);
Vue.use(VueTypedJs);

axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '/api';

const router = new VueRouter({
  mode: 'history',
  routes,
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
