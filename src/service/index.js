import { sendHttp } from "./base";

//文件上传
export function fileUpload(params) {
  const headers = { "Content-Type": "multipart/form-data" };
  return sendHttp("/app/obs/upload", "post", params, { headers });
}
//识别二维码
export function CouponQrcode(params) {
  const headers = { "Content-Type": "multipart/form-data" };
  return sendHttp("/app/order/virtual/decodeQrCode", "post", params, {
    headers,
  });
}

// App 应用市场下载链接
export function getAppURL() {
  return sendHttp("/app/home/getMiaoyinAppDownloadUrl", "get");
}

/* 用户 */
//登录
export function login(params) {
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  return sendHttp("/app/sso/login", "post", params, { headers });
}
//信息
export function getUserInfo() {
  return sendHttp("/app/sso/info", "get");
}
//实名
export function getAuthentication() {
  return sendHttp("/app/sso/checkAuthentication", "get");
}
//是否分部员工
export function isBranchMember() {
  return sendHttp("/app/sso/isFilialeCharge", "get");
}
//是否核销员
export function isCancelMember() {
  return sendHttp("/app/sso/isTicketCodeVerifier", "get");
}

/* 系统消息 */
//点击相应的栏
export function noticeType(params) {
  return sendHttp("/app/system/inform/readByType", "get", { params });
}
//列表
export function noticeSystemList(params) {
  return sendHttp("/app/system/inform/list", "get", { params });
}
//全部已读
export function noticeSystemRead() {
  return sendHttp("/app/system/inform/readAll", "post");
}

/* 分类 */
export function cateList() {
  return sendHttp("/app/home/productCateAllList", "get");
}

/* 首页 */
// 列表
export function search(params) {
  return sendHttp("/search/esProduct/search", "get", { params });
}
// tab栏
export function homeCategory(params) {
  return sendHttp("/app/home/productCateList", "get", { params });
}
// sub.vue  tab栏切换
export function homeCategoryChange(params) {
  return sendHttp("/search/esProduct/homeSearch", "get", { params });
}

/* 商品 */
//详情
export function pDetail(params) {
  return sendHttp("/app/product/detail", "get", { params });
}

/* 收货地址 */
//列表
export function addressList() {
  return sendHttp("/app/member/address/list", "get");
}
//详情
export function addressDetail(params) {
  return sendHttp("/app/member/address", "get", { params });
}
//删除
export function addressDel(params) {
  return sendHttp("/app/member/address/delete", "get", { params });
}
//新增
export function addressAdd(params) {
  return sendHttp("/app/member/address/add", "post", params);
}
//编辑
export function addressEdit(params) {
  return sendHttp("/app/member/address/update", "post", params);
}

/* 积分兑换 */
//列表
export function exchangeList(params) {
  return sendHttp("/app/agencyExchanges/getPointExchange", "post", params);
}
//新增
export function exchangeAdd(params) {
  return sendHttp(
    "/app/agencyExchanges/createMemberAgentOrders",
    "post",
    params
  );
}
//总积分
export function totalScore(params) {
  return sendHttp("/app/agencyExchanges/getUserIntegral", "get", { params });
}

/* 购物车 */
//列表
export function cartList() {
  return sendHttp("/app/cart/list", "get");
}
//新增
export function cartAdd(params) {
  return sendHttp("/app/cart/add", "post", params);
}
//删除
export function cartDel(params) {
  return sendHttp("/app/cart/delete", "post", params);
}
//金额
export function cartTotalPrice(params) {
  return sendHttp("/app/cart/totalPrice", "post", params);
}
//数量加减
export function card_CRUD(params) {
  return sendHttp("/app/cart/update/quantity", "get", { params });
}

/* 订单 */
//列表
export function ListOrder(params) {
  return sendHttp("/app/order/list", "get", { params });
}
//分部列表
export function ListBranchOrder(params) {
  return sendHttp("/app/order/companyOrderList", "get", { params });
}
// 取消订单
export function cancelOrder(params) {
  return sendHttp("/app/order/cancelUserOrder", "get", { params });
}
// 删除订单
export function deleteOrder(params) {
  return sendHttp("/app/order/deleteOrder", "get", { params });
}
//创建订单
export function createOrder(params) {
  return sendHttp("/app/order/generateConfirmOrder", "post", params);
}
//生成订单
export function generateOrder(params) {
  return sendHttp("/app/order/generateOrder", "post", params);
}
//详情
export function detailOrder(params) {
  return sendHttp("/app/order/detail", "get", { params });
}
//确认收货
export function receiveOrder(params) {
  return sendHttp("/app/order/confirmReceiveOrder", "get", { params });
}
//支付成功
export function payOrder(params) {
  return sendHttp("/app/order/paySuccess", "post", params);
}
//支付成功--分部员工
export function payOrder_branch(params) {
  return sendHttp("/app/order/update/companyPayScreen", "post", params);
}

/* 服务中心 */
//列表
export function ListService(params) {
  return sendHttp("/app/company/list", "post", params);
}
//选择服务中心
export function updateService(params) {
  return sendHttp("/app/sso/updateMemberCompanyId", "get", { params });
}

//是否选择服务中心
export function getChooseService(params) {
  return sendHttp("/app/sso/checkBindCompany", "get", { params });
}
// 订单物流
export function getLogics(params) {
  return sendHttp("/app/order/queryDeliveryByOrderId", "get", { params });
}

/* 卡券 */
//列表
export function CouponList(params) {
  return sendHttp("/app/order/virtual/list", "get", { params });
}
//分部列表
export function CouponBranchList(params) {
  return sendHttp("/app/order/virtual/companyOrderList", "get", { params });
}
// 取消订单
export function CouponAbolish(params) {
  return sendHttp("/app/order/virtual/cancelOrder", "get", { params });
}
//详情
export function CouponDetail(params) {
  return sendHttp("/app/order/virtual/detail", "get", { params });
}
//normal支付
export function CouponPay(params) {
  return sendHttp("/app/order/virtual/updateMemberPayScreen", "post", params);
}
//branch支付
export function CouponPay_branch(params) {
  return sendHttp("/app/order/virtual/updateCompanyPayScreen", "post", params);
}
//判断支付状态
export function CouponPayStatus(params) {
  return sendHttp("/app/order/virtual/getPayStatus", "get", { params });
}
//获取wechat支付url
export function CouponWechatUrl(params) {
  return sendHttp("/app/order/virtual/payOrder", "get", { params });
}
//核销
export function CouponCancel(params) {
  return sendHttp("/app/order/virtual/portalVerify", "get", { params });
}
//核销记录
export function CouponRecord(params) {
  return sendHttp("/app/order/virtual/verifyHistory", "get", { params });
}

/* 分部客户 */
//列表
export function branchList(params) {
  return sendHttp("/app/sso/memberListByCompany", "get", { params });
}