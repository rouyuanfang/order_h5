<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-nav-bar
      title="消息中心"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right>
        <svg-icon icon-class="clean" class="clean" />
      </template>
    </van-nav-bar>
    <div
      v-if="
        lists_system.length === 0 &&
        lists_order.length === 0 &&
        lists_coupon.length === 0
      "
      class="empty"
    >
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div>

    <div
      v-if="lists_system.length > 0"
      class="lists flex"
      @click="jumpTo('/notice-system')"
    >
      <div><svg-icon icon-class="notice-system" class="notice-system" /></div>
      <div class="list">
        <div class="top flex-between">
          <p class="title">系统通知</p>
          <p class="date">{{ lists_system[0].sendDate }}</p>
        </div>
        <div class="bottom flex-between">
          <div class="desc single-wrap">
            {{ lists_system[0].content }}
          </div>
          <div v-if="sLength"><van-badge :content="sLength" /></div>
        </div>
      </div>
    </div>

    <div
      v-if="lists_order.length > 0"
      class="lists flex"
      @click="jumpTo('/notice-order')"
    >
      <div><svg-icon icon-class="notice-order" class="notice-system" /></div>
      <div class="list">
        <div class="top flex-between">
          <p class="title">订单通知</p>
          <p class="date">{{ lists_order[0].sendDate }}</p>
        </div>
        <div class="bottom flex-between">
          <div class="desc single-wrap">
            {{ lists_order[0].content }}
          </div>
          <div v-if="oLength"><van-badge :content="oLength" /></div>
        </div>
      </div>
    </div>

    <div
      v-if="lists_coupon.length > 0"
      class="lists flex"
      @click="jumpTo('/notice-coupon')"
    >
      <div><svg-icon icon-class="notice-coupon" class="notice-system" /></div>
      <div class="list">
        <div class="top flex-between">
          <p class="title">卡券通知</p>
          <p class="date">{{ lists_coupon[0].sendDate }}</p>
        </div>
        <div class="bottom flex-between">
          <div class="desc single-wrap">
            {{ lists_coupon[0].content }}
          </div>
          <div v-if="cLength"><van-badge :content="cLength" /></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getUserInfo, noticeSystemList, noticeSystemRead } from "@/service";
export default {
  data() {
    return {
      badge_show: false,
      lists_system: [],
      lists_order: [],
      lists_coupon: [],
      sLength: 0,
      oLength: 0,
      cLength: 0,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      const info = await getUserInfo();
      const res = await noticeSystemList({ id: info.id });
      if (!res) return;

      for (let i = 0; i < res.length; i++) {
        if (res[i].type === 1) {
          this.lists_system.push(res[i]);
        } else if (res[i].type === 2) {
          this.lists_order.push(res[i]);
        } else if (res[i].type === 3) {
          this.lists_coupon.push(res[i]);
        }
      }

      if (this.lists_system.length > 0) {
        for (let i = 0; i < this.lists_system.length; i++) {
          if (this.lists_system[i].status === 0) {
            this.sLength++;
          }
        }
      }
      if (this.lists_order.length > 0) {
        for (let i = 0; i < this.lists_order.length; i++) {
          if (this.lists_order[i].status === 0) {
            this.oLength++;
          }
        }
      }
      if (this.lists_coupon.length > 0) {
        for (let i = 0; i < this.lists_coupon.length; i++) {
          if (this.lists_coupon[i].status === 0) {
            this.cLength++;
          }
        }
      }
    },
    async onClickRight() {
      const res = await noticeSystemRead();
      if (res) {
        this.$toast.success("全部已读");
        // this.getData();
        this.sLength = 0;
        this.oLength = 0;
        this.cLength = 0;
      }
    },
    jumpTo(path) {
      this.$router.push(path);
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
.clean {
  width: 1.8rem;
  height: 1.8rem;
}
.lists {
  align-items: center;
  margin: 1.2rem 0;
  padding: 1.2rem;
  background-color: $white-background;
  .notice-system {
    width: 5rem;
    height: 5rem;
    margin-right: 0.8rem;
  }
  .list {
    width: calc(100% - 6rem);
  }
  .top {
    margin-bottom: 0.6rem;
  }
  .title {
    font-size: $font-size-16;
  }
  .date,
  .bottom {
    color: $color-999;
    font-size: $font-size-12;
    .desc {
      width: 80%;
    }
  }
}
</style>
