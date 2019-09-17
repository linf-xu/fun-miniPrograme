// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('yun',event)
  try {
    return await db.collection('activityList').doc(event.id).update({
      // data 传入需要局部更新的数据
      data: Object.assign({ updateTime: new Date().getTime()},event.data)
    })
  } catch (e) {
    console.error(e)
  }
}