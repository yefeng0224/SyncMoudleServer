var mongoose = require("mongoose");
var async = require('async');
var Schema = mongoose.Schema;

var dataScheMa = new Schema(
    {
        _id: {type: String, index: true, unique: true},
        time: String,
        title: String
    },
    {
        _id: false,
        versionKey: false
    }
);

exports.insertData = function(user, data, callback)
{
    var dataTabel = mongoose.model(user+'_datas', dataScheMa);
    var options  = {};
    dataTabel.create(data,function(err,doc)
    {
         if(err){
            console.log('insert data list error' + err);
            callback(-1);
        }
        else
        {
            console.log('insert data list success');
            callback(1);
        }
    });
}

exports.updateData = function(user, data, callback)
{

    var result = 1;
    var dataTabel = mongoose.model(user+'_datas', dataScheMa);
    var options = {'upsert' : true};
     async.forEach(data, function(item, done)
    {
        console.log('item');
        console.log(item);

        var query = {};
        var update = {};
        for(var i in item)
        {
            if( i == '_id')
            {
                query[i] = item[i];
            }
            else
            {
                update[i] = item[i];
            }
        }
        dataTabel.update(query, {'$set': update}, options, function(err,doc)
        {
            if(err)
            {
                console.log('update fail');
                console.log(err);
                result = -1;
            }
            else
            {
                console.log('update result');
                console.log(doc);
            }
            done(null,'');
        });

    },function (error, result2) {
        console.log('return');
        callback(result);
    });
}

exports.deleteData = function(user, data, callback)
{
    var result = 1;
    var dataTabel = mongoose.model(user+'_datas', dataScheMa);
    var options = {};
    console.log('delete');
    console.log(data);
     async.forEach(data, function(item, done)
    {
        console.log(item);
        dataTabel.remove(item, function(err,doc)
        {
            if(err)
            {
                console.log('delete fail');
                console.log(err);
                result = -1;
            }
            else
            {
                console.log('delete result');
                console.log(doc);
            }
            done(null,'');
        });
    },function (error, result2) {
        callback(result);
    });
}

exports.generateUpdateList = function(user,data,callback)
{
    var dataTabel = mongoose.model(user+'_datas', dataScheMa);
    var query_doc = {};
    var result =
    {
        version:-1,
        'new' : [],
        'delete': []
    }
    result.version = data.version;

    async.concat(data.list, function(item, done)
    {
        query_doc = {'_id': item};
        console.log(query_doc);
        dataTabel.findOne(query_doc, function(err, doc)
        {
            done(err,doc);
            /*
            if(err)
            {
                console.log(err);
            }
            else
            {
                if(doc == null)
                {
                    result.delete.push(query_doc);
                }
                else
                {
                    result.new.push(doc);
                }
            }
            done(null,'');
            */
        });
    },
    function (error, result2) {
        console.log('error:',error);
        console.log(result2);
        console.log('generate');
        var isFind = false;
        var doc_length = result2.length;
        var i = 0;
        for(var k in data.list)
        {
            i = 0;
            isFind = false;
            while(i < doc_length && !isFind)
            {
                if(result2[i]._id == data.list[k])
                {
                    isFind = true;
                }
                else
                {
                    i++;
                }
            }
            if(isFind)
            {
                result.new.push(result2[i]);
            }
            else
            {
                result.delete.push({'_id':data.list[k]});
            }
        }
        console.log(result);
        callback(result);
    });

}

