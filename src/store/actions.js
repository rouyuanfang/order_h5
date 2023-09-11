import { cartList } from "@/service";
import storage from "good-storage";

export async function getCartNum({ commit }) {
  let token = storage.get("Auth");
  if (!token) return;
  const res = await cartList();
  if (res) {
    const num = res.valid.reduce((total, i) => {
      return total + i.quantity;
    }, 0);
    commit("setCartNum", num);
  }
}
