// pages/newActivity.js
var inputMixins = require("../../mixins/inputMixins.js")
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    nickName:'',
    realName:'',
    openid:'',
    title:'',
    name:'',
    address:'',
    joinNum:'',
    remarks:'',
    tempName:'',
    isTemp: false,
    submit:false,
    curStatus:'wait',
    isStart:true,
    isEnd:false,
    minDate: new Date().getTime(),
    maxDate: new Date().getTime()+180*24*60*60*1000,
    currentDate: new Date().getTime(),
    showTimePicker:false,
    startTime:'',
    endTime:'',
    timePicker:'start',
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      } else if (type === 'day') {
        return `${value}日`;
      } 
      return value;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  // 地图选择
  chooseAddress(){
    wx.chooseLocation({
      success: (res)=> {
        // success
        console.log(res, "location")
        console.log(res.name)
        console.log(res.latitude)
        console.log(res.longitude)
        this.setData({
          address: res.name,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  // 选择开始时间
  chooseEndTime(){
    this.setData({
      showTimePicker:true,
      timePicker:'end'
    })
  },
  // 选择结束时间
  chooseStartTime() {
    this.setData({
      showTimePicker: true,
      timePicker: 'start'
    })
  },
  // 获取选择的时间
  onTimeInput(e){
    let timestamp4 = new Date(e.detail);
    let formData = timestamp4.toLocaleDateString().replace(/\//g, "-") + " " + timestamp4.toTimeString().substr(0, 8)
    if(this.data.timePicker=='start'){
      this.setData({
        showTimePicker: false,
        startTime: formData.slice(5, 15)
      })
    }else{
      this.setData({
        showTimePicker: false,
        endTime: formData.slice(5, 15)
      })
    }
  },
  //是否添加为模板
  isTemp(event){
    this.setData({ isTemp: event.detail });
  },
  submit(){
    if (
      this.data.title &&
      this.data.name &&
      this.data.address &&
      this.data.joinNum &&
      ((this.data.tempName && this.data.isTemp) || !this.data.isTemp)
    ){
    this.onAdd()
    }else{
      wx.showToast({
        title: '请填写完整信息',
      })
    }
  },
  //新建活动
  onAdd() {
    const db = wx.cloud.database()
    db.collection('activityList').add({
        data: Object.assign({
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        },{
          joins:[
            {
              openid: this.data.openid,
              avatarUrl: this.data.avatarUrl || '',
              nickName: this.data.nickName || '',
              realName: this.data.realName || '',
            }
          ]
        },this.data)
    })
      .then(res => {
        wx.showToast({
          title: '新增记录成功',
        })
        setTimeout(() => {
          wx.navigateTo({
            url: 'page/activity/detail?user_id=111'
          })
        }, 2000)
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      }).catch(err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
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
    let userInfo = getApp().globalData.userInfo
    this.setData({
      openid: userInfo._openid,
      avatarUrl: userInfo.avatarUrl,
      nickName: userInfo.nickName,
      realName: userInfo.realName || ''
    })
    console.log(userInfo)
    console.log(this.data.userInfo)
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
},inputMixins))