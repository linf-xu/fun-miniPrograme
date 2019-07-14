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
    this.globalData = {}
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        this.globalData.openId = res.result.openId;
        const db = wx.cloud.database()
        db.collection('user').where({
          _openId: res.result.openId
        }).get({
          success: res => {
            console.log('[数据库] [查询记录] 成功: ', res)
            if(res.data.lenght<1){
              db.collection('activityList').add({
                data: {
                  creaTime:db.serverDate()
                }
              })
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
      }
    })
    // wx.getUserInfo({
    //   success: (res) => {
    //     console.log(res);
    //     var avatarUrl = 'userInfo.avatarUrl';
    //     var nickName = 'userInfo.nickName';
    //     this.globalData[avatarUrl] = res.userInfo.avatarUrl;
    //     this.globalData[nickName] = res.userInfo.nickName;
    //   }
    // })
  }
})
