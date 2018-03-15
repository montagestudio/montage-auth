
var passport = require('passport');
var ZendeskStrategy = require('passport-zendesk').Strategy;
var jwt = require('jsonwebtoken');
var uuidv4 = require('uuid/v4');

module.exports = function (app) {

    // Set default env
    app.set('ZENDESK_CLIENT_ID', process.env.ZENDESK_CLIENT_ID || "kaazingsupport1505261284");
    app.set('ZENDESK_SUBDOMAIN', process.env.ZENDESK_SUBDOMAIN || process.env.ZENDESK_CLIENT_ID || "kaazingsupport1505261284");
    app.set('ZENDESK_CLIENT_SECRET', process.env.ZENDESK_CLIENT_SECRET || "0YKoEVgenmGNzu3gIaKpwnQj0H3Oh57mD95qmKcn");

    app.set('ZENDESK_TOKEN_SECRET', process.env.ZENDESK_TOKEN_SECRET || "gYfkWN9hRtDAKdJClHgjIyJIH4C9GUVJC3AS4hscYSUvg7Sr");
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

    // - https://support.zendesk.com/hc/en-us/articles/203663816 
    // - https://support.zendesk.com/hc/en-us/articles/204279616-Anatomy-of-a-JWT-request

    app.get('/api/zendesk/token', requireJWTAuth, function (req, res, next) {

        var user = req.user;
        /*
        Here's an example claims set for the JWT:
        // JWT must be HS256 I believe.
        user = {
            "iss": "Online JWT Builder",
            "iat": 1520029662,
            "exp": 1551548588,
            "sub": "jrocket",
            "jti": "123423423412346",
            "name": "Jesse Selitham",
            "email": "jrocket@example.com"
        }
        */

        // TODO fetch email from endpoint if missing.
        if (!req.query.email) {
            throw new Error('Missing email');
        }

        console.log(user);

        var payload = {
            jti: uuidv4(),
            iat: user.iat,
            aud: user.iss,
            sub: user.sub,
            external_id: user.sub,
            name: user.sub,
            email: req.query.email
        };

        var token = jwt.sign(payload, ZENDESK_TOKEN_SECRET, { 
            algorithm: ZENDESK_TOKEN_ALGORITHM,
            expiresIn: ZENDESK_TOKEN_DURATION
        });

        console.log(payload);

        var result = {
            token: token,
            url: "https://" + ZENDESK_SUBDOMAIN + ".zendesk.com/access/jwt?jwt=" + encodeURIComponent(token)
        };

        if (req.query.payload) {
            result.payload = payload;
        }

        res.json(result);

    });
};