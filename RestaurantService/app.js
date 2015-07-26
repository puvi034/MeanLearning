var path = require('path');

var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var connectMongo = require('connect-mongo');
var passport = require('passport');
var expressSession = require('express-session');
var flash = require('connect-flash');

var MongoStore = connectMongo(expressSession);

var passportConfig = require('./auth/passport-config');
passportConfig();

var config = require('./config.js');
var restrict = require('./auth/restrict');
var routes = require('./routes/index');
var users = require('./routes/users');
var orders = require('./routes/orders');

mongoose.connect(config.mongoUri);

var app = express();

app.set('production', process.env.NODE_ENV == 'production');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession(
  {
    secret: 'getting hungry',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection    
    })
  }
));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);
//app.use(restrict);
app.use('/orders', orders);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var port = process.env.PORT|| 3000;
console.log("Listening at:"+port);
app.listen(port);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;