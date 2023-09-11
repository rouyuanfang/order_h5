<template>
  <div class="normal_page overflow-y f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar left-arrow @click-left="onClickLeft">
        <template #title>
          <div class="single-wrap">{{ title }}</div>
        </template>
        <template #right v-if="rigBtn_show">
          <span @click="toCouponList">我的卡券</span>
          <div class="bell-icon" @click="jumpTo('/notice')">
            <van-badge :content="noticeLength" v-if="noticeLength">
              <svg-icon icon-class="bell" class="bell" />
            </van-badge>
            <svg-icon icon-class="bell" class="bell" v-else />
          </div>
        </template>
      </van-nav-bar>
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
        :key="item.id"
        :title="item.name"
        :name="item.id"
      >
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
                <span
                  v-if="item.productType === 2 && item.presale"
                  class="presell"
                  >预售</span
                >
                <span>{{ item.name }}</span>
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
              <div
                v-if="item.productType === 2 && item.downPayment"
                class="earnest"
              >
                定金仅¥{{ item.downPayment }}
              </div>
            </div>
          </div>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import storage from "good-storage";
import {
  homeCategory,
  homeCategoryChange,
  getUserInfo,
  noticeSystemList,
} from "@/service";

export default {
  data() {
    return {
      title: "",
      rigBtn_show: false,
      activeName: "",
      tabs: [],
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      lists: [],
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
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.activeName = this.$route.query.thirdId;

    this.getTabs().then(() => {
      this.getData();
    });

    this.getNoticeList();
    // this.hideAppNav();
  },
  methods: {
    /*     hideAppNav() {
          const isIos = /(iPhone|iPad|iPod|iOS|Mac)/i.test(userAgent);
          if (isAndroid && window.android) {
            // console.log(window.android)
            // console.log(window.native)
            window.android.hideTitle("");
          }
          if (isIos && window.webkit) {
            // console.log(window.webkit.messageHandlers);
            window.webkit.messageHandlers.hideTitle.postMessage("");
          }
        }, */
    onClickLeft() {
      if (window.android) {
        storage.remove("Auth");
        this.$store.state.Auth = "";
        window.android.didSelectCloseHBSquareAction("");
      } else if (window.webkit) {
        storage.remove("Auth");
        this.$store.state.Auth = "";
        window.webkit.messageHandlers.didSelectCloseHBSquareAction.postMessage(
          ""
        );
      } else {
        this.$router.back();
      }
    },
    async getNoticeList() {
      const res = await getUserInfo();
      this.notice_lists = await noticeSystemList({ id: res.id });
    },
    async getTabs() {
      const res = await homeCategory({ parentId: this.$route.query.secondId });
      // if (res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        if (this.activeName && res[i].id == this.activeName) {
          this.title = res[i].name;
        } else {
          this.activeName = res[0].id;
          this.title = res[0].name;
        }
      }
      this.rigBtn_show = res[0].categoryType === 2 ? true : false;
      // }

      this.tabs = res;
    },
    async tabChange(name, title) {
      this.activeName = name;
      this.title = title;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    async getData() {
      const res = await homeCategoryChange({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        productCategoryId: this.activeName,
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
    jumpTo(path) {
      this.$router.push(path);
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    toCouponList() {
      this.$router.push({
        name: "coupon-list",
        query: { role: "normal", activeName: -1 },
      });
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
.van-nav-bar__title {
  max-width: 30%;
}

::v-deep .van-badge--fixed {
  top: 4px;
  right: 2px;
}
.bell-icon {
  margin-left: 1rem;
  .bell {
    width: 3rem;
    height: 3rem;
  }
}

.single-wrap {
  width: 80%;
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
      .presell {
        padding: 0.1rem 0.2rem;
        border-radius: 0.4rem;
        background-color: #7658ff;
        color: $white-text;
        text-align: center;
        font-size: $font-size-12;
      }
    }
    .bottom {
      margin: 0.8rem;
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
    .earnest {
      margin: 0.8rem;
      color: #6a49ff;
      font-size: $font-size-12;
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
</style>
