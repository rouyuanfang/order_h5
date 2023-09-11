<template>
  <div :class="{ app_page: isAndroid }">
    <van-nav-bar title="上传转账凭证" left-arrow @click-left="onClickLeft"></van-nav-bar>

    <div class="top">
      <span class="title">支付截图预览</span>
      <span class="sub-title">（请上传10M以内的图片）</span>
    </div>

    <div class="lists overflow-y f5f5f5">
      <van-image v-if="pic" width="100%" radius="1.2rem" fit="cover" :src="pic" />
      <van-icon v-else name="photograph" size="5rem" @click="upload" />
      <input type="file" name="file" accept="image/*" v-on:change="afterUpload" ref="file_input" style="display: none" />
      <!-- <van-uploader v-else v-model="fileList" :max-count="1" :before-read="beforeUpload" :after-read="afterUpload">
        <van-icon name="photograph" />
      </van-uploader> -->
    </div>

    <div class="tip">*若无法上传或拍照，当前浏览器版本过低，建议更换浏览器</div>

    <div class="pay-type">
      <div class="title"><span>*</span>选择支付方式</div>
      <van-radio-group v-model="radio" @change="changeRadio">
        <van-radio :name=1 icon-size="16px" checked-color="#F94227">客户先支付到分部，分部需要对公</van-radio>
        <van-radio :name=2 icon-size="16px" checked-color="#F94227">客户直接支付到总部</van-radio>
      </van-radio-group>
    </div>

    <div class="btn flex-between">
      <van-button @click="pic = ''" color="#bbbbbb" round block class="gray">重新上传</van-button>
      <van-button :disabled="!pic" @click="onSubmit" color="#F94227" round block>确定上传</van-button>
    </div>

    <van-loading v-show="loading_show" />
  </div>
</template>
<script>
import {
  CouponDetail,
  fileUpload,
  CouponPay,
  CouponPay_branch,
} from "@/service";
export default {
  data() {
    return {
      routeId: 0,
      role: "",
      pic: "",
      fileList: [],
      loading_show: false,
      radio: 1,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.routeId = this.$route.query.id;
    this.role = this.$route.query.role;

    if (this.$route.query.repeat) {
      this.getData();
    }
  },
  methods: {
    onClickLeft() {
      this.$dialog
        .confirm({
          message: "是否放弃支付？",
          confirmButtonText: "继续付款",
          cancelButtonText: "放弃",
        })
        .then(() => {
          // on confirm addressDel
        })
        .catch(() => {
          // on cancel
          this.$router.back();
        });
    },
    async getData() {
      const res = await CouponDetail({
        orderId: this.routeId,
      });
      if (this.role === "branch") {
        this.pic = res.companyPayScreen;
      } else if (this.role === "normal") {
        this.pic = res.memberPayScreen;
      }
      this.radio=res.payToObject
    },
    changeRadio(val){
      this.radio=val
    },
    upload() {
      this.$refs.file_input.click();
    },
    beforeUpload(file) {
      if (!file.type.includes("image")) {
        this.$toast("图片格式错误");
        return false;
      }
      return true;
    },
    async afterUpload(event) {
      const file = event.target.files[0];
      if (!file.type.includes("image")) {
        this.$toast("图片格式错误");
        return false;
      }

      this.loading_show = true;
      const res = await fileUpload({ file: file });
      if (res.url) {
        this.pic = res.url;
      } else {
        this.$dialog
          .alert({
            title: "转账凭证上传失败",
            message: "转账凭证上传超时，请重试",
            confirmButtonText: "知道了",
            theme: "round-button",
          })
          .then(() => {
            // on close
          });
      }
      this.loading_show = false;
    },
    async onSubmit() {
      let res;
      if (this.role === "branch") {
        res = await CouponPay_branch({
          orderId: this.routeId,
          companyPayScreen: this.pic,
          payToObject:this.radio
        });
      } else if (this.role === "normal") {
        res = await CouponPay({
          orderId: this.routeId,
          payScreen: this.pic,
        });
      }
      if (res) {
        this.$router.push({ name: "coupon-pay", query: { id: this.routeId } });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}

.top {
  margin: 2.4rem 2.8rem;
  .title {
    font-size: $font-size-16;
  }
  .sub-title {
    color: $color-999;
    padding-left: 0.4rem;
  }
}

.tip {
  color: $color-price;
  padding: 1.2rem;
  line-height: 1.8rem;
}

.btn {
  // position: fixed;
  // bottom: 0;
  // width: 90%;
  margin: 2rem;
  .gray {
    margin-right: 1.2rem;
  }
}

.lists {
  position: relative;
  margin: 1.2rem;
  border-radius: 1.2rem;
  height: 60vh;
  .van-icon {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* .van-uploader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    i {
      font-size: 5rem;
    }
  } */
}

.pay-type {
  display: flex;
  justify-content: space-between;
  margin: 0 1.2rem;
  .van-radio-group {
    flex: 2;
  }
  .title {
    flex: 1;
    font-size: $font-size-14;
    color: $color-999;
    span {
      color: $color-price;
    }
  }
}

.van-loading {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  .van-loading__spinner {
    top: 50%;
    left: 45%;
  }
}
</style>
