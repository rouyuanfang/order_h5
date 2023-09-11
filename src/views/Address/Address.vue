<template>
  <div>
    <van-nav-bar
      title="收货地址"
      left-arrow
      right-text="新增地址"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
    </van-nav-bar>

    <div class="lists">
      <div class="list flex-between" v-for="item in lists" :key="item.id">
        <div class="left" @click="selectItem(item.id)">
          <div class="top">
            <span class="title">{{ item.name }}</span>
            <span class="phone">{{ item.phoneNumber }}</span>
            <van-tag v-if="item.defaultStatus" type="danger">默认</van-tag>
          </div>
          <div class="bottom two-wrap">
            {{ item.province + item.city + item.region + item.detailAddress }}
          </div>
        </div>
        <div class="right" @click="toEdit(item.id)">
          <svg-icon icon-class="edit" class="edit" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { addressList } from "@/service";
export default {
  data() {
    return {
      lists: [],
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    async getData() {
      this.lists = await addressList();
    },
    selectItem(id) {
      if (Object.keys(this.$route.query).length === 0) {
        return;
      }
      this.$router.push({
        name: "order-comfirm",
        query: { ...this.$route.query, id_address: id },
      });
    },
    toEdit(id) {
      this.$router.push({ name: "address-crud", query: { isEdit: true, id } });
    },
    onClickLeft() {
      this.$router.back();
    },
    onClickRight() {
      this.$router.push("/address-crud");
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

.lists {
  .list {
    // margin: 0 1.2rem;
    padding: 0 2.4rem;
    border-bottom: 0.1rem solid #f5f5f5;
    .left {
      flex: 2;
      padding-right: 1.2rem;
      .top {
        margin-top: 1.2rem;
        .title {
          font-size: $font-size-16;
        }
        .phone {
          padding: 0 1rem;
          font-size: $font-size-14;
          color: $color-999;
        }
      }
      .bottom {
        margin: 1rem 0;
        color: $color-999;
        line-height: 2rem;
      }
    }
    .edit {
      width: 2.2rem;
      height: 2.2rem;
    }
  }
}
</style>
