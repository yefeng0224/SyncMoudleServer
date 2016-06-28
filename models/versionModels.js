var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var versionScheMa = new Schema(
    {
        _id: {type: Number, index: true, unique: true},
        list: Array
    },
    {
        _id: false,
        versionKey: false
    }
);

exports.getChgList = function(user, fromversion, endVersion, callback)
{
    var versionTabel = mongoose.model(user+'_versions', versionScheMa);
    var query_doc;
    if(endVersion == -1)
    {
        query_doc = {'_id': {'$gt': fromversion}};
    }
    else
    {
        query_doc = {'_id': {'$gt': fromversion, '$lt': endVersion}};
    }
    console.log(query_doc);
    var fields   = '_id  list';
    var options  = {};
    var result = {
        'version': -1,
        'list': []
    };

    versionTabel.find(query_doc, fields, options, function(err, doc)
    {
        if(err){
            console.log('get chg list error' + err);
            callback(result);
        }
        else if(doc.length > 0)
        {
            console.log('get change list success');
            for(var i=0; i < doc.length; i++)
            {
                if(doc[i]._id > result.version)
                {
                    result.version = doc[i].version;
                }
                for(var j=0; j < doc[i].list.length; j++)
                {
                    result.list.push(doc[i].list[j]);
                }
            }
            if(endVersion != -1)
            {
                result.version = endVersion;
            }
            callback(result);
        }
        else
        {
            console.log('no version found');
            callback(result);
        }
    });
}

exports.updateFromClient = function(user, version, data, callback)
{
    console.log(data);
    var versionTabel = mongoose.model(user+'_versions', versionScheMa);
    var jsonData = {
        '_id': version,
        'list': data
    };

    versionTabel.create(jsonData,function(err,doc)
    {
         if(err){
            console.log('update chg list error' + err);
            callback(-1);
        }
        else
        {
            callback(version);
        }
    });
}
