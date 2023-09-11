<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <!-- <van-sticky> -->
    <div class="banner">
      <van-nav-bar
        title="订单详情"
        left-arrow
        @click-left="onClickLeft"
      ></van-nav-bar>
      <div class="status flex-between">
        <div class="left">
          <div class="top">{{ status[detail.status] }}</div>
          <div v-if="detail.status === 1" class="bottom flex-between">
            <svg-icon icon-class="order-time" class="order-time" />剩余时间：
            <van-count-down :time="detail.timeOut" />
          </div>
          <div v-else-if="detail.status === 2" class="bottom">
            已付款，等待商家发货
          </div>
          <div v-else-if="detail.status === 3" class="bottom">
            商家已发货，请等待收货
          </div>
          <div v-else-if="detail.status === 4" class="bottom">
            订单已完成，感谢您的支持
          </div>
          <div v-else-if="detail.status === 5" class="bottom">
            订单已取消，请重新购买
          </div>
        </div>
        <div>
          <svg-icon
            v-if="detail.status === 1"
            icon-class="order-daifukuan"
            class="order-status"
          />
          <svg-icon
            v-else-if="detail.status === 2"
            icon-class="order-daifahuo"
            class="order-status"
          />
          <svg-icon
            v-else-if="detail.status === 3"
            icon-class="order-daishouhuo"
            class="order-status"
          />
          <svg-icon
            v-else-if="detail.status === 4"
            icon-class="order-sign"
            class="order-status"
          />
          <svg-icon
            v-else-if="detail.status === 5"
            icon-class="order-refund"
            class="order-status"
          />
        </div>
      </div>
      <div class="address flex">
        <div><svg-icon icon-class="location" class="location" /></div>
        <div class="right">
          <div>
            <p class="top">
              <span>{{ detail.receiverName }}</span
              ><span class="phone">{{ detail.receiverPhone }}</span>
            </p>
            <p class="bottom two-wrap">
              {{
                detail.receiverProvince +
                detail.receiverCity +
                detail.receiverRegion +
                detail.receiverDetailAddress
              }}
            </p>
          </div>
        </div>
      </div>
      <svg-icon icon-class="order-dash" class="order-dash" />
    </div>
    <!-- </van-sticky> -->

    <div class="content overflow-y">
      <div class="lists">
        <div
          class="list flex"
          v-for="item in detail.orderItemList"
          :key="item.id"
          @click="toDetail(item.productId)"
        >
          <van-image
            width="9rem"
            height="9rem"
            fit="cover"
            radius="0.4rem"
            :src="item.productPic"
          />
          <div class="right">
            <div class="top flex">
              <div class="title two-wrap">{{ item.productName }}</div>
              <div class="price">¥ {{ item.productPrice }}</div>
            </div>
            <div class="bottom flex">
              <div class="sku">{{ item.attr }}</div>
              <div class="num">x{{ item.productQuantity }}</div>
            </div>
          </div>
        </div>
      </div>

      <van-cell-group v-if="detail.payAmount">
        <van-cell title="商品金额" :value="'￥' + detail.totalAmount" />
        <van-cell title="订单运费" value="免邮" />
        <van-cell
          title-class="title_van_cell"
          value-class="price_van_cell"
          v-if="detail.status === 1 || detail.status === 5"
          title="需付款"
          :value="'￥' + detail.payAmount"
        />
        <van-cell
          title-class="title_van_cell"
          value-class="price_van_cell"
          v-else
          title="实付款"
          :value="'￥' + detail.payAmount"
        />
      </van-cell-group>

      <van-cell-group>
        <van-cell title="订单信息">
          <template #icon>
            <svg-icon icon-class="order-info" class="order-info" />
          </template>
        </van-cell>
        <van-cell title="订单编号" :value="detail.orderSn" @click="copy">
          <template #right-icon>
            <svg-icon icon-class="order-copy" class="order-info" />
          </template>
        </van-cell>
        <van-cell title="下单时间" :value="detail.createTime" />
        <van-cell title="订单备注" :value="detail.note" />
      </van-cell-group>

      <div class="btn">
        <div @click="cancel" v-if="detail.status === 1" class="gray">
          取消订单
        </div>
        <div
          @click="del"
          v-if="detail.status === 4 || detail.status === 5"
          class="gray"
        >
          删除订单
        </div>
        <div
          v-if="detail.status === 3 || detail.status === 4"
          class="gray"
          @click.stop="toLogics"
        >
          查看物流
        </div>
        <div
          @click="toUpload('normal')"
          v-if="detail.status === 1"
          class="red-bg"
        >
          立即付款
        </div>
        <div @click="receive" v-if="detail.status === 3" class="red-bg">
          确认收货
        </div>
        <div
          @click="toDetail(detail.orderItemList[0].productId)"
          v-if="detail.status === 4 || detail.status === 5"
          class="red-bg"
        >
          再次购买
        </div>
        <div
          @click="toUpload('branch', 'repeat')"
          v-if="role === 'branch' && detail.needCompanyPayScreen"
          class="red-bg"
        >
          修改对公
        </div>
        <div
          @click="toUpload('normal', 'repeat')"
          v-if="detail.needMemberPayScreen"
          class="red-bg"
        >
          修改支付
        </div>
        <div
          @click.stop="toUpload('branch')"
          v-if="
            role === 'branch' &&
            !detail.companyPayScreen &&
            (detail.status === 2 || detail.status === 3 || detail.status === 4)
          "
          class="red-bg"
        >
          上传凭证
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { detailOrder, receiveOrder, deleteOrder, cancelOrder } from "@/service";
export default {
  data() {
    return {
      routeId: 0,
      cancel_show: false,
      detail: {},
      status: {
        1: "待付款",
        2: "待发货",
        3: "待收货",
        4: "交易完成",
        5: "交易关闭",
      },
      role: "",
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
    this.getData();
  },
  methods: {
    async getData() {
      const reg = /、$/gi;

      const res = await detailOrder({
        orderId: this.routeId,
      });

      res.orderItemList.map((i) => {
        const attr = JSON.parse(i.productAttr);
        let str = "";
        attr.map((j) => {
          str += j.value + "、";
        });
        i.attr = str.replace(reg, "");
      });
      this.detail = res;
    },
    onClickLeft() {
      this.$router.back();
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    copy() {
      this.$copyText(this.detail.orderSn).then(() =>
        this.$toast.success("复制成功")
      );
    },
    toLogics() {
      this.$router.push({ path: `/order-logics/${this.routeId}` });
    },
    cancel() {
      this.$dialog
        .confirm({
          message: "确定取消订单？",
        })
        .then(async () => {
          // on confirm
          const res = await cancelOrder({ orderId: this.routeId });
          if (res) {
            this.$toast.success("取消成功");
            this.$router.push({
              name: "order-list",
              query: { role: this.role, activeName: -1 },
            });
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    del() {
      this.$dialog
        .confirm({
          message: "确定删除订单？",
        })
        .then(async () => {
          // on confirm
          const res = await deleteOrder({ orderId: this.routeId });
          if (res) {
            this.$toast.success("删除成功");
            this.$router.push({
              name: "order-list",
              query: { role: this.role, activeName: -1 },
            });
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    receive() {
      this.$dialog
        .confirm({
          message: "确定已收货？",
        })
        .then(async () => {
          // on confirm
          const res = await receiveOrder({ orderId: this.routeId });
          if (res) {
            this.$toast.success("收货成功");
            this.$router.push({
              name: "order-list",
              query: { role: this.role, activeName: -1 },
            });
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    toUpload(role, repeat) {
      this.$router.push({
        name: "order-upload",
        query: { id: this.routeId, role, repeat },
      });
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
  background: url("../../assets/images/order-bg.png") no-repeat;
  background-size: 100% 100%;
  .status {
    margin: 0 2.4rem;
    .left {
      color: $white-text;
      .top {
        font-size: $font-size-16;
      }
      .bottom {
        padding-top: 0.6rem;
        font-size: $font-size-14;
        .order-time {
          width: 1.6rem;
          height: 1.6rem;
          vertical-align: text-bottom;
          margin-right: 0.4rem;
        }
        .van-count-down {
          color: $white-text;
        }
      }
    }
    .order-status {
      width: 9rem;
      height: 6rem;
    }
  }
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
  }
  .order-dash {
    width: 100%;
  }
}

.content {
  height: calc(100vh - 25rem);
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
  .red-bg {
    background-color: $color-price;
    color: $white-text;
  }
}
</style>
