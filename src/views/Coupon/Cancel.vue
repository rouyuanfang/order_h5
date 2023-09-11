<template>
  <div :class="{ app_page: isAndroid }">
    <van-nav-bar
      title="卡券核销"
      left-arrow
      right-text="核销记录"
      @click-left="onClickLeft"
      @click-right="jumpTo('/coupon-record')"
    ></van-nav-bar>

    <div class="lists f5f5f5">
      <van-image
        v-if="pic"
        width="100%"
        height="100%"
        radius="1.2rem"
        fit="cover"
        :src="pic"
      />
      <van-icon v-else name="photograph" size="5rem" @click="upload" />
      <input
        type="file"
        name="file"
        accept="image/*"
        capture="environment"
        v-on:change="afterUpload"
        ref="file_input"
        style="display: none"
      />
    </div>
    <!-- user 前置 -->
    <div class="bot">
      <van-field v-model="num" label="核销码编号" />
      <div class="btn flex-between">
        <van-button @click="pic = ''" color="#bbbbbb" round block class="gray"
          >重新上传</van-button
        >
        <van-button
          :disabled="!num"
          @click="onSubmit"
          color="#F94227"
          round
          block
          >确认核销</van-button
        >
      </div>
    </div>

    <van-loading v-show="loading_show" />
  </div>
</template>
<script>
import { CouponCancel, CouponQrcode } from "@/service";
export default {
  data() {
    return {
      num: "",
      pic: "",
      fileList: [],
      loading_show: false,
    };
  },
  computed: {
    isAndroid() {
      return window.android ? true : false;
    },
  },
  methods: {
    onClickLeft() {
      this.$router.back();
    },
    jumpTo(path) {
      this.$router.push(path);
    },
    upload() {
      this.$refs.file_input.click();
    },
    async afterUpload(event) {
      const file = event.target.files[0];
      if (!file.type.includes("image")) {
        this.$toast("图片格式错误");
        return false;
      }

      this.loading_show = true;
      const res = await CouponQrcode({ file: file });
      if (res.content) {
        this.pic = res.image;
        this.num = res.content;
      } else {
        this.$dialog
          .alert({
            title: "识别失败",
            message: "请重新上传",
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
      const res = await CouponCancel({
        ticketCode: this.num,
      });
      if (res) {
        this.$toast.success("核销成功");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar {
  .van-icon {
    color: #000;
  }
  .van-nav-bar__text {
    color: #000;
  }
}

.bot {
  position: fixed;
  bottom: 0;
  width: 90%;
  margin: 2rem;
  .btn {
    margin: 1.2rem;
  }
}
.lists {
  position: relative;
  margin: 1.2rem;
  border-radius: 1.2rem;
  height: 40vh;
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
