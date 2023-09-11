<template>
  <div class="normal_page f5f5f5">
    <div class="banner">
      <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft"></van-nav-bar>
      <div class="address flex" @click="toAddress">
        <div><svg-icon icon-class="location" class="location" /></div>
        <div class="right">
          <div v-if="address.length === 0">
            <p class="top">设置收货地址</p>
            <p class="bottom">您还未设置收货地址</p>
          </div>
          <div v-else>
            <p class="top">
              <span>{{ address[0].name }}</span><span class="phone">{{ address[0].phoneNumber }}</span>
            </p>
            <p class="bottom two-wrap">
              {{
                address[0].province +
                address[0].city +
                address[0].region +
                address[0].detailAddress
              }}
            </p>
          </div>
        </div>
        <div class="arrow-r">
          <van-icon name="arrow" />
        </div>
      </div>
      <svg-icon icon-class="order-dash" class="order-dash" />
    </div>

    <div class="content overflow-y">
      <div class="lists">
        <div class="list flex" v-for="item in lists" :key="item.id" @click="toDetail(item.productId)">
          <van-image width="9rem" height="9rem" fit="cover" radius="0.4rem" :src="item.productPic" />
          <div class="right">
            <div class="top flex">
              <div class="title two-wrap">{{ item.productName }}</div>
              <div class="price">¥ {{ item.price }}</div>
            </div>
            <div class="bottom flex">
              <div class="sku">{{ item.attr }}</div>
              <div class="num">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>
      </div>

      <van-cell-group>
        <van-cell title="配送方式" value="快递 免邮" />
        <van-cell title="订单备注">
          <template #default>
            <van-form>
              <van-field v-model="remarkVal" placeholder="必填,建议先和客服沟通确认" maxlength="20" input-align="right"
                :rules="[{ required: true }]" /></van-form>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <van-submit-bar :price="price" button-text="提交订单" @submit="onSubmit">
      <template #default>
        <div class="total">共{{ total }}件</div>
      </template>
    </van-submit-bar>
  </div>
</template>
<script>
import {
  createOrder,
  generateOrder,
  getAuthentication,
  getChooseService,
} from "@/service";
export default {
  data() {
    return {
      price: 0,
      total: 0,
      directClearing: false, //是否直接结算
      lists: [],
      address: [],
      remarkVal: "",
    };
  },
  mounted() {
    if (this.$route.query.isDetail) {
      this.getData(this.$route.query);
    } else if (this.$route.query.isCart) {
      this.getData({
        isCart: this.$route.query.isCart,
        cartIds: JSON.parse(this.$route.query.cartIds),
      });
    }

    this.isAuthentication();
    this.isChooseService();

    this.remarkVal = this.$route.query.remarkVal;
  },
  methods: {
    onClickLeft() {
      this.$dialog
        .confirm({
          message: "是否放弃下单？",
          confirmButtonText: "继续下单",
          cancelButtonText: "放弃",
        })
        .then(() => {
          // on confirm addressDel
        })
        .catch(() => {
          // on cancel
          this.$router.replace("/home");
        });
      /* if (this.$route.query.isDetail) {
        this.$router.push({
          path: `/product-detail/${this.$route.query.productId}`,
        });
      } else if (this.$route.query.isCart) {
        this.$router.push({ path: "/cart" });
      } */
    },
    async getData(params) {
      const res = await createOrder(params);
      if (res) {
        const reg = /、$/gi;
        const lists = res.cartPromotionItemList;

        this.price = Number(res.calcAmount.payAmount);
        this.directClearing = res.directClearing;
        this.total = res.numberTotal;

        lists.map((i) => {
          const attr = JSON.parse(i.productAttr);
          let str = "";
          attr.map((j) => {
            str += j.value + "、";
          });
          i.attr = str.replace(reg, "");
        });

        this.lists = lists;

        if (this.$route.query.id_address) {
          this.address = res.memberReceiveAddressList.filter(
            (i) => i.id === Number(this.$route.query.id_address)
          );
        } else {
          this.address = res.memberReceiveAddressList.filter(
            (i) => i.defaultStatus === 1
          );
        }
      }
    },
    async isAuthentication() {
      this.noAuth = await getAuthentication();
    },
    async isChooseService() {
      this.noService = await getChooseService();
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    toAddress() {
      if (!this.noAuth) {
        return this.$dialog
          .alert({
            title: "请先实名认证",
            message: "当前帐号未实名认证，请先在秒音APP完成",
            confirmButtonText: "知道了",
            theme: "round-button",
          })
          .then(() => {
            // on close
          });
      }

      this.$router.push({
        name: "address",
        query: { ...this.$route.query, remarkVal: this.remarkVal },
      });
    },
    async onSubmit() {
      if (!this.noAuth) {
        return this.$dialog
          .alert({
            title: "请先实名认证",
            message: "当前帐号未实名认证，请先在秒音APP完成",
            confirmButtonText: "知道了",
            theme: "round-button",
          })
          .then(() => {
            // on close
          });
      }
      if (!this.noService) {
        return this.$dialog
          .alert({
            title: "请先选择服务中心",
            confirmButtonText: "知道了",
            theme: "round-button",
          })
          .then(() => {
            // on close
            this.$router.push({ name: "service", query: this.$route.query });
          });
      }

      if (this.address.length === 0) {
        return this.$toast("请选择收货地址");
      }

      if (!this.remarkVal) {
        return this.$toast("请输入订单备注");
      }

      let ids = [];
      if (this.$route.query.isDetail) {
        for (let i = 0; i < this.lists.length; i++) {
          ids.push(this.lists[i].id);
        }
      } else if (this.$route.query.isCart) {
        ids = JSON.parse(this.$route.query.cartIds);
      }
      const res = await generateOrder({
        cartIds: ids,
        directClearing: this.directClearing,
        memberReceiveAddressId: this.address[0].id,
        note: this.remarkVal,
      });
      if (res.order) {
        this.$toast.success("下单成功");
        this.$router.push({
          name: "order-commit",
          query: { id: res.order.id, txt: "提交成功，" },
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar {
  background-color: unset;
  .van-icon,
  .van-nav-bar__title {
    color: $white-text;
  }
}
::v-deep.van-hairline--bottom::after {
  border-bottom-width: 0;
}

.banner {
  height: 20rem;
  background: url("../../assets/images/order-bg.png") no-repeat;
  background-size: 100% 100%;
  .address {
    margin: 2rem 1.2rem;
    padding: 1.2rem;
    height: 8rem;
    background: $white-background;
    border-radius: 0.8rem;
    .location {
      width: 2rem;
      height: 2rem;
    }
    .right {
      flex: 2;
      margin-left: 0.6rem;
      .top {
        font-size: $font-size-16;
        .phone {
          padding-left: 1.8rem;
        }
      }
      .bottom {
        padding-top: 1rem;
        color: $color-999;
        font-size: $font-size-14;
      }
    }
    .arrow-r {
      transform: translateY(50%);
    }
  }
  .order-dash {
    width: 100%;
  }
}

.content {
  height: calc(100vh - 250px);
}
.lists {
  margin: 1.2rem;
  background: $white-background;
  border-radius: 0.8rem;
  .list {
    padding: 1.2rem;
    margin: 1.2rem 0;
    .right {
      flex: 2;
      margin-left: 0.8rem;
      .top {
        justify-content: space-between;
        font-size: $font-size-14;
        .title {
          flex: 2;
          line-height: 1.8rem;
        }
        .price {
          font-weight: 600;
          color: $color-price;
        }
      }
      .bottom {
        margin-top: 1rem;
        justify-content: space-between;
        color: $color-999;
        .sku {
          flex: 2;
        }
      }
    }
  }
}

.van-cell-group {
  margin: 1.2rem;
  .van-cell {
    align-items: center;
    .van-cell__value {
      flex: 2;
    }
  }
}

.total {
  transform: translateY(2px);
}
</style>
