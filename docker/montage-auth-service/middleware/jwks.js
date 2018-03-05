var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var passport = require('passport');
var jwkToPem = require('jwk-to-pem');
var jwt = require('jsonwebtoken');                                                                                                                                                           
var https = require('https');
var url = require('url');

function handleSigningKeyError(err, cb) {
  // If we didn't find a match, can't provide a key.
  if (err && err.name === 'SigningKeyNotFoundError') {
    return cb(null);
  }

  // If an error occured like rate limiting or HTTP issue, we'll bubble up the error.
  if (err) {
    return cb(err);
  }
}

function getSigningKey(jwksUrl, kid) {
  return new Promise(function (resolve, reject) {
      var jwksUri = url.parse(jwksUrl);     
      var req = https.request({
          hostname: jwksUri.hostname,
          port: jwksUri.port,
          path: jwksUri.path,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          },
          rejectUnauthorized: false
      }, function(res) {

        var response = '';
        res.on('data', function(data) {
            response += data;
        });

        res.on('end', function() {
          // Parse response
          try {
            response =  JSON.parse(response);
          } catch (err) {
            reject(err);
          }

          // Validate response
          if (
              !response.keys || 
                response.keys.length === 0 || 
                  !Array.isArray(response.keys)
          ) {
            reject('No valid keys found for ' + jwksUrl);
          }

          // Lookup for match
          var signingKey = response.keys.find(function (key) {
            return key.kid === kid;
          });
          
          // If match convert to pem and resolve
          if (signingKey) {
              resolve(jwkToPem(signingKey));
          } else {
            reject('No kid matching key found.');
          }

          return signingKey;
        });
      });

      req.on('error', reject);

      req.end();
  });
}

function passportJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new Error('An options object must be provided when initializing passportJwtSecret');
  }

  return function secretProvider(req, rawJwtToken, next) {

    var decoded = jwt.decode(rawJwtToken, { 
    	complete: true 
    });

    /*
        { header: 
     { kid: '2018-02-02|testenterprise.disasteraware.com',
       alg: 'RS512' },
    payload: 
     { jti: '1d34d547-3913-47f3-a1ef-db9f9ed4fdc9',
       iss: 'https://testenterprise.disasteraware.com/jwt/jwks.json',
       exp: 1520284152,
       iat: 1520283252,
       nbf: 1520283252,
       sub: 'robot',
       userRoles: 
        [ 'LOGIN',
          'SMS_RECEIVE',
          'AGS_ADMINISTRATOR',
          'AGS_PUBLISHER',
          'MYPDC_DEFAULT',
          'COMMAND_ADMIN',
          'LIVE_CAMS' ],
       userGroupId: '2' },
    signature: 'HDb6OnF60Momfz9zXiouk1g7sZA_Ny-keqqxM8Ip_x9oabhaPPUs-YhxFLT4zR8j9ARbUx-KRjDM1dsewtAQnnc_CN3yRLZdIEDkCSk8lzb1TMz2PlQfS1CTAOIRyWIv5-eAbw0z5MhtaqDdKyiNkRq3ggAolUkckt9nfhPgw0tARTeJ5OgTj5DTQYwwgwFKeausTu7Oolq6ES0OUJtVVUo6yqSdWtZYYdKJvRpcKYAdkYETzRts961kmXSCL2wv6eG_j4Fu1MTlPIGcvb8IrXcNzcnbVBmEfMy17jpTW2MGFIFynnMrDDRT5G9fUka6lc7tsMuuGmKIiG1mf0sQ6A' }
      */

    getSigningKey(options.jwksUrl, decoded.header.kid).then(function (key) {
      return next(null, key);
    }, next);
  };
}

function validateToken(jwtPayload, done) {
  //console.log('Verify user:', jwtPayload);

  if (jwtPayload && jwtPayload.sub) {
    return done(null, jwtPayload);
  }

  return done(null, false);
}

module.exports = function (app) {

  /*
    We can get JWK from PDC’s JWT service
    Swagger: https://testenterprise.disasteraware.com/jwt/
    Key Set: https://testenterprise.disasteraware.com/jwt/jwks.json
  */

  app.set('JWKS_URI', process.env.JWKS_URI || "https://testenterprise.disasteraware.com/jwt/jwks.json");
  app.set('JWKS_ISSUER', process.env.JWKS_ISSUER || "https://testenterprise.disasteraware.com/jwt/jwks.json");
  app.set('JWKS_AUDIENCE', process.env.JWKS_AUDIENCE || "");
  app.set('JWKS_ALGORITHM', process.env.JWKS_ALGORITHM || "RS512");

  var JWKS_URI = app.get('JWKS_URI'),
    JWKS_AUDIENCE =  app.get('JWKS_AUDIENCE'),
    JWKS_ISSUER = app.get('JWKS_ISSUER'),
    JWKS_ALGORITHM = app.get('JWKS_ALGORITHM');

  	passport.use(
  	  new JwtStrategy({
  	    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  	    secretOrKeyProvider: passportJwtSecret({
  	      jwksUrl: JWKS_URI
  	    }),
  	    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  	    // Validate the audience and the issuer.
  	    audience: JWKS_AUDIENCE,
  	    issuer: JWKS_ISSUER,
  	    algorithms: [JWKS_ALGORITHM]
  	  },
  	  validateToken)
  	);

    app.get('/auth/jwtks', function (req, res, next) {
        passport.authenticate('jwt', {
            failWithError: true,
            session: false
        })(req, res, function (err) {
          if (err) {
              next(err);
          } else {
              res.send(req.user);
          }
        });
    });
};

module.exports.getSigningKey = getSigningKey;