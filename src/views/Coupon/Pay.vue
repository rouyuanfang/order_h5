<template>
  <div :class="{ app_page: isAndroid }">
    <div class="banner">
      <center class="title">支付成功</center>
      <center class="sub-title">感谢您的购买</center>
    </div>

    <center class="price">¥{{ detail.lastPaymentPaid }}</center>

    <van-cell-group>
      <van-cell title="订单编号" :value="detail.orderSn" />
      <van-cell title="下单时间" :value="detail.createTime" />
      <van-cell title="支付方式" value="转账支付" />
    </van-cell-group>

    <div class="btn flex-around">
      <div @click="toHome" class="left">返回首页</div>
      <div @click="toDetail" class="right">查看订单</div>
    </div>

    <div class="tip flex">
      <div>
        <svg-icon icon-class="commit-safe" class="commit-safe" />
      </div>
      <p>
        安全提醒：秒音商家不会以任何理由要求您提供银行卡信息或支付额外费用，请谨防钓鱼链接或诈骗电话
      </p>
    </div>
  </div>
</template>
<script>
import storage from "good-storage";
import { CouponDetail } from "@/service";
export default {
  data() {
    return {
      routeId: 0,
      detail: {},
    };
  },
  mounted() {
    this.routeId = this.$route.query.id;
    this.getData();
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  methods: {
    async getData() {
      this.detail = await CouponDetail({
        orderId: this.routeId,
      });
    },
    toHome() {
      if (window.android || window.webkit) {
        this.$router.push({
          name: "sort-sub",
          query: {
            secondId: storage.get("secondId"),
            thirdId: storage.get("thirdId"),
          },
        });
      } else {
        this.$router.push("/home");
      }
    },
    toDetail() {
      this.$router.push({ name: "coupon-detail", query: { id: this.routeId } });
    },
  },
};
</script>
<style lang="scss" scoped>
.banner {
  background: url("../../assets/images/order-pay.png") no-repeat;
  background-size: 100% 100%;
  .title,
  .sub-title {
    color: $white-text;
  }
  .title {
    padding-top: 20rem;
    font-size: 2.2rem;
  }
  .sub-title {
    padding: 1rem 0 2.8rem;
    font-size: $font-size-14;
  }
}

.price {
  font-size: 3.4rem;
  padding: 2rem 0;
}

.van-cell__value {
  flex: 2;
}

.btn {
  margin-top: 2rem;
  div {
    width: 12rem;
    height: 3.2rem;
    line-height: 3.2rem;
    text-align: center;
    border-radius: 1.8rem;
  }
  .left {
    color: $color-price;
    border: 1px solid #f94227;
  }
  .right {
    border: 0.1rem solid #bbbbbb;
  }
}

.tip {
  margin: 2rem;
  color: $color-999;
  .commit-safe {
    width: 1.4rem;
    height: 1.4rem;
  }
  p {
    line-height: 1.8rem;
  }
}
</style>
