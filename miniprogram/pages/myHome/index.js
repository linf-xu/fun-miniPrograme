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
    leftLastH:0,
    rightListH:0,
    rightLastH:0,
    leftImglist:[
      {    fileID:"https://ss1.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=ad628627aacc7cd9e52d32d909032104/32fa828ba61ea8d3fcd2e9ce9e0a304e241f5803.jpg"
      },
      {
        fileID: "https://ss1.baidu.com/-4o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=a9e671b9a551f3dedcb2bf64a4eff0ec/4610b912c8fcc3cef70d70409845d688d53f20f7.jpg"
      },
      {
        fileID: "https://ss1.baidu.com/-4o3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=907f6e689ddda144c5096ab282b6d009/dc54564e9258d1092f7663c9db58ccbf6c814d30.jpg"
      }, 
      {
        fileID: "https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=0c78105b888ba61ec0eece2f713597cc/0e2442a7d933c8956c0e8eeadb1373f08202002a.jpg"
      },
      {
        fileID: "https://ss1.baidu.com/9vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=92afee66fd36afc3110c39658318eb85/908fa0ec08fa513db777cf78376d55fbb3fbd9b3.jpg"
      },
      {
        fileID: "https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=d985fb87d81b0ef473e89e5eedc551a1/b151f8198618367aa7f3cc7424738bd4b31ce525.jpg"
      },],
    rightImglist: [
      {
        fileID: "https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=d985fb87d81b0ef473e89e5eedc551a1/b151f8198618367aa7f3cc7424738bd4b31ce525.jpg"
      },
      {
        fileID: "https://ss3.baidu.com/9fo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=0cc74ef9a3773912db268361c8188675/9922720e0cf3d7ca810f3732f81fbe096a63a9fd.jpg"
      },
      {
        fileID: "https://ss2.baidu.com/-vo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=d985fb87d81b0ef473e89e5eedc551a1/b151f8198618367aa7f3cc7424738bd4b31ce525.jpg"
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.$watch('rightListH', (val, old) => {
      console.log('watch rightListH', val, old)
      this.changeLeftRight()
    })
    this.$watch('leftListH', (val, old) => {
      console.log('watch leftListH', val, old)
      this.changeLeftRight()
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
    // console.log(this.data.leftImglist.length)
    // setTimeout(()=>{
    //   this.changeLeftRight()
    // },2000)
  },
  onload(){
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
  changeLeftRight(){
    if (this.data.leftListH - this.data.rightListH > this.data.leftLastH) {
      console.log('lefttoright')
      let rightImglist = this.data.rightImglist
      rightImglist.push(this.data.leftImglist[this.data.leftImglist.length - 1])
      let leftImglist = this.data.leftImglist
      leftImglist.splice(this.data.leftImglist.length - 1, 1)
      this.setData({ rightImglist, leftImglist })
    } 
  },
  getUserInfo(res) {
    app.updateUserInfo(res)
  },
  update(){
    if(!this.data.edit){
      this.setData({ edit:true})
      return
    }
    console.log(app.globalData.userInfo)
    if(!app.globalData.userInfo._id){
      wx.showToast({
        icon: 'none',
        title: '请重新进入'
      })
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