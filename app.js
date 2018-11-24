var superagent = require('superagent');
var request = require('request');
var cheerio = require('cheerio');
var charset = require('superagent-charset');
charset(superagent);

var fs = require("fs");
var Bagpipe = require('bagpipe');
var bagpipe = new Bagpipe(10,{timeout: 100});

var express = require('express');

var app = express();
var baseUrl = 'https://www.zcool.com.cn/work/ZMTQ0ODQwNA.html'; //输入任何网址都可以

app.get('/', function(req, res) {
  reptile(req, res)
});

function reptile(req, res) {
  //设置请求头
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  //网页页面信息是gb2312，所以chaeset应该为.charset('gb2312')，一般网页则为utf-8,可以直接使用.charset('utf-8')
  superagent.get(baseUrl)
    .charset('gb2312')
    .end(function(err, sres) {
      var items = [];
      if (err) {
        console.log('ERR: ' + err);
        res.json({ code: 400, msg: err, sets: items });
        return;
      }
      var $ = cheerio.load(sres.text);
      $('div.reveal-work-wrap div.photo-information-content').each(function(idx, element) {
        var $element = $(element);
        var $subElement = $element.find('img');
        var thumbImgSrc = $subElement.attr('src');
        var imgId = $element.find('a.photo-box').attr('data-img-id');
        bagpipe.push(downloadPic, thumbImgSrc, './assets/imgs/'+ imgId +'.jpg', function (err, data) {
          // won’t occur error because of too many file descriptors
          // well done
        });
        items.push({
            idx: imgId,
            imgSrc: thumbImgSrc
        });
      });
      res.json({ code: 200, msg: "", data: items });
    });
}
//利用fs模块download图片
function downloadPic(src, dest){
  request(src).pipe(fs.createWriteStream(dest)).on('close',function(){
    console.log('pic saved!')
  })
}

var server = app.listen(8081, function() {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)

})