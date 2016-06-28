var session = require('express-session');
var MongoDBStore  = require('connect-mongodb-session')(session);
var LocalsessionStore = new MongoDBStore(
{
  uri: 'mongodb://localhost:27017/SyncModuleServer',
  collection: 'UserSessions'
});
exports.sessionStore = LocalsessionStore

exports.checkLogin = function(sessionID, callback) {
    var result = false;
    if (typeof(SessionID) != 'undefined')
    {
        callback(result);
    }
    LocalsessionStore.get(sessionID, function(err, doc)
    {
        console.log('get');
        if(err || typeof(err) == 'undefined')
        {
            callback(result);
        }
        else
        {
            result = true;
            callback(result);
        }
    });
}


