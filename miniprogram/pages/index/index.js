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
    nickName:'',
    scrollTop:0,
    addTop:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
  getData(){
    
  },
  getUserInfo(res){
    app.updateUserInfo(res)
  },
  init(){
    if (app.globalData.userInfo.nickName){
      this.setData({
        nickName: app.globalData.userInfo.nickName
      })
    }
    console.log('init',app.globalData)
    if (!app.globalData.openid) return
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('activityList').orderBy('updateTime', 'desc').where({
      isStart: true
    }).get({
      success: res => {
        console.log(app.globalData.openid)
        // console.log(res.data)
        let acList = res.data
        let nowStamp = new Date().getTime()
        try{
          acList.map(item => {
            // console.log(item.joinIds.indexOf(app.globalData.openid))
            if (item.joinIds.indexOf(app.globalData.openid) > -1) {
              item.isJoin = true
            }
            if (item.isStart && nowStamp > item.startTimeStamp && nowStamp < item.endTimeStamp){
              item.curStatus = 'going'
            }
            if (item.isStart && nowStamp > item.endTimeStamp) {
              item.curStatus = 'end'
            }
          })
        }catch(e){
          console.log(e)
        }
        // console.log(waitingList)
        console.log(acList)
        let waitingList = acList.filter(item=>{
          return item.curStatus == 'wait' || item.curStatus == 'going'
        })
        let endList = acList.filter(item => {
          return item.isEnd || item.curStatus == 'end'
        })
        this.setData({
          waitingList,
          endList,
          pageLoading: false
        })
        const query = wx.createSelectorQuery()
        query.select('#add').boundingClientRect()
        query.exec((res) => {
          this.setData({
            addTop:res[0].top
          })
          // res[0].top       // #the-id节点的上边界坐标
          // res[1].scrollTop // 显示区域的竖直滚动位置
        })
        console.log(this.data.pageLoading)
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
    if(!app.globalData.userInfo.nickName){
      wx.showToast({
        icon: 'none',
        title: '您还未登陆，请点击页面最上方登录'
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
      openid: app.globalData.openid,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName,
      updateTime: db.serverDate(),
      realName: app.globalData.userInfo._realName
    })
    console.log(app.globalData.userInfo)
    let joinIds = this.data.waitingList[index].joinIds + ',' + app.globalData.openid
    let _data = {
      id: this.data.waitingList[index]._id,
      data: {
        joins,
        joinIds,
        updateTime: db.serverDate(),
      }
    }
    let _this = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'updateActive',
      // 传给云函数的参数
      data: _data,
      success(res) {
        console.log(res)
        _this.init()
        wx.showToast({
          title: '报名成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: console.error
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
    if (!app.globalData.userInfo.nickName) {
      wx.showToast({
        icon: 'none',
        title: '您还未登陆，请点击页面最上方登录'
      })
      return
    }
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
  scroll: function (e) {
    console.log(e.detail.scrollTop)
    this.setData({
      scrollTop: e.detail.scrollTop
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
    if (app.globalData.openid) this.init()
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
      title: '里边有好玩的活动！'
    }
  }
})