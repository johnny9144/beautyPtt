"use strict";
var debug = require("debug")("dev:libs:getPics");
var self = module.exports;


self.getPics = function ( cb) {
  db.collection('article').aggregate([
    { $unwind: "$pictures" },
    { $limit: 1000 }
  ], function ( err, objs) {
    if ( err) {
      debug( err);
      return;
    }
    var images = [];
    for ( var i = 0, imax = objs.length; i < imax; i+=1) {
      images.push( {
        "type":"image",
        originalContentUrl: "https:" + objs[i].pictures,
        previewImageUrl: "https:" + objs[i].pictures,
      });
    }
    return cb( images);
  });
};
