const express = require('express');
const app = express();

// ...
let isURL = (str) => {
  return !!str.match(/(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g);
}

let isNoURLOrInWhiteList = (urlstring) => {
  
  if (!isURL(urlstring)) {
    console.log(`it is not url format - ${urlstring}`)
    return true;
  }

  let list = ['weibo.com','www.baidu.com','baidu.com']
  var url = require('url');

  let hostname = url.parse(urlstring).hostname
  console.log(hostname)

  return list.indexOf(hostname) >= 0
}

let parseCotent = (tag, url, html) => {

  
  var fs = require("fs")
  var md5 = require('md5');
  let dirname = './htmlCache/' + tag
  let filename = dirname + '/' + md5(url)+'.html'
  
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  const cheerio = require('cheerio');
  let $ = cheerio.load(html);

  var maxDivContent = ""
  $('body div').each(function(i, ele) {
    var temp = $(this).html()
    if (maxDivContent.length < temp.length) {
      maxDivContent = temp
    } 
  })

  if (!maxDivContent) {
    console.log(`get html body error ${url}`)
    return;
  }

  var TurndownService = require('turndown')

  var turndownService = new TurndownService()
  var markdown = turndownService.turndown(maxDivContent)

  console.log(`will wirte ${filename} - ${url}`);
  fs.writeFile(filename, markdown,  function(err) {
    if (err) {
        return console.error(err);
    }
    console.log(`write ${filename} - ${url} successfully`)
  });

}

let fetchContent = (tag, item) => {

  console.log(`tag ${tag}`)

  let url = item.match(/\((.+)\)/)[1]
  if (isNoURLOrInWhiteList(url)) {
    console.log(`whilte list ${url}`)
    return;
  }

  console.log("will load url: " + url)
  

  // 引入所需要的第三方包
  const superagent= require('superagent');

  superagent.get(encodeURI(url)).end((err, res) => {
    if (err) {
      // 如果访问失败或者出错，会这行这里
      console.log(`error ${url} - ${err}`)
    } else {
      // console.log(res.text)
      parseCotent(tag, url, res.text)
    }
  });
}

let handleItem = (item) => {
  var content = item.body;
  // console.log(item)
  var list = content.match(/\[[\s\S]*?\]\([\s\S]*?\)/g)
  for (var temp of list) {
    fetchContent(item.id, temp)
  }
}

let loadReleaseList = () => {
  var request = require("request");

  var options = { method: 'GET',
    url: 'https://api.github.com/repos/SwiftOldDriver/iOS-Weekly/releases',
    headers: 
    { 'postman-token': 'c15398c3-a54a-ac1f-dfab-2fddeaf445e8',
      'cache-control': 'no-cache',
      'user-agent': 'iOS-Weekly' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // console.log(response)
    // console.log();
    var model = JSON.parse(body)
    if (model.message) {
      console.log(model.message)
      return 
    }

    for (let item of model) {
      handleItem(item)
    }
  });


}
// https://9to5mac.com/2018/10/06/ios-12-now-installed-on-50-of-devices-outpacing-ios-11/
fetchContent("16465370", "[Swift](https://swift.gg/2019/01/21/streaming-multipart-requests/)")

// fetchContent("16465370", "[Swift](https://9to5mac.com/2018/10/06/ios-12-now-installed-on-50-of-devices-outpacing-ios-11/)")
// fetchContent("16465370", "[Swift](https://mp.weixin.qq.com/s/-fLVdoTz3lT5Kxnea0-Avg)")

// loadReleaseList();