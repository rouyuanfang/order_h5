<template>
  <div class="tabbar_page f5f5f5">
    <van-sticky>
      <van-nav-bar
        title="购物车"
        :right-text="rightText"
        @click-right="onClickRight"
      >
      </van-nav-bar>
    </van-sticky>

    <div
      v-if="valid_lists.length === 0 && invalid_lists.length === 0"
      class="empty"
    >
      <svg-icon icon-class="no-cart" class="no-data" />
      <p>购物车空空如也～</p>
    </div>

    <div class="lists" v-if="valid_lists.length > 0">
      <div
        class="list flex"
        v-for="item in valid_lists"
        :key="item.id"
        @click="toDetail(item.productId)"
      >
        <van-checkbox
          checked-color="#F94227"
          v-model="item.checked"
          @change="changeCheckbox(item)"
          @click.native="$event.stopPropagation()"
        ></van-checkbox>
        <van-image
          width="10rem"
          height="10rem"
          radius="0.4rem"
          fit="cover"
          :src="item.productPic"
        />
        <div class="content">
          <div class="title two-wrap">{{ item.productName }}</div>
          <div class="sku">{{ item.attr }}</div>
          <div class="bot flex-between">
            <div class="price">
              <span class="icon">￥</span>
              <span>
                <span class="large">{{ item.price_L }}</span>
                <span>.{{ item.price_R }}</span>
              </span>
            </div>
            <van-stepper
              integer
              v-model="item.quantity"
              :max="item.stock"
              @change="changeStep(item)"
              @click.native="$event.stopPropagation()"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="lists invalid" v-if="invalid_lists.length > 0">
      <div class="top flex-between">
        <div class="left">失效商品（{{ invalid_lists.length }}）</div>
        <div class="right" @click="clear_invalid">
          <svg-icon icon-class="clean" class="clean" />
          <span>清空失效商品</span>
        </div>
      </div>
      <div class="list flex" v-for="item in invalid_lists" :key="item.id">
        <div class="btn">
          <div class="txt">失效</div>
        </div>
        <van-image
          width="10rem"
          height="10rem"
          radius="0.4rem"
          fit="cover"
          :src="item.productPic"
        />
        <div class="content">
          <div class="title two-wrap">{{ item.productName }}</div>
          <div class="sku">{{ item.attr }}</div>
        </div>
      </div>
    </div>

    <van-submit-bar :price="price" :button-text="btnTxt" @submit="onSubmit">
      <van-checkbox
        checked-color="#F94227"
        v-model="all_checked"
        @change="all_changeCheckbox"
        >全选</van-checkbox
      >
    </van-submit-bar>

    <van-tabbar
      route
      v-model="active"
      active-color="#F94227"
      inactive-color="#999999"
    >
      <van-tabbar-item
        v-for="item in tabs"
        :key="item.path"
        replace
        :to="item.path"
        :badge="item.active === 'car' ? cartNum() : ''"
      >
        <span>{{ item.title }}</span>
        <template #icon="props">
          <svg-icon
            :icon-class="props.active ? item.active : item.inactive"
            id="tab-icon"
          />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>
import { cartList, cartDel, card_CRUD } from "@/service";
export default {
  data() {
    return {
      active: 1,
      tabs: [
        {
          title: "首页",
          path: "/home",
          active: "home",
          inactive: "home-inactive",
        },
        {
          title: "购物车",
          path: "/cart",
          active: "car",
          inactive: "car-inactive",
        },
        {
          title: "我的",
          path: "/mine",
          active: "mine",
          inactive: "mine-inactive",
        },
      ],

      rightText: "管理",
      btnTxt: "去结算",
      price: 0,
      valid_lists: [],
      invalid_lists: [],
      all_checked: false,
      isDel: false,
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    cartNum() {
      return this.$store.state.cartNum > 99 ? "99+" : this.$store.state.cartNum;
    },
    async getData() {
      const res = await cartList();
      if (!res) return;
      const reg = /、$/gi;

      res.valid.map((i) => {
        i.checked = false;

        i.price_L = i.price.split(".")[0];
        i.price_R = i.price.split(".")[1];

        const attr = JSON.parse(i.productAttr);
        let str = "";
        attr.map((j) => {
          str += j.value + "、";
        });
        i.attr = str.replace(reg, "");
      });
      res.invalid.map((i) => {
        const attr = JSON.parse(i.productAttr);
        let str = "";
        attr.map((j) => {
          str += j.value + "、";
        });
        i.attr = str.replace(reg, "");
      });

      this.valid_lists = res.valid;
      this.invalid_lists = res.invalid;

      const num = this.valid_lists.reduce((total, i) => {
        return total + i.quantity;
      }, 0);
      this.$store.commit("setCartNum", num);
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    clear_invalid() {
      const ids = [];
      for (let i = 0; i < this.invalid_lists.length; i++) {
        ids.push(this.invalid_lists[i].id);
      }
      this.$dialog
        .confirm({
          message: "确定清空失效商品？",
        })
        .then(async () => {
          // on confirm
          const res = await cartDel(ids);
          if (res) {
            this.$toast.success("清空成功");
            this.getData();
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    async changeStep(item) {
      let price = 0;

      await card_CRUD({
        id: item.id,
        quantity: item.quantity,
      });

      for (let i = 0; i < this.valid_lists.length; i++) {
        if (this.valid_lists[i].checked) {
          price += this.valid_lists[i].price * this.valid_lists[i].quantity;
        }
      }
      this.price = price;

      const num = this.valid_lists.reduce((total, i) => {
        return total + i.quantity;
      }, 0);
      this.$store.commit("setCartNum", num);
    },
    changeCheckbox(item) {
      const isAll = this.valid_lists.every((i) => i.checked === true);
      if (isAll) {
        this.all_checked = true;
      }
      for (let i = 0; i < this.valid_lists.length; i++) {
        if (item.id === this.valid_lists[i].id) {
          if (item.checked) {
            this.price +=
              this.valid_lists[i].price * this.valid_lists[i].quantity;
          }
          if (!item.checked) {
            this.price -=
              this.valid_lists[i].price * this.valid_lists[i].quantity;
          }
        }
      }
    },
    all_changeCheckbox(checked) {
      if (checked) {
        for (let i = 0; i < this.valid_lists.length; i++) {
          this.valid_lists[i].checked = true;
        }
      } else {
        for (let i = 0; i < this.valid_lists.length; i++) {
          this.valid_lists[i].checked = false;
        }
      }
    },
    onClickRight() {
      if (!this.isDel) {
        this.rightText = "完成";
        this.btnTxt = "删除";
        this.isDel = true;
      } else {
        this.rightText = "管理";
        this.btnTxt = "去结算";
        this.isDel = false;
      }
    },
    async onSubmit() {
      const ids = [];
      for (let i = 0; i < this.valid_lists.length; i++) {
        if (this.valid_lists[i].checked) {
          ids.push(this.valid_lists[i].id);
        }
      }
      if (ids.length === 0) {
        return this.$toast("请选择商品");
      }
      if (this.isDel) {
        this.$dialog
          .confirm({
            message: "确定删除商品？",
          })
          .then(async () => {
            // on confirm
            const res = await cartDel(ids);
            if (res) {
              for (let i = 0; i < this.valid_lists.length; i++) {
                if (this.valid_lists[i].checked) {
                  this.price -=
                    this.valid_lists[i].price * this.valid_lists[i].quantity;
                }
              }
              this.$toast.success("删除成功");
              this.getData().then(() => {
                if (this.valid_lists.length === 0) {
                  this.all_checked = false;
                }
              });
            }
          })
          .catch(() => {
            // on cancel
          });
      } else {
        this.$router.push({
          name: "order-comfirm",
          query: { isCart: true, cartIds: JSON.stringify(ids) },
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.van-hairline--top-bottom::after {
  border-width: 0;
}

#tab-icon {
  width: 2.8rem;
  height: 2.8rem;
}
.van-tabbar-item__text {
  span {
    font-weight: bold;
  }
}
::v-deep.van-tabbar-item .van-info {
  margin-top: 6px;
}

::v-deep.van-nav-bar {
  .van-nav-bar__text {
    color: #333;
  }
}
.van-submit-bar {
  bottom: 50px;
}

// .cart{
//   height: calc(100vh - 120px);
//   overflow-y: scroll;
// }

.lists {
  margin: 1.2rem;
  margin-bottom: 60px;
  border-radius: 1.2rem;
  background-color: $white-background;
  .top {
    padding: 1.2rem;
    .left {
      color: $color-333;
      font-size: $font-size-16;
    }
    .right {
      color: $color-666;
      font-size: $font-size-14;
    }
    .clean {
      width: 1.8rem;
      height: 1.8rem;
      margin-right: 0.4rem;
      vertical-align: text-bottom;
    }
  }
  .list {
    margin: 1.2rem;
    padding: 1.2rem 0;
    .btn {
      transform: translateY(50%);
      .txt {
        width: 2.8rem;
        height: 1.6rem;
        line-height: 1.6rem;
        padding: 0 0.2rem;
        background-color: #ccc;
        border-radius: 0.8rem;
        color: $white-text;
        font-size: $font-size-12;
      }
    }
    .van-image {
      flex: 1;
      margin: 0 1.2rem;
    }
    .content {
      flex: 2;
      .title {
        margin-bottom: 1.2rem;
        line-height: 2rem;
        font-size: $font-size-14;
        color: $color-333;
      }
      .sku {
        color: $color-999;
      }
      .bot {
        margin-top: 2rem;
        .price {
          font-weight: bold;
          color: $color-price;
          .large {
            font-size: 2.2rem;
          }
        }
      }
    }
  }
}

.lists.invalid {
  margin-bottom: 8rem;
}
</style>
