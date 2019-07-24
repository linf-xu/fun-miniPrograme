// miniprogram/pages/guide.js
import Dialog from '../../ui/dialog/dialog';
import Toast from '../../ui/toast/toast';
const db = wx.cloud.database()
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waitingList:[],
    endList: [],
    pageLoading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    app.$watch('userInfo', (val, old) => {
      console.log(val,old)
      this.setData({
        userInfo: val
      })
      this.init()
    })
  },
  getData(){
    
  },
  
  init(){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('activityList').orderBy('updateTime', 'desc').where({
      isStart: true
    }).get({
      success: res => {
        // console.log(res.data)
        let waitingList = res.data
        waitingList.map(item => {
          // console.log(item.joinIds.indexOf(app.globalData.userInfo._openid))
          if (item.joinIds.indexOf(app.globalData.userInfo._openid)>-1){
            item.isJoin = true
          }
        })
        // console.log(waitingList)
        this.setData({
          waitingList,
          pageLoading: false
        })
        // this.setData({
        //   pageLoading: false
        // })
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
  // getUserInfo(e){
  //   console.log(e)
  //   db.collection('user').add({
  //     data: Object.assign({
  //       creaTime: db.serverDate(),
  //       updateTime: db.serverDate()
  //     },e.detail.userInfo)
  //   })
  // },
  onD(){
    Dialog.alert({
      title: '标题',
      message: '弹窗内容'
    }).then(() => {
      // on close
      console.log(1)
    });
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
  // 报名
  baoming(e){
    console.log(e)
    if(!app.globalData.userInfo){
      app.getUserInfo().then(()=>{
        this.upadteBaomingDb(e.currentTarget.dataset.index)
      })
      return
    }
    this.upadteBaomingDb(e.currentTarget.dataset.index)
    return false
  },
  upadteBaomingDb(index){
    //更新活动list表
    let joins = this.data.waitingList[index].joins
    joins.push({
      openid: app.globalData.userInfo._openid,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName,
      realName: app.globalData.userInfo._realName
    })
    let joinIds = this.data.waitingList[index].joinIds + ',' + app.globalData.userInfo._openid
    db.collection('activityList')
      .doc(this.data.waitingList[index]._id)
      .update({
        data: {
          joins,
          joinIds,
          updateTime: db.serverDate(),
        }
      })
      .then(()=>{
        this.init()
        wx.showToast({
          title: '报名成功',
          icon: 'success',
          duration: 2000
        })
      })
    //插入活动record表
    db.collection('record')
      .add({
        data: {
          createTime: db.serverDate(),
          updateTime: db.serverDate(),
          activityId: this.data.waitingList[index]._id,
          role:'join',
          action:'add'
        }
      })

  },
  // 获取用户信息
  addNew() {
    console.log(222)
    wx.navigateTo({
      url: '../activity/addNew'
    })
  },
  // 查看详情
  goDetail(e){
    wx.navigateTo({
      url: '../activity/detail?id='+e.currentTarget.dataset.id
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
    if(app.globalData.userInfo){
      this.init()
    }
    
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