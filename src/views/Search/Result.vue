<template>
  <div class="normal_page f5f5f5">
    <van-sticky>
      <van-search
        v-model="searchVal"
        show-action
        placeholder="请输入搜索关键词"
        @input="onInput"
        @cancel="jumpTo('/seek')"
      >
        <!-- <template #left>
          <van-icon name="arrow-left" />
        </template> -->
      </van-search>
    </van-sticky>
    <!-- 
      使用van-search清除按钮失效
      官方解释是：Vant 是一个面向移动端的组件库，因此默认只适配了移动端设备
      适配桌面端：npm i '@vant/touch-emulator' -S
      main.js引入 import '@vant/touch-emulator'
     -->

    <van-tabs
      sticky
      offset-top="54"
      title-active-color="#F94227"
      line-width="2rem"
      @change="tabChange"
      @click="tabClick"
      v-model="activeName"
    >
      <van-tab
        v-for="item in tabs"
        :key="item.name"
        :title="item.title"
        :name="item.name"
      >
        <template #title>
          {{ item.title }}
          <span v-if="item.name === 3">
            <svg-icon v-if="up" icon-class="search-up" class="search-icon" />
            <svg-icon v-else icon-class="search-down" class="search-icon" />
          </span>
        </template>
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
            <div
              class="list"
              v-for="item in lists"
              :key="item.id"
              @click="toDetail(item.id)"
            >
              <van-image
                width="100%"
                height="16rem"
                fit="cover"
                :src="item.pic"
              />
              <div class="title two-wrap">
                {{ item.name }}
              </div>
              <div class="bottom flex-between">
                <p class="price">
                  <span class="icon">￥</span><span>{{ item.price }}</span>
                </p>
                <svg-icon
                  icon-class="cart"
                  class="cart"
                  v-if="item.productType === 1"
                />
              </div>
            </div>
          </div>
        </van-list>
      </van-tab>
    </van-tabs>

    <cart />
  </div>
</template>
<script>
import { search } from "@/service";
import cart from "@/components/Cart";
export default {
  components: {
    cart,
  },
  data() {
    return {
      searchVal: "",
      tabs: [
        { title: "综合", name: 0 },
        { title: "新品", name: 1 },
        { title: "销量", name: 2 },
        { title: "价格", name: 3 }, //3->价格从低到高；4->价格从高到低
      ],
      activeName: 0,
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      lists: [],
      up: true,
      flagId: "",
    };
  },
  mounted() {
    this.searchVal = this.$route.params.searchVal;
    this.getData();
  },
  methods: {
    async getData() {
      let sort = this.activeName;
      if (this.activeName === 3 && !this.up) {
        sort = 4;
      }
      const res = await search({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        sort: sort,
        keyword: this.searchVal,
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
    async tabChange(id) {
      this.activeName = id;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();

      setTimeout(() => {
        this.flagId = id;
      }, 50);
    },
    tabClick(id) {
      if (this.flagId === 3 && id === 3) {
        this.up = !this.up;
        this.pageOptions.pageNum = 1;
        this.loading = true;
        this.finished = false;
        this.getData();
      }
    },
    onInput(val) {
      this.searchVal = val;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    jumpTo(path) {
      this.$router.push(path);
    },
  },
};
</script>
<style lang="scss" scoped>
.lists {
  display: flex;
  flex-wrap: wrap;
  .list {
    margin: 1.2rem;
    min-width: 16rem;
    max-width: 45%;
    flex: 1;
    background-color: $white-background;
    border-radius: 1.2rem;
    ::v-deep .van-image {
      img {
        border-radius: 1.2rem 1.2rem 0 0;
      }
    }
    .title {
      height: 4rem;
      line-height: 2rem;
      font-size: $font-size-14;
      font-weight: bold;
      color: $color-333;
      margin: 0.8rem;
    }
    .bottom {
      margin: 0.8rem;
    }
    .price {
      color: $color-price;
      font-size: $font-size-20;

      .icon {
        font-size: $font-size-12;
      }
    }
    .cart {
      width: 2.8rem;
      height: 2.8rem;
    }
  }
  .list:nth-child(odd) {
    margin-right: 0;
  }
  /* &::after {
    clear: both;
    height: 0;
    content: '';
    display: block;
    visibility: hidden;
  } */
}

.search-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
