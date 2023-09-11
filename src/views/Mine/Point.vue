<template>
  <div>
    <van-sticky>
      <van-nav-bar
        title="积分兑换"
        left-arrow
        @click-left="onClickLeft"
      ></van-nav-bar>
    </van-sticky>

    <van-sticky offset-top="45">
      <div class="banner">
        <div class="txt">
          <span class="sub-title">当前可用积分</span>
          <span class="title">{{ totalPoint }}</span>
        </div>
      </div>

      <van-dropdown-menu>
        <van-dropdown-item
          v-model="remain"
          @change="changeRemain"
          :options="remain_option"
        />
        <van-dropdown-item :title="area" ref="areaDrop">
          <template #default>
            <!-- <van-cascader :value="area" :closeable="false" :options="area_option" @finish="onFinish" /> -->
            <van-area
              value="100000"
              :area-list="areaList"
              @confirm="address_confirm"
              @cancel="address_cancel"
            />
            <!-- @change="address_confirm" -->
          </template>
        </van-dropdown-item>
      </van-dropdown-menu>
    </van-sticky>

    <div v-if="lists.length == 0" class="empty">
      <svg-icon icon-class="no-result" class="no-data" />
      <p>暂无内容～</p>
    </div>

    <div class="content" v-else>
      <!-- <p class="title">
        {{ selectObj.province + selectObj.city + selectObj.area }}
      </p> -->

      <van-list
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
            :class="[
              item.remainingQuota === 0
                ? 'gray'
                : item.remainingQuota > 20
                ? 'green'
                : 'red',
            ]"
            v-for="(item, index) in lists"
            :key="item.id"
            @click="selectItem(item, index)"
          >
            <div
              class="surplus"
              :class="[
                item.remainingQuota === 0
                  ? 'surplus-gray'
                  : item.remainingQuota > 20
                  ? 'surplus-green'
                  : 'surplus-red',
              ]"
            >
              剩余{{ item.remainingQuota }}
            </div>
            <center class="top single-wrap">{{ item.town||item.area }}</center>
            <center class="mid">
              <span class="price">{{ item.agentScore }}</span
              ><span>积分</span>
            </center>
            <center class="bot">
              <div class="btn" v-if="item.btn_show">
                <span v-if="item.remainingQuota > 0">兑换</span>
                <span v-else>不可兑换</span>
              </div>
              <van-stepper
                v-else
                integer
                :max="item.remainingQuota"
                v-model="item.stepVal"
                @change="changeStep(item)"
                @click.native="$event.stopPropagation()"
              />
              <!-- change事件阻止不了冒泡，只能使用 click.native="$event.stopPropagation()处理 -->
            </center>
          </div>
        </div>
      </van-list>
    </div>

    <van-submit-bar :disabled="!exangeObj.id" :price="price" button-text="立即兑换" @submit="onSubmit" />
  </div>
</template>
<script>
import { areaList } from "@vant/area-data";
import { totalScore, exchangeList, exchangeAdd, getUserInfo } from "@/service";
export default {
  data() {
    return {
      areaList,
      price: 0,
      totalPoint: 0,
      area: "全部",
      remain: "",
      remain_option: [
        { text: "全部", value: "" },
        { text: "名额充足", value: 1 },
        { text: "名额不多", value: 2 },
        { text: "名额已满", value: 3 },
      ],
      pageOptions: {
        pageNum: 1,
        pageSize: 15,
      },
      loading: false,
      finished: false,
      lists: [],
      selectObj: {
        province: "",
        city: "",
        area: "",
        // town: "",
        // country: "",
        // code: "440106",
      },
      exangeObj: {
        id: "",
        stepVal: "",
        remainingQuota: "",
      },
    };
  },
  mounted() {
    this.$set(areaList.province_list, "100000", "全部");
    this.$set(areaList.city_list, "100000", "全部");
    this.$set(areaList.county_list, "100000", "全部");

    this.getTotalPoint();
    this.getData();
  },
  methods: {
    async getTotalPoint() {
      const res = await getUserInfo();
      this.totalPoint = await totalScore({ id: res.id });
    },
    async getData() {
      const res = await exchangeList({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        remainingQuota: this.remain,
        ...this.selectObj,
      });
      if (!res) {
        return (this.lists = []);
      }
      if (this.pageOptions.pageNum === 1) {
        this.lists = res.list;
      } else {
        this.lists = this.lists.concat(res.list);
      }
      this.lists.map((i) => {
        // i = this.$set(i, 'btn_show', true)
        // i =  this.$set(i, 'stepVal', 1)
        i = Object.assign(i, { btn_show: true, stepVal: 1 });
      });

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
    reset() {
      this.selectObj = {};
      this.exangeObj = {};
      this.price = 0;
      this.area = "全部";
    },
    changeRemain(val) {
      if (this.price) {
        this.price = 0;
      }
      this.remain = val;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    changeStep(item) {
      this.price = item.agentScore * item.stepVal;
      this.exangeObj.stepVal = item.stepVal;
    },
    selectItem(item, index) {
      this.lists.map((i) => {
        i = this.$set(i, "btn_show", true);
      });
      this.lists.map((i) => {
        if (i.id === item.id) {
          i = this.$set(i, "btn_show", false);
        }
      });

      //清除样式
      for (let i = 0; i < this.lists.length; i++) {
        if (
          document.getElementsByClassName("lists")[0].children[i].classList
            .length === 3
        ) {
          document
            .getElementsByClassName("lists")[0]
            .children[i].classList.remove("actived");
        }
      }
      //设置样式
      document.getElementsByClassName("lists")[0].children[index].className =
        document.getElementsByClassName("lists")[0].children[index].className +
        " actived";

      this.price = item.agentScore;

      this.exangeObj.id = item.id;
      this.exangeObj.stepVal = item.stepVal;
      this.exangeObj.remainingQuota = item.remainingQuota;
    },
    address_confirm(val) {
      if (this.price) {
        this.price = 0;
      }
      if (val[0].code === "100000") {
        this.selectObj.province = "";
        this.selectObj.city = "";
        this.selectObj.area = "";
        this.area = "全部";
      } else {
        this.selectObj.province = val[0].name;
        this.selectObj.city = val[1].name;
        this.selectObj.area = val[2].name;
        this.area = val[0].name + val[1].name + val[2].name;
      }
      this.$refs.areaDrop.toggle();

      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    address_cancel() {
      this.$refs.areaDrop.toggle();
    },
    async onSubmit() {
      if (this.exangeObj.remainingQuota === 0) {
        return this.$dialog
          .alert({
            title: "提交失败",
            message: "所选区域名额已满，请更换区域重试",
            confirmButtonText: "重试",
            theme: "round-button",
          })
          .then(() => {
            // on close
          });
      }
      const res = await exchangeAdd({
        agentId: this.exangeObj.id,
        purchaseQuota: this.exangeObj.stepVal,
      });
      if (res) {
        this.$dialog
          .alert({
            title: "提交成功",
            message: "兑换工单已提交，待平台处理",
            confirmButtonText: "知道了",
            theme: "round-button",
          })
          .then(() => {
            this.pageOptions.pageNum = 1;
            this.loading = true;
            this.finished = false;

            this.reset();
            this.getTotalPoint();
            this.getData();
          });
        // this.$toast('兑换成功')
      }
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}
::v-deep.van-stepper {
  button,
  input {
    background-color: $white-background;
  }
}

.banner {
  height: 8.8rem;
  background: url("../../assets/images/exchange-bg.png") no-repeat;
  background-size: 100% 100%;
  background-color: $white-background;
  .txt {
    padding: 4.8rem 0 2rem 2.4rem;
  }
  .sub-title {
    color: $color-999;
    font-size: $font-size-14;
  }
  .title {
    padding-left: 0.4rem;
    color: $color-333;
    font-size: $font-size-20;
  }
}

.content {
  // margin: 0 1.2rem;
  .title {
    margin: 1.8rem 0;
    color: $color-333;
    font-size: $font-size-14;
  }
  .lists {
    margin-top: 2.4rem;
    margin-left: 1.2rem; //margin-left: 1.2rem; width: 30%;  gap: 2.4rem 1.2rem;  适配手机点击所学习变形
    display: flex;
    flex-wrap: wrap;
    gap: 2.4rem 1.2rem;
    .list {
      width: 30%;
      // flex: 1;
      // max-width: 11.2rem;
      height: 11.2rem;
      border-radius: 0.8rem;
      // margin: 1.2rem;
      position: relative;
      .surplus {
        height: 1.8rem;
        line-height: 1.8rem;
        padding: 0 0.6rem;
        border-radius: 8px 8px 12px 0px;
        font-weight: bold;
        color: $white-text;
        text-align: center;
        position: absolute;
        left: 0;
        top: -1rem;
      }
      .surplus-red {
        background-color: $color-price;
      }
      .surplus-green {
        background-color: #1bc246;
      }
      .surplus-gray {
        background-color: #bbbbbb;
      }
      .top {
        padding: 1.6rem 0 1rem;
        color: $color-333;
        font-size: $font-size-14;
        max-width: 10rem;
      }
      .mid {
        padding-bottom: 0.4rem;
        color: $color-price;
        .price {
          padding-right: 0.2rem;
          font-size: $font-size-20;
        }
      }
      .btn {
        width: 8.4rem;
        height: 2.8rem;
        line-height: 2.8rem;
        margin-top: 0.6rem;
        background-color: $white-background;
        border-radius: 1.2rem;
      }
    }
    .red {
      background: linear-gradient(180deg, #fff7f7 0%, #ffebeb 100%);
      &.actived {
        border: 0.1rem solid #f94227;
      }
    }
    .green {
      background: linear-gradient(180deg, #f1fef4 0%, #e4fdeb 100%);
      &.actived {
        border: 0.1rem solid #1bc246;
      }
    }
    .gray {
      background: linear-gradient(180deg, #f9f9f9 0%, #f7f7f7 100%);
      &.actived {
        border: 0.1rem solid #bbbbbb;
      }
    }
  }
}
</style>
