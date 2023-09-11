<template>
  <transition name="fade-in">
    <div v-if="visible" @click.stop="handleClick" class="float">
      <slot>
        <svg-icon icon-class="top" class="float-icon" />
      </slot>
    </div>
  </transition>
</template>

<script>
import { throttle } from "throttle-debounce";

const cubic = (value) => Math.pow(value, 3);
const easeInOutCubic = (value) =>
  value < 0.5 ? cubic(value * 2) / 2 : 1 - cubic((1 - value) * 2) / 2;

export default {
  props: {
    visibilityHeight: {
      type: Number,
      default: 200,
    },
  },

  data() {
    return {
      el: null,
      visible: false,
    };
  },

  mounted() {
    this.throttledScrollHandler = throttle(300, this.onScroll);
    document.addEventListener("scroll", this.throttledScrollHandler, true);
  },

  methods: {
    onScroll(e) {
      const scrollTop = e.target.scrollTop;
      this.visible = scrollTop >= this.visibilityHeight;
      this.el = e.target;
    },
    handleClick(e) {
      this.scrollToTop();
      this.$emit("click", e);
    },
    scrollToTop() {
      const beginTime = Date.now();
      const beginValue = this.el.scrollTop;
      const rAF =
        window.requestAnimationFrame || ((func) => setTimeout(func, 16));
      const frameFunc = () => {
        const progress = (Date.now() - beginTime) / 500;
        if (progress < 1) {
          this.el.scrollTop = beginValue * (1 - easeInOutCubic(progress));
          rAF(frameFunc);
        } else {
          this.el.scrollTop = 0;
        }
      };
      rAF(frameFunc);
    },
  },

  beforeDestroy() {
    document.removeEventListener("scroll", this.throttledScrollHandler);
  },
};
</script>

<style lang="scss" scoped>
.float-icon {
  width: 5.4rem;
  height: 5.4rem;
}

.fade-in-linear-enter-active,
.fade-in-linear-leave-active {
  transition: opacity 200ms linear;
}
.fade-in-linear-enter,
.fade-in-linear-leave,
.fade-in-linear-leave-active {
  opacity: 0;
}

.fade-in-enter-active,
.fade-in-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
.fade-in-enter,
.fade-in-leave-active {
  opacity: 0;
}
</style>
