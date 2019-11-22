//app.js

App({
  onLaunch: function (options) {
    console.log('onlaunch')
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 线上环境fun-a1qgd  测试环境prod-6jygs
      wx.cloud.init({
        traceUser: true,
        env: 'fun-a1qgd'
      })
    }
    const db = wx.cloud.database()
    this.globalData = {
      openid:'',
      userInfo:{}
    }
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result)
        this.setGlobalData({ openid: res.result.openid })
        this.setGlobalData({ userInfo: { _openid: res.result.openid} })
        this.getUserInfoByOpenid(res.result.openid)
      }
    })
  },
  getUserInfoByOpenid(openid){
    const db = wx.cloud.database()
    db.collection('user').where({
      _openid: openid
    }).get({
      success: res => {
        console.log('通过openid查询userInfo 成功: ', res)
        if (res.data.length > 0) {
          console.log('数据库中存在此openid，setUserinfo赋值给GlobalData')
          this.setGlobalData({
            userInfo: res.data[0]
          })
        }else{
          console.log('数据库中不存在此openid，显示登录按钮')
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('通过openid查询userInfo 失败：', err)
      }
    })
  },
  userLogin(userInfo){
    const db = wx.cloud.database()
    console.log('用户登录', userInfo)
    let _info = JSON.parse(userInfo.detail.rawData)
    db.collection('user').add({
      data: Object.assign({
        createTime: new Date().getTime(),
        updateTime: new Date().getTime()
      }, _info)
    }).then(_res => {
      console.log('新用户写入user表成功,赋值globaldata',_res)
      this.setGlobalData({ userInfo: Object.assign({}, _info, { _id: _res._id }) })
    }).catch(_err => {
      wx.showToast({
        icon: 'none',
        title: '新增记录失败'
      })
      console.error('[数据库] [新增记录] 失败：', _err)
    })
  },
  updateUserInfo(userInfo){
    console.log('用户更新微信信息赋值globaldata:',userInfo)
    let _info = JSON.parse(userInfo.detail.rawData)
    this.setGlobalData({ userInfo: _info})
    const db = wx.cloud.database()
    db.collection('user').doc(this.globalData.userInfo._id).update({
      data: Object.assign({
        updateTime: new Date().getTime()
      }, _info)
    })
  },
  watchCallBack: {},
  watchingKeys: [],
  setGlobalData(data) {
    // 为了便于管理，应通过此方法修改全局变量
    Object.keys(data).map(key => {
      this.globalData[key] =  data[key]
    })
    console.log('mutation', data);
    wx.setStorageSync('store', this.globalData)// 加入缓存
  },

  $watch(key, cb) {
    this.watchCallBack = Object.assign({}, this.watchCallBack, {
      [key]: this.watchCallBack[key] || []
    });
    this.watchCallBack[key].push(cb);
    if (!this.watchingKeys.find(x => x === key)) {
      const that = this;
      this.watchingKeys.push(key);
      let val = this.globalData[key];
      Object.defineProperty(this.globalData, key, {
        configurable: true,
        enumerable: true,
        set(value) {
          const old = that.globalData[key];
          val = value;
          that.watchCallBack[key].map(func => func(value, old));
          console.log(that.globalData)
        },
        get() {
          return val
        }
      })
    }
  },
  // 集合activityList操作
  activityList(){

  }
})
