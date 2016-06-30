var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var dataScheMa = new Schema(
    {
        _id: {type: String, index: true, unique: true},
        value: String
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
    dataTabel.collection.insert(data,function(err,doc)
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

    for(var k in data)
    {
        var query = {};
        var update = {};
        for(var i in data[k])
        {
            console.log(i);
            if( i == '_id')
            {
                console.log('_id :'  + data[k][i])
                query[i] = data[k][i];
            }
            else
            {
                console.log(i + ' : '  + data[k][i])
                update[i] = data[k][i];
            }
        }
        console.log(query);
        console.log(update);
        dataTabel.collection.update(query, {'$set': update}, options, function(err,doc)
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
        });
    }
    callback(result);
}

exports.deleteData = function(user, data, callback)
{
    var result = 1;
    var dataTabel = mongoose.model(user+'_datas', dataScheMa);
    var options = {};
    console.log('delete');
    console.log(data);
    for(var k in data)
    {
        dataTabel.remove(k, function(err,doc)
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
        });
    }
    callback(result);
}

