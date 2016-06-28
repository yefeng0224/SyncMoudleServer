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

