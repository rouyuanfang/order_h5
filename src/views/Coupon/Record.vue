<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar title="核销记录" left-arrow @click-left="onClickLeft">
      </van-nav-bar>
    </van-sticky>

    <div v-if="lists.length == 0" class="empty">
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div>
    <van-list
      v-else
      v-model="loading"
      :immediate-check="false"
      :finished="finished"
      offset="30"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="lists">
        <div class="list" v-for="item in lists" :key="item.id">
          <div class="top flex">
            <van-image
              width="6.8rem"
              height="6.8rem"
              :radius="4"
              fit="cover"
              :src="item.productPic"
            />
            <div class="rig">
              <p class="title single-wrap">{{ item.productName }}</p>
              <div class="num flex" @click="copy(item.ticketCode)">
                <span>核销码编号：{{ item.ticketCode }}</span>
                <svg-icon icon-class="order-copy" class="copy" />
              </div>
              <div class="desc flex-around">
                <p class="name single-wrap">{{ item.verifyAdminName }}</p>
                <p class="nickname single-wrap">{{ item.nickName }}</p>
                <p>{{ item.phone }}</p>
              </div>
            </div>
          </div>
          <div class="bot flex-between">
            <div class="date">{{ item.useDate }}</div>
            <div class="status">{{ type[item.verifyWay] }}</div>
          </div>
        </div>
      </div>
    </van-list>
  </div>
</template>
<script>
import { CouponRecord } from "@/service";
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
      type: {
        1: "后台核销",
        2: "扫码核销",
      },
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
      const res = await CouponRecord({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
      });
      if (!res) {
        return (this.lists = []);
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
    },
    onLoad() {
      this.getData();
    },
    onClickLeft() {
      this.$router.back();
    },
    copy(code) {
      this.$copyText(code).then(() => this.$toast.success("复制成功"));
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

.lists {
  margin: 0 1.2rem;
  .list {
    margin: 1.2rem 0;
    padding: 1.2rem;
    border-radius: 1.2rem;
    background-color: $white-background;
    .top {
      align-items: center;
      .van-image {
        flex: 0 0 6.8rem;
      }
      .rig {
        width: 77%;
        margin-left: 1rem;
        .title {
          color: $color-333;
          font-size: $font-size-16;
        }

        .copy {
          width: 2rem;
          height: 2rem;
        }
      }
    }
    .num,
    .date,
    .desc {
      color: $color-999;
      font-size: $font-size-14;
    }
    .num {
      align-items: center;
      margin: 0.6rem 0 1rem 0;
    }
    .desc {
      .name {
        flex: 1;
      }
      .nickname {
        flex: 2;
        margin: 0 1rem;
      }
    }
    .bot {
      margin-top: 1rem;
      .status {
        color: #17cd3a;
        font-size: $font-size-14;
      }
    }
  }
}
</style>
