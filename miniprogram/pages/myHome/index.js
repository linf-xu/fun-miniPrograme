// pages/newActivity.js
var inputMixins = require("../../mixins/inputMixins.js")
var app = getApp()
const db = wx.cloud.database()
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: 'user-unlogin.png',
    nickName: '',
    realName: '',
    openid: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.$watch('userInfo', (val, old) => {
      this.init()
    })
    app.$watch('nickName', (val, old) => {
      if (app.globalData.userInfo.nickName) {
        this.setData({
          nickName: app.globalData.userInfo.nickName
        })
      }
    })
  },
  init() {
    let userInfo = app.globalData.userInfo
    console.log(app.globalData)
    this.setData({
      openid: app.globalData.openid,
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName,
      realName: userInfo.realName || ''
    })
  },
  getUserInfo(res) {
    app.updateUserInfo(res)
  },
  update(){
    db.collection('user').doc(app.globalData.userInfo._id).update({
      data: {
        updateTime: db.serverDate(),
        realName: this.data.realName
      }
    }).then(() => {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 2000
      })
    })
    app.setGlobalData({realName: this.data.realName})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '里边有好玩的活动！',
      path: 'pages/index/index'
    }
  }
}, inputMixins))