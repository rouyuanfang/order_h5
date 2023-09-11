import axios from "axios";
import { Toast } from "vant";
import storage from "good-storage";
import store from "@/store";
//  console.log(store);


axios.defaults.baseURL = process.env.VUE_APP_URL;

if (storage.get("Auth")) {
  axios.defaults.headers.common["Authorization"] = storage.get("Auth");
} else {
  axios.interceptors.request.use((config) => {
    config.headers["Authorization"] = store.state.Auth;
    return config;
  });
}

export function sendHttp(url, method, params, contentType) {
  return axios[method](url, params, contentType)
    .then((res) => {
      const serverData = res.data;
      if (serverData.code === 200) {
        // Toast(serverData.message);
        return serverData.data;
      } else {
        Toast(serverData.message || serverData.code);
        return false;
      }
    })
    .catch((e) => {
      Toast(e);
    });
}
