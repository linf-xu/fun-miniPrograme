// miniprogram/pages/guide.js
import Dialog from '../../ui/dialog/dialog';
const db = wx.cloud.database()
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
    
  },
  getData(){
    
  },
  getUserInfo(e){
    console.log(e)
    db.collection('user').add({
      data: Object.assign({
        creaTime: db.serverDate(),
        updateTime: db.serverDate()
      },e.detail.userInfo)
    })
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
  //发起新活动
  goNewActivity(){
    wx.navigateTo({
      url: '../newActivity/newActivity',
    })
  },
  // 查看地图
  viewMap(e){
    console.log(e)
    // return
    let latitude = e.currentTarget.dataset.latitude
    let longitude = e.currentTarget.dataset.longitude
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
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
    console.log(getApp().globalData)
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('activityList').where({
      isStart: true
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