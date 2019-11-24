
// pages/newActivity.js
var inputMixins = require("../../mixins/inputMixins.js")
// const regeneratorRuntime = require('../../libs/regenerator-runtime/runtime')

var app = getApp()
const db = wx.cloud.database()
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
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
    startTime: '',
    startTimeStamp:'',
    endTime: '',
    endTimeStamp:'',
    timePicker:'start',
    tempList:[],
    makerJoin:true,
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
  init(){
    let userInfo = app.globalData.userInfo
    console.log(app.globalData)
    // this.setData({
    //   openid: app.globalData.openid,
    //   avatarUrl: userInfo.avatarUrl,
    //   nickName: userInfo.nickName,
    //   realName: userInfo.realName || ''
    // })
    // 查询模板列表
    db.collection('tempList').get({
      success: res => {
        this.setData({
          tempList: res.data,
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      }
    })
  },
  // 地图选择
  chooseAddress(){
    wx.chooseLocation({
      success: (res)=> {
        // success
        // console.log(res, "location")
        // console.log(res.name)
        // console.log(res.latitude)
        // console.log(res.longitude)
        this.setData({
          address: res.name,
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      fail: function (e) {
        // fail
        console.log(e)
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
    let formData = this.formDate(e.detail);
    let timeStamp = new Date(e.detail).getTime()
    console.log(timeStamp)
    console.log(formData)
    if(this.data.timePicker=='start'){
      this.setData({
        showTimePicker: false,
        startTime: formData.slice(5, 16),
        startTimeStamp:timeStamp
      })
    }else{
      this.setData({
        showTimePicker: false,
        endTime: formData.slice(5, 16),
        endTimeStamp: timeStamp
      })
    }
  },
  //是否添加为模板
  isTemp(event){
    this.setData({ isTemp: event.detail });
  },
  makerJoin(event) {
    this.setData({ makerJoin: event.detail });
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
  async onAdd() {
    let addObj={
      createTime: new Date().getTime(),
      updateTime: new Date().getTime(),
      joins:[],
      joinIds: '',
      imgList: [],
      playmaker:{
        openid: app.globalData.openid,
        avatarUrl: app.globalData.userInfo.avatarUrl || '',
        nickName: app.globalData.userInfo.nickName || '',
        realName: app.globalData.userInfo.realName || ''
      }
    }
    if (this.data.makerJoin){
      addObj.joins = [
        {
          openid: app.globalData.openid,
          avatarUrl: app.globalData.userInfo.avatarUrl || '',
          nickName: app.globalData.userInfo.nickName || '',
          realName: app.globalData.userInfo.realName || '',
          updateTime: this.getDate(new Date().getTime())
        }
      ]
      addObj.joinIds= app.globalData.openid
    }
    console.log(addObj)
    let checkContent = JSON.stringify(this.data).replace(/[^\u4e00-\u9fa5|,]+/g, '')
    console.log(checkContent)
    let ckres = await wx.cloud.callFunction({
      name: 'msgcheck',
      data: {
        content: checkContent
      }
    })
    console.log(ckres)
    //写审核通过之后的操作 if == 0
    if (ckres.result.errCode == 0) {
    } else {
      wx.hideLoading();
      wx.showModal({
        title: '提醒',
        content: '提交的信息中有敏感词，请注意言论',
        showCancel: false
      })
      return
    }
    //插入activitylist
    db.collection('activityList').add({
      data: Object.assign(addObj,this.data)
    })
      .then(res => {
        wx.showToast({
          title: '新建活动成功',
        })
        this.setData({ id: res._id})
        setTimeout(() => {
          wx.redirectTo({
            url: '../activity/detail?id=' + res._id
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
    // 插入活动记录表
    db.collection('record')
      .add({
        data: {
          createTime: new Date().getTime(),
          updateTime: new Date().getTime(),
          role: 'playmaker',
          activityTitle: this.data.title,
          action: 'create'
        }
      })
    if (this.data.isTemp){
      // 插入templist
      try{
      db.collection('tempList')
        .add({
          data: {
            createTime: new Date().getTime(),
            updateTime: new Date().getTime(),
            title: this.data.title,
            name: this.data.name,
            address: this.data.address,
            latitude: this.data.latitude,
            longitude: this.data.longitude,
            joinNum: this.data.joinNum,
            created: this.data._openid,
            tempName: this.data.tempName
          }
          }).then(res => {
            wx.showToast({
              title: '新建活动成功',
            })
            console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
          }).catch(err => {
            wx.showToast({
              icon: 'none',
              title: '新增记录失败'
            })
            console.error('[数据库] [新增记录] 失败：', err)
          })
      } catch (e) {
        console.log(e)
      }
    }
  },
  // 使用模板
  useTemp(e){
    let temp = this.data.tempList[e.currentTarget.dataset.index]
    this.setData({
      title: temp.title,
      name: temp.name,
      address: temp.address,
      latitude: temp.latitude,
      longitude: temp.longitude,
      joinNum: temp.joinNum,
      isTemp: false,
      tempName: ''
    })
  },
  // 新建模板
  addTemp(){
    console.log('addtemp')
    wx.showToast({
      icon: 'none',
      title: '填写下方活动信息，选择添加为模板即可',
      duration: 2000
    })
    this.setData({isTemp:true})
  },
  getDate(time, splitStr='-') {
    if (!time) return '';

    var date = time
    try{
      date = new Date(time)
    }catch(e){
      console.log(e)
    }
    var M = date.getMonth() + 1;
    var y = date.getFullYear();
    var d = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();

    if (M < 10) M = "0" + M;
    if (d < 10) d = "0" + d;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;

    if (splitStr)
      return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
    else
      return {
        y: y,
        M: M,
        d: d
      };
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
      path:'pages/index/index'
    }
  }
},inputMixins))