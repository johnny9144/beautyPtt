"use strict";
var debug = require("debug")("dev:libs:getPics");
var self = module.exports;


self.getPics = function () {
  db.collection('article').aggregate([
    { $unwind: "$pictures" },
  ], function ( err, objs) {
    if ( err) {
      debug( err);
      return;
    }

    for ( var i = 0, imax = objs.length; i < imax; i+=1) {
      pics.push( {
        "type":"image",
        originalContentUrl: "https:" + objs[i].pictures,
        previewImageUrl: "https:" + objs[i].pictures,
      });
    }
  });
};
