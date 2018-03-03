
var passport = require('passport');
var session = require('express-session');
var fs = require('fs');

module.exports = function (app) {

	var APP_SECRET = app.get('APP_SECRET');

	// Configure passport
	passport.serializeUser(function(user, next) {
	  next(null, user);
	});

	passport.deserializeUser(function(id, next) {
	  next(null, id);
	});

	app.use(passport.initialize());
	
	// Init session (Required by passport-twitter)
	app.use(session({
	  secret: APP_SECRET,
	  resave: false,
	  saveUninitialized: true,
	  cookie: { secure: true }
	}));
};