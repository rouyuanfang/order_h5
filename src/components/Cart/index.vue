<template>
  <div class="float" @click="jumpTo('/cart')">
    <van-badge
      :content="$store.state.cartNum > 99 ? '99+' : $store.state.cartNum"
    >
      <svg-icon icon-class="cart-float" class="float-icon"
    /></van-badge>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.$store.dispatch("getCartNum");
  },
  methods: {
    jumpTo(path) {
      this.$router.push(path);
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .van-badge--fixed {
  top: 4px;
  right: 6px;
}

.float-icon {
  width: 5.4rem;
  height: 5.4rem;
}
</style>
