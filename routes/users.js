var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/haha',function(req,res,next)
{
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('ok');
    res.end();
});

module.exports = router;
