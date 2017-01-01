"use strict";
var pttCrawler = require("pttcrawler");
var async = require("async");
var debug = require("debug")("dev:libs:crawler");
var self = module.exports; 
debug( "load");
self.crawler = function ( start, page, callback) {
  var data = [];
  pttCrawler.crawler("Beauty", start, page, function (result) {
    async.each( result, function ( rows, next) {
      if ( rows && rows.pictures && rows.pictures.length > 0) {
        data.push( { _id: rows.url, author: rows.author, title: rows.title, pictures: rows.pictures});
      }
      next ();
    }, function (err) {
      if (err) {
        debug( err);
        return callback( err);
      }
      return callback( null, data);
    });
  });
};
