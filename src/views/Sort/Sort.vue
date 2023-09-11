<template>
  <div class="ffffff">
    <van-sticky>
      <van-nav-bar
        title="选择商品分类"
        left-arrow
        @click-left="jumpTo('/home')"
      />
    </van-sticky>
    <van-tree-select
      v-if="lists.length"
      :items="lists"
      :active-id.sync="activeId"
      :main-active-index.sync="activeIndex"
      @click-nav="onNavClick"
      height="100%"
    >
      <!-- @click-item="onItemClick" -->

      <template #content>
        <div class="lists">
          <!-- v-for="F_list in lists" :key="F_list.id" -->
          <div v-for="S_list in lists[activeId].children" :key="S_list.id">
            <p class="second-title">{{ S_list.text }}</p>
            <div class="tabs">
              <div
                class="third"
                v-for="T_list in S_list.children"
                :key="T_list.id"
                @click="toSub(S_list.id, T_list.id)"
              >
                <van-image
                  width="7.4rem"
                  height="7.4rem"
                  radius="0.2rem"
                  fit="cover"
                  :src="T_list.img"
                />
                <center class="single-wrap">{{ T_list.text }}</center>
              </div>
              <center v-if="!S_list.children.length" class="no-data">
                暂无三级分类
              </center>
            </div>
          </div>
          <center v-if="!lists[activeId].children.length" class="no-data">
            暂无二级分类
          </center>
        </div>
      </template>
    </van-tree-select>
  </div>
</template>
<script>
import { cateList } from "@/service";
export default {
  data() {
    return {
      lists: [],
      activeIndex: 0, //左侧选中项的索引
      activeId: 0, //右侧选中项的 id
    };
  },
  async mounted() {
    this.lists = await cateList();
  },
  methods: {
    onNavClick(val) {
      this.activeIndex = val;
      this.activeId = val;
    },
    toSub(secondId, thirdId) {
      this.$router.push({ name: "sort-sub", query: { secondId, thirdId } });
    },
    jumpTo(path) {
      this.$router.push(path);
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}

.lists {
  padding-left: 1rem;
  .second-title {
    padding: 1.2rem 0;
    font-size: $font-size-14;
    font-weight: bold;
    color: $color-333;
  }

  .tabs {
    font-size: $font-size-12;
    color: $color-333;
    .third {
      float: left;
      margin-bottom: 1rem;
      center {
        width: 7.4rem;
        padding-top: 0.4rem;
      }
    }
    &::after {
      clear: both;
      height: 0;
      content: "";
      display: block;
      visibility: hidden;
    }
  }
}

.no-data {
  padding: 20px 0;
  color: $color-999;
  font-size: 1.2rem;
}
</style>
