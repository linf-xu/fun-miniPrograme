module.exports = {

  inputgetName(e) {
    let name = e.detail.name;
    let nameMap = {}

    if (name.indexOf('.')>-1) {
      console.log(111)

      let nameList = name.split('.')

      if (this.data[nameList[0]]) {

        nameMap[nameList[0]] = this.data[nameList[0]]

      } else {

        nameMap[nameList[0]] = {}

      }

      nameMap[nameList[0]][nameList[1]] = e.detail.value

    } else {

      nameMap[name] = e.detail.value

    }

    console.log(nameMap)

    this.setData(nameMap)

  },
  formDate(time){
    console.log(time)

    if (!time) return '';

    var date = new Date(time);
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
    return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':' + s;
  }
}