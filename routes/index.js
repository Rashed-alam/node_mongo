var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('hello');
  // res.send('server working fine');
  return res.status(200).json({ message: "server working fine" });
  // res.render('index', { title: 'Express' });
});

module.exports = router;
