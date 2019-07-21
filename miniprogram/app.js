//app.js

App({
  onLaunch: function (options) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
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
        this.updateUserInfo()
      }
    })
    
    
  },
  getUserInfo(){
    console.log('getUserInfo')
    return new Promise((rev,rej) => {
      wx.getUserInfo({
        success: (res) => {
          console.log(res);
          rev()
          this.setGlobalData(res.userInfo)
        }
      })
    })
  },
  updateUserInfo(){
    const db = wx.cloud.database()
    db.collection('user').where({
      _openid: this.globalData.openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.lenght < 1) {
          //用户未注册到数据库，获取用户授权并记录到数据库中
          this.getUserInfo().then(()=>{
            db.collection('user').add(
              Object.assign({
                createTime: db.serverDate(),
                updateTime: db.serverDate()
              },this.globalData.userInfo)
            )
          })
        } else {
          console.log('getuserinfo')
          this.setGlobalData({ userInfo: res.data[0] })
        }
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
  watchCallBack: {},
  watchingKeys: [],
  setGlobalData(data) {
    // 为了便于管理，应通过此方法修改全局变量
    Object.keys(data).map(key => {
      this.globalData[key] = data[key]
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
