<template>
  <div>
    <van-search
      :autofocus="true"
      v-model="value"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      @cancel="jumpTo('/home')"
    />
    <!-- <div class="history">
      <div class="top flex-between">
        <div class="title">历史搜索</div>
        <div @click="del">
          <svg-icon icon-class="delete" class="delete" />
        </div>
      </div>
    </div> 
    <div class="lists flex">
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
      <div class="list">苹果</div>
    </div>-->
  </div>
</template>
<script>
export default {
  data() {
    return {
      value: "",
    };
  },
  methods: {
    onSearch(val) {
      this.$router.push({ name: "seek-result", params: { searchVal: val } });
    },
    jumpTo(path) {
      this.$router.push(path);
    },
    del() {},
  },
};
</script>
<style lang="scss" scoped>
.history {
  margin: 2rem 1.2rem;
  .title {
    font-size: $font-size-16;
  }
  .delete {
    width: 1.8rem;
    height: 1.8rem;
  }
}
.lists {
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0 1.2rem;
  .list {
    padding: 0.4rem 1.2rem;
    border-radius: 1.4rem;
    border: 0.1rem solid #ededed;
  }
}
</style>
