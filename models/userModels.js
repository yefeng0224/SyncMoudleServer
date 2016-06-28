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
                /*
                var version_new = doc[0].version + 1;
                console.log(doc[0]);
                console.log("doc.version: " + doc[0].version);
                console.log("version_new: " + version_new);
                var sessionID = req.sessionID;
                req.session.userid = sessionID;

                var conditions = { 'name': req.body.userid, 'password': req.body.password};
                var update     = {$set : { 'version':version_new, 'test':{'name':query_doc.name,'value':query_doc.password}}};
                var options    = {upsert : true};
                user.update(conditions, update, options, function(error){
                    if(error) {
                        console.log(error);
                    } else {
                        console.log('update ok!');
                    }
                });
                var new_doc = {'user':'yefeng','version':version_new, 'list':['2','5','6']};
                version.create(new_doc, function(err){
                                    if(err) {
                                            console.log("save failed!");
                                        } else {
                                            console.log("save success!");
                                        }
                                });
                res.render('homepage', { title: 'homepage' });
                */
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
    userTabel.findOneAndUpdate(query, update, options, function(err,doc)
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

