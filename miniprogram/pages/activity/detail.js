// pages/activity/detail.js
var inputMixins = require("../../mixins/inputMixins.js")
var app = getApp()
const db = wx.cloud.database()
Page(Object.assign({

  /**
   * 页面的初始数据
   */
  data: {
    isPlaymaker:false,
    edit:false,
    id:'',
    pageLoading:true,
    playmaker:"",
    isJoin:false,
    imgList:[],
    imgstyles:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    console.log(app.globalData.openid)
    this.setData({ 
      id: options.id
    })
    this.init()
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if (this.data.id) this.init()
  },
  init(){
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('activityList').where({
      _id: this.data.id
    }).get({
      success: res => {
        if (!res.data[0]){
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          this.setData({
            pageLoading: false
          })
          return
        }
        try{
          let acInfo = res.data[0],
              playmaker = acInfo.joins && acInfo.joins[0]
          this.setData({
            acInfo,
            playmaker,
            pageLoading: false,
            time: acInfo.startTime + ' <--> ' + acInfo.endTime,
            isPlaymaker: playmaker && playmaker.openid == app.globalData.userInfo._openid,
            isJoin: acInfo.joinIds.indexOf(app.globalData.userInfo._openid)>-1,
            imgList:acInfo.imgList
          })
          console.log('[数据库] [查询记录] 成功: ', res)
        }catch(e){
          console.log(e)
        }
        
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        this.setData({
          pageLoading: false
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  //发起人编辑
  edit() {
    this.setData({
      edit: true
    })
  },
  // 编辑完成
  edited() {
    const db = wx.cloud.database()
    db.collection('activityList')
      .doc(this.data.id)
      .update({
        data: {
          updateTime: db.serverDate(),
          remarks: this.data.acInfo.remarks
        }
      }).then(() => {
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 2000
        })
        this.setData({
          edit: false
        })
      })
  },
  // 查看地图
  viewMap(e) {
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
  // 取消活动
  cancelClick(){
    wx.showModal({
      title: '提示',
      content: '确定取消本次活动吗',
      success(res) {
        if (res.confirm) {
          this.cancelBaoming()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  cancelAc(){

  },
  // 主按钮  报名/取消报名
  action(){
    if(this.data.isJoin){
      wx.showModal({
        title: '提示',
        content: '确定取消报名吗',
        success(res) {
          if (res.confirm) {
            this.cancelBaoming()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      this.baoming()
    }
  }, 
  cancelBaoming(){
    console.log('cancel')
  },
  // 报名
  baoming() {
    if (!this.data.userInfo) {
      app.getUserInfo().then(() => {
        this.upadteBaomingDb()
      })
      return
    }
    this.upadteBaomingDb()
    return false
  },
  upadteBaomingDb() {
    //更新活动list表
    let joins = this.data.acInfo.joins
    joins.push({
      openid: this.data.userInfo._openid,
      avatarUrl: this.data.userInfo.avatarUrl,
      nickName: this.data.userInfo.nickName,
      realName: this.data.userInfo.realName
    })
    let joinIds = this.data.acInfo.joinIds + ',' + this.data.userInfo._openid
    // db.collection('activityList')
    //   .doc(this.data.id)
    //   .update({
    //     data: {
    //       joins,
    //       joinIds,
    //       updateTime: db.serverDate(),
    //     }
    //   })
    //   .then(() => {
    //     this.init()
    //     wx.showToast({
    //       title: '报名成功',
    //       icon: 'success',
    //       duration: 2000
    //     })
    //   })
    this.update({ joins, joinIds}).then(()=>{
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
          activityId: this.data.id,
          role: 'join',
          action:'add'
        }
      })

  },
  // 上传图片
  uploadImg() {
    console.log('upload')
    let that = this;
    let timestamp = (new Date()).valueOf();
    wx.chooseImage({
      success: chooseResult => {
        console.log(chooseResult)
        wx.showLoading({
          title: '上传中。。。',
        })
        // 将图片上传至云存储空间
        wx.cloud.uploadFile({
          // 指定上传到的云路径
          cloudPath: timestamp + '.png',
          // 指定要上传的文件的小程序临时文件路径
          filePath: chooseResult.tempFilePaths[0],
          // 成功回调
          success: res => {
            console.log('上传成功', res)
            wx.hideLoading()
            wx.showToast({
              title: '上传图片成功',
            })
            if (res.fileID) {
              let _list = this.data.imgList
              _list.unshift(res.fileID)
              console.log(_list)
              this.setData({
                imgList: _list
              })
              this.update({ imgList: _list})
            }
          },
        })
      },
    })
  },
  // 更新
  update(obj){
    console.log(obj)
    return new Promise((rev,rej)=>{
      db.collection('activityList')
        .doc(this.data.id)
        .update({
          data: Object.assign({
            updateTime: db.serverDate(),
          }, obj)
        })
        .then((e) => {
          console.log(e)
          rev()
        })
        .catch(e => {
          console.warn(e)
          rej()
        })
    })
    
  },
  imageLoad(e) {
    var $width = e.detail.width,    //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height;    //图片的真实宽高比例
    var viewHeight = 200,           //设置图片显示高度
      viewWidth = 200 * ratio;    //计算的宽度
    var image = this.data.imgstyles;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
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
}, inputMixins))