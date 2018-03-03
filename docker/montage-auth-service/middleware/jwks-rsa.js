var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var JwksClient = require('jwks-rsa');
var passport = require('passport');
var jwt = require('jsonwebtoken');

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

function passportJwtSecret(options) {
  if (options === null || options === undefined) {
    throw new Error('An options object must be provided when initializing passportJwtSecret');
  }

  var client = new JwksClient(options);
  var onError = options.handleSigningKeyError || handleSigningKeyError;

  return function secretProvider(req, rawJwtToken, cb) {
    var decoded = jwt.decode(rawJwtToken, { 
    	complete: true 
    });

    // Only RS256 is supported.
    // TODO WTF ?
    if (!decoded.header || decoded.header.alg !== 'RS256') {
      return cb(null, null);
    }

    client.getSigningKey(decoded.header.kid, function (err, key) {
      if (err) {
        return onError(err, function (newError) {
        	cb(newError, null);
        });
      }

      // Provide the key.
      return cb(null, key.publicKey || key.rsaPublicKey);
    });
  };
}

// TODO
// Fake verify, accept any authenticated user.
function validateToken(jwt_payload, done) {
  console.log('Verify user:', jwt_payload);

  if (jwt_payload && jwt_payload.sub) {
    return done(null, jwt_payload);
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
  app.set('JWKS_AUDIENCE', process.env.JWKS_AUDIENCE || "urn:my-resource-server");
  app.set('JWKS_ISSUER', process.env.JWKS_ISSUER || "https://my-authz-server/");
  app.set('JWKS_ALGORITHM', process.env.JWKS_ALGORITHM || "RS256");

  var JWKS_URI = app.get('JWKS_URI'),
    JWKS_AUDIENCE =  app.get('JWKS_AUDIENCE'),
    JWKS_ISSUER = app.get('JWKS_ISSUER'),
    JWKS_ALGORITHM = app.get('JWKS_ALGORITHM');

	passport.use(
	  new JwtStrategy({
	    // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
	    secretOrKeyProvider: passportJwtSecret({
	      cache: true,
	      rateLimit: true,
	      jwksRequestsPerMinute: 5,
	      jwksUri: JWKS_URI
	    }),
	    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	    // Validate the audience and the issuer.
	    audience: JWKS_AUDIENCE,
	    issuer: JWKS_ISSUER,
	    algorithms: [JWKS_ALGORITHM]
	  },
	  validateToken)
	);
};