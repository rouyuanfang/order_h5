<template>
  <div class="normal_page overflow-y f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar title="分部客户管理" left-arrow @click-left="onClickLeft">
      </van-nav-bar>
    </van-sticky>

    <div v-if="lists.length == 0" class="empty">
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div>
    <van-list v-else v-model="loading" :immediate-check="false" :finished="finished" offset="30" finished-text="没有更多了"
      @load="onLoad">
    <div class="lists">
      <div class="list" v-for="item in lists" :key="item.id">
        <div class="top flex">
          <van-image width="6.8rem" height="6.8rem" :radius="4" fit="cover" src="https://img01.yzcdn.cn/vant/cat.jpeg" />
          <div class="rig">
            <div class="flex-between">
              <p>{{item.name}}</p>
              <p style="color: #f94227">已绑定{{item.companyName}}</p>
            </div>
            <p class="single-wrap">{{item.nickname}}</p>
            <p>{{item.phone}}</p>
          </div>
        </div>
        <div class="date">{{item.bindCompanyTime}}</div>
      </div>
    </div>
    </van-list>
  </div>
</template>
<script>
import { branchList } from "@/service";
export default {
  data() {
    return {
      lists: [],
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
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
      const res = await branchList({
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
      // align-items: center;
      margin-bottom: 1rem;
      .van-image {
        flex: 0 0 6.8rem;
      }
      .rig {
        width: 75%;
        margin-left: 1rem;
        p {
          color: $color-333;
          font-size: $font-size-16;
          padding-bottom: 1rem;
        }
      }
    }
    .date {
      color: $color-999;
      font-size: $font-size-14;
    }
  }
}
</style>
