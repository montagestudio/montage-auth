
var Twitter = require('twitter');
var TwitterStrategy = require('passport-twitter');
var passport = require('passport');

module.exports = function (app) {

    // Set default env
    app.set('TWITTER_CONSUMER_KEY', process.env.TWITTER_CONSUMER_KEY || "YYmrT8z8xBsAMBWJeqhhmnxXD");
    app.set('TWITTER_CONSUMER_SECRET', process.env.TWITTER_CONSUMER_SECRET || "KmNYBsjmnEHlIghivYKFcbqGu4dSxzQ7qOvGFtMIYb1zirwkbi");

    // Twitter middleware
    var APP_URL = app.get('APP_URL'),
        TWITTER_CONSUMER_KEY = app.get('TWITTER_CONSUMER_KEY'),
        TWITTER_CONSUMER_SECRET = app.get('TWITTER_CONSUMER_SECRET');

    passport.use(new TwitterStrategy({
          passReqToCallback: true,
          consumerKey: TWITTER_CONSUMER_KEY,
          consumerSecret: TWITTER_CONSUMER_SECRET,
          callbackURL: APP_URL + "/auth/twitter/callback"
      },
      function(req, token, tokenSecret, profile, next) {
        next(null, {
            token: token,
            tokenSecret: tokenSecret,
            profile: profile
        });
      }
    ));

    // Start auth process
    app.get('/auth/twitter', function (req, res, next) {
        var options = {
            failWithError: true,
            session: false,
            state: req.params.state ? req.params.state : Date.now()
        };

        passport.authenticate('twitter', options)(req, res, function (err) {
          if (err) {
              res.redirect('/auth/twitter/result#error=' + JSON.stringify(err.message || err));
          } else {
              next();
          }
        });
    });

    // Handle auth process callback
    app.get('/auth/twitter/callback', function (req, res, next) {
        
        var options = {
          failWithError: true,
          session: false,
          state: req.params.state ? req.params.state : Date.now()
        };

        passport.authenticate('twitter', options)(req, res, function (err) {
          if (err) {
            res.redirect('/auth/twitter/result#error=' + JSON.stringify(err.message || err));
          } else {
            res.redirect('/auth/twitter/result#result=' + JSON.stringify(req.user));
          }
        });
    });

    // Handle auth process result
    app.get('/auth/twitter/result', function (req, res, next) {
        // Empty
        res.end();
    });

    // Twitter api proxy
    app.get('/api/twitter/:twitterObject/:twitterAction', function (req, res, next) {
      
        var twitterObject = req.params.twitterObject,
            twitterAction = req.params.twitterAction,
            twitterParams = req.query;

        var accesToken = {
            token: req.query.token || req.headers['authorization-token'],
            secret: req.query.secret || req.headers['authorization-secret']
        };

        var client = new Twitter({
            consumer_key: TWITTER_CONSUMER_KEY,
            consumer_secret: TWITTER_CONSUMER_SECRET,
            access_token_key: accesToken.token,
            access_token_secret: accesToken.secret
        });
         
        // TODO implement http2 push
        // - https://blog.twitter.com/2008/what-does-rate-limit-exceeded-mean-updated
        console.log('Twitter API call', twitterObject, twitterAction, twitterParams);
        client.get(twitterObject + '/' + twitterAction, twitterParams, function(errors, tweets /*,response*/) {
            if (errors) {
                next(errors[0]);
            } else {
                res.json(tweets);
          }
        }); 
    });

};