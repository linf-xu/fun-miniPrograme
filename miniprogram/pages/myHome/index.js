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
    edit:false,
    needBack:0,
    leftListH:0,
    rightListH:0,
    leftImgList:[],
    rightImgList: [],
    imgList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getImgList()
    if (options.needBack == 1){
      this.setData({
        needBack:1,
        edit:true
      })
    }
    app.$watch('userInfo', (val, old) => {
      console.log('watch userInfo myhome')
      this.init()
    })
    app.$watch('nickName', (val, old) => {
      console.log('watch nickName myhome')
      if (app.globalData.userInfo.nickName) {
        this.setData({
          nickName: app.globalData.userInfo.nickName
        })
      }
    })
  },
  watchCallBack: {},
  watchingKeys: [],
  $watch(key, cb) {
    this.watchCallBack = Object.assign({}, this.watchCallBack, {
      [key]: this.watchCallBack[key] || []
    });
    this.watchCallBack[key].push(cb);
    if (!this.watchingKeys.find(x => x === key)) {
      const that = this;
      this.watchingKeys.push(key);
      let val = this.data[key];
      Object.defineProperty(this.data, key, {
        configurable: true,
        enumerable: true,
        set(value) {
          const old = that.data[key];
          val = value;
          value != old && that.watchCallBack[key].map(func => func(value, old));
        },
        get() {
          return val
        }
      })
    }
  },
  init() {
    let userInfo = app.globalData.userInfo
    console.log(app.globalData)
    this.setData({
      openid: app.globalData.openid,
      avatarUrl: userInfo.avatarUrl || '',
      nickName: userInfo.nickName || '',
      realName: userInfo.realName || ''
    })
    console.log(this.data.imgList)
    // this.getImgList()
  },
  previewImg(e) {
    let src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: this.data.imgList // 需要预览的图片http链接列表
    })
  },
  getImgList(){
    const db = wx.cloud.database()
    // 查询 imgList
    db.collection('imgList').get({
      success: res => {
        console.log('获取图片列表成成功',res)
        try {
          let _list = res.data
          let _imglist = []
          let _leftH = this.data.leftListH
          let _leftList = this.data.leftImgList||[]
          let _rightH = this.data.rightListH
          let _rightList = this.data.rightImgList||[]
          console.log(_leftH,_leftList,_rightH,_rightList)
          for(let i=0;i<_list.length;i++){
            _imglist.push(_list[i].fileID)
            console.log(_leftH, _rightH)
            if(_leftH>_rightH){
              _rightList.push(_list[i])
              _rightH += _list[i].ratioheight
            }else{
              _leftList.push(_list[i])
              _leftH += _list[i].ratioheight
            }
          }
          console.log(_leftH, _leftList, _rightH, _rightList)

          this.setData({
            leftListH: _leftH,
            rightListH: _rightH,
            leftImgList: _leftList,
            rightImgList: _rightList,
            imgList: _imglist
          })
        } catch (error) {
          console.log(error)
        }
      }
    })
  },
  imgonload(){
    console.log('onload', new Date().getTime())
    let leftListH = 0
    let leftLastH = 0
    let rightListH = 0
    let rightLastH = 0
    wx.createSelectorQuery().selectAll('.leftList').boundingClientRect( (rect) => {
      leftListH = parseInt(rect[0].height)
      this.setData({ leftListH })
    }).exec()
    wx.createSelectorQuery().selectAll('.rightList').boundingClientRect( (rect) => {
      rightListH = parseInt(rect[0].height)
      this.setData({ rightListH })
    }).exec()
    wx.createSelectorQuery().selectAll('.rightLast').boundingClientRect( (rect) => {
      rightLastH = parseInt(rect[0].height)
      this.setData({ rightLastH })
    }).exec()
    wx.createSelectorQuery().selectAll('.leftLast').boundingClientRect( (rect) => {
      rightLastH = parseInt(rect[0].height)
      this.setData({ rightLastH })
    }).exec()
  },
  getUserInfo(res) {
    app.userLogin(res)
  },
  update(){
    if(!this.data.edit){
      this.setData({ edit:true})
      return
    }
    if (!this.data.realName){
      wx.showToast({
        icon: 'none',
        title: '请输入备注姓名'
      })
      return
    }
    console.log(app.globalData.userInfo)
    if(!app.globalData.userInfo._id){
      wx.showToast({
        icon: 'none',
        title: '请重新进入'
      })
      return
    }
    db.collection('user').doc(app.globalData.userInfo._id).update({
      data: {
        updateTime: new Date().getTime(),
        realName: this.data.realName
      }
    }).then((r) => {
      console.log(r)
      this.setData({ edit: false })
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 2000
      })
      app.setGlobalData({ 
        realName: this.data.realName,
        userInfo: Object.assign({}, app.globalData.userInfo, { realName: this.data.realName }) 
      })
      if(this.data.needBack){
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      }
    })
  },
  goHome() {
    console.log('home')
    wx.navigateBack({ delta : 2})
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