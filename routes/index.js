var express = require('express');
var router = express.Router();

var async = require('async');
var mongoose = require('mongoose');

var userModels = require('../models/userModels');
var versionModels = require('../models/versionModels');
var sessionModels = require('../models/sessionModels');
var dataModels = require('../models/dataModels');

mongoose.connect('mongodb://localhost/SyncModuleServer');

/* GET home page. */
router.get('/', function(req, res) {
      res.render('index', { title: 'index' });
});

/*login*/
router.get('/login', function(req, res) {
    console.log(req);
    var SessionID = req.sessionID;
    //if (typeof(SessionID) != 'undefined')
    //{
        console.log(SessionID);

        //sessionModels.checkLogin();
        sessionModels.checkLogin(SessionID,function(result) {
        if(result == true)
        {
            res.render('homepage', { title: 'homepage' });
        }
        else
        {
            res.render('login', { title: 'login' });
        }
    });
    //}
    //else
    //{
        //res.render('login', { title: 'login' });
    //}
});

/*logout*/
router.get('/logout', function(req, res) {
    req.session.destroy();
      res.render('logout', { title: 'logout' });
});

router.get('/homepage',function(req,res){
    var SessionID = req.sessionID;
    if (typeof(SessionID) != 'undefined')
    {
        console.log(SessionID);

    }
});
/*hompage*/
router.post('/homepage', function(req, res) {
    console.log('post home');
    console.log(req);

    userModels.userAuth(req.body.userid,req.body.password,function(serverVersion)
    {
        if(serverVersion == -1)
        {
            res.redirect('/');
        }
        else
        {
            console.log("version: " + serverVersion);
            req.session.userid = req.sessionID;
            res.render('homepage', { title: 'homepage' });

            versionModels.getChgList(req.body.userid, serverVersion, -1,function(list)
            {
                console.log(list);
            });
        }
    });
    /*
    var query_doc = {'name': req.body.userid, 'password': req.body.password};
    var fields   = '-_id version';
    var options  = {};
    console.log(query_doc);
    (function(){
        user.find(query_doc, fields, options, function(err, doc){
            if(err){
                console.log(query_doc.name + ": login failed in error" + new Date());
                res.redirect('/');
            }
            else if(doc.length == 0)
            {
                console.log(query_doc.name + ": login failed in no found. " + new Date());
                res.redirect('/');
            }
            else{
                console.log(query_doc.name + doc + ": login success in " + new Date());
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
            }
        });
    })(query_doc);

    */
});

router.post('/test', function(req, res) {
    var errorNo = '';
    console.log(req);
    userModels.userAuth(req.body.userid,req.body.password,function(serverVersion)
    {
        if(serverVersion == -1)
        {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('Auth_Fail');
            res.end();
        }
        else
        {
            console.log("version: " + serverVersion);
            req.session.userid = req.sessionID;

            var jsonlist = JSON.parse(req.body.data);
            console.log(jsonlist);
            if(jsonlist.DELETE.length > 0 || jsonlist.INSERT.length> 0 || jsonlist.UPDATE.length > 0)
            {
                serverVersion = serverVersion + 1;
                async.series(
                {
                    insert: function(done)
                    {
                        if(jsonlist.INSERT.length> 0 )
                        {
                            dataModels.insertData(req.body.userid, jsonlist.INSERT, function(result)
                            {
                                console.log(result);
                                if(result == -1)
                                {
                                    errorNo = 'Server_Fail_In_Insert';
                                }
                                done(null,result);
                            });
                        }
                    },
                    update: function(done)
                    {
                        if(jsonlist.UPDATE.length> 0  && errorNo == '')
                        {
                            dataModels.updateData(req.body.userid, jsonlist.UPDATE, function(result)
                            {
                                console.log(result);
                                if(result == -1)
                                {
                                    errorNo = 'Server_Fail_In_Update';
                                }
                                done(null,result);
                            });
                        }
                        else
                        {
                            done(null,null)
                        }
                    },
                    delete: function(done)
                    {
                        if(jsonlist.DELETE.length> 0  && errorNo == '')
                        {
                            dataModels.deleteData(req.body.userid, jsonlist.DELETE, function(result)
                            {
                                console.log(result);
                                if(result == -1)
                                {
                                    errorNo = 'Server_Fail_In_Delete';
                                }
                                done(null,result);
                            });
                        }
                        else
                        {
                            done(null,null)
                        }
                    },
                    insertVersionList: function (done)
                    {
                        if(errorNo == '')
                        {
                            versionModels.insertVersionList(req.body.userid, serverVersion, jsonlist, function(result)
                            {
                               console.log(result);
                               if(result == -1)
                                {
                                    errorNo = 'Server_Fail_In_Insert_Version';
                                }
                                done(null,result);
                            });
                        }
                        else
                        {
                            done(null,null)
                        }
                    },
                    updateVersion: function(done)
                    {
                        if(errorNo == '')
                        {
                            userModels.updateVersion(req.body.userid,serverVersion, function(result)
                            {
                                console.log(result);
                               if(result == -1)
                                {
                                    errorNo = 'Server_Fail_In_Update_User_Version';
                                }
                                done(null,result);
                            });
                        }
                        else
                        {
                            done(null,null)
                        }
                    },
                    getChgList: function(done)
                    {
                         if(errorNo == '')
                        {
                            versionModels.getChgList(req.body.userid, req.body.version, serverVersion, function(result)
                            {
                                console.log(result);
                                if(result.version == -1)
                                {
                                    errorNo = 'Server_Fail_In_Get_Chg_List';
                                }
                                done(null,result);
                            });
                        }
                        else
                        {
                            done(null,null)
                        }
                    }
                }, function (error, result) {
                    console.log('result:', result);
                    console.log('errorNo:' + errorNo);
                    if(errorNo == '')
                    {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(JSON.stringify(result.getChgList));
                        res.end();
                    }
                    else
                    {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(errorNo);
                        res.end();
                    }
                });


                /*
                if(jsonlist.INSERT.length> 0 )
                {
                    dataModels.insertData(req.body.userid, jsonlist.INSERT, function(insertResult)
                    {
                        console.log(insertResult);
                        if(insertResult == -1)
                        {
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Insert');
                            res.end();
                        }
                    });
                }
                if(jsonlist.UPDATE.length> 0  && isContinue)
                {
                    dataModels.updateData(req.body.userid, jsonlist.UPDATE, function(updateResult)
                    {
                        console.log(updateResult);
                        if(updateResult == -1)
                        {
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Update');
                            res.end();

                        }
                    });
                }
                if(jsonlist.DELETE.length> 0  && isContinue)
                {
                    dataModels.deleteData(req.body.userid, jsonlist.DELETE, function(deleteResult)
                    {
                        console.log(deleteResult);
                        if(deleteResult == -1)
                        {
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Delete');
                            res.end();

                        }
                    });
                }
                if(isContinue)
                {
                    versionModels.insertVersionList(req.body.userid, serverVersion, jsonlist, function(insertVersionResult)
                    {
                        console.log(insertVersionResult);
                        if(insertVersionResult == -1)
                        {
                            console.log('insertVersionResult  error');
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Insert_Version');
                            res.end();
                        }
                    });
                }
                if(isContinue)
                {
                    userModels.updateVersion(req.body.userid,serverVersion, function(versionResult)
                    {
                        console.log(versionResult);
                        if(versionResult == -1)
                        {
                            console.log('update Version  error');
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Update_User_Version');
                            res.end();
                        }
                    });
                }
                if(isContinue)
                {
                    versionModels.getChgList(req.body.userid, req.body.version, serverVersion, function(list)
                    {
                        console.log(list);
                        if(list.version == -1)
                        {
                            isContinue = false;
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('Server_Fail_In_Get_Chg_List');
                            res.end();
                        }
                        else
                        {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write(list);
                            res.end();
                        }
                    });
                }
                */
            }
            else
            {
                versionModels.getChgList(req.body.userid, req.body.version, -1, function(list)
                {
                    console.log(list);
                    if(list.version == -1)
                    {
                        isContinue = false;
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('Server_Fail_In_Get_Chg_List');
                        res.end();
                    }
                    else
                    {
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write(JSON.stringify(list));
                        res.end();
                    }
                });
            }
        }
    });
});

module.exports = router;
