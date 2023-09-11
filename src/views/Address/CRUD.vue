<template>
  <div>
    <van-nav-bar
      :title="title"
      left-arrow
      :right-text="rightText"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
    </van-nav-bar>
    <van-form @submit="onSubmit">
      <van-field
        v-model="form.name"
        label="联系人"
        placeholder="请填写联系人"
        :maxlength="20"
        :rules="[{ required: true }]"
      />
      <!-- :rules="[{ required: true, message: '请填写联系人' }]" -->
      <van-field
        v-model="form.phoneNumber"
        label="手机号码"
        placeholder="请填写手机号码"
        type="tel"
        :maxlength="11"
        :rules="[{ required: true }, { pattern: /^(1[3-9])\d{9}$/ }]"
      />
      <van-field
        v-model="area"
        label="所在地区"
        readonly
        placeholder="请选择区域"
        right-icon="arrow"
        @click="address_show = true"
        :rules="[{ required: true }]"
      />
      <van-field
        v-model="form.detailAddress"
        label="详细地址"
        placeholder="请填写详细地址信息"
        autosize
        type="textarea"
        :rules="[{ required: true }]"
      />

      <van-cell title="设置默认地址">
        <template #right-icon>
          <van-switch
            v-model="form.defaultStatus"
            :active-value="1"
            :inactive-value="0"
            active-color="#F94227"
          />
        </template>
        <template #label>
          <p>提醒：每次下单会默认推荐使用该地址</p>
        </template>
      </van-cell>
      <div class="btn">
        <van-button round block color="#F94227" native-type="submit"
          >保存</van-button
        >
      </div>
    </van-form>
    <van-popup v-model="address_show" round position="bottom">
      <van-area
        @confirm="address_confirm"
        @cancel="address_show = false"
        :value="form.regionCode"
        title="所在地区"
        :area-list="areaList"
      />
    </van-popup>
  </div>
</template>
<script>
import { areaList } from "@vant/area-data";
import { addressDetail, addressDel, addressAdd, addressEdit } from "@/service";
export default {
  data() {
    return {
      areaList,
      title: "",
      rightText: "",
      isEdit: false,
      address_show: false,
      area: "",
      form: {
        name: "",
        phoneNumber: "",
        regionCode: "",
        province: "",
        city: "",
        region: "",
        detailAddress: "",
        defaultStatus: 0,
      },
      routeId: 0,
    };
  },
  mounted() {
    this.isEdit = this.$route.query.isEdit;
    this.title = this.isEdit ? "编辑地址" : "新增地址";
    this.rightText = this.isEdit ? "删除地址" : "";

    if (this.isEdit) {
      this.routeId = this.$route.query.id;
      this.getData();
    }
  },
  methods: {
    async getData() {
      const res = await addressDetail({ id: this.routeId });
      let {
        name,
        phoneNumber,
        regionCode,
        province,
        city,
        region,
        detailAddress,
        defaultStatus,
      } = res;

      this.form = {
        name,
        phoneNumber,
        regionCode,
        province,
        city,
        region,
        detailAddress,
        defaultStatus,
      };
      // this.form.name = res.name;
      // this.form.phoneNumber = res.phoneNumber;
      // this.form.regionCode = res.regionCode;
      // this.form.province = res.province;
      // this.form.city = res.city;
      // this.form.region = res.region;
      // this.form.detailAddress = res.detailAddress;
      // this.form.defaultStatus = res.defaultStatus;

      this.area = res.province + res.city + res.region;
    },
    onClickLeft() {
      this.$router.back();
    },
    onClickRight() {
      this.$dialog
        .confirm({
          message: "确定删除收货地址？",
        })
        .then(async () => {
          // on confirm addressDel
          const res = await addressDel({ id: this.routeId });
          if (res) {
            this.$toast.success("删除成功");
            this.$router.back();
          }
        })
        .catch(() => {
          // on cancel
        });
    },
    address_confirm(val) {
      this.area = val[0].name + val[1].name + val[2].name;
      this.form.regionCode = val[2].code;
      this.form.province = val[0].name;
      this.form.city = val[1].name;
      this.form.region = val[2].name;
      this.address_show = false;
    },
    async onSubmit() {
      if (this.isEdit) {
        const res = await addressEdit({ id: this.routeId, ...this.form });
        if (res) {
          this.$toast.success("编辑成功");
          this.$router.back();
        }
      } else {
        const res = await addressAdd(this.form);
        if (res) {
          this.$toast.success("新增成功");
          this.$router.back();
        }
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
::v-deep.van-switch--on {
  background-color: $color-price !important;
}

.btn {
  position: fixed;
  bottom: 0;
  width: 90%;
  margin: 2rem;
}
</style>
