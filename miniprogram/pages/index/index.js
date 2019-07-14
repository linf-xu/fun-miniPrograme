// miniprogram/pages/guide.js
import Dialog from '../../ui/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitingList:[],
    endList: [],
    pageLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOpenid()
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('activityList').where({
      _status: 'waiting'
    }).get({
      success: res => {
        this.setData({
          waitingList: res.data,
          pageLoading: false
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  getData(){
    
  },
  getOpenid(){
    // wx.cloud.callFunction({
    //   name: 'login',
    //   complete: res => {
    //     console.log('云函数获取到的openid: ', res)
    //     var openid = res.result.openId;
    //     // that.setData({
    //     //   openid: openid
    //     // })
    //   }
    // })
  },
  getUserInfo(e){
    console.log(e)
  },
  onD(){
    Dialog.alert({
      title: '标题',
      message: '弹窗内容'
    }).then(() => {
      // on close
      console.log(1)
    });
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

  }
})