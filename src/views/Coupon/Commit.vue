<template>
  <div :class="{ app_page: isAndroid }">
    <div class="top">
      <div>
        <svg-icon icon-class="commit-success" class="commit-success" />
      </div>
      <div class="title">{{ txt }}请支付</div>
      <van-button @click="toUpload" round color="#F94227">上传凭证</van-button>
      <div class="desc">
        请上传转账记录截图或相关凭证，并保证图片清晰以便客服核对
        <span @click="example_show = true">查看示例</span>
      </div>
    </div>

    <div class="lists">
      <center class="price">¥{{ detail.lastPayment }}</center>
      <van-cell-group>
        <van-cell title="订单编号" :value="detail.orderSn" />
        <van-cell title="下单时间" :value="detail.createTime" />
        <van-cell title="支付方式" value="转账支付" />
      </van-cell-group>
      <div class="tip flex">
        <div><svg-icon icon-class="commit-safe" class="commit-safe" /></div>
        <p>
          安全提醒：秒音商家不会以任何理由要求您提供银行卡信息或支付额外费用，请谨防钓鱼链接或诈骗电话
        </p>
      </div>
      <div class="btn flex-around">
        <div @click="toHome" class="left">返回首页</div>
        <div @click="toDetail" class="right">查看订单</div>
      </div>
    </div>

    <div class="bot flex-center" @click="takePhone">
      <svg-icon icon-class="commit-phone" class="commit-phone" />
      如有相关疑问，可 <span>电话联系</span>您所在服务中
    </div>

    <van-popup v-model="example_show" round position="bottom">
      <div class="example">
        <img src="@/assets/images/pay-example.png" />
        <van-button @click="example_show = false" color="#F94227" round block
          >知道了</van-button
        >
      </div>
    </van-popup>
  </div>
</template>
<script>
import storage from "good-storage";
import { CouponDetail } from "@/service";
export default {
  data() {
    return {
      routeId: 0,
      txt: "",
      detail: {},
      example_show: false,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.routeId = this.$route.query.id;
    this.txt = this.$route.query.txt;

    this.getData();
  },
  methods: {
    async getData() {
      this.detail = await CouponDetail({
        orderId: this.routeId,
      });
    },
    takePhone() {
      window.location.href = "tel://4006301286";
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
      this.$router.push({
        name: "coupon-detail",
        query: { id: this.routeId, role: "normal" },
      });
    },
    toUpload() {
      this.$router.push({
        name: "coupon-upload",
        query: { id: this.routeId, role: "normal" },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 4.6rem;
  .commit-success {
    width: 12rem;
    height: 12rem;
  }
  .van-button {
    padding: 0 3rem;
  }
  .title {
    font-size: 2.2rem;
    font-weight: bold;
    padding: 2rem 0;
  }
  .desc {
    color: $color-999;
    padding: 1rem 0 3rem 0;
    width: 70%;
    font-size: $font-size-14;
    line-height: 2rem;
    span {
      color: $color-price;
    }
  }
}

.lists {
  margin: 0 1.2rem;
  padding: 2rem 1.2rem;
  background: #f5f5f5;
  border-radius: 1.2rem;
  .price {
    font-size: 3.4rem;
    font-weight: bold;
    padding-bottom: 2rem;
  }
  .van-cell-group {
    margin: 2rem 0;
    background-color: unset;
    .van-cell {
      background-color: unset;
      .van-cell__value {
        flex: 2;
      }
    }
  }
  .van-hairline--top-bottom::after,
  .van-cell::after {
    border: none;
  }
  .tip {
    margin: 0.4rem 0 2rem 0;
    color: $color-999;
    .commit-safe {
      width: 1.4rem;
      height: 1.4rem;
    }
    p {
      line-height: 1.8rem;
    }
  }
  .btn {
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
}

.bot {
  padding: 4rem 0;
  text-align: center;
  .commit-phone {
    width: 1.8rem;
    height: 1.8rem;
    margin-right: 0.4rem;
    font-size: $font-size-14;
    color: $color-999;
    vertical-align: text-bottom;
  }
  span {
    padding: 0 0.4rem;
    color: #0088ff;
  }
}

.example {
  img {
    width: 31rem;
    height: 46rem;
    display: block;
    margin: 0 auto;
  }
  button {
    width: 20rem;
    margin: 0 auto;
    margin-bottom: 2rem;
  }
}
</style>
