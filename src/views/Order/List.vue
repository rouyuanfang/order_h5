<template>
  <div class="normal_page f5f5f5">
    <van-sticky>
      <van-nav-bar :title="title" left-arrow @click-left="jumpTo('/mine')" />
    </van-sticky>

    <van-tabs
      sticky
      offset-top="45"
      title-active-color="#F94227"
      line-width="2rem"
      @change="tabChange"
      v-model="activeName"
    >
      <van-tab
        v-for="item in tabs"
        :key="item.name"
        :title="item.title"
        :name="item.name"
      >
        <div v-if="lists.length == 0" class="empty">
          <svg-icon icon-class="no-order" class="no-data" />
          <p>暂无内容～</p>
        </div>
        <div class="content overflow-y" v-else>
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
                v-for="item in lists"
                :key="item.id"
                @click="to_Order_Detail(item.id)"
              >
                <div class="top flex-between">
                  <p class="date">下单时间：{{ item.createTime }}</p>
                  <p class="status">{{ status[item.status] }}</p>
                </div>

                <div
                  class="flex"
                  v-for="val in item.orderItemList"
                  :key="val.id"
                >
                  <div>
                    <van-image
                      width="9rem"
                      height="9rem"
                      fit="cover"
                      radius="0.4rem"
                      :src="val.productPic"
                    />
                  </div>
                  <div class="bot">
                    <div class="bot_top">
                      <p class="title two-wrap">
                        {{ val.productName }}
                      </p>
                      <p class="price">￥{{ val.productPrice }}</p>
                    </div>
                    <div class="bot_under flex-between">
                      <div class="sku">{{ val.attr }}</div>
                      <div class="num">x{{ val.productQuantity }}</div>
                    </div>
                  </div>
                </div>

                <van-divider />

                <div class="total flex-between">
                  <div>共{{ item.quantity }}件商品</div>
                  <div>
                    <span>合计：</span
                    ><span class="price">￥{{ item.payAmount }}</span>
                  </div>
                </div>

                <div class="btn">
                  <div
                    @click.stop="del(item.id)"
                    v-if="item.status === 4 || item.status === 5"
                    class="gray"
                  >
                    删除订单
                  </div>
                  <div
                    v-if="item.status === 3 || item.status === 4"
                    class="gray"
                    @click.stop="toLogics(item.id)"
                  >
                    查看物流
                  </div>
                  <div
                    @click.stop="cancel(item.id)"
                    v-if="item.status === 1"
                    class="gray"
                  >
                    取消订单
                  </div>

                  <!-- <div class="gray">查看退款</div> -->
                  <div
                    @click.stop="receive(item.id)"
                    v-if="item.status === 3"
                    class="red"
                  >
                    确认收货
                  </div>
                  <div
                    @click.stop="toDetail(item.orderItemList[0].productId)"
                    v-if="item.status === 4 || item.status === 5"
                    class="red"
                  >
                    再次购买
                  </div>
                  <div
                    @click.stop="pay(item.id)"
                    v-if="item.status === 1"
                    class="red"
                  >
                    立即付款
                  </div>

                  <div
                    @click.stop="toUpload(item.id, 'branch', 'repeat')"
                    v-if="role === 'branch' && item.needCompanyPayScreen"
                    class="red-bg"
                  >
                    修改对公
                  </div>
                  <div
                    @click.stop="toUpload(item.id, 'normal', 'repeat')"
                    v-if="item.needMemberPayScreen"
                    class="red-bg"
                  >
                    修改支付
                  </div>
                  <div
                    @click.stop="toUpload(item.id, 'branch')"
                    v-if="
                      role === 'branch' &&
                      !item.companyPayScreen &&
                      (item.status === 2 ||
                        item.status === 3 ||
                        item.status === 4)
                    "
                    class="red-bg"
                  >
                    上传凭证
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import {
  ListOrder,
  deleteOrder,
  cancelOrder,
  receiveOrder,
  ListBranchOrder,
} from "@/service";
export default {
  data() {
    return {
      title: "",
      activeName: "",
      tabs: [
        { name: -1, title: "全部" },
        { name: 1, title: "待付款" },
        { name: 2, title: "待发货" },
        { name: 3, title: "待收货" },
        { name: 4, title: "交易完成" },
        { name: 5, title: "已取消" },
      ],
      status: {
        1: "待付款",
        2: "待发货",
        3: "待收货",
        4: "交易完成",
        5: "已取消",
      },
      pageOptions: {
        pageNum: 1,
        pageSize: 15,
      },
      loading: false,
      finished: false,
      lists: [],
    };
  },
  mounted() {
    this.activeName = this.$route.query.activeName;
    this.role = this.$route.query.role;

    if (this.role === "branch") {
      this.title = "分部客户订单";
    } else if (this.role === "normal") {
      this.title = "我的订单";
    }
    this.getData();
  },
  methods: {
    async tabChange(name) {
      this.activeName = name;
      this.pageOptions.pageNum = 1;
      this.loading = true;
      this.finished = false;
      this.getData();
    },
    async getData() {
      let methodName = this.role === "branch" ? ListBranchOrder : ListOrder;
      const reg = /、$/gi;

      const res = await methodName({
        pageNum: this.pageOptions.pageNum,
        pageSize: this.pageOptions.pageSize,
        status: this.activeName,
      });
      if (!res) {
        return (this.lists = []);
      }
      if (!res.list) {
        res.list = [];
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

      if (this.lists.length > 0) {
        this.lists.map((i) => {
          if (i.orderItemList.length > 0) {
            i.orderItemList.map((j) => {
              const attr = JSON.parse(j.productAttr);
              let str = "";
              attr.map((k) => {
                str += k.value + "、";
              });
              j.attr = str.replace(reg, "");
            });
          }
        });
      }
    },
    onLoad() {
      this.getData();
    },
    jumpTo(path) {
      this.$router.push(path);
    },
    to_Order_Detail(id) {
      this.$router.push({
        name: "order-detail",
        query: { id, role: this.role },
      });
    },
    toDetail(id) {
      this.$router.push({ path: `/product-detail/${id}` });
    },
    toLogics(id) {
      this.$router.push({ path: `/order-logics/${id}` });
    },
    cancel(orderId) {
      this.$dialog
        .confirm({
          message: "确定取消订单？",
        })
        .then(async () => {
          // on confirm
          const res = await cancelOrder({ orderId });
          if (res) {
            this.$toast.success("取消成功");
            this.loading = true;
            this.finished = false;
            this.pageOptions.pageNum = 1;
            this.getData();
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    del(orderId) {
      this.$dialog
        .confirm({
          message: "确定删除订单？",
        })
        .then(async () => {
          // on confirm
          const res = await deleteOrder({ orderId });
          if (res) {
            this.$toast.success("删除成功");
            this.pageOptions.pageNum = 1;
            this.loading = true;
            this.finished = false;
            this.getData();
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    receive(orderId) {
      this.$dialog
        .confirm({
          message: "确定已收货？",
        })
        .then(async () => {
          // on confirm
          const res = await receiveOrder({ orderId });
          if (res) {
            this.$toast.success("收货成功");
            this.pageOptions.pageNum = 1;
            this.loading = true;
            this.finished = false;
            this.getData();
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    pay(id) {
      this.$router.push({ name: "order-commit", query: { id, txt: "" } });
    },
    toUpload(id, role, repeat) {
      this.$router.push({
        name: "order-upload",
        query: { id, role, repeat },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep.van-nav-bar .van-icon {
  color: #000;
}

.content {
  height: calc(100vh - 90px);
}

.lists {
  .list {
    padding: 1.2rem;
    margin: 1.2rem;
    border-radius: 1.2rem;
    background-color: $white-background;
    .top {
      margin: 1.2rem 0;
      font-size: $font-size-14;
      .status {
        color: $color-price;
      }
    }
    .bot {
      flex: 2;
      margin-left: 0.8rem;
      &_top {
        display: flex;
        justify-content: space-between;
        font-size: $font-size-14;
        color: $color-333;
        line-height: 1.8rem;
        .title {
          flex: 2;
        }
        .price {
          font-weight: bold;
        }
      }
      &_under {
        margin-top: 1rem;
        color: $color-999;
        .sku {
          flex: 2;
        }
      }
    }
    .total {
      color: $color-666;
      .price {
        color: $color-333;
        font-size: $font-size-18;
      }
    }
    .btn {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 1rem 0;
      gap: 0.6rem;
      div {
        width: 6.8rem;
        height: 2.6rem;
        line-height: 2.6rem;
        text-align: center;
        border-radius: 1.2rem;
      }
      .red {
        color: $color-price;
        border: 1px solid $color-price;
      }
      .gray {
        color: $color-999;
        border: 0.1rem solid #bbbbbb;
      }
      .red-bg {
        background-color: $color-price;
        color: $white-text;
      }
    }
    .flex {
      margin-bottom: 1.2rem;
    }
  }
}
</style>
