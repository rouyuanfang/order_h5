<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar title="卡券详情" left-arrow @click-left="onClickLeft" />
    </van-sticky>

    <div class="lists">
      <div class="list">
        <div class="status">
          <span v-if="detail.status === 1">
            <span v-if="!detail.finishDownPayment">
              <span v-if="detail.dualPayment === 1">待支付定金</span>
              <span v-else>待付款</span>
            </span>
            <span v-else-if="!detail.finishDualPayment">待支付尾款</span>
          </span>
          <span v-else>{{ status[detail.status] }}</span>
        </div>
        <div class="subtitle flex">
          <div
            v-if="detail.status === 1 && !detail.finishDownPayment && time_show"
          >
            <span>剩余时间：</span>
            <van-count-down
              :time="detail.timeOut"
              @finish="time_show = false"
            />
          </div>
          <div v-else>{{ subtitle[detail.status] }}</div>
        </div>

        <div v-if="detail.dualPayment && detail.status !== 5">
          <van-steps :active="active" active-color="#F94227">
            <van-step>付定金</van-step>
            <van-step>付尾款</van-step>
          </van-steps>
          <div class="step flex-between">
            <p v-if="!detail.finishDownPayment">
              需微信支付￥{{ detail.downPayment }}
            </p>
            <div v-if="detail.finishDownPayment">
              <p :class="detail.downPaymentPaid ? 'actived' : ''">
                微信支付￥{{ detail.downPaymentPaid }}
              </p>
              <p>{{ detail.paymentTime }}</p>
            </div>

            <p v-if="!detail.finishDualPayment">
              需转账支付￥{{ detail.lastPayment }}
            </p>
            <div v-if="detail.finishDualPayment">
              <p :class="detail.lastPaymentPaid ? 'actived' : ''">
                转账支付￥{{ detail.lastPaymentPaid }}
              </p>
              <p>{{ detail.lastPaymentTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lists">
      <div class="list flex" @click="toDetail(detail.productId)">
        <van-image
          width="9rem"
          height="9rem"
          fit="cover"
          radius="0.4rem"
          :src="detail.productPic"
        />
        <div class="right">
          <div class="top flex">
            <div class="title two-wrap">{{ detail.productName }}</div>
            <div class="price">¥ {{ detail.agencyPrice }}</div>
          </div>
          <div class="bottom flex">
            <div class="sku">{{ detail.attr }}</div>
            <div class="num">x{{ detail.productQuantity }}</div>
          </div>
        </div>
      </div>
    </div>

    <van-cell-group v-if="detail.totalAmount">
      <van-cell title="商品金额" :value="'￥' + detail.totalAmount" />
      <van-cell
        title-class="title_van_cell"
        value-class="price_van_cell"
        v-if="
          (detail.status === 1 || detail.status === 5) &&
          !detail.finishDownPayment
        "
        title="需付款"
        :value="'￥' + detail.downPayment"
      />
      <van-cell
        title-class="title_van_cell"
        value-class="price_van_cell"
        v-else-if="
          (detail.status === 1 || detail.status === 5) &&
          !detail.finishDualPayment
        "
        title="需付款"
        :value="'￥' + detail.lastPayment"
      />
      <van-cell
        title-class="title_van_cell"
        value-class="price_van_cell"
        v-else
        title="实付款"
        :value="'￥' + detail.totalAmount"
      />
    </van-cell-group>

    <van-cell-group>
      <van-cell title="订单信息">
        <template #icon>
          <svg-icon icon-class="order-info" class="order-info" />
        </template>
      </van-cell>
      <van-cell
        title="订单编号"
        :value="detail.orderSn"
        @click="copy(detail.orderSn)"
      >
        <template #right-icon>
          <svg-icon icon-class="order-copy" class="order-info" />
        </template>
      </van-cell>
      <van-cell title="下单时间" :value="detail.createTime" />
      <van-cell title="订单备注" :value="detail.note" />
    </van-cell-group>

    <div class="btn f5f5f5">
      <div
        v-if="detail.status === 1 && !detail.finishDownPayment"
        @click.stop="cancel(detail.id)"
        class="gray"
      >
        取消支付
      </div>
      <div v-if="detail.status === 1" @click.stop="pay(detail)" class="red">
        立即支付
      </div>
      <div v-if="detail.status === 2" @click.stop="remind" class="gray">
        提醒发放
      </div>
      <div
        v-if="detail.status !== 1"
        @click.stop="toDetail(detail.virtualItemList[0].productId)"
        class="red"
      >
        再次购买
      </div>
      <div
        v-if="detail.status === 3"
        @click.stop="check_code(detail)"
        class="red-bg"
      >
        出示核销
      </div>

      <div
        @click.stop="toUpload(detail.id, 'branch')"
        class="red-bg"
        v-if="
          role === 'branch' &&
          detail.dualPayment === 1 &&
          detail.finishDownPayment === 1 &&
          !detail.companyPayScreen
        "
      >
        上传凭证
      </div>
      <div
        @click.stop="toUpload(detail.id, 'branch', 'repeat')"
        class="red-bg"
        v-if="
          role === 'branch' &&
          detail.dualPayment === 1 &&
          detail.needCompanyPayScreen === 1
        "
      >
        修改对公
      </div>
      <div
        @click.stop="toUpload(detail.id, 'normal', 'repeat')"
        class="red-bg"
        v-if="detail.dualPayment === 1 && detail.needMemberPayScreen === 1"
      >
        修改支付
      </div>
    </div>

    <van-popup round v-model="code_show">
      <div class="code-popup coupon-popup">
        <center class="title">卡券核销二维码</center>
        <center>
          <van-image
            width="21rem"
            height="21rem"
            :radius="4"
            fit="cover"
            :src="code_img"
          />
        </center>
        <center class="num" @click="copy(code)">
          <span>核销码编号：{{ code }}</span>
          <svg-icon icon-class="order-copy" class="copy" />
        </center>
        <center class="tip">
          温馨提示：请于核销员前出示卡券核销二维码或告知核销码编号
        </center>
      </div>
    </van-popup>

    <van-popup round v-model="num_show">
      <div class="num-popup coupon-popup">
        <center class="title">卡券核销编码</center>
        <center class="num">
          {{ code }}
        </center>
        <center>
          <div class="red" @click="copy(code)">复制</div>
        </center>
        <center class="tip">温馨提示：平台客服核实后会核销当前卡券</center>
      </div>
    </van-popup>
  </div>
</template>
<script>
import QRCode from "qrcode";
import { CouponDetail, CouponAbolish, CouponWechatUrl } from "@/service";
export default {
  data() {
    return {
      routeId: 0,
      cancel_show: false,
      detail: {},
      status: {
        1: "待付款",
        2: "待发放",
        3: "待使用",
        4: "已使用",
        5: "已取消",
      },
      subtitle: {
        // 1: "待付款",
        2: "已付款，等待平台发放",
        3: "等待核销使用",
        4: "您已核销使用",
        5: "订单已取消",
      },
      role: "",
      active: -1,
      code_show: false,
      num_show: false,
      time_show: true,
      code: "",
      code_img: "",
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.routeId = this.$route.query.id;
    this.role = this.$route.query.role;
    // this.getData();
    this.creatInterval();
  },
  methods: {
    creatInterval() {
      let timer = setInterval(() => {
        this.getData();
      }, 100);
      this.$once("hook:beforeDestroy", () => {
        clearInterval(timer);
      });
    },
    async getData() {
      const reg = /、$/gi;
      let str = "";

      const res = await CouponDetail({
        orderId: this.routeId,
      });

      const attr = JSON.parse(res.productAttr);
      attr.map((j) => {
        str += j.value + "、";
      });
      res.attr = str.replace(reg, "");

      if (res.finishDownPayment && !res.finishDualPayment) {
        this.active = 0;
      } else if (res.finishDualPayment) {
        this.active = 1;
      }
      this.detail = res;
    },
    onClickLeft() {
      this.$router.back();
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    copy(orderSn) {
      this.$copyText(orderSn).then(() => this.$toast.success("复制成功"));
    },
    cancel(orderId) {
      this.$dialog
        .confirm({
          message: "确定取消支付？",
        })
        .then(async () => {
          // on confirm
          const res = await CouponAbolish({ orderId });
          if (res) {
            this.$toast.success("取消成功");
            this.$router.push({
              name: "coupon-list",
              query: { role: this.role, activeName: -1 },
            });
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    remind() {
      this.$dialog
        .alert({
          message: "提醒成功，平台客服核实中，请耐心等待",
          confirmButtonText: "知道了",
          theme: "round-button",
        })
        .then(async () => {
          // on confirm
        });
    },
    check_code(item) {
      this.code = item.ticketCode;
      if (item.virtualItemList.length > 1) {
        this.$router.push({ path: `/coupon-code/${item.id}` });
      } else if (item.qrCodeVerification) {
        QRCode.toDataURL(item.ticketCode)
          .then((url) => {
            this.code_img = url;
          })
          .catch((err) => {
            this.$toast.error(err);
          });
        this.code_show = true;
      } else {
        this.num_show = true;
      }
    },
    async pay(item) {
      if (!item.finishDownPayment) {
        //支付定金
        const res = await CouponWechatUrl({
          orderId: this.routeId,
        });
        if (res) {
          location.href = res;
        }
      } else if (!item.finishDualPayment) {
        //支付尾款
        this.$router.push({
          name: "coupon-commit",
          query: { id: item.id, txt: "提交成功，" },
        });
      }
    },
    toUpload(id, role, repeat) {
      this.$router.push({
        name: "coupon-upload",
        query: { id, role, repeat },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}

.lists {
  margin: 1.2rem;
  background: $white-background;
  border-radius: 0.8rem;
  .status {
    color: $color-333;
    font-size: $font-size-20;
  }
  .subtitle {
    align-items: center;
    padding: 0.8rem 0 1.6rem;
    color: $color-999;
    font-size: $font-size-14;
    .van-count-down {
      color: $color-999;
    }
  }
  .step {
    margin: 0 1rem;
    color: $color-999;
    p {
      padding: 0.2rem 0;
      &.actived {
        color: #f94227;
      }
    }
  }

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
  .van-cell__value {
    flex: 2;
  }
  .title_van_cell {
    font-size: $font-size-16;
  }
  .price_van_cell {
    font-size: $font-size-20;
    color: $color-price;
  }
  .title_van_cell,
  .price_van_cell {
    span {
      font-weight: bold;
    }
  }
  .order-info,
  .order-copy {
    width: 2rem;
    height: 2rem;
  }
}

.btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2rem;
  gap: 0.6rem;
  font-size: 1.2rem;
  div {
    width: 6.8rem;
    height: 2.6rem;
    line-height: 2.6rem;
    text-align: center;
    border-radius: 1.2rem;
  }
  .gray {
    color: $color-999;
    border: 0.1rem solid #bbbbbb;
  }
  .red {
    color: $color-price;
    border: 1px solid $color-price;
  }
  .red-bg {
    background-color: $color-price;
    color: $white-text;
  }
}

.van-popup {
  background-color: unset;
}
.coupon-popup {
  width: 31rem;
  background-image: url("../../assets/images/code-bg.png");
  background-size: 100% 100%;
}
.code-popup {
  height: 44rem;
  .title {
    line-height: 5rem;
    font-size: $font-size-18;
    color: $white-text;
  }
  .van-image {
    margin: 3rem 0;
  }
  .num {
    font-size: $font-size-14;
  }
  .copy {
    width: 2rem;
    height: 2rem;
  }
  .tip {
    padding: 4rem 1.2rem 0;
    line-height: 1.6rem;
    color: $color-999;
  }
}
.num-popup {
  height: 26rem;
  .title {
    line-height: 4rem;
    font-size: $font-size-16;
    color: $white-text;
  }
  .num {
    padding: 3rem 0;
    font-size: 3.6rem;
  }
  .red {
    width: 9rem;
    height: 3rem;
    line-height: 3rem;
    margin-bottom: 7rem;
    color: $color-price;
    font-size: $font-size-14;
    border: 1px solid $color-price;
    border-radius: 1.8rem;
  }
  .tip {
    color: $color-999;
  }
}
</style>
