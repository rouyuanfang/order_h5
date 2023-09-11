<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar :title="title" left-arrow @click-left="onClickLeft" />
    </van-sticky>

    <van-tabs
      sticky
      offset-top="45"
      title-active-color="#F94227"
      line-width="2rem"
      @change="tabChange"
      v-model="activeName"
    >
      <van-tab
        v-for="item in tabs"
        :key="item.name"
        :title="item.title"
        :name="item.name"
      >
        <div v-if="lists.length == 0" class="empty">
          <svg-icon icon-class="no-order" class="no-data" />
          <p>暂无内容～</p>
        </div>
        <div class="content overflow-y" v-else>
          <van-list
            v-model="loading"
            :immediate-check="false"
            :finished="finished"
            offset="30"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div class="lists">
              <div
                class="list"
                v-for="item in lists"
                :key="item.id"
                @click="to_Coupon_Detail(item.id)"
              >
                <div class="top flex-between">
                  <p class="date">下单时间：{{ item.createTime }}</p>
                  <p class="status">
                    <span v-if="item.status === 1">
                      <span v-if="!item.finishDownPayment">
                        <span v-if="item.dualPayment === 1">待支付定金</span>
                        <span v-else>待付款</span>
                      </span>
                      <span v-else-if="!item.finishDualPayment"
                        >待支付尾款</span
                      >
                    </span>
                    <span v-else>{{ status[item.status] }}</span>
                  </p>
                </div>

                <div class="flex">
                  <div>
                    <van-image
                      width="9rem"
                      height="9rem"
                      fit="cover"
                      radius="0.4rem"
                      :src="item.productPic"
                    />
                  </div>
                  <div class="bot">
                    <div class="bot_top">
                      <p class="title two-wrap">
                        {{ item.productName }}
                      </p>
                      <p class="price">￥{{ item.agencyPrice }}</p>
                    </div>
                    <div class="bot_under flex-between">
                      <div class="sku">{{ item.attr }}</div>
                      <div class="num">x{{ item.productQuantity }}</div>
                    </div>
                  </div>
                </div>

                <van-divider />

                <div class="total flex-between">
                  <div>共{{ item.totalQuantity }}件商品</div>
                  <div>
                    <span>合计：</span
                    ><span class="price">￥{{ item.totalAmount }}</span>
                  </div>
                </div>

                <div class="btn">
                  <div
                    v-if="item.status === 1 && !item.finishDownPayment"
                    @click.stop="cancel(item.id)"
                    class="gray"
                  >
                    取消支付
                  </div>
                  <div
                    v-if="item.status === 1"
                    @click.stop="pay(item)"
                    class="red"
                  >
                    立即支付
                  </div>
                  <div
                    v-if="item.status === 2"
                    @click.stop="remind"
                    class="gray"
                  >
                    提醒发放
                  </div>
                  <div
                    v-if="item.status !== 1"
                    @click.stop="toDetail(item.virtualItemList[0].productId)"
                    class="red"
                  >
                    再次购买
                  </div>
                  <div
                    v-if="item.status === 3"
                    @click.stop="check_code(item)"
                    class="red-bg"
                  >
                    出示核销
                  </div>

                  <div
                    @click.stop="toUpload(item.id, 'branch')"
                    class="red-bg"
                    v-if="
                      role === 'branch' &&
                      item.dualPayment === 1 &&
                      item.finishDownPayment === 1 &&
                      !item.companyPayScreen
                    "
                  >
                    上传凭证
                  </div>
                  <div
                    @click.stop="toUpload(item.id, 'branch', 'repeat')"
                    class="red-bg"
                    v-if="
                      role === 'branch' &&
                      item.dualPayment === 1 &&
                      item.needCompanyPayScreen === 1
                    "
                  >
                    修改对公
                  </div>
                  <div
                    @click.stop="toUpload(item.id, 'normal', 'repeat')"
                    class="red-bg"
                    v-if="
                      item.dualPayment === 1 && item.needMemberPayScreen === 1
                    "
                  >
                    修改支付
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>

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
        <center class="num" @click="copy">
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
          <div class="red" @click="copy">复制</div>
        </center>
        <center class="tip">温馨提示：平台客服核实后会核销当前卡券</center>
      </div>
    </van-popup>
  </div>
</template>
<script>
import QRCode from "qrcode";
import {
  CouponList,
  CouponBranchList,
  CouponAbolish,
  CouponWechatUrl,
} from "@/service";
export default {
  data() {
    return {
      title: "",
      activeName: "",
      tabs: [
        { name: -1, title: "全部" },
        { name: 1, title: "待付款" },
        { name: 2, title: "待发放" },
        { name: 3, title: "待使用" },
        { name: 4, title: "已使用" },
      ],
      status: {
        1: "待付款",
        2: "待发放",
        3: "待使用",
        4: "已使用",
        5: "已取消",
      },
      pageOptions: {
        pageNum: 1,
        pageSize: 15,
      },
      loading: false,
      finished: false,
      lists: [],
      code_show: false,
      num_show: false,
      code: "",
      code_img: "",
      role: "",
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.activeName = this.$route.query.activeName;
    this.role = this.$route.query.role;

    if (this.role === "branch") {
      this.title = "分部卡券";
    } else if (this.role === "normal") {
      this.title = "我的卡券";
    }
    this.getData();
  },
  methods: {
    async tabChange(name) {
      this.activeName = name;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    async getData() {
      let methodName = this.role === "branch" ? CouponBranchList : CouponList;
      const reg = /、$/gi;

      const res = await methodName({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        status: this.activeName,
      });
      if (!res) {
        return (this.lists = []);
      }
      if (!res.list) {
        res.list = [];
      }

      if (this.pageOptions.pageNum === 1) {
        this.lists = res.list;
      } else {
        this.lists = this.lists.concat(res.list);
      }
      this.loading = false;
      this.pageOptions.pageNum++;
      if (!res.list || res.list.length === 0) {
        this.finished = true;
      }

      if (this.lists.length > 0) {
        this.lists.map((i) => {
          const attr = JSON.parse(i.productAttr);
          let str = "";
          attr.map((k) => {
            str += k.value + "、";
          });
          i.attr = str.replace(reg, "");
        });
      }
    },
    onLoad() {
      this.getData();
    },
    onClickLeft() {
      this.$router.back();
    },
    to_Coupon_Detail(id) {
      this.$router.push({
        name: "coupon-detail",
        query: { id, role: this.role },
      });
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    copy() {
      this.$copyText(this.code).then(() => this.$toast.success("复制成功"));
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
            this.loading = true;
            this.finished = false;
            this.pageOptions.pageNum = 1;
            this.getData();
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
        /* const res = await CouponWechatUrl({
          orderId: item.id,
        });
        if (res) {
          location.href = res;
        } */
        this.$router.push({
          name: "coupon-detail",
          query: { id: item.id, role: this.role },
        });
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

.content {
  height: calc(100vh - 90px);
}

.lists {
  .list {
    padding: 1.2rem;
    margin: 1.2rem;
    border-radius: 1.2rem;
    background-color: $white-background;
    .top {
      margin: 1.2rem 0;
      font-size: $font-size-14;
      .status {
        color: $color-price;
      }
    }
    .bot {
      flex: 2;
      margin-left: 0.8rem;
      &_top {
        display: flex;
        justify-content: space-between;
        font-size: $font-size-14;
        color: $color-333;
        line-height: 1.8rem;
        .title {
          flex: 2;
        }
        .price {
          font-weight: bold;
        }
      }
      &_under {
        margin-top: 1rem;
        color: $color-999;
        .sku {
          flex: 2;
        }
      }
    }
    .total {
      color: $color-666;
      .price {
        color: $color-333;
        font-size: $font-size-18;
      }
    }
    .btn {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 1rem 0;
      gap: 0.6rem;
      div {
        width: 6.8rem;
        height: 2.6rem;
        line-height: 2.6rem;
        text-align: center;
        border-radius: 1.2rem;
      }
      .red {
        color: $color-price;
        border: 1px solid $color-price;
      }
      .gray {
        color: $color-999;
        border: 0.1rem solid #bbbbbb;
      }
      .red-bg {
        background-color: $color-price;
        color: $white-text;
      }
    }
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
