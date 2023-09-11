<template>
  <div class="normal_page overflow-y f5f5f5" :class="{ app_page: isAndroid }">
    <van-nav-bar title="订单通知" left-arrow @click-left="onClickLeft">
    </van-nav-bar>
    <div class="lists" v-for="item in lists" :key="item.id">
      <center class="date">{{ item.sendDate }}</center>
      <div class="list" @click="toDetail(item.url, item.userType)">
        <div class="top">{{ item.title }}</div>
        <div class="bottom" v-html="item.content"></div>
      </div>
    </div>
  </div>
</template>
<script>
import { getUserInfo, noticeSystemList, noticeType } from "@/service";
export default {
  data() {
    return {
      lists: [],
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.getData();
    this.getType();
  },
  methods: {
    async getType() {
      await noticeType({ type: 2 });
    },
    async getData() {
      const info = await getUserInfo();
      const res = await noticeSystemList({ id: info.id });
      if (!res) return;

      for (let i = 0; i < res.length; i++) {
        if (res[i].type === 2) {
          this.lists.push(res[i]);
        }
      }
    },
    onClickLeft() {
      this.$router.back();
    },
    toDetail(url, userType) {
      const id = url.split("=")[1];
      const role = userType === 1 ? "branch" : "normal";
      this.$router.push({ name: "order-detail", query: { id, role } });
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}
.lists {
  margin: 2rem 0 1rem 0;
  center {
    color: $color-999;
  }
  .list {
    margin: 2.2rem 1.2rem;
    padding: 1.2rem;
    border-radius: 1.2rem;
    background-color: $white-background;
    .top {
      font-size: $font-size-16;
      padding-bottom: 2.2rem;
    }
    .bottom {
      font-size: $font-size-14;
      color: $color-999;
      line-height: 2rem;
      white-space: pre-line;
    }
  }
}
</style>
