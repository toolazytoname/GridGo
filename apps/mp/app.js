// app.js - 微信小程序入口
App({
  onLaunch() {
    // 启动时检查登录态
    const session = wx.getStorageSync('gridgo-session')
    if (session) {
      this.globalData.session = session
    }
  },
  globalData: {
    session: null,
    user: null,
  },
})
