<template>
  <div :class="{ app_page: isAndroid }">
    <div class="banner">
      <van-swipe :loop="false" @change="changeSwipe">
        <van-swipe-item v-for="(image, index) in swipes" :key="index">
          <van-image
            width="100%"
            height="37.5rem"
            fit="cover"
            :src="image"
          ></van-image>
        </van-swipe-item>
        <template #indicator>
          <div class="custom-indicator">
            {{ indicator + 1 }}/{{ swipes.length }}
          </div>
        </template>
      </van-swipe>
      <div @click="onClickLeft">
        <svg-icon icon-class="circle-back" class="circle-back" />
      </div>
      <div @click="share_show = true">
        <svg-icon icon-class="circle-share" class="circle-share" />
      </div>
    </div>

    <div class="info">
      <div class="top flex-between">
        <div class="price">
          <span class="icon">￥</span>
          <span>
            <span class="large">{{ price_L }}</span>
            <span>.{{ price_R }}</span>
          </span>
        </div>

        <div class="sale">
          <span>销量</span
          ><span>{{ detail.sale <= 9999 ? detail.sale : "9999+" }}</span>
        </div>
      </div>

      <div class="title two-wrap">
        {{ detail.name }}
      </div>
    </div>

    <div class="divider"></div>
    <van-cell-group>
      <van-cell
        title="选择"
        is-link
        :value="sku_selected.name"
        @click="showSku"
      ></van-cell>
      <!-- <van-cell title="配送至" is-link @click="address_show = true"></van-cell>
      <van-cell title="参数" is-link @click="desc_show = true"></van-cell> -->
    </van-cell-group>

    <div class="divider"></div>
    <div class="Lpicture">
      <van-divider>商品详情</van-divider>
      <div class="overflow-h" v-html="detail.detailMobileHtml"></div>
    </div>

    <van-goods-action>
      <van-goods-action-icon text="客服" @click="phone">
        <template #icon>
          <svg-icon icon-class="kefu" class="kefu" />
        </template>
      </van-goods-action-icon>
      <van-goods-action-button
        :disabled="detail.productType === 2"
        @click="showSku"
        type="warning"
        text="加入购物车"
      />
      <van-goods-action-button @click="buy" type="danger" text="立即购买" />
    </van-goods-action>

    <van-share-sheet
      v-model="share_show"
      title="分享至"
      :options="options"
      @select="share"
    />

    <van-popup v-model="address_show" round position="bottom">
      <van-area
        title="配送至"
        :area-list="areaList"
        value="440000"
        @cancel="address_show = false"
        @confirm="address_show = false"
      />
    </van-popup>
    <van-popup v-model="desc_show" round closeable position="bottom">
      <div class="PInfo">
        <center class="title">产品参数</center>
        <div class="lists">
          <div class="list flex">
            <p class="left">品牌</p>
            <p class="right">CHANEL/香奈儿</p>
          </div>
        </div>
      </div>
    </van-popup>

    <van-sku
      v-if="skuData"
      v-model="sku_show"
      :sku="skuData.sku"
      :goods="skuData.goods_info"
      :goods-id="skuData.goods_id"
      :quota="skuData.quota"
      :quota-used="skuData.quota_used"
      :initial-sku="skuData.initialSku"
      :hide-stock="skuData.sku.hide_stock"
      @buy-clicked="onBuyClicked"
      @stepper-change="stepperChanged"
      @add-cart="onAddCartClicked"
      @sku-selected="onSkuSelected"
      :show-add-cart-btn="cart_btn_show"
    />

    <cart v-if="detail.productType === 1" />

    <van-loading v-show="loading_show" />
  </div>
</template>
<script>
import storage from "good-storage";
import Login from "@/permission.js";
import { getUserInfo, pDetail, cartAdd } from "@/service";
import { areaList } from "@vant/area-data";
import cart from "@/components/Cart";
export default {
  components: {
    cart,
  },
  data() {
    return {
      areaList,
      routeId: 0,
      detail: {},
      swipes: [],
      indicator: 0,
      cart_btn_show: true,
      share_show: false,
      address_show: false,
      desc_show: false,
      sku_show: false,
      loading_show: false,
      options: [{ name: "复制链接", icon: "link" }],
      skuData: null,
      sku_selected: {},
      min_buy_price: 0,
    };
  },
  computed: {
    price_L() {
      if (this.sku_selected.price) {
        return String(this.sku_selected.price).split(".")[0];
      } else {
        return this.detail?.agencyPrice?.split(".")[0] ?? "";
      }
    },
    price_R() {
      if (this.sku_selected.price) {
        return String(this.sku_selected.price)?.split(".")[1] ?? "00";
      } else {
        return this.detail?.agencyPrice?.split(".")[1] ?? "00";
      }
    },
    isAndroid() {
      return window.android ? true : false;
    },
  },
  mounted() {
    this.routeId = this.$route.params.id;
    this.getData();
  },
  methods: {
    async getData() {
      this.loading_show = true;
      const res = await pDetail({ id: this.routeId });
      if (res) {
        this.min_buy_price = res.orderMiniTotalPrice;
        if (res.product.pic) {
          this.swipes = res.product.pic.split(",");
        }
        this.swipes.unshift(res.product.productCoverPic);
        this.detail = res.product;

        const attrList = res.productAttributeList;
        const stockList = res.skuStockList;
        let tree = [],
          list = [];

        for (let i = 0; i < attrList.length; i++) {
          tree.push({ k: attrList[i].name, k_s: "s" + i, v: [] });
          const name_attr = attrList[i].inputList.split("_");
          for (let j = 0; j < name_attr.length; j++) {
            tree[i].v.push({ id: name_attr[j], name: name_attr[j] });
          }
        }

        for (let i = 0; i < stockList.length; i++) {
          const spData = JSON.parse(stockList[i].spData);
          let str = "";
          for (let j = 0; j < spData.length; j++) {
            str += spData[j].value;
          }
          for (let k = 0; k < spData.length; k++) {
            if (k === 0) {
              list.push({
                id: stockList[i].id,
                price: stockList[i].agencyPrice,
                stock_num: stockList[i].stock,
                imgUrl: stockList[i].pic,
                ["s" + k]: spData[k].value,
                name: str,
              });
            } else {
              list[i][["s" + k]] = spData[k].value;
            }
          }
        }

        this.skuData = {
          sku: {
            tree,
            list,
            price: res.product.agencyPrice,
            stock_num: res.product.stock,
            none_sku: false,
            hide_stock: false,
          },
          // goods_id: "",
          // quota: res.product.promotionPerLimit,//限购数量
          // quota_used: 0,//已经购买过的数量
          goods_info: {
            picture: res.product.productCoverPic,
          },
          // initialSku: {}
        };

        this.loading_show = false;
      }
    },
    share(options, index) {
      this.$copyText(location.href).then(() => this.$toast.success("复制成功"));
      this.share_show = false;
    },
    onClickLeft() {
      this.$router.back();
    },
    changeSwipe(index) {
      this.indicator = index;
    },
    phone() {
      window.location.href = "tel://4006301286";
    },
    showSku() {
      if (!storage.get("Auth")) {
        return Login.login();
      }
      if (this.detail.productType === 2) {
        this.cart_btn_show = false;
      } else {
        this.cart_btn_show = true;
      }
      this.sku_show = true;
    },
    buy() {
      if (!storage.get("Auth")) {
        return Login.login();
      }
      this.cart_btn_show = false;
      this.sku_show = true;
    },
    onSkuSelected(data) {
      // 更改商品属性时触发
      if (data.selectedSkuComb) {
        this.skuData.goods_info.picture = data.selectedSkuComb.imgUrl;
        this.sku_selected = data.selectedSkuComb;
      }
    },
    onBuyClicked(data) {
      // 立即购买时触发
      if (data.selectedNum * data.selectedSkuComb.price < this.min_buy_price) {
        return this.$toast(`下单金额小于${this.min_buy_price}元`);
      }
      if (this.detail.productType === 2) {
        this.$router.push({
          name: "coupon-comfirm",
          query: {
            productId: this.routeId,
            skuId: data.selectedSkuComb.id,
            quantity: data.selectedNum,
          },
        });
      } else {
        this.$router.push({
          name: "order-comfirm",
          query: {
            isDetail: true,
            productId: this.routeId,
            skuId: data.selectedSkuComb.id,
            quantity: data.selectedNum,
          },
        });
      }
    },
    async onAddCartClicked(data) {
      // 加入购物车时触发
      const result = await getUserInfo();
      const res = await cartAdd({
        memberId: result.id,
        productId: this.routeId,
        productSkuId: data.selectedSkuComb.id,
        quantity: data.selectedNum,
      });
      if (res) {
        this.$toast.success("加入成功");
        this.sku_show = false;
        this.$store.dispatch("getCartNum");
      }
    },
    stepperChanged(num) {
      // 更改商品数量时触发
    },
  },
};
</script>
<style lang="scss" scoped>
.banner {
  position: relative;
  .circle-back,
  .circle-share {
    width: 3.4rem;
    height: 3.4rem;
    position: absolute;
    top: 1rem;
  }
  .circle-back {
    left: 1rem;
  }
  .circle-share {
    right: 1rem;
  }
  .custom-indicator {
    position: absolute;
    right: 1.2rem;
    bottom: 1.2rem;
    padding: 0.5rem;
    font-size: $font-size-12;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 1rem;
    color: $white-text;
  }
}

.info {
  padding: 1.2rem;
  .price {
    color: $color-price;
    .large {
      font-size: 3rem;
    }
  }
  .discount {
    color: $color-999;
    text-decoration: line-through;
    padding-left: 1rem;
  }
  .sale {
    color: $color-333;
  }
  .title {
    color: $color-333;
    font-size: $font-size-16;
    padding-top: 1rem;
    line-height: 2.2rem;
  }
}

.divider {
  height: 1rem;
  background-color: #f5f5f5;
}

.Lpicture {
  margin-bottom: 5rem;
  ::v-deep img {
    max-width: 100%;
  }
}

.kefu {
  width: 2.2rem;
  height: 2.2rem;
}

.PInfo {
  padding: 2rem;
  .title {
    font-size: $font-size-16;
  }
  .lists {
    padding-top: 3rem;
    .list {
      padding-top: 2rem;
      .right {
        flex: 2;
      }
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
