"use strict";
global.db = {};
var crawler = require( __dirname + "/libs/crawler");
var debug = require("debug")("dev:main:crawler");
var conf = require( __dirname + '/config');
var async = require("async");

debug( "load");
async.waterfall([
  function ( callback) {
    require( __dirname + "/libs/mongo")( conf.mongodb, callback);
  },
  function( callback) {
    crawler.crawler( 0, 1, function ( err, data) {
      if ( err) {
        debug ( err);
        callback();
        return;
      }
      async.eachSeries( data, function ( item, cb) {
        item.timestamp = new Date();
        db.collection("article").insert( item, cb);
      }, callback);
    });
  },
], function (err, result) {
  if ( err) {
    debug( err);
  }
  debug( "done");
  process.exit();
});
