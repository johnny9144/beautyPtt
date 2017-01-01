"use strict";
var express = require('express');
var router = express.Router();
var debug = require("debug")("dev:router:index");
var request = require("request");
var options = {
  headers: {
    "content-type": "application/json",
    "Authorization": "Bearer " + conf.bot.line.authorization
  },
  url: conf.bot.line.url,
  json: {}
};

/* GET home page. */
router.post('/callback', function (req, res, next) {
  var data = req.body;
  if ( !data || !data.events || data.events.length <= 0 || !data.events[0].replyToken ) {
    return res.send();
  }
  options.json.replyToken = data.events[0].replyToken;
  options.json.messages = [];
  for( var x = 0; x < 5; x+=1) {
    options.json.messages.push( global.pics[Math.floor(Math.random() * global.pics.length)]);
  }
  request.post( options, function ( err, result, body) {
    if ( err) {
      debug( err);
      return;
    }
  });
  res.send();
});

module.exports = router;
