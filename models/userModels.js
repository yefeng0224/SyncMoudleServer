var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userScheMa = new Schema(
    {
        name: {type: String, unique: true},
        password: String,
        version: Number
    },
    {
        versionKey:false
    }
);
var userTabel = mongoose.model('users', userScheMa);
exports.userAuth = function(name, password, callback)
{
    var query_doc = {'name': name, 'password': password};
    var fields   = '-_id version';
    var options  = {};
    var result = -1;
    userTabel.find(query_doc, fields, options, function(err, doc)
    {
            if(err){
                console.log(name + ": login failed in error" + new Date());
                callback(result);
            }
            else if(doc.length == 1)
            {
                console.log(name + ":"+doc[0].version + ": login success in " + new Date());
                callback(doc[0].version);
            }
            else if(doc.length == 0 || doc.length > 1)
            {
                console.log(name + ": login failed in no found. " + new Date());
                callback(result);
            }
        });
}

exports.updateVersion = function(user, version,callback)
{
    var query = { 'name': user};
    var update = {'version': version};
    options = {};
    userTabel.findOneAndUpdate(query, {'$set': update}, options, function(err,doc)
    {
        if(err)
        {
            callback(-1);
        }
        else
        {
            console.log('updateVersion: ' + doc);
            callback(1);
        }
    });
// is sent as

}

exports.registerUser = function(user, password,callback)
{
    var data = 
    {
        'name': user,
        'password': password,
        'version': 0
    }
    userTabel.create(data,function(err,doc)
    {
        if(err)
        {
            callback(-1);
        }
        else
        {
            callback(1);
        }

    });
}

