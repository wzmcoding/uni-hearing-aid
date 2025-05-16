const defaultImage = `${WEB_PREFIX}/wx/share/default.jpg`
const addressImage = `${WEB_PREFIX}/wx/share/address.jpg`

export function commonShare() {
  return {
    title: '大件物流上门取件5折起',
    path: '/pages/index',
    // #ifndef MP-ALIPAY
    imageUrl: defaultImage,
    // #endif
    // #ifdef MP-ALIPAY
    bgImgUrl: defaultImage,
    // #endif
  }
}

export function addressShare(id?: string) {
  if (!id) {
    return commonShare()
  }
  return {
    title: '我的地址信息，点击查看',
    path: `/pages/address-book/detail?id=${id}`,
    // #ifndef MP-ALIPAY
    imageUrl: addressImage,
    // #endif
    // #ifdef MP-ALIPAY
    bgImgUrl: addressImage,
    // #endif
  }
}

export function orderShare(id?: string, title: string = '我的订单信息，点击查') {
  if (!id) {
    return commonShare()
  }
  return {
    title,
    path: `/pages/share/orderDetail?id=${id}`,
  }
}
