#!/bin/env node

var express = require('express');
var fs      = require('fs');
var mongodb = require('mongodb');

var App = function(){

  // Scope
  var self = this;

  // Setup
  self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST, parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT), {safe: true});
 // self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {auto_reconnect: true});
  self.dbServer = new mongodb.Server(process.env.OPENSHIFT_MONGODB_DB_HOST,parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT));
  self.db = new mongodb.Db(process.env.OPENSHIFT_APP_NAME, self.dbServer, {safe: true});
  
  //self.db = monk('mongodb://'+process.env.OPENSHIFT_MONGODB_DB_HOST+':'+process.env.OPENSHIFT_MONGODB_DB_PORT+'/');
  self.dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
  self.dbPass = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

  self.ipaddr  = process.env.OPENSHIFT_NODEJS_IP;
  self.port    = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
  if (typeof self.ipaddr === "undefined") {
    console.warn('No OPENSHIFT_NODEJS_IP environment variable');
  };


  // Web app logic
  self.routes = {};

  // Web app urls
  self.app  = express();  
  //This uses the Connect frameworks body parser to parse the body of the post request
  var methodOverride = require('method-override');
  // parse application/x-www-form-urlencoded
  //self.app.use(bodyParser.urlencoded());
  var bodyParser = require('body-parser');
  // parse application/json
  self.app.use(bodyParser.json());
  self.app.use(bodyParser.urlencoded({extended: true}));
  // override with POST having ?_method=DELETE
  self.app.use(methodOverride('_method'));

  //define all the custom url map functio ns
 
   //default response with info about app URLs
  self.app.get('/', function(req, res){ 
    res.send('root response~'); 
  });
 
  self.app.post('/addtime', function(req, res){
  
	//app.connectDb(function callback(){})
	
    // Get our form values
    var userName = req.body['UserName'];
	var userID = req.body['UserID'];
	var levelName = req.body['LevelName'];
    var Time = req.body['Time'];
	var check = req.body['Check'];
	var mycheck = Math.tan(Math.cos(Time));	
	
	// Check if the check's correct
	if (Math.abs(check - mycheck) > 0.05){
		console.log("Stuff went wrong; check's wrong.");
		res.write('Something went wrong I guess, sorry.');
		return
	};
	
    // Set our collection
    //collection.save(
	//{'UserID' : -22, 'LevelName' : 'TestLevel1', 'Time' : 90001, 'UserName' : 'Guest 15'}
	//self.db.collection('AllTimes').insert({'UserID' : -123, 'LevelName' : 'LevelTest1', 'Time' : 90000, 'UserName' : 'Guest 123'}, function (err, result){ if (err) throw err; console.log(result);});
	//var collection = self.db.get('AllTimes');
	var lookFor = {'UserID' : userID, 'LevelName' : levelName}
	var toPush = {'UserID' : userID, 'LevelName' : levelName, 'Time' : Time, 'UserName' : userName}
	self.db.collection('AllTimes').update(
		lookFor,
		toPush,
		{upsert : true},
		function updcallback(err, result){ if (err) throw err; console.log(result);}
	);
  res.end()
  return
  });
    
  self.app.get('/gettimes', function(req, res){
  
	//app.connectDb(function callback(){})
	
	var reqminRank = req.query.minRank;
	var reqmaxRank = req.query.maxRank; //size of table
	var reqminTime = req.query.minTime; //sort by time~
	var reqmaxTime = req.query.maxTime;
	var reqUserID = req.query.UserID;
	var timestrang = 'Times';
	var reqLevelName = req.param('LevelName');
	//var collection = self.db.get('AllTimes');
	//self.db.collection('AllTimes').find(
	var cursor = self.db.collection('AllTimes').find(
	{
	'LevelName' : reqLevelName
	}
	)
	cursor.sort('Time', -1);
	cursor.toArray(function(err, names){
              res.header("Content-Type:","application/json");
              res.end(JSON.stringify(names));
      });
  });
	/*,
	function(err, cursor){
		if (cursor){
			cursor.sort('Time', -1);
			res.write(JSON.stringify(cursor)); //converting circular structure to JSON
		};
		res.end();
	});	*/
  //});  

  // Logic to open a database connection. We are going to call this outside of app so it is available to all our functions inside.
  self.connectDb = function(callback){
    self.db.open(function(err, db){
      if(err){callback()};
      self.db.authenticate(self.dbUser, self.dbPass, {authdb: "admin"}, function(err, res){
        if(err){};
        callback();
      });
    });
  };
  
  
  //starting the nodejs server with express
  self.startServer = function(){
    self.app.listen(self.port, self.ipaddr, function(){
      console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddr, self.port);
    });
  };

  // Destructors
  self.terminator = function(sig) {
    if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...', Date(Date.now()), sig);
      process.exit(1);
    };
    console.log('%s: Node server stopped.', Date(Date.now()) );
  };

  process.on('exit', function() { self.terminator(); });

  self.terminatorSetup = function(element, index, array) {
    process.on(element, function() { self.terminator(element); });
  };

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'].forEach(self.terminatorSetup);

};

//make a new express app
var app = new App();

//call the connectDb function and pass in the start server command
app.connectDb(app.startServer);
