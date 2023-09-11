<template>
  <div class="normal_page overflow-y f5f5f5">
    <van-sticky>
      <van-nav-bar
        title="查看物流"
        left-arrow
        @click-left="onClickLeft"
      ></van-nav-bar>
    </van-sticky>

    <van-cell-group>
      <van-cell title="订单编号" :value="detail.orderSn" />
      <van-cell title="物流公司" :value="detail.shipperName" />
      <van-cell title="物流单号" @click="copy">
        <template #default>
          {{ detail.logisticCode }}
          <svg-icon icon-class="order-copy" class="order-copy" />
        </template>
      </van-cell>
    </van-cell-group>

    <div class="list">
      <div class="top flex">
        <div>
          <van-image
            width="6rem"
            height="6rem"
            radius="0.4rem"
            fit="cover"
            :src="detail.productPic"
          />
        </div>
        <div class="right flex-between">
          <div class="two-wrap">{{ detail.productName }}</div>
          <div class="total">共{{ detail.productQuantity }}件商品</div>
        </div>
      </div>

      <van-steps
        v-if="detail.traces"
        direction="vertical"
        active-color="#323232"
        :active="0"
      >
        <van-step v-for="(item, i) in detail.traces" :key="item.id">
          <template #active-icon v-if="i === 0">
            <svg-icon icon-class="step" class="step" />
          </template>
          <h3>
            {{ item.acceptStation }}
          </h3>
          <p>{{ item.acceptTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>
<script>
import { getLogics } from "@/service";
export default {
  data() {
    return {
      detail: {},
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const res = await getLogics({ orderId: this.$route.query.fId });
      const lists = res.filter((i) => {
        return i.id == this.$route.query.cId;
      });
      this.detail = lists[0];
    },
    copy() {
      this.$copyText(this.lists[0].logisticCode).then(() =>
        this.$toast.success("复制成功")
      );
    },
    onClickLeft() {
      this.$router.back();
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}

.van-cell-group {
  margin: 1.2rem;
  .van-cell__value {
    flex: 3;
    text-align: left;
  }
  .order-copy {
    width: 2rem;
    height: 2rem;
  }
}

.list {
  margin: 1.2rem;
  padding: 1.2rem;
  background-color: $white-background;
  box-shadow: 0 -0.4rem 4rem 0 rgba(204, 204, 204, 0.12);
  border-radius: 2rem 2rem 0 0;
  .right {
    flex: 2;
    margin-left: 1rem;
    .name {
      flex: 2;
    }
    .total {
      color: $color-999;
    }
  }
  // .top {
  //   align-items: center;
  //   .mid {
  //     padding-left: 1rem;
  //     color: $color-333;
  //   }
  // }
}
</style>
