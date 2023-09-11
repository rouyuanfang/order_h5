<template>
  <div>
    <van-nav-bar
      title="物流信息"
      left-arrow
      @click-left="onClickLeft"
    ></van-nav-bar>

    <div v-if="lists.length == 0" class="empty">
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div>

    <div v-else>
      <van-notice-bar
        v-if="lists.length"
        color="#F94227"
        background="#FFE7E3"
        :text="lists.length + '个包裹已发出'"
      />

      <div class="lists">
        <div
          class="list"
          v-for="item in lists"
          :key="item.id"
          @click="toStep(item.id)"
        >
          <div class="top">
            <span class="name">{{ item.shipperName }}</span>
            <span class="num">
              {{ item.logisticCode }}
            </span>
          </div>
          <div class="mid">
            <span v-if="item.traces && item.traces.length">
              {{ item.traces[item.traces.length - 1].acceptStation }}
            </span>
            <span v-else>商家已发货，等到快递员揽件</span>
          </div>
          <div class="bot">
            <van-image
              width="8rem"
              height="8rem"
              radius="0.4rem"
              fit="cover"
              :src="item.productPic"
            />
            <p class="num">共{{ item.productQuantity }}件商品</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getLogics } from "@/service";
export default {
  data() {
    return {
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      lists: [],
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const res = await getLogics({ orderId: this.$route.params.id });
      this.lists = res;
    },
    toStep(id) {
      this.$router.push({
        name: "order-step",
        query: { fId: this.$route.params.id, cId: id },
      });
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

.list {
  padding: 0 2rem;
  .top {
    padding: 1.2rem 0 0.8rem 0;
    color: $color-999;
    .num {
      padding-left: 1rem;
    }
  }
  .mid {
    color: $color-333;
  }
  .bot {
    .van-image {
      margin: 1.2rem 0 0.4rem 0;
    }
    .num {
      color: $color-999;
      padding: 0 0 1.2rem 1.4rem;
    }
  }
}
</style>
