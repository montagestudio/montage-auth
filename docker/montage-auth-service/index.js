/* global __dirname, process, Promise */

var express = require('express');

//
// Configure app
//

var app = express();

// Path
app.set('ROOT_PATH', __dirname);
app.set('PUBLIC_PATH', process.env.PUBLIC_PATH || app.get('ROOT_PATH') + '/public/');

// App
app.set('APP_SECRET', process.env.APP_SECRET || "montage-auth");
app.set('APP_SSL', !!process.env.APP_SSL || true);
app.set('APP_PORT', process.env.APP_PORT || '8080');
app.set('APP_HOST', process.env.APP_HOST || 'localhost');
app.set('APP_URL', process.env.APP_URL || (app.get('APP_SSL') ? 'https' : 'http') + '://' + app.get('APP_HOST') + ':' + app.get('APP_PORT'));

// Middlewares
require('./middleware/http')(app);
require('./middleware/passport')(app);
require('./middleware/jwks')(app);
require('./middleware/twitter')(app);
require('./middleware/zendesk')(app);

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500);
  res.end(err.message);  
});