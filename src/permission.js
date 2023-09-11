import router from "@/router";
import { getAppURL } from "@/service";
import { Dialog } from "vant";
import storage from "good-storage";
import store from "./store";
// store.state.Auth

const userAgent = navigator.userAgent;
const isWechat = userAgent.toLowerCase().indexOf("micromessenger") !== -1; //微信内
const isAndroid = /(Android)/i.test(userAgent);
const isIos = /(iPhone|iPad|iPod|iOS|Mac)/i.test(userAgent);

let inBrowser = false;
let hidden =
  document.hidden ||
  document.mozHidden ||
  document.msHidden ||
  document.webkitHidden;

if (window.android || window.webkit) {
  inBrowser = true;
}

function login() {
  Dialog.confirm({
    title: "暂未登录",
    message: "您还未登录，请先前往app授权登录",
    confirmButtonText: "去授权",
    cancelButtonText: "暂不",
  })
    .then(() => {
      let schemeURL =
        "SCHME_URL://auth/avatar?inBrowser=" +
        inBrowser +
        "&form=报单H5商城&target=" +
        encodeURIComponent(
          window.location.origin + "/login?inBrowser=" + inBrowser + "&code="
        );

      if (isWechat) {
        Dialog.alert({
          message: "请在浏览器中打开",
        }).then(() => {
          // on close
        });
      } else {
        if (window.android) {
          // console.log(window.android);
          window.android.didSelectCloseHBSquareAction("");
        }

        window.location.href = schemeURL;

        if (!inBrowser && !hidden) {
          setTimeout(async () => {
            const res = await getAppURL();
            if (res) {
              window.location.href = res.androidMy;
            }
          }, 2500);
        }

        /* if (isAndroid) {
          window.location.href = schemeURL;
          setTimeout(async () => {
            getAppURL().then((res) => {
              window.location.href = res.androidMy;
            });
          }, 3000);
        } */

        /* if (isIos) {
          const loadDateTime = Date.now();
          window.location.href = schemeURL;
          setTimeout(() => {
            const timeoutDateTime = Date.now();
            if (timeoutDateTime - loadDateTime < 5000) {
              getAppURL().then((res) => {
                window.location.href = res.iosMy;
              });
            }
          }, 3000);
        } */
      }
    })
    .catch(() => {
      // on cancel
      if (window.android) {
        window.android.didSelectCloseHBSquareAction("");
      } else if (window.webkit) {
        window.webkit.messageHandlers.didSelectCloseHBSquareAction.postMessage(
          ""
        );
      }
    });
}

//   weixin://   会调起微信app

// const token = store.state.Auth
// storage.get("Auth");

router.beforeEach((to, from, next) => {
  if (to.meta.requireLogin) {
    if (window.android || window.webkit) {
      if (!isNaN(Number(to.query.secondId))) {
        storage.set("secondId", to.query.secondId);
        storage.set("thirdId", to.query.thirdId);
      }

      if (store.state.Auth) {
        next();
      } else {
        login();
      }
    } else {
      if (storage.get("Auth")) {
        next();
      } else {
        login();
      }
    }

    /* if (store.state.Auth) {
      next();
    } else {
      login();
    } */
  } else {
    //如果不需要登录认证，就直接访问
    next();
  }
});

export default { login };
