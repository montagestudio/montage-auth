
var https = require('https');
var express = require('express');
var fs = require('fs');

/* 
// To enable Push
var https = require('spdy');
*/

module.exports = function (app) {

  var APP_PORT = app.get('APP_PORT'), 
      APP_URL = app.get('APP_URL'),  
      APP_SSL = app.get('APP_SSL'),
      CERT_PATH = app.get('ROOT_PATH') + '/certs/',
      PUBLIC_PATH = app.get('PUBLIC_PATH');

  // Expose statics
  app.use(express.static(PUBLIC_PATH, {
    index: false
  }));

  // Trust first proxy
  app.set('trust proxy', 1);

  if (APP_PORT === 443) {
    var forwardingServer = express();

    forwardingServer.all('*', function(req, res) {
        return res.redirect("https://" + APP_URL + req.url);
    });

    forwardingServer.listen(80); 
  }

  if (APP_SSL === true) {

    https
      .createServer({
          key: fs.readFileSync(CERT_PATH + '/private.key'),
          cert:  fs.readFileSync(CERT_PATH + '/public.crt')
      }, app)
      .listen(APP_PORT, function (error) {
        if (error) {
          console.error(error);
          return process.exit(1);
        } else {
          console.log('(https) Listening on port: ' + APP_PORT + '.');
        }
      });
  } else {
    app.listen(APP_PORT);
    console.log('(http) Listening on port: ' + APP_PORT + '.');
  } 
};