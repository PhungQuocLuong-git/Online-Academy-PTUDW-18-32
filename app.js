const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const bcrypt = require('bcrypt');



const exphbs = require('express-handlebars');

var app = express();

const db = require('./config/db');

// Connect to DB
db.connect();

// view engine setup
app.engine('hbs', exphbs({
  extname: '.hbs',
  helpers:{
    ifcond(v1, v2, options) {
      if(v1 === v2) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// Session
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "Dam Linh",
  })
);


// Routes
const usersRouter = require('./routes/user');
const siteRouter = require('./routes/site');
// const meRouter = require('./routes/me');
const accountRouter = require('./routes/account');
const coursesRouter = require('./routes/course');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));

app.use('/', siteRouter);
app.use('/user', usersRouter);
app.use('/account', accountRouter);
app.use('/courses',coursesRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
