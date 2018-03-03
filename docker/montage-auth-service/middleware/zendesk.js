
var passport = require('passport');
var ZendeskStrategy = require('passport-zendesk').Strategy;
var jwt = require('jsonwebtoken');

module.exports = function (app) {

    // Set default env
    app.set('ZENDESK_SUBDOMAIN', process.env.ZENDESK_SUBDOMAIN || "disateraware");
    app.set('ZENDESK_CLIENT_ID', process.env.ZENDESK_CLIENT_ID || "disateraware");
    app.set('ZENDESK_CLIENT_SECRET', process.env.ZENDESK_CLIENT_SECRET || "9ta9csrdHPnsKMFCXTxuvZqqIJ1BHEduLi9YEXbqaGUMZqTj");

    app.set('ZENDESK_TOKEN_SECRET', process.env.ZENDESK_TOKEN_ALGORITHM || "9ta9csrdHPnsKMFCXTxuvZqqIJ1BHEduLi9YEXbqaGUMZqTj");
    app.set('ZENDESK_TOKEN_ALGORITHM', process.env.ZENDESK_TOKEN_ALGORITHM || "HS256");
    app.set('ZENDESK_TOKEN_DURATION', process.env.ZENDESK_TOKEN_DURATION || "1h");

    // Twitter middleware
    var APP_URL = app.get('APP_URL'),
        ZENDESK_SUBDOMAIN = app.get('ZENDESK_SUBDOMAIN'),
        ZENDESK_CLIENT_ID = app.get('ZENDESK_CLIENT_ID'),
        ZENDESK_CLIENT_SECRET = app.get('ZENDESK_CLIENT_SECRET');

    passport.use(new ZendeskStrategy({
        passReqToCallback: true,
        subdomain: ZENDESK_SUBDOMAIN,
        clientID: ZENDESK_CLIENT_ID,
        clientSecret: ZENDESK_CLIENT_SECRET,
        callbackURL: APP_URL + "/auth/zendesk/callback"
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
    app.get('/auth/zendesk', function (req, res, next) {

        var options = {
            failWithError: true,
            session: false,
            state: req.params.state ? req.params.state : Date.now()
          };

        passport.authenticate('zendesk', options)(req, res, function (err) {
            if (err) {
              res.redirect('/auth/twitter/result#error=' + JSON.stringify(err.message || err));
            } else {
              next();
            }
        });
    });

    // Handle auth process callback
    app.get('/auth/zendesk/callback', function (req, res, next) {
        var options = {
            failWithError: true,
            session: false,
            state: req.params.state ? req.params.state : Date.now()
        };

        passport.authenticate('zendesk', options)(req, res, function (err) {
            if (err) {
              res.redirect('/auth/zendesk/result#error=' + JSON.stringify(err.message || err));
            } else {
              res.redirect('/auth/zendesk/result#result=' + JSON.stringify(req.user));
            }
        });
    });

    // Handle auth process result
    app.get('/auth/zendesk/result', function (req, res, next) {
      // Empty
      res.end();
    });

    // Zendesk token api
    var requireJWTAuth = passport.authenticate('jwt', { session: false });

    var ZENDESK_TOKEN_SECRET = app.get('ZENDESK_TOKEN_SECRET'),
        ZENDESK_TOKEN_ALGORITHM = app.get('ZENDESK_TOKEN_ALGORITHM'),
        ZENDESK_TOKEN_DURATION = app.get('ZENDESK_TOKEN_DURATION');

    app.get('/api/zendesk/token', requireJWTAuth, function (req, res, next) {

        // TODO 
        // - get current user
        // - forge zendek token
        // - jit uuid

        // LINKS:
        // - https://support.zendesk.com/hc/en-us/articles/203663816 
        // - https://support.zendesk.com/hc/en-us/articles/204279616-Anatomy-of-a-JWT-request

        /*
        Here's an example claims set for the JWT:
        // JWT must be HS256 I believe.
        {
            "iss": "Online JWT Builder",
            "iat": 1520029662,
            "exp": 1551548588,
            "aud": "www.example.com",
            "sub": "jrocket@example.com",
            "jti": "123423423412346",
            "name": "Jesse Selitham",
            "email": "jesse.selitham@kaazing.com"
        }
        */

        var user = req.user || {
            "app": APP_URL,
            "name": "Jesse Selitham",
            "email": "jesse.selitham@kaazing.com"
        };

        var token = jwt.sign({
            //"jti": "123423423412346",
            aud: user.app,
            sub: user.email,
            name: user.name,
            email: user.email
        }, ZENDESK_TOKEN_SECRET, { 
            algorithm: ZENDESK_TOKEN_ALGORITHM,
            expiresIn: ZENDESK_TOKEN_DURATION
        });

        res.json({
            token: token
        });

    });
};