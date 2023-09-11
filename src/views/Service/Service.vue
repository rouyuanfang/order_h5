<template>
  <div class="normal_page f5f5f5">
    <div class="banner">
      <van-nav-bar left-arrow @click-left="onClickLeft"></van-nav-bar>
      <div class="title">服务中心</div>
      <div class="sub-title">
        为了更好的跟进您的购物环节并提供更完善的体验，请您选择对应的服务中心
      </div>
    </div>

    <div class="content overflow-y">
      <div class="filter flex-between" @click="address_show = true">
        <div class="left">请选择服务中心</div>
        <div class="right">
          <span class="tit single-wrap">{{ addressName }}</span>
          <van-icon name="arrow-down" />
        </div>
      </div>

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
        <van-radio-group v-model="radio" checked-color="#F94227">
          <van-cell-group>
            <van-cell
              v-for="item in lists"
              :key="item.id"
              :title="item.companyName"
              clickable
            >
              <template #right-icon>
                <van-radio :name="item.id" />
              </template>
              <template #label>
                <span class="top">{{ item.companyCode }}</span>
                <p class="bottom">
                  {{
                    item.province + item.city + item.town + item.detailedAddress
                  }}
                </p>
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </van-list>
    </div>

    <div class="btn">
      <van-button
        @click="onSubmit"
        :disabled="lists.length === 0 || !radio"
        color="#F94227"
        round
        block
        >确定</van-button
      >
    </div>

    <van-popup v-model="address_show" round position="bottom">
      <van-area
        title="配送至"
        :area-list="areaList"
        value="100000"
        :columns-num="2"
        @confirm="address_confirm"
        @cancel="address_show = false"
      />
    </van-popup>
  </div>
</template>
<script>
import { ListService, updateService } from "@/service";
import { areaList } from "@vant/area-data";
export default {
  data() {
    return {
      areaList,
      radio: "",
      address_show: false,
      lists: [],
      loading: false,
      finished: false,
      pageOptions: {
        pageNum: 1,
        pageSize: 10,
      },
      province: "",
      city: "",
      addressName: "筛选区域",
    };
  },
  mounted() {
    this.$set(areaList.province_list, "100000", "全部");
    this.$set(areaList.city_list, "100000", "全部");

    this.getData();
  },
  methods: {
    async getData() {
      const res = await ListService({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        province: this.province,
        city: this.city,
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
    address_confirm(val) {
      if (val[0].name === "全部") {
        this.province = "";
        this.city = "";
        this.addressName = "全部";
      } else {
        this.province = val[0].name;
        this.city = val[1].name;
        this.addressName = val[0].name + val[1].name;
      }

      this.address_show = false;

      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    onClickLeft() {
      this.$router.back();
    },
    onSubmit() {
      updateService({
        companyId: this.radio,
      }).then(() => {
        this.$router.back();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar {
  background-color: unset;
  .van-nav-bar__title {
    color: $white-text;
  }
  .van-icon {
    color: $color-333;
  }
}
::v-deep.van-hairline--bottom::after {
  border-bottom-width: 0;
}

.banner {
  height: 16rem;
  background: url("../../assets/images/service.png") no-repeat;
  background-size: 100% 100%;
  .title {
    padding: 2rem 0 1rem 2.4rem;
    font-size: 2.2rem;
    color: $color-333;
  }
  .sub-title {
    width: 70%;
    line-height: 1.6rem;
    padding-left: 2.4rem;
    color: $color-999;
  }
}

.filter {
  margin: 1.2rem;
  padding: 1.2rem;
  font-size: $font-size-14;
  .left {
    font-weight: bold;
  }
  .right {
    display: flex;
    align-items: center;
    .tit {
      max-width: 15rem;
    }
    .van-icon {
      padding-left: 0.2rem;
    }
  }
}

.content {
  height: calc(100vh - 230px);
  .van-cell-group {
    margin: 1.2rem;
    background-color: unset;
    .van-cell {
      border-radius: 0.8rem;
      margin-bottom: 1rem;
      .van-cell__title > span {
        font-weight: bold;
      }
      .van-cell__label {
        font-size: $font-size-14;
        .top {
          background-color: #f0f6ff;
          color: #2d68b6;
          border-radius: 2px;
          padding: 0.4rem;
        }
        .bottom {
          padding-top: 0.6rem;
        }
      }
    }
  }
}

.btn {
  position: fixed;
  bottom: 0;
  width: 90%;
  margin: 2rem;
}
</style>
