
var GithubStrategy = require('passport-github');
var passport = require('passport');

module.exports = function (app) {

    // Set default env
    // https://github.com/settings/developers
    app.set('GITHUB_ID', process.env.GITHUB_ID || "34ebda7d3a87b5922fc2");
    app.set('GITHUB_SECRET', process.env.GITHUB_SECRET || "4de6dfcfeb747eed94406991067f6f5108779575");

    // Github middleware
    var APP_URL = app.get('APP_URL'),
        GITHUB_ID = app.get('GITHUB_ID'),
        GITHUB_SECRET = app.get('GITHUB_SECRET');

    passport.use(new GithubStrategy({
          passReqToCallback: true,
          clientID: GITHUB_ID,
          clientSecret: GITHUB_SECRET,
          callbackURL: APP_URL + "/auth/github/callback"
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
    app.get('/auth/github', function (req, res, next) {
        var options = {
            failWithError: true,
            session: false,
            state: req.params.state ? req.params.state : Date.now()
        };

        passport.authenticate('github', options)(req, res, function (err) {
          if (err) {
              res.redirect('/auth/github/result#error=' + JSON.stringify(err.message || err));
          } else {
              next();
          }
        });
    });

    // Handle auth process callback
    app.get('/auth/github/callback', function (req, res, next) {
        
        var options = {
          failWithError: true,
          session: false,
          state: req.params.state ? req.params.state : Date.now()
        };

        passport.authenticate('github', options)(req, res, function (err) {
          if (err) {
            res.redirect('/auth/github/result#error=' + JSON.stringify(err.message || err));
          } else {
            res.redirect('/auth/github/result#result=' + JSON.stringify(req.user));
          }
        });
    });

    // Handle auth process result
    app.get('/auth/github/result', function (req, res, next) {
        // Empty
        res.end();
    });

    // Github api proxy
    app.get('/api/github/:githubObject/:githubAction', function (req, res, next) {
     // TODO
    });

};
