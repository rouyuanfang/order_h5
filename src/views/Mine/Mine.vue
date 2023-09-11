<template>
  <div class="tabbar_page f5f5f5">
    <div class="banner">
      <div class="bell-icon">
        <van-badge :content="noticeLength" v-if="noticeLength">
          <div @click="jumpTo('/notice')">
            <svg-icon icon-class="bell" class="bell" />
          </div>
        </van-badge>
        <div v-else @click="jumpTo('/notice')">
          <svg-icon icon-class="bell" class="bell" />
        </div>
      </div>
      <div class="avatar">
        <van-image
          round
          width="5.4rem"
          height="5.4rem"
          fit="cover"
          :src="userInfo.icon"
        ></van-image>
        <div class="right">
          <p class="title">
            {{ userInfo.nickname }}
          </p>
          <div class="flex-center">
            <img
              v-if="userInfo.authentication"
              src="@/assets/images/mine-shiming.png"
            />
            <img v-else src="@/assets/images/mine-shiming-inactive.png" />
            <div class="branch" v-if="userInfo.companyName">{{userInfo.companyName}}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="total flex-around">
      <div class="scores" @click="jumpTo('/point')">
        <div class="top flex-between">
          <div class="left">积分</div>
          <div class="right">立即兑换<van-icon name="arrow" /></div>
        </div>
        <div class="bottom">{{ userInfo.profitIntegral }}</div>
      </div>
      <div class="profits">
        <div class="top">分红点</div>
        <div class="bottom">{{ userInfo.profitDividend }}</div>
      </div>
    </div>

    <div class="cards">
      <div class="flex-between">
        <p class="title">我的订单</p>
        <p class="sub-title" @click="toList('normal', -1)">
          查看全部订单<van-icon name="arrow" />
        </p>
      </div>
      <div class="card">
        <div class="card-item" @click="toList('normal', 1)">
          <svg-icon icon-class="mine-daifukuan" class="card-icon" />
          <p>待付款</p>
        </div>
        <div class="card-item" @click="toList('normal', 2)">
          <svg-icon icon-class="mine-daifahuo" class="card-icon" />
          <p>待发货</p>
        </div>
        <div class="card-item" @click="toList('normal', 3)">
          <svg-icon icon-class="mine-daishouhuo" class="card-icon" />
          <p>待收货</p>
        </div>
        <div class="card-item" @click="toList('normal', 4)">
          <svg-icon icon-class="mine-sign" class="card-icon" />
          <p>已签收</p>
        </div>
        <div class="card-item" @click="toList('normal', 5)">
          <svg-icon icon-class="mine-refund" class="card-icon" />
          <p>退款/售后</p>
        </div>
      </div>
    </div>

    <div class="cards" v-if="isBranch">
      <div class="flex-between">
        <p class="title">分部客户订单</p>
        <p class="sub-title" @click="toList('branch', -1)">
          查看全部订单<van-icon name="arrow" />
        </p>
      </div>
      <div class="card">
        <div class="card-item" @click="toList('branch', 1)">
          <svg-icon icon-class="mine-fenbu-daifukuan" class="card-icon" />
          <p>待付款</p>
        </div>
        <div class="card-item" @click="toList('branch', 2)">
          <svg-icon icon-class="mine-fenbu-daifahuo" class="card-icon" />
          <p>待发货</p>
        </div>
        <div class="card-item" @click="toList('branch', 3)">
          <svg-icon icon-class="mine-fenbu-daishouhuo" class="card-icon" />
          <p>待收货</p>
        </div>
        <div class="card-item" @click="toList('branch', 4)">
          <svg-icon icon-class="mine-fenbu-sign" class="card-icon" />
          <p>已签收</p>
        </div>
        <div class="card-item" @click="toList('branch', 5)">
          <svg-icon icon-class="mine-fenbu-refund" class="card-icon" />
          <p>退款/售后</p>
        </div>
      </div>
    </div>

    <van-cell-group>
      <van-cell title="联系客服" @click="phone">
        <template #icon>
          <svg-icon icon-class="kefu" class="cell-icon" />
        </template>
      </van-cell>
      <!-- <van-cell title="我的证书" is-link>
        <template #icon>
          <svg-icon icon-class="certificate" class="cell-icon" />
        </template>
      </van-cell> -->
      <van-cell title="收货地址" is-link @click="jumpTo('/address')">
        <template #icon>
          <svg-icon icon-class="location" class="cell-icon" />
        </template>
      </van-cell>
      <van-cell title="我的卡券" is-link @click="toCouponList('normal', -1)">
        <template #icon>
          <svg-icon icon-class="mine-coupon" class="cell-icon" />
        </template>
      </van-cell>
      <van-cell
        title="分部卡券"
        is-link
        @click="toCouponList('branch', -1)"
        v-if="isBranch"
      >
        <template #icon>
          <svg-icon icon-class="mine-branch-coupon" class="cell-icon" />
        </template>
      </van-cell>
      <van-cell
        title="卡券核销"
        is-link
        @click="jumpTo('/coupon-cancel')"
        v-if="isCancel"
      >
        <template #icon>
          <svg-icon icon-class="mine-cancel-coupon" class="cell-icon" />
        </template>
      </van-cell>
      <van-cell
        title="分部客户管理"
        is-link
        @click="jumpTo('/branch-list')"
        v-if="isBranch"
      >
        <template #icon>
          <svg-icon icon-class="mine-service" class="cell-icon" />
        </template>
      </van-cell>
      <van-cell title="退出登录" is-link @click="logout">
        <template #icon>
          <svg-icon icon-class="logout" class="cell-icon" />
        </template>
      </van-cell>
    </van-cell-group>

    <center class="version">系统版本 V1.0</center>

    <van-tabbar
      route
      v-model="active"
      active-color="#F94227"
      inactive-color="#999999"
    >
      <van-tabbar-item
        v-for="item in tabs"
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
  </div>
</template>
<script>
import storage from "good-storage";
import {
  getUserInfo,
  isBranchMember,
  noticeSystemList,
  isCancelMember,
} from "@/service";
export default {
  data() {
    return {
      active: 2,
      tabs: [
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

      userInfo: {},
      isBranch: false,
      isCancel: false,
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
    this.getBranchMember();
    this.getCancelMember();
    // if (this.$store.state.Auth) {
    //   location.reload();
    // }
    if (storage.get("Auth")) {
      this.getNoticeList();
    }
  },
  methods: {
    async getInfo() {
      const res = await getUserInfo();
      this.userInfo = res;
      // this.$store.commit('setUserInfo', res)
    },
    async getBranchMember() {
      this.isBranch = await isBranchMember();
    },
    async getCancelMember() {
      this.isCancel = await isCancelMember();
    },
    async getNoticeList() {
      const res = await getUserInfo();
      this.userInfo = res;
      this.notice_lists = await noticeSystemList({ id: this.userInfo.id });
    },
    jumpTo(path) {
      this.$router.push(path);
    },
    toList(role, activeName) {
      this.$router.push({
        name: "order-list",
        query: { role, activeName },
      });
    },
    toCouponList(role, activeName) {
      this.$router.push({
        name: "coupon-list",
        query: { role, activeName },
      });
    },
    phone() {
      window.location.href = "tel://4006301286";
    },
    logout() {
      this.$dialog
        .confirm({
          title: "退出登录",
          message: "确定退出登录吗？",
        })
        .then(() => {
          // on confirm addressDel
          storage.remove("Auth");
          this.$store.state.Auth = "";
          this.$router.push("/home");
          // location.reload();
        })
        .catch(() => {
          // on cancel
        });
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

.banner {
  background: url("../../assets/images/mine-bg.png") no-repeat;
  background-size: 100% 100%;
  .bell-icon {
    text-align: right;
    padding: 1rem 1.2rem 1.4rem 0;
  }
  .bell {
    width: 3rem;
    height: 3rem;
  }
  .avatar {
    display: flex;
    align-items: center;
    padding: 0 0 3rem 1.2rem;
  }
  .right {
    margin-left: 0.8rem;
    img {
      width: 6rem;
      height: 2rem;
    }
    .title {
      padding-bottom: 0.4rem;
      color: $color-333;
      font-size: $font-size-20;
    }
    .branch {
      margin-left: 0.6rem;
      padding: 2px 4px;
      text-align: center;
      border-radius: 6px;
      background: linear-gradient(65.5deg, #fb563e, #fe7d5f);
      color: $white-text;
    }
  }
}

.total {
  margin: -1.2rem 1.2rem 1.2rem;
  gap: 1.2rem;
  .scores {
    // width: 17rem;
    flex: 1;
    height: 8rem;
    padding: 1.4rem;
    background: url("../../assets/images/mine-scores.png") no-repeat;
    background-size: cover;
    .top {
      font-size: $font-size-14;
      .left {
        color: $color-666;
      }
      .right {
        font-size: $font-size-10;
        padding: 0.4rem 0.6rem;
        background-color: #ffe590;
        border-radius: 1rem;
        color: #654d00;
      }
    }
    .bottom {
      padding-top: 1rem;
      color: $color-333;
      font-size: 2.2rem;
      font-weight: bold;
    }
  }
  .profits {
    // width: 17rem;
    flex: 1;
    height: 8rem;
    padding: 1.4rem;
    background: url("../../assets/images/mine-profits.png") no-repeat;
    background-size: cover;
    .top {
      padding-top: 0.4rem;
      font-size: $font-size-14;
      color: $color-666;
    }
    .bottom {
      padding-top: 1rem;
      color: $color-333;
      font-size: 2.2rem;
      font-weight: bold;
    }
  }
}

.cards {
  margin: 0 1.2rem 1.2rem;
  padding: 1.2rem;
  background-color: $white-background;
  border-radius: 1.2rem;
  .title {
    color: $color-333;
    font-size: $font-size-16;
  }
  .sub-title {
    color: $color-666;
    font-size: $font-size-12;
  }
  .card {
    display: flex;
    flex-wrap: wrap;
    margin-top: 1.6rem;
    &-item {
      flex: 1;
      text-align: center;
      p {
        color: $color-666;
        font-size: $font-size-14;
        padding-top: 0.6rem;
      }
    }
    &-icon {
      width: 2.8rem;
      height: 2.8rem;
    }
  }
}

.van-cell-group {
  margin: 0 1.2rem;
  .van-cell {
    .van-cell__title {
      padding-left: 0.4rem;
    }
    .cell-icon {
      width: 2.8rem;
      height: 2.8rem;
    }
  }
}
.version {
  padding: 2rem 0;
  color: $color-666;
}
</style>
