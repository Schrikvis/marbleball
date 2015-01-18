var express = require('express');
var router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find(undefined,undefined,function(e,docs){
       res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* POST to Add User Service */
router.post('/addtime', function(req, res) {

	console.log(req.body);
    // Set our internal DB variable
    var db = req.db;
    var collection = req.db.get('usercollection');
	
    // Get our form values
    var userName = req.body['UserName'];
	var userID = req.body['UserID'];
	var levelName = req.body['LevelName'];
    var Time = req.body['Time'];
	var check = req.body['Check'];
	var mycheck = Math.tan(Math.cos(Time));
	console.log(check);
	console.log(mycheck);
	
	// Check if the check's correct
	if (Math.abs(check - mycheck) > 0.05){
		console.log("Stuff went wrong; check's wrong.");
		res.write('Something went wrong I guess, sorry.');
		return
	}
	
	console.log('Thing dint went wrong!');
    // Set our collection
    //collection.save(
	//{'UserID' : -22, 'LevelName' : 'TestLevel1', 'Time' : 90001, 'UserName' : 'Guest 15'}
	collection.update(
		{'UserID' : userID, 'LevelName' : levelName},
		{'UserID' : userID, 'LevelName' : levelName, 'Time' : Time, 'UserName' : userName},
		{
		 upsert : true
		}
	)
  res.end()
  return
});

router.get('/gettimes', function(req, res) {
	var examplestat = {'_id':-21, 'LevelName':'TestLevel1','Time':90003}
	//for (i=0; i<100) {
	//	examplestrat[examplestrat.length+1] = {'UserID':-21 - i, 'LevelName':'TestLevel1','Time':90003 + i}
	//}
	var db = req.db;
	var collection = db.get('usercollection');
	var reqminRank = req.param('minRank');
	var reqmaxRank = req.param('maxRank'); //size of table
	var reqminTime = req.param('minTime'); //sort by time~
	var reqmaxTime = req.param('maxTime');
	var reqUserID = req.param('UserID');
	var timestrang = 'Times';
	var reqLevelName = req.param('LevelName');
	collection.find(
	{'LevelName' : reqLevelName
	}
	,
	function(err, cursor){
	cursor.sort('Time', -1)
		res.write(JSON.stringify(cursor))
		res.end()
	})
});	


/*
db.usercollection.insert({'userid' : '-30', 'Times' : {'TestLevel2' : '90000'}})

format
[
{'userid' : '-23', 'Times' : {'TestLevel1' : '90000'}},
{'userid' : '-24', 'Times' : {'TestLevel1' : '90001'}},
{'userid' : '-25', 'Times' : {'TestLevel1' : '90002'}},
{'userid' : '-26', 'Times' : {'TestLevel1' : '90003'}},
{'userid' : '-27', 'Times' : {'TestLevel1' : '90004'}},
{'userid' : '-28', 'Times' : {'TestLevel1' : '90005'}},
{'userid' : '-29', 'Times' : {'TestLevel1' : '90006'}},
]

newstuff = [
			{"username" : "testuser2", "email" : "testuser2@testdomain.com" }, 
			{"username" : "testuser3", "email" : "testuser3@testdomain.com" }
			]
db.usercollection.insert(newstuff);

db.usercollection.insert({'userid' : })
*/

module.exports = router;