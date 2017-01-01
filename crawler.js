"use strict";
global.db = {};
var crawler = require( __dirname + "/libs/crawler");
var debug = require("debug")("dev:main:crawler");
var conf = require( __dirname + '/config');
var async = require("async");

debug( "load");
async.waterfall([
  function ( callback) {
    require( __dirname + "/libs/mongo")( conf.mongodb, function () {
      callback(); 
    });
  },
  function( callback) {
    crawler.crawler( 0, 30, function ( err, data) {
      if ( err) {
        debug ( err);
        callback();
        return;
      }
      debug( data);
      for( var i = 0, imax = data.length; i < imax; i+=1) {
        db.collection("article").insert( data[i], function ( err) {
          if ( err) {
            debug( err);
          }
        });
      }
      callback();
    });
  },
], function (err, result) {
  if ( err) {
    debug( err);
  }
  debug( "done");
  // process.exit();
});
