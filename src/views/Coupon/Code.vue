<template>
  <div class="normal_page f5f5f5" :class="{ app_page: isAndroid }">
    <van-sticky>
      <van-nav-bar
        :title="`当前可用${len}张，请选择`"
        left-arrow
        @click-left="onClickLeft"
      >
      </van-nav-bar>
    </van-sticky>

    <!-- <div v-if="lists.length == 0" class="empty">
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div> -->
    <!-- <van-list v-else v-model="loading" :immediate-check="false" :finished="finished" offset="30" finished-text="没有更多了"
      @load="onLoad"> -->
    <div class="lists">
      <div
        class="list"
        v-for="item in detail.virtualItemList"
        :key="item.ticketCode"
      >
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
          </div>
        </div>
        <div class="flex-between">
          <div class="date">{{ detail.createTime }}</div>
          <center
            class="red-bg"
            @click="check_code(item)"
            v-if="item.qrCodeVerification && !item.isUsed"
          >
            出示核销
          </center>
        </div>
      </div>
    </div>
    <!-- </van-list> -->

    <van-popup round v-model="code_show">
      <div class="code">
        <center class="title">卡券核销二维码</center>
        <center>
          <van-image
            width="21rem"
            height="21rem"
            :radius="4"
            fit="cover"
            :src="code_img"
          />
        </center>
        <center class="num" @click="copy(code)">
          <span>核销码编号：{{ code }}</span>
          <svg-icon icon-class="order-copy" class="copy" />
        </center>
        <center class="tip">
          温馨提示：请于核销员前出示卡券核销二维码或告知核销码编号
        </center>
      </div>
    </van-popup>
  </div>
</template>
<script>
import QRCode from "qrcode";
import { CouponDetail } from "@/service";
export default {
  data() {
    return {
      detail: {},
      code_show: false,
      routeId: 0,
      code: "",
      code_img: "",
      len: 0,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.routeId = this.$route.params.id;
    // this.getData();
    this.creatInterval();
  },
  methods: {
    creatInterval() {
      let timer = setInterval(() => {
        this.getData();
      }, 300);
      this.$once("hook:beforeDestroy", () => {
        clearInterval(timer);
      });
    },
    async getData() {
      const res = await CouponDetail({
        orderId: this.routeId,
      });
      this.detail = res;

      let sum = 0;
      res.virtualItemList.map((i) => {
        if (!i.isUsed) {
          sum++;
        }
      });
      this.len = sum;
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
    check_code(item) {
      this.code = item.ticketCode;
      QRCode.toDataURL(item.ticketCode)
        .then((url) => {
          this.code_img = url;
        })
        .catch((err) => {
          this.$toast.error(err);
        });
      this.code_show = true;
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
        width: 70%;
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
    .num {
      align-items: center;
      margin-top: 1rem;
    }
    .num,
    .date {
      color: $color-999;
      font-size: $font-size-14;
    }
    .red-bg {
      width: 6.8rem;
      height: 2.6rem;
      line-height: 2.6rem;
      border-radius: 1.2rem;
      background-color: $color-price;
      color: $white-text;
    }
  }
}

.van-popup {
  background-color: unset;
}
.code {
  width: 31rem;
  height: 44rem;
  background-image: url("../../assets/images/code-bg.png");
  background-size: 100% 100%;
  .title {
    line-height: 5rem;
    font-size: $font-size-18;
    color: $white-text;
  }
  .van-image {
    margin: 3rem 0;
  }
  .num {
    font-size: $font-size-14;
  }
  .copy {
    width: 2rem;
    height: 2rem;
  }
  .tip {
    padding: 4rem 1.2rem 0;
    line-height: 1.6rem;
    color: $color-999;
  }
}
</style>
