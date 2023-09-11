<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft"></van-nav-bar>

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

    <van-popup v-model="pay_show" closeable round position="bottom" @click-close-icon="close">
      <div class="pay">
        <center class="price">
          ￥<span>{{ price }}</span>
        </center>
        <van-cell-group>
          <van-cell title="微信" is-link>
            <template #icon>
              <svg-icon icon-class="wechat" class="cell-icon" />
            </template>
            <template #right-icon>
              <van-icon name="success" color="#F94227" />
            </template>
          </van-cell>
        </van-cell-group>

        <van-button @click="wechat_pay" color="#F94227" round block>确认支付</van-button>
      </div>
    </van-popup>
  </div>
</template>
<script>
import {
  createOrder,
  generateOrder,
  getAuthentication,
  getChooseService,
  CouponPayStatus,
} from "@/service";
export default {
  data() {
    return {
      price: 0,
      total: 0,
      directClearing: false, //是否直接结算
      lists: [],
      remarkVal: "",
      pay_show: false,
      wechatUrl: "",
      timer: null,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.getData(this.$route.query);
    this.isAuthentication();
    this.isChooseService();
  },
  destroyed() {
    clearInterval(this.timer);
    this.timer = null;
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
          this.$router.back();
          // this.$router.replace("/home");
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

      if (!this.remarkVal) {
        return this.$toast("请输入订单备注");
      }

      let ids = [];
      for (let i = 0; i < this.lists.length; i++) {
        ids.push(this.lists[i].id);
      }

      const res = await generateOrder({
        cartIds: ids,
        directClearing: this.directClearing,
        memberReceiveAddressId: 0,
        note: this.remarkVal,
      });
      if (res.order) {
        this.pay_show = true;
        this.$store.state.id_coupon_pay = res.order.id;
        this.$store.state.isFinalPay = res.order.dualPayment;
        this.wechatUrl = res.weixinPayH5Url;

        clearInterval(this.timer);
        this.timer = null;

        this.timer = setInterval(() => {
          this.isPay(res.order.id);
        }, 1000);
      }
    },
    close() {
      return this.$dialog
        .confirm({
          title: "您真的要退出支付吗",
          message: "您的订单已下单成功，如未支付将被取消，请尽快完成支付。",
          confirmButtonText: "继续支付",
          cancelButtonText: "暂不支付",
          confirmButtonColor: "#F94227",
        })
        .then(() => {
          // on close
          location.href = this.wechatUrl;
        })
        .catch(() => {
          // on cancel
          this.$router.push({
            name: "coupon-detail",
            query: { id: this.$store.state.id_coupon_pay },
          });
        });
    },
    async wechat_pay() {
      location.href = this.wechatUrl;
    },
    async isPay(orderId) {
      const res = await CouponPayStatus({
        orderId,
      });
      if (res) {
        clearInterval(this.timer);
        this.timer = null;
        this.pay_show = false;

        if (this.$store.state.isFinalPay) {
          return this.$dialog
            .confirm({
              title: "定金支付成功",
              message: "您已成功支付定金，请转账尾款后上传支付截图",
              confirmButtonText: "支付尾款",
              cancelButtonText: "暂不",
              confirmButtonColor: "#F94227",
            })
            .then(() => {
              // on close
              this.$router.push({
                name: "coupon-upload",
                query: { id: this.$store.state.id_coupon_pay, role: "normal" },
              });
            })
            .catch(() => {
              // on cancel
              this.$router.push({
                name: "coupon-detail",
                query: { id: this.$store.state.id_coupon_pay },
              });
            });
        } else {
          return this.$dialog
            .alert({
              title: "支付成功",
              confirmButtonText: "知道了",
              theme: "round-button",
            })
            .then(() => {
              // on close
              this.$router.push({
                name: "coupon-detail",
                query: { id: this.$store.state.id_coupon_pay },
              });
            });
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar {
  .van-icon {
    color: #000;
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

.pay {
  height: 20rem;
  .price {
    padding-top: 5rem;
    color: #f94227;
    span {
      font-size: 3.8rem;
    }
  }
  .van-cell-group {
    .van-cell {
      .van-cell__title {
        padding-left: 0.4rem;
      }
      .cell-icon {
        width: 2.4rem;
        height: 2.4rem;
      }
    }
  }
  button {
    width: 90%;
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
