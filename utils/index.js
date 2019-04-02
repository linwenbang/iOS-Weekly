const express = require('express');
const app = express();

// ...

let parseCotent = (tag, url, html) => {

  
  var fs = require("fs")
  console.log("准备写入文件");
  var md5 = require('md5');
  let dirname = './htmlCache/' + tag
  let filename = dirname + '/' + md5(url)+'.html'
  
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  fs.writeFile(filename, html,  function(err) {
    if (err) {
        return console.error(err);
    }
    console.log(`write ${url} successfully`)
  });

  // // 引入所需要的第三方包
  // const cheerio = require('cheerio');
  // let $ = cheerio.load(content);

  // // 找到目标数据所在的页面元素，获取数据
  // $('div#pane-news ul li a').each((idx, ele) => {
  //   // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
  //   // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
  //   let news = {
  //     title: $(ele).text(),        // 获取新闻标题
  //     href: $(ele).attr('href')    // 获取新闻网页链接
  //   };
  //   hotNews.push(news)              // 存入最终结果数组
  // });
}

let fetchContent = (tag, item) => {

  console.log(`tag ${tag}`)

  let url = item.match(/\((.+)\)/)[1]
  console.log("will load url: " + url)

  // 引入所需要的第三方包
  const superagent= require('superagent');

  /**
   * index.js
   * [description] - 使用superagent.get()方法来访问百度新闻首页
   */
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
    for (let item of JSON.parse(body)) {
      handleItem(item)
    }
  });


}


loadReleaseList();
// fetchContent("[url](https://www.macstories.net/ios/shortcuts-2-2-brings-new-apple-notes-actions-travel-time-enhancements/)")


// let server = app.listen(3000, function () {
//   let host = server.address().address;
//   let port = server.address().port;
//   console.log('Your App is running at http://%s:%s', host, port);
// });


// app.get('/', function (req, res) {
//   res.send(hotNews);
// });




// /**
//  * index.js
//  * [description] - 抓取热点新闻页面
//  */
// // 引入所需要的第三方包
// const cheerio = require('cheerio');

// let getHotNews = (res) => {
//   let hotNews = [];
//   // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res.text中。
  
//   /* 使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
//      以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
//    */
//   let $ = cheerio.load(res.text);

//   // 找到目标数据所在的页面元素，获取数据
//   $('div#pane-news ul li a').each((idx, ele) => {
//     // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
//     // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
//     let news = {
//       title: $(ele).text(),        // 获取新闻标题
//       href: $(ele).attr('href')    // 获取新闻网页链接
//     };
//     hotNews.push(news)              // 存入最终结果数组
//   });
//   return hotNews
// };