<template>
  <div class="tabbar_page f5f5f5">
    <van-sticky>
      <van-search
        v-model="searchVal"
        show-action
        placeholder="请输入搜索关键词"
        @focus="jumpTo('/seek')"
      >
        <template #action>
          <div @click="jumpTo('/notice')">
            <van-badge :content="noticeLength" v-if="noticeLength">
              <svg-icon icon-class="bell" class="bell" />
            </van-badge>
            <svg-icon icon-class="bell" class="bell" v-else />
          </div>
        </template>
      </van-search>
    </van-sticky>

    <van-tabs
      sticky
      offset-top="54"
      title-active-color="#F94227"
      line-width="2rem"
      @change="tabChange"
      v-model="activeName"
    >
      <van-tab
        v-for="item in tabs"
        :key="item.id"
        :title="item.name"
        :name="item.id"
      >
        <van-swipe :loop="false" v-if="menus.length && lists.length">
          <van-swipe-item
            v-for="(menu, index) in menus"
            :key="index"
            class="menus"
          >
            <div
              class="menu"
              v-for="item in menu"
              :key="item.id"
              @click="toSub(item)"
            >
              <van-image
                width="4.8rem"
                height="3.6rem"
                fit="cover"
                :src="item.minIcon"
              />
              <p class="title">{{ item.name }}</p>
            </div>
          </van-swipe-item>
        </van-swipe>

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

    <van-tabbar
      route
      v-model="active"
      active-color="#F94227"
      inactive-color="#999999"
    >
      <van-tabbar-item
        v-for="item in tabbars"
        :key="item.path"
        replace
        :to="item.path"
      >
        <span>{{ item.title }}</span>
        <template #icon="props">
          <svg-icon
            :icon-class="props.active ? item.active : item.inactive"
            id="tab-icon"
          />
        </template>
      </van-tabbar-item>
    </van-tabbar>

    <back-top />
  </div>
</template>
<script>
import storage from "good-storage";
import BackTop from "@/components/BackTop";
import { homeCategory, search, getUserInfo, noticeSystemList } from "@/service";
export default {
  components: {
    BackTop,
  },
  data() {
    return {
      active: 0,
      tabbars: [
        {
          title: "首页",
          path: "/home",
          active: "home",
          inactive: "home-inactive",
        },
        {
          title: "购物车",
          path: "/cart",
          active: "car",
          inactive: "car-inactive",
        },
        {
          title: "我的",
          path: "/mine",
          active: "mine",
          inactive: "mine-inactive",
        },
      ],

      searchVal: "",
      activeName: "",
      tabs: [],
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      lists: [],
      menus: [],
      notice_lists: [],
    };
  },
  computed: {
    noticeLength() {
      let len = 0;
      for (let i = 0; i < this.notice_lists.length; i++) {
        if (this.notice_lists[i].status === 0) {
          len++;
        }
      }
      return len;
    },
  },
  mounted() {
    this.getTabs();
    this.getData();

    // if (this.$store.state.Auth) {
    //   location.reload();
    // }
    if (storage.get("Auth")) {
      this.getNoticeList();
    }
  },
  methods: {
    async getNoticeList() {
      const res = await getUserInfo();
      this.notice_lists = await noticeSystemList({ id: res.id });
    },
    async getTabs() {
      const res = await homeCategory({ parentId: 0 });
      if (res) {
        res.unshift({ id: "", name: "特卖" });
        res.push({ id: -11, name: "全部" });
        this.tabs = res;
      }
    },
    async getSecondTabs(parentId) {
      const res = await homeCategory({ parentId });
      let menu = [],
        arr = [];
      res.forEach((item) => {
        arr.push(item);
        if (arr.length === 8) {
          menu.push(arr);
          arr = [];
        }
      });
      if (arr.length) menu.push(arr);
      this.menus = menu;
    },
    async tabChange(id) {
      if (id === -11) {
        return this.$router.push("/sort");
      }
      if (id !== "") {
        this.getSecondTabs(id);
      }
      this.activeName = id;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    async getData() {
      const res = await search({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        cid1: this.activeName,
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
    toSub(item) {
      if (item.isLevel) {
        this.$router.push({ name: "sort-sub", query: { secondId: item.id } });
      } else {
        this.$toast("暂无分类");
      }
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
::v-deep .van-badge--fixed {
  top: 4px;
  right: 6px;
}

#tab-icon {
  width: 2.8rem;
  height: 2.8rem;
}
.van-tabbar-item__text {
  span {
    font-weight: bold;
  }
}

.bell {
  width: 3rem;
  height: 3rem;
}

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

.van-swipe {
  margin: 1.2rem;
  padding: 1.2rem;
  background: $white-background;
  border-radius: 1.2rem;
  .menu {
    float: left;
    width: 25%;
    margin-bottom: 1.2rem;
    text-align: center;
    .title {
      padding-top: 1.2rem;
      color: $color-999;
    }
  }
}

// .van-tabs{
//   height: calc(100vh - 11rem);
// }
</style>
