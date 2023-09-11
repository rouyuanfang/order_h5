import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/Home/Home.vue"),
  },
  {
    path: "/login",
    component: () => import("../views/Login/Login.vue"),
  },
  {
    path: "/cart",
    name: "cart",
    component: () => import("../views/Cart/Cart.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/mine",
    name: "mine",
    component: () => import("../views/Mine/Mine.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/point",
    name: "point",
    component: () => import("../views/Mine/Point.vue"),
  },
  {
    path: "/sort",
    name: "sort",
    component: () => import("../views/Sort/Sort.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/sort-sub",
    name: "sort-sub",
    component: () => import("../views/Sort/Sub.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/product-detail/:id",
    name: "product-detail",
    component: () => import("../views/Product/Detail.vue"),
  },
  {
    path: "/notice",
    name: "notice",
    component: () => import("../views/Notice/Notice.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/notice-system",
    name: "notice-system",
    component: () => import("../views/Notice/System.vue"),
  },
  {
    path: "/notice-order",
    name: "notice-order",
    component: () => import("../views/Notice/Order.vue"),
  },
  {
    path: "/notice-coupon",
    name: "notice-coupon",
    component: () => import("../views/Notice/Coupon.vue"),
  },
  {
    path: "/seek",
    name: "seek",
    component: () => import("../views/Search/Search.vue"),
    meta: {
      requireLogin: true,
    },
  },
  {
    path: "/seek-result",
    name: "seek-result",
    component: () => import("../views/Search/Result.vue"),
  },
  {
    path: "/order-detail",
    name: "order-detail",
    component: () => import("../views/Order/Detail.vue"),
  },
  {
    path: "/order-comfirm",
    name: "order-comfirm",
    component: () => import("../views/Order/Comfirm.vue"),
  },
  {
    path: "/order-commit",
    name: "order-commit",
    component: () => import("../views/Order/Commit.vue"),
  },
  {
    path: "/order-upload",
    name: "order-upload",
    component: () => import("../views/Order/Upload.vue"),
  },
  {
    path: "/order-pay",
    name: "order-pay",
    component: () => import("../views/Order/Pay.vue"),
  },
  {
    path: "/order-list",
    name: "order-list",
    component: () => import("../views/Order/List.vue"),
  },
  {
    path: "/order-logics/:id",
    name: "order-logics",
    component: () => import("../views/Order/Logics.vue"),
  },
  {
    path: "/order-step",
    name: "order-step",
    component: () => import("../views/Order/Step.vue"),
  },
  {
    path: "/address",
    name: "address",
    component: () => import("../views/Address/Address.vue"),
  },
  {
    path: "/address-crud",
    name: "address-crud",
    component: () => import("../views/Address/CRUD.vue"),
  },
  {
    path: "/service",
    name: "service",
    component: () => import("../views/Service/Service.vue"),
  },
  {
    path: "/branch-list",
    name: "branch-list",
    component: () => import("../views/Service/BranchList.vue"),
  },
  {
    path: "/coupon-list",
    name: "coupon-list",
    component: () => import("../views/Coupon/List.vue"),
  },
  {
    path: "/coupon-cancel",
    name: "coupon-cancel",
    component: () => import("../views/Coupon/Cancel.vue"),
  },
  {
    path: "/coupon-code/:id",
    name: "coupon-code",
    component: () => import("../views/Coupon/Code.vue"),
  },
  {
    path: "/coupon-detail",
    name: "coupon-detail",
    component: () => import("../views/Coupon/Detail.vue"),
  },
  {
    path: "/coupon-record",
    name: "coupon-record",
    component: () => import("../views/Coupon/Record.vue"),
  },
  {
    path: "/coupon-commit",
    name: "coupon-commit",
    component: () => import("../views/Coupon/Commit.vue"),
  },
  {
    path: "/coupon-comfirm",
    name: "coupon-comfirm",
    component: () => import("../views/Coupon/Comfirm.vue"),
  },
  {
    path: "/coupon-upload",
    name: "coupon-upload",
    component: () => import("../views/Coupon/Upload.vue"),
  },
  {
    path: "/coupon-pay",
    name: "coupon-pay",
    component: () => import("../views/Coupon/Pay.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/Error/404.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
