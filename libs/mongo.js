var log = require('ain2').getInstance();
var Logger = require('mongodb').Logger;
var dbUrl;
var dbNoResponseTimeout = 60000;
var dbTimer;
var allowReconnect = false;
var debug = require("debug")("dev:libs:mongo");
debug("load");

var self = module.exports = function(url, cb){
  if(url){
    dbUrl = url;
  }
  
  require("mongodb").MongoClient.connect(dbUrl,
    {
      uri_decode_auth: true,
      db: {native_parser: true},
      server: {auto_reconnect: true, 
        socketOptions: {connectTimeoutMS: 20000, socketTimeoutMS: 20000}
      }
    },
    function(err, client){
      if(err){
        // 第一次連線就連不上時才需要處理
        if(typeof db == "undefined"|| allowReconnect){
          allowReconnect = false;
          clearTimeout(dbTimer);
          dbTimer = setTimeout(runDBNoRespone, dbNoResponseTimeout);
          console.dir(err);
        }
        return log.error("Error DB 1 " + err);
      }

      Logger.setLevel('error');
      Logger.setCurrentLogger(function(msg, context) {
        console.error(msg);
        return log.error("Error DB " + msg);
      });

      db = client;
      db.on('close', function(){
        log.error('Error DB Closed');
      });
      db.on('reconnect', function(){
        log.error('DB Reconnect (DB Level)');
      });
      db.on('error', function(err){
        log.error('Error DB (DB Level) ' + err);
      });
      db.on('timeout', function(err){
        log.error('Error DB Timeout (DB Level) ' + err);
      });
      db.serverConfig.on('reconnect', function(){
        log.info('DB Reconnect');
      });
      db.serverConfig.on('left', function(err, server){
        log.info('DB Replicaset left');
      });
      db.serverConfig.on('error', function(err){
        log.error('Error DB Replicaset  '+err);
      });

      if(typeof cb != "undefined"){ cb(); }
      
      log.info("DB connected");
      console.info("DB connected");

      // prevent disconnect
      doMonitorDB();

      // make sure index
      // ensureIndex(db);
    });
};

// self.ORDER_ID_MAX_LENGTH = 9;
// self.new_order_id = function(next){
//   self.new_id('orderId', next);
// };

// self.new_order_id = function( items, next){
//   self.new_id('orderId', function (err, val) {
//     var temp = [];
//     var id = 0;
//     var random = Math.floor(Math.random() * 100);
//     var year = new Date().getFullYear().toString().substring( 2, 4);
//     for(var i = 0, imax = items.length; i < imax; i +=1) {
//       if(temp.indexOf(items[i].type) < 0) {
//         temp.push(items[i].type);
//       }
//     }
//     for(var k in temp) {
//       if (temp[k] === "new") {
//         id+=1
//       } else if (temp[k] === "renew") {
//         id+=2
//       } else if (temp[k] === "transferin") {
//         id+=4
//       }
//     }
//     id = parseInt(year + (random < 10 ? "0" + random : random) + val + id);
//     next(id);
//   });
// };

// self.orderIdFormat = function(id){
//   id = ""+id;
//   if (id.length > 4) {
//     return id;
//   }
//   return new Array(self.ORDER_ID_MAX_LENGTH - id.length + 1).join("0") + id;
// };
//
// [>*
// 動態產生流水編號ID
// */
// self.new_id = function(key, next){
//   db.collection('misc').findAndModify(
//     {'key': key},
//     [],
//     {'$inc': {'val': 1}},
//     {'upsert': true, 'new': true},
//     function(err, doc){
//       if(err){
//         console.error(err);
//         return next(err);
//       }
//       if(doc && doc.value && doc.value.val){
//         return next(null, doc.value.val);
//       }
//
//       return next('err_create_order_id');
//     }
//   );
// };
//
function runDBNoRespone(){
  var msg = 'Error DB Native Module No Response After '+dbNoResponseTimeout+' ms'+
    ', Try Reconnect ( ' + process.title + ' )' ;
  if(typeof db != "undefined"){
    db.close();
  }
  console.error(msg);
  log.error(msg);
  clearTimeout(dbTimer);

  // 會有一個狀況, 當今天服務一段時候, db才會掉, 恢復連線機制卻還是連不是db, 且db不是null時, 
  // 它只會連一次, 然後重連機制就不會運作了
  setTimeout(function(){
    allowReconnect = true;
    self();
  }, 2000);

}

function doMonitorDB(){
  dbTimer = setTimeout(runDBNoRespone, dbNoResponseTimeout);
  db.collection('action').findOne({}, {_id:1}, function(err, doc){
    if(err){
      log.error('Error DB (doMonitorDB) '+err);
      return;
    }

    clearTimeout(dbTimer);
    setTimeout(doMonitorDB, dbNoResponseTimeout);
  });
}

// function ensureIndex(client){
//
//   client.collection('cart').ensureIndex(
//     [['fakeId', 1]],
//     {name: 'fakeId'},
//     function(){}
//   );
//
//   client.collection('cart').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//
//   client.collection('company').ensureIndex(
//     [['name', 1]],
//     {name: 'name'},
//     function(){}
//   );
//
//   client.collection('company').ensureIndex(
//     [['hostnames', 1]],
//     {name: 'hostnames'},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['id', 1]],
//     {name: 'cid', 'unique': true},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['email', 1]],
//     {name: 'email'},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['domains', 1]],
//     {name: 'domains'},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['PP', 1]],
//     {name: 'PP'},
//     function(){}
//   );
//
//   client.collection('contact').ensureIndex(
//     [['PPLink', 1]],
//     {name: 'PPLink'},
//     function(){}
//   );
//
//   client.collection('country').ensureIndex(
//     [['code', 1]],
//     {name: 'code', 'unique': true},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['registrant', 1]],
//     {name: 'registrant'},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['PP', 1]],
//     {name: 'PP'},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['source', 1]],
//     {name: 'source'},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['creation_date', 1]],
//     {name: 'creation_date'},
//     function(){}
//   );
//
//   client.collection('domain').ensureIndex(
//     [['expiration_date', 1]],
//     {name: 'expiration_date'},
//     function(){}
//   );
//
//   // Event
//   client.collection('event').ensureIndex(
//     [['notify', 1]],
//     {name: 'notify'},
//     function(){}
//   );
//   client.collection('event').ensureIndex(
//     [['notify_date', 1]],
//     {name: 'notify_date'},
//     function(){}
//   );
//
//   //Misc
//   client.collection('misc').ensureIndex(
//     [['key', 1]],
//     {name: 'key', 'unique':true},
//     function(){}
//   );
//
//   //Order
//   client.collection('order').ensureIndex(
//     [['id', 1]],
//     {name: 'id', "unique": true, "sparse": true},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['company', 1]],
//     {name: 'company'},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['date_updated', 1]],
//     {name: 'date_updated'},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['date_order_create', 1]],
//     {name: 'date_order_create'},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['date_order_done', 1]],
//     {name: 'date_order_done'},
//     function(){}
//   );
//   client.collection('order').ensureIndex(
//     [['payment', 1], ['payment_id']],
//     {name: 'payment', 'unique': true, 'sparse': true},
//     function(){}
//   );
//   //OTP
//   client.collection('otp').ensureIndex(
//     [['code', 1]],
//     {name: 'code'},
//     function(){}
//   );
//
//   //Staticpage
//   client.collection('staticpage').ensureIndex(
//     [['url', 1]],
//     {name: 'url', 'unique': true},
//     function(){}
//   );
//
//   //TLD
//   client.collection('tld').ensureIndex(
//     [['registrar', 1]],
//     {name: 'registrar'},
//     function(){}
//   );
//   client.collection('tld').ensureIndex(
//     [['registrar.sale', 1]],
//     {name: 'registrar_sale'},
//     function(){}
//   );
//   client.collection('tld').ensureIndex(
//     [['company', 1]],
//     {name: 'company'},
//     function(){}
//   );
//
//   //Transaction
//   client.collection('transaction').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//   client.collection('transaction').ensureIndex(
//     [['name', 1]],
//     {name: 'name'},
//     function(){}
//   );
//   client.collection('transaction').ensureIndex(
//     [['creation_date', 1]],
//     {name: 'creation_date'},
//     function(){}
//   );
//   client.collection('transaction').ensureIndex(
//     [['expiration_date',1]],
//     {name: 'expiration_date'},
//     function(){}
//   );
//
//   //transferin
//   client.collection('transferin').ensureIndex(
//     [['user',1]],
//     {name: 'user'},
//     function(){}
//   );
//   client.collection('transferin').ensureIndex(
//     [['domain',1]],
//     {name: 'domain'},
//     function(){}
//   );
//   client.collection('transferin').ensureIndex(
//     [['status',1]],
//     {name: 'status'},
//     function(){}
//   );
//
//   // Search_term
//   client.collection('search_term').ensureIndex(
//     [['keyword',1]],
//     {name: 'keyword'},
//     function(){}
//   );
//
//   client.collection('search_term').ensureIndex(
//     [['tlds',1]],
//     {name: 'tlds'},
//     function(){}
//   );
//
//   client.collection('search_term').ensureIndex(
//     [['user',1]],
//     {name: 'user'},
//     function(){}
//   );
//
//   client.collection('search_term').ensureIndex(
//     [['fakeId',1]],
//     {name: 'fakeId'},
//     function(){}
//   );
//
//   // User
//   client.collection('user').ensureIndex(
//     [['email', 1]],
//     {name: 'email', 'unique': true},
//     function(){}
//   );
//
//   client.collection('user').ensureIndex(
//     [['mailPP', 1]],
//     {name: 'mailPP', 'unique': true, 'sparse': true},
//     function(){}
//   );
//
//   // Invite code
//   client.collection('invite_code').ensureIndex(
//     [['user', 1]],
//     {name: 'user'},
//     function(){}
//   );
//
//   client.collection('invite_code').ensureIndex(
//     [['code', 1]],
//     {name: 'code', 'unique': true},
//     function(){}
//   );

// }
